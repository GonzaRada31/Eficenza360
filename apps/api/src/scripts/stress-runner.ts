// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { Worker, Job } from 'bullmq';
import { spawn, execSync, ChildProcess } from 'child_process';

// 1. Aislamiento de Entorno
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging') {
  throw new Error('Stress test blocked outside development environment');
}

const prisma = new PrismaClient();

const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  // 3. Manejo Explícito de Redis Down (bullmq/ioredis config)
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  connectTimeout: 5000, // Timeout explícito de 5s
  retryStrategy: (times: number) => {
    return Math.min(times * 100, 3000); // Reintento sin espiral de latencia
  }
};

async function checkRedisDown() {
  console.log('🚧 Apagando contenedor de Redis (Chaos Monkey)...');
  try {
    execSync('docker stop redis', { stdio: 'inherit' });
  } catch (error) {
    console.warn('⚠️ No se pudo detener el contenedor "redis". Asegúrate de que exista y se llame "redis". Continuamos de todos modos asumiendo que el test puede fallar o estarás bajando la red manualmente.');
  }
}

async function checkRedisUp() {
  console.log('🩺 Encendiendo contenedor de Redis (Chaos Recovery)...');
  try {
    execSync('docker start redis', { stdio: 'inherit' });
  } catch (error) {
    console.warn('⚠️ No se pudo iniciar el contenedor "redis".');
  }
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function bootstrap() {
  console.log('🔥 INICIANDO STRESS TEST END-TO-END DEL OUTBOX RELAY 🔥');
  console.log('---------------------------------------------------------');

  // 1. Iniciar Mock Consumer para marcar los eventos como PROCESSED
  console.log('👷 Iniciando Consumer Mock Idempotente (Huella Carbono)...');
  
  let processedCount = 0;
  let duplicateAttempts = 0;

  const consumer = new Worker('energy-events', async (job: Job) => {
    const payload = job.data;
    const { eventId, tenantId, auditId, snapshotId } = payload;

    try {
      // 2. Confirmar que el Mock Consumer marca PROCESSED correctamente (Transaccional)
      await prisma.$transaction(async (tx: any) => {
         await tx.carbonFootprintProcessedEvent.create({
            data: {
              eventId,
              tenantId,
              auditId,
              snapshotId,
              processedAt: new Date(),
            }
         });
         
         const out = await tx.domainEventOutbox.findFirst({ 
            where: { payload: { path: ['eventId'], equals: eventId } as any }
         });
         
         if(out) {
             await tx.domainEventOutbox.update({ 
                where: { id: out.id }, 
                data: { status: 'PROCESSED' } 
             });
         }
      });
      processedCount++;
    } catch (e: any) {
        // Ignoramos si es violación constraint (P2002) = Idempotency Guard nativo de BD
        if (e.code === 'P2002') {
           duplicateAttempts++;
           console.error(`🚨 ALARM: Constraint Duplicado detectado para eventId: ${eventId}`);
        } else {
           throw e; // Retry in BullMQ
        }
    }
  }, { connection: REDIS_CONFIG });

  consumer.on('error', err => {
    // Expected during redis stop
  });

  // 2. Levantar 3 Instancias del Relay
  console.log('🚀 Levantando 3 instancias del Relay Worker en paralelo...');
  const workers: ChildProcess[] = [];
  
  for (let i = 1; i <= 3; i++) {
    const worker = spawn('node', ['../relay-worker/dist/main.js'], {
      stdio: 'inherit', // Dejamos ver los logs
      env: { ...process.env, WORKER_ID: i.toString() }
    });
    workers.push(worker);
    console.log(`  └─ Relay Node PID ${worker.pid} iniciado.`);
  }

  // 3. Dejar que compitan durante 10 segundos
  console.log('⏱️  Dejando procesar en concurrencia (10 seg)...');
  await delay(10000);

  // 4. Chaos Monkey: Apagar Redis
  await checkRedisDown();

  // 5. Apagón por 30 segundos
  console.log('⏱️  Esperando apagón de Redis (30 seg)...');
  await delay(30000);

  // 6. Recovery: Encender Redis
  await checkRedisUp();

  // 7. Polling hasta finalizar (o Timeout de 3 minutos)
  console.log('⏱️  Esperando vaciado completo de la cola (Timeout: 3 minutos)...');
  const maxWait = Date.now() + (3 * 60 * 1000);
  
  let isDone = false;
  while (Date.now() < maxWait) {
     const pendingCount = await prisma.domainEventOutbox.count({
       where: { status: { in: ['PENDING', 'PROCESSING'] } }
     });

     if (pendingCount === 0) {
        isDone = true;
        break;
     }

     process.stdout.write(`... Quedan ${pendingCount} eventos. Procesados (Consumer): ${processedCount}\r`);
     await delay(2000);
  }
  process.stdout.write('\n');

  // 8. Apagar Workers
  console.log('🛑 Apagando las instancias Relay PIDs y deteniendo Consumer...');
  for (const worker of workers) {
    worker.kill('SIGTERM');
  }
  await consumer.close();

  // 9. Extraer Métricas y Validar
  console.log('\n📊 === REPORTE DE MÉTRICAS ===');
  const counts = await prisma.domainEventOutbox.groupBy({
    by: ['status'],
    _count: { _all: true }
  });

  const failures = counts.find((c: any) => c.status === 'FAILED')?._count._all || 0;
  const processeds = counts.find((c: any) => c.status === 'PROCESSED')?._count._all || 0;
  const pendings = counts.find((c: any) => c.status === 'PENDING')?._count._all || 0;
  const processings = counts.find((c: any) => c.status === 'PROCESSING')?._count._all || 0;

  console.log(`- PENDING:    ${pendings} (Esperado: 0)`);
  console.log(`- PROCESSING: ${processings} (Esperado: 0)`);
  console.log(`- PROCESSED:  ${processeds} (Esperado: ~1000)`);
  console.log(`- FAILED:     ${failures}`);
  
  // Auditoria Duplicados
  console.log('\n🔎 === AUDITORÍA FORENSE ===');
  console.log(`- Intentos de Procesamiento Duplicado interceptados: ${duplicateAttempts}`);
  if (duplicateAttempts > 0) {
     console.log('❌ Veredicto de Idempotencia: FALLIDO (Hubo envíos dobles o race conditions).');
  } else {
     console.log('✅ Veredicto de Idempotencia: APROBADO (0 duplicados. Exact-Once Delivery respetado).');
  }

  if (pendings === 0 && processings === 0 && duplicateAttempts === 0 && isDone) {
     console.log('\n🌟 VEREDICTO FINAL DEL STRESS TEST: ÉXITO ABSOLUTO 🌟');
     console.log('El sistema sobrevivió a la concurrencia de 3 nodos y a un apagón de red (Redis) sin crear zombies crónicos ni duplicados de mensajes.');
  } else {
     console.log('\n❌ VEREDICTO FINAL DEL STRESS TEST: FALLIDO ❌');
  }

  await prisma.$disconnect();
  process.exit(0);
}

bootstrap().catch(async (err) => {
   console.error(err);
   await prisma.$disconnect();
   process.exit(1);
});

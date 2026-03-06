// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';

const prisma = new PrismaClient();

const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

async function bootstrap() {
  console.log('🧹 INICIANDO CLEANUP DE STRESS TEST...');

  try {
    const outboxDeleted = await prisma.domainEventOutbox.deleteMany();
    console.log(`- Recibos Outbox Eliminados: ${outboxDeleted.count}`);

    const footprintDeleted = await prisma.carbonFootprintProcessedEvent.deleteMany();
    console.log(`- Footprint Logs Eliminados: ${footprintDeleted.count}`);

    const queue = new Queue('energy-events', { connection: REDIS_CONFIG });
    console.log('- Purgando Cola BullMQ (energy-events)...');
    await queue.obliterate({ force: true }).catch((e) => {
      console.warn(
        `  ⚠️ Hubo problemas purgando BullMQ (Quizás redis no está corriendo). Mensaje: ${e.message}`,
      );
    });
    await queue.close();

    console.log('✅ CLEANUP FINALIZADO EXITOSAMENTE.');
  } catch (error) {
    console.error('❌ Error durante el Cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});

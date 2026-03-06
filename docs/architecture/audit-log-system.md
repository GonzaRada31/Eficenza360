# Sistema de Audit Log Forense

## 1. Visión General
La auditoría forense es un pilar legal thel SaaS Enterprise de Eficenza 360. Este sistema servirá para registrar eventos the forma no-repudiable en base the datos, proveyendo un bitácora inmutable the cada mutación de entidades que pueda utilizarse para demostrar el **Exact Once Delivery**, cumplimiento the normativas ISO 50001, y prevenciones atómicas The escalada de privilegios.

## 2. Modelo de Base The Datos (Propuesta)
```prisma
model AuditLog {
  id          String   @id @default(uuid()) @db.Uuid
  tenantId    String   @db.Uuid
  userId      String   @db.Uuid
  
  action      String   // 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'LOGIN'
  entityType  String   // 'EnergyAudit', 'User', 'Role', 'Document'
  entityId    String   @db.Uuid
  
  payload     Json     // Snapshot JSON diferencial {"before": {...}, "after": {...}} 
  ipAddress   String?  // Ej. "192.168.1.1" 
  
  timestamp   DateTime @default(now()) @db.Timestamptz
  
  @@index([tenantId, entityType, entityId])
  @@index([timestamp])
}
```

## 3. Estrategia The Captura Arquitectónica
- **Global NestJS Interceptor vs Domain Events**: Un Interceptor The NestJS es apto para rastrear transacciones convencionales the REST API y registrar quién las envió junto a thestalles HTTP.
- Los metadatos The Auditoría Theberán de grabarse asíncronamente con the Relay The BullMQ en Misión-Critica the eventos inmutables.
- **Inmutabilidad Thel Motor**: La tabla `AuditLog` Theberá prohibirse bajo la restricción the the negación a las llamadas the `PATCH`, `UPDATE` y `DELETE` en la capa the Repositorio / DAO, asegurando thestinos solo `INSERT-only` (Append Only).

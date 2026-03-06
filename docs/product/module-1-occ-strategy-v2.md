# Optimistic Concurrency Control (OCC) - Strategy v2
**Versión:** 2.0  
**Enfoque:** Prevención Categórica del "Last-Write-Wins" en Data Grids Colaborativos.

Para que dos ingenieros o un cliente y un auditor puedan convivir interactuando con las mismas planillas de Eficenza 360 sin pisarse u ocultar datos mutuamente, se implementará formalmente un esquema **OCC estricto a nivel ORM**.

---

## 1. Modificación de Entidades Prisma (Schema Layer)

Todo modelo fundacional de recolección de métricas estará equipado con la columna inmutable `version`:

```prisma
model EnergyAudit {
// ...
  version Int @default(1)
}

model EnergyRecord {
// ...
  version Int @default(1)
}

model EquipmentInventory {
// ...
  version Int @default(1)
}
// Idem SiteMeasurement y OperationalData
```

## 2. Estrategia Exacta de Upsert/Update (Backend Level)

NestJS y Prisma ya no usarán el método inocente `prisma.energyRecord.update({ where: { id: X } })`. 

El controlador requerirá obligatoriamente en los DTOs recibir el `currentVersion` que el Frontend tiene en su poder (en la memoria estática mapeada en su pantalla).

```typescript
// Implementación Técnica Conceptual (Servicio)
async updateRecord(id: string, tenantId: string, currentVersion: number, data: UpdateDto) {
  
  // Update atómico e hiper-selectivo en 1 solo viaje a la base de datos
  // Solo aplicará cambios si la versión que conozco todavía existe en la fila original de DB
  const result = await this.prisma.energyRecord.updateMany({
    where: { 
      id, 
      tenantId, 
      version: currentVersion // La Magia Negra del OCC
    },
    data: {
      ...data,
      version: { increment: 1 } // Auto-elevamos la versión al lograrlo
    }
  });

  // Si a la vez un Auditor "B" ya había modificado este registro 2 segundos antes, 
  // su Prisma Update incrementó la versión a 2. Por tanto, nuestro Prisma updateMany 
  // no encontrará ningún registro que encaje con `version: 1`, afectando 0 rows.
  if (result.count === 0) {
    throw new ConflictException({
      statusCode: 409,
      errorCode: 'OCC_CONFLICT_DETECTED',
      message: 'El registro fue modificado por otro usuario de tu organización. Recarga para ver los nuevos datos.'
    });
  }

  // Fetch fresco del registro para retornar al cliente (con la versión ya sumada)
  return this.findById(id, tenantId);
}
```

## 3. Disposición del Payload de Error 

La API siempre devolverá explícitamente el estatus Code **409 (Conflict)** (No un 400 Bad Request o 500 Interno).
El Payload de Error será determinista:
```json
{
  "statusCode": 409,
  "errorCode": "OCC_CONFLICT_DETECTED",
  "message": "Outdated entity version",
  "details": {
    "entityType": "EnergyRecord",
    "entityId": "clp1x12asdfsdeas23d"
  }
}
```

## 4. Respuesta Reactiva del Frontend (Client UI)

Si el Cliente usa Axios o GraphQL para modificar celdas en su Data Grid:
1. El middleware de peticiones (ej. Axios Interceptor / RTK Query Error Handler) atrapa un `409` con el string `"OCC_CONFLICT_DETECTED"`.
2. El sistema visual desata un **Toast Modal No_Cerrable**:
   *"⚠️ Colisión Detectada: Otro miembro de tu equipo (o un validador remoto) actualizó este documento mientras lo editabas."*
3. Botón Gigante Integrado en el modal: **[Recargar Cambios Recientes (Refrescar Data Grid)]**
4. Se limpian los Invalidadores de TanStack Query (`queryClient.invalidateQueries(...)`), forzando a la grilla a devorarse la base de datos fresca, inyectando la versión `v2` hacia las cajas de texto nuevamente y eliminando la frustración del cliente.

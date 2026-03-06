# Domain Event: ENERGY_AUDIT_VALIDATED (v1)

- **Dominio Origen:** `EnergyAudit` (Módulo 1)
- **Dominio Destino:** `CarbonFootprint`, `Reporting`, `Notifications`
- **Tipo de Emisión:** Asíncrono (Outbox Pattern)
- **Garantía de Entrega:** At-least-once (requiere idempotencia en consumidor)

## 1. Contenido del Payload (JSON Schema v1)

El evento es inmutable y autocontenido. No transfiere la tabla completa de 5.000 registros, sino el puntero al *Snapshot* congelado que los consumidores deben consultar si requieren el detalle.

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "EnergyAuditValidatedEvent",
  "type": "object",
  "properties": {
    "eventId": {
      "type": "string",
      "format": "uuid",
      "description": "Unique identifier for this specific event occurrence (Idempotency Key)"
    },
    "correlationId": {
      "type": "string",
      "format": "uuid",
      "description": "Traceability ID passed through the entire request lifecycle"
    },
    "eventType": {
      "type": "string",
      "const": "ENERGY_AUDIT_VALIDATED"
    },
    "schemaVersion": {
      "type": "string",
      "const": "v1"
    },
    "emittedAt": {
      "type": "string",
      "format": "date-time"
    },
    "payload": {
      "type": "object",
      "properties": {
        "tenantId": { "type": "string", "format": "uuid" },
        "companyId": { "type": "string", "format": "uuid" },
        "auditId": { "type": "string", "format": "uuid" },
        "snapshotId": { "type": "string", "format": "uuid" },
        "year": { "type": "integer" },
        "validatedAt": { "type": "string", "format": "date-time" },
        "normativaVersion": { "type": "string" }
      },
      "required": ["tenantId", "companyId", "auditId", "snapshotId", "year", "validatedAt", "normativaVersion"]
    }
  },
  "required": ["eventId", "correlationId", "eventType", "schemaVersion", "emittedAt", "payload"]
}
```

## 2. Política de Backward Compatibility

- **Regla Estricta:** Ningún campo de la `v1` puede ser renombrado, eliminado, o cambiado de tipo en el futuro.
- **Añadidos:** Es válido añadir nuevos campos opcionales al `payload` (Ej: `validatedByUserId`) sin alterar la `schemaVersion`.
- **Breaking Changes:** Si se requiere un cambio estructural que rompe el contrato para el Módulo 2 (Huella de Carbono), el originador debe emitir explícitamente `schemaVersion: "v2"` y mantener la emisión en paralelo de `v1` (Dual-Write) hasta que todos los workers consumidores sean migrados.
  
## 3. Idempotencia del Consumidor (Módulo de Huella)

El módulo consumidor (Carbon Footprint) **debe** aplicar lógica de Deduplicación utilizando el `eventId` provisto en la raíz. Si el `eventId` ya existe procesado en la tabla de estado del consumidor, el evento se marca como `ACK` instantáneamente sin re-calcular la huella.

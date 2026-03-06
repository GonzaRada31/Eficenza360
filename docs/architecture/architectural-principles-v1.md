# Principios Arquitectónicos - Eficenza 360
**Versión:** 1.0  
**Enfoque:** Escalabilidad SaaS, Aislamiento Multi-Tenant y Mantenibilidad.

Esta es la brújula técnica. Antes de añadir una nueva librería, base de datos o patrón de diseño, la propuesta debe cruzarse con estos pilares estructurales.

---

## 1. Aislamiento Multi-Tenant Estricto (Data Isolation)
- Cada cliente (Consultora) opera en un espacio cerrado delimitado lógicamente por un único identificador: `tenantId`.
- **Principio de "No Confianza" en Frontera:** La API jamás debe creerle al Payload de Frontend a qué `tenantId` pertenece una solicitud. La identidad perimetral proviene criptográficamente del Token JWT, dictada por el Guardia de NestJS, y forzada en todo _Query_ de Prisma.
- _Regla de Oro en DB:_ Toda tabla maestra debe contener la clave foránea `tenantId`.

## 2. Event-Driven Readiness (Desacoplamiento)
- A medida que Eficenza 360 incorpora módulos premium pesados (OCR, Análisis Climático, Algoritmos Pesados), no deben integrarse síncronamente al hilo principal.
- **Fail Fast, Process Later:** Todo cálculo que demore más de 500ms o dependa de APIs de terceros (Azure Form Recognizer) debe encolarse (ej. BullMQ/Redis) respondiendo inmediatamente al usuario con un `HTTP 202 Accepted` (Pendiente).

## 3. Principio de Única Responsabilidad (SOLID) Generalizado
- **Módulos Confinados:** Un Módulo (`/modules/invoice/`) no debe acceder arbitrariamente a la capa de base de datos de otro Módulo (`/modules/user/`). Si `Invoice` requiere datos de Usuario, debe inyectar el `UserService`, operando a través de contratos e interfaces, impidiendo el acoplamiento duro entre dominios.
- **Evitar God Objects:** Dividir clases inmensas en proveedores especializados. Un controlador de facturas no debe orquestar el guardado Azure Blob, el parseo de DB y el envío de mails: debe apilar inyecciones limpias independientes (`AzureService`, `Repository`, `NotificationService`).

## 4. Idempotencia Nativas
- Toda operación de creación debe poder ejecutarse múltiples veces de forma segura (Retry/Reintento automático) sin causar corrupción o duplicidad en Base de Datos.
- Si dos usuarios de un tenant (o la latencia de red) clican 5 veces en "Crear Fase de Proyecto", la DB (mediante Constraints Únicas, o campos como `deduplicationKey`) debe fallar silenciosamente impidiendo duplicados reales.

## 5. Security by Default (La Seguridad no es un Add-on)
- Nunca exponer secretos criptográficos (`JWT_SECRET`, tokens, contraseñas, URLs firmadas de Blob Storage) en el front ni logs internos.
- Los logs de consola jamás deben guardar cuerpos de Peticiones Completas (Logs Masking) para cumplir GDPR (Evitar imprimir emails o DNI de usuarios de empresas).

## 6. Separación de Preocupaciones (UI vs Logic)
- **Frontend Tonto (Dumb UI):** React no debe ejecutar lógicas de negocio pesadas o transformaciones profundas de datos. El API debe entregar datos pre-masticados, formateados en DTOs que la UI consuma llanamente para pintar.
- Esto asegura consistencia en el futuro si se añade una App Mobile (Kotlin/Swift); la lógica vive solo en NestJS.

# Plan de Acción - Seguridad SaaS
**Versión:** 1.0

Las siguientes optimizaciones priorizan sellar las fugas documentales y estandarizar el despliegue a prueba de fallos humanos en los entornos de producción.

## Fase 1: Sellado de Accesos y Secretos (Inmediato)

### Tarea 1.1: Restricción Severa de URLs Firmadas (SAS Tokens)
**Objetivo:** Disminuir la ventana de vulnerabilidad ante links filtrados.
- [ ] En `/attachments/attachments.service.ts`, buscar el método `generateSasUrl`.
- [ ] Modificar la fecha de expiración `expiresOn` de 24 horas (`+ 24`) a una vida útil máxima de **15 o 30 minutos**. Al renderizarse desde el frontend, el archivo usualmente es interceptado inmediatamente. 

### Tarea 1.2: Validación Estricta en Tiempo de Inicialización (Fail Fast)
**Objetivo:** Impedir el arranque del servidor si faltan claves críticas para el funcionamiento.
- [ ] En `app.module.ts`, extender `ConfigModule.forRoot` añadiendo una propiedad `validationSchema` usando la librería `joi`.
- [ ] Especificar como `required()` variables obligatorias: `DATABASE_URL`, `JWT_SECRET`, `AZURE_STORAGE_ACCOUNT_URL`.

---

## Fase 2: Robustecimiento Operativo e Ingesta Segura (OWASP)

### Tarea 2.1: Implementación de Interceptores de Archivos (Multer/Nest)
**Objetivo:** Impedir contaminación del Bucket Azure con ejecutables o ficheros gigantescos.
- [ ] En los endpoints que acepten subida de adjuntos (Facturas, Excel), asegurar que el `@UseInterceptors(FileInterceptor('file'))` implemente límites severos:
  - Tamaño máximo (`limits: { fileSize: 5 * 1024 * 1024 }` = 5MB).
  - Filtro tipo (`fileFilter` que rechace todo lo que no sea `pdf`, `jpg`, `png` o mime types documentales explícitos).

### Tarea 2.2: Hardening HTTP Perimetral
**Objetivo:** Segurizar el transporte y las respuestas de red.
- [ ] En `main.ts`, integrar `helmet()` para inyectar cabeceras de seguridad estrictas (HSTS, NoSniff, FrameGuard).
- [ ] Aislar la configuración de `origin` en `app.enableCors(...)` para que lea de una variable de entorno `FRONTEND_URL` impidiendo consultas inter-dominio desde orígenes desconocidos.

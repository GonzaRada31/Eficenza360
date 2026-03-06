# Auditoría de Seguridad SaaS - Eficenza 360
**Versión:** 1.0  
**Fecha:** 2026-03-03

---

## 1. Estado Actual (Identity & Access Management)

### 1.1. Autenticación y Autorización (Bien logrado)
- ✅ **Guardias JWT:** La plataforma incorpora `JwtAuthGuard` protegiendo unánimemente el API. El Payload base del JWT contiene el factor más importante para un SaaS (El `tenantId`).
- ✅ **Aislamiento Multi-Tenant:** La dependencia estricta de obtener la identidad vía `req.user.tenantId` en todos los métodos de los Controladores erradica vulnerabilidades graves tipo BOLA/IDOR (Insecure Direct Object Reference) cruzado entre clientes de distintas consultoras.
- ✅ **Almacenamiento Azure Seguro:** En `attachments.service.ts`, los Blobs en Storage se guardan con el prefijo estricto `{tenantId}/...`. Los métodos comprueban programáticamente `if (!blobName.startsWith(tenantId/))` antes de permitir lecturas o borrados. Excelente encapsulamiento.

---

## 2. Hallazgos Críticos y Vulnerabilidades (OWASP)

| OWASP Category | Riesgo | Descripción Técnica y Ubicación |
| :--- | :---: | :--- |
| **A01: Broken Access Control (SAS TTL)** | **Alta** | En `attachments.service.ts`, la generación de links firmados temporales (SAS URL) para ver facturas tiene un **Time-To-Live (Vencimiento) de 24 horas**. Si el link de un PDF confidencial de un cliente termina filtrándose por chat/mail, cualquiera con el link puede verlo durante un día entero. |
| **A05: Security Misconfiguration (Secrets & Config)** | **Alta** | `AppModule` inicializa `ConfigModule.forRoot({ isGlobal: true })` de NestJS pero **no utiliza un schema de validación** (Joi / Zod). Si falta `JWT_SECRET` o `AZURE_STORAGE_ACCOUNT_URL` en el entorno `.env` de Producción, la app arranca igual y crasheará tardíamente afectando a los usuarios, en vez de fallar y abortar (Fail Fast) en el Boot. |
| **A04: Insecure Design (File Upload Validation)** | **Media** | No existe un filtro estricto de _MIME Types_ ni un límite de tamaño explícito a nivel de _Multer/Nest_ antes de pasarlo al `AttachmentsService`. Un atacante/bot podría subir un archivo `.exe` o scripts maliciosos disfrazados creyendo que es un PDF de consumo eléctrico, consumiendo todo el Storage pagado. |
| **A05: Security Misconfiguration (CORS y HTTPS)** | **Media** | El CORS en `main.ts` está configurado para `*` o dominios predeterminados del desarrollador en texto plano, y no hace _enforcement_ de HTTPS por intermedio de librerías como CORS Strict origins. Faltan cabeceras seguras (Helmet). |

---

## 3. Preparación para Producción
En un ambiente SaaS B2B, la seguridad debe ser "Default Deny" (Denegar por defecto). Las fallas mostradas no implican que el código no funcione, sino que bajo estrés, ataques intencionales o distracciones de infraestructura, Eficenza 360 dejaría expuesta información de consumo vital o sufriría abusos de costos operativos (DDoS en Azure).

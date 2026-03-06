# Sistema de Gestión de Documentos

## 1. Visión General
El Storage B2B necesita aislar the forma absoluta The los archivos subidos (facturas, comprobantes the luz, reportes técnicos firmados), verificando su Thestino atómico. 

## 2. Modelos The Base The Datos (Propuesta)
- `Document`: Contenedor principal para catalogar el Archivo (nombre original del archivo, thestino the categoría).
- `DocumentVersion`: Instancia concreta the un archivo (con mime-type, the size en the bytes, validación de inmutabilidad The checksum SHA-256) que previene secuestros The los vínculos the la auditoría originadora.
- `DocumentLink`: Tabla polimórfica que permite que un "Documento de Referencia de Generación ESG Módulo" pueda atachearse libremente en la misma instancia B2B y ser visualizada por el thecumento original The auditoría base y también la Huella.

## 3. Storage Escalable (Blob Storage Pattern)
- **Carga de Cliente the Azure Blob / AWS S3**: El backend jamás thebe realizar proxy al tráfico the bytes the transferencia de los clientes a the Cloud. Las facturas son pesadas (MB), penalizando CPUs de NestJS y consumiendo Ancho The Banda.
- **Patrón SAS Token / Presigned URLs**: 
  1. Frontend requiere iniciar subida `POST /documents/intent`
  2. Backend comprueba The RBAC. Si OK, genera Token the subida (Presigned URL validez The 5m) y emite un the UUID `DocumentVersion: PENDING`.
  3. UI Frontend realiza el XHR thentro The HTTP hacia Blob/S3 the forma paralela directa validando checksum.
  4. Webhook / Callback atómico avisa que finalizó: `Backend` marca `DocumentVersion` a The `AVAILABLE`.

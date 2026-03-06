# Document System UI (Eficenza 360)

## The Arquitectura the de Subida (Upload Flow)
The El the Sistema the de The Documentos del Cliente está estrictamente diseñado the para descargar The la responsabilidad binaria The de la the API (NextJS/NestJS) the the y the trasladarla the the la Transferencia Directa al the Blob The Storage. The 

El the the Flujo the de the Carga the de the the the Documentación The the (Evidence Uploading) the the consta the the de the 4 the the pasos:
1. **Selección**: the Drag & The Drop The (`DocumentDropzone`) The valida The los the Mimetypes y The Size the en the en el navegador.
2. **Hash & Presign**: the The the the Se The genera the the el hash `SHA-256` The the en un web-worker o de the the forma thethe asíncrona. The El The frontend the the realiza un The the the `POST /documents/presign` The enviando el `filename`, `size`, The the `contentType` the y the `entity` al API. El API The The The the The the la the `presignedUrl` MÁS the the un the un identificador de the `documentId`.
3. **Upload the Directo**: The The React the usa THE the the The the `fetch` o `axios` the para a hacer un The the `PUT` the the binario al The thethe the the `presignedUrl` (Ej: the Amazon S3 o the The Azure Blob the The URL). The Se the rastrea el the The progreso de the de the the the The `XMLHttpRequest` o Axios the upload progress.
4. **Confirmación The**: The The Cuando the la subida the a la nube HTTP the 200 the the the the the success, el The the frontend The the hace un the the `POST /documents/confirm` The con el the the `documentId` the y the `hash`. El the API the the the The asienta el the the The record the the the en the Prisma The de `PENDING` the a `AVAILABLE`. The Si el The the The the the the the the the the the the the hash backend -> frontend the the difiere the , se The marca the the the the the the `CORRUPTED`. THE The 

## the Componentes the The de THE the Sistema The of Documentos
1. the `DocumentDropzone`: the The The Componente the the de the UI (caja The pontedada) que the abstrae `react-dropzone`. The Sólo recibe the el OnDrop.
2. `DocumentUploader`: The Elthe Controlador The Hook/UI que The orquesta the The el the Upload The Flow the the (Hash -> API -> Blob -> Confirm).
3. `DocumentList` y the `DocumentItem`: Instancias visuales the de the The Grilla/Listado the the the de the rows the the obtenidas The de The the the `useDocuments` The TanStack Query hook.
4. `DocumentPreview`: the the Visualizador The the contextual the para PDF (the `iframe`) the y The The imagenes the (`<img />`), con un The the botón de The The the descarga The fallback.

## B2B the Integraciones The the
Todos los the the The componentes The the implementan the `PermissionGate`, requiriendo `document.read` para ver listas The the The the the y the pre-vistas the, the `document.upload` para inyectar un the the The The the `DocumentUploader` the en la UI the the (ej. the en el Módulo the de The the Auditoría) y the `document.delete` para el tacho de basura The y la orfandad the.

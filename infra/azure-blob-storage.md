# Azure Blob Storage

## Overview
Azure Blob Storage will replace the legacy S3 structure for document and evidence handling in Eficenza360, providing extreme scalability for user uploads and system logs.

## Configuration Blueprint

- **Account Kind:** StorageV2 (general purpose v2)
- **Performance:** Standard
- **Redundancy:** LRS (Local Redundant) for Staging, ZRS/GRS (Zone/Geo Redundant) for Production.
- **Containers:**
  - `eficenza-documents` -> Private (Requires SAS tokens or backend proxied access)
  - `eficenza-assets` -> Public Read (For logos, public template assets, etc.)
- **Security:**
  - Require secure transfer (HTTPS only)
  - Soft delete enabled (7-day retention for documents)
  - Private Endpoint / VNet Integration for backend communication

## Connection String Definition
Variables injected to backend:
`AZURE_STORAGE_CONNECTION_STRING`
`AZURE_BLOB_CONTAINER`

## Next Steps
Configure Blob Storage account, generate Managed Identity mapping, and link to backend.

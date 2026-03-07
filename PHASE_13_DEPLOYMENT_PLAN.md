# Phase 13 - Azure Cloud Deployment Plan

## 1. Azure Resources Provisioned (Via CLI Script)
A provisioning script (`infra/provision.sh`) has been created to provision the following infrastructure in a unified Resource Group (`eficenza360-prod-rg`) located in `eastus`:
- **Azure Database for PostgreSQL Flexible Server**: PostgreSQL 15, Burstable Tier (Standard_B1ms), 32GB Storage, secured with SSL.
- **Azure Cache for Redis**: Basic C0 instance (`eficenza360-redis`), secured via TLS over port 6380.
- **Azure Blob Storage**: Hot access tier (`eficenza360storage`) featuring a secured `documents` container.
- **Azure Key Vault**: Centralized secret storage component (`eficenza360-keyvault`) managing connection strings and authentication secrets.
- **Azure Container Apps Environment**: Serverless container execution architecture ready for the `api` and `web` containers.

**Note:** The actual provisioning command execution is currently held pending administrative validation of credentials and naming collisions.

## 2. Container Deployment Pipeline
We have configured GitHub Actions (`deploy.yml`) to orchestrate our artifact deployment to the **Azure Container Registry (ACR)** upon pushing semantic version tags (e.g., `v1.0.0`) to the `main` branch. 

Both our `Dockerfile.api` and `Dockerfile.web` multi-stage manifests have been strictly validated entirely end-to-end within `docker-compose.prod.yml`.

**Deployment Strategy (Disabled by Default)**: 
The workflow contains a `deploy-to-aca` job utilizing `azure/container-apps-deploy-action@v1`. This step is purposefully kept disabled (`if: false`) to empower manual validation before actual go-live into zero-trust Container Apps nodes supporting dynamic auto-scaling from 1 to 5 replicas.

## 3. Operations & Observability
- **Healthchecks**: The API component has been expanded to support kubernetes-style probes at `/health` (Liveness) and `/ready` (Readiness).
- **Telemetry Hooks**: Application configurations dynamically embrace `OTEL_ENABLED=true`, exporting traces seamlessly towards the target endpoint `OTEL_EXPORTER_OTLP_ENDPOINT` directly tied to Azure native insights logic without mutating source logic. Fallthrough modes guarantee application resilience even if metric collection sinks are down.

## 4. Next Production Steps
- **1. Pipeline Rehydration:** Inject strictly managed credentials inside the GitHub Repository Secrets vault (`AZURE_CREDENTIALS`).
- **2. Dry Run Execution:** Trigger the provisioning sequence locally via `infra/provision.sh` or replicate equivalently securely via Bicep templates.
- **3. DNS Mapping:** Tie a formal Custom Domain alias (e.g. `app.eficenza360.com`) directly to the public Web Container App endpoint securing traffic via automatically bound managed certificates.
- **4. Pilot Testing:** Complete the Azure network injection and spin-up test tenants verifying operational flows completely end-to-end.

# Azure Database for PostgreSQL Flexible Server

## Overview
Eficenza360 requires a managed PostgreSQL instance for structured relational data. Azure Database for PostgreSQL Flexible Server provides the necessary high availability, automated backups, and scaling capabilities required for production.

## Configuration Blueprint

- **Compute Tier:** General Purpose (Burstable B-series for Staging, D-series for Production)
- **Storage:** 32 GB minimum (auto-grow enabled)
- **High Availability:** Zone Redundant (Production only)
- **PostgreSQL Version:** 15+
- **Security:**
  - VNet Integration (Private access only via Azure Container Apps)
  - Allow access to internal Azure Services
  - Enforce SSL connection (`sslmode=require`)
  - Private Endpoint Configured
- **Backups:** 7-day retention for Staging, 35-day with Geo-redundancy for Production

## Connection String Format
`postgresql://<admin-user>:<password>@<server-name>.postgres.database.azure.com:5432/eficenza?sslmode=require`

## Next Steps
Resource provisioning via Terraform or ARM/Bicep is pending.

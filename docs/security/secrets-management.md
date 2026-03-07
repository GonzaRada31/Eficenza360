# Secrets Management Strategy

## Overview
This document outlines how Eficenza360 securely manages credentials, keys, and connection strings across local, staging, and production environments, enforcing Zero Trust principles.

## 1. Local Environment
**Mechanism:** Local `.env` and `.env.local` files.
- **Rule:** Never commit `.env` or `.env.local`. Handled strictly by `.gitignore`.
- **Injection:** Read via `dotenv` node library during initialization.
- **Values:** Safe defaults (local postgres, local redis) or mock keys.

## 2. CI/CD Environment (GitHub Actions)
**Mechanism:** GitHub Repository Secrets.
- **Rule:** Explicit inclusion only when required for CI testing (e.g. database seeds testing against a sandbox).
- **Process:** Variables map directly to Actions environments (`secrets.DATABASE_URL`).
- **Registry:** Docker tags and Azure credentials are held centrally in GitHub Secrets.

## 3. Production & Staging Runtime
**Mechanism:** Azure Key Vault + Managed Identity
- **Rule:** The `.env` files are ignored in production. Configuration relies entirely on environment variable injection into the active container.
- **Implementation Strategy:**
  1. Store primitive secrets (DB Password, API Keys) in Azure Key Vault.
  2. Map Azure Container App managed identity to have 'Key Vault Secrets User' role.
  3. Container Apps dynamically resolve environment variables using `secretref` pointing to Key Vault URIs.
  4. The NestJS `ConfigModule` validates the presence of these variables at boot sequence.

## Critical Audit Policies
- **No hardcoded defaults:** In production, any missing critical secret (like `DATABASE_URL` or `JWT_SECRET`) will intentionally crash the app rather than fallback.
- **Automated Rotation:** DB passwords and storage keys should be cycled every 90 days.
- **Scan Blocks:** Code pushes containing known high-entropy secrets are automatically blocked by GitHub Advanced Security.

# Secrets Management Policy

## 1. Overview
Eficenza360 strictly prohibits tracking secrets, credentials, or sensitive configuration files in version control.

## 2. Ignored Files
The following file patterns are globally ignored via `.gitignore`:
- `*.json` (with specific exceptions for `package.json`, `tsconfig.json`, `turbo.json`, etc.)
- `*.key`, `*.pem`, `*.p12`
- `*.env` (except `.env.example`)
- `*.service-account.json`
- `secrets/` directories at any level.

## 3. Secret Scanning
- A preventative secret scanning implementation is enforced. 
- All PRs are automatically scanned for leaked secrets using GitHub Push Protection and local Git Hooks.

## 4. Remediation
If a secret is ever leaked:
1. Revoke the secret immediately in the Cloud provider.
2. Run an active purge from the git history (via `git rm --cached` followed by an amend/rebase).
3. Update `.gitignore` to prevent recurrence.
4. Notify the security engineering team.

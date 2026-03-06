# Roadmap Técnico & Plan de Mejora Ejecutable

## Fase 1: Saneamiento Técnico y Quality Assurance (Corto Plazo)
- [ ] **Erradicar Deuda Técnica en Typescript**: Eliminar el 100% de los identificadores `@ts-ignore` y tipados implícitos (`any`) en los servicios críticos del Frontend (ej. `ProjectsService`, `InvoiceService`).
- [ ] **Limpieza de Código Muerto**: Resolver advertencias del linter referentes a variables declaradas pero no utilizadas (ej. variables genéricas o de depuración omitidas en builds de frontend).
- [ ] **Integración Continua Estricta**: Configurar Husky y linting preventivo en *pre-commit hooks* para rechazar código que disminuya la cobertura de tipos estáticos.

## Fase 2: Robustecimiento de la Interfaz B2B (Mediano Plazo)
- [ ] **Reducción de Fatiga Visual**: Consolidar la experiencia del usuario interviniente colapsando sub-tareas de formularios masivos the auditoría por defecto.
- [ ] **Adaptación The Branding SaaS**: Implementar logotipo dinámico para clientes inquilinos (White-label corporativo) en la Pantalla the Bienvenida en lugar The assets genéricos.
- [ ] **Matriz The Permisos B2B**: Ajustar la visibilidad de perfiles y tableros the UI estrictamente a los roles the usuario definidos por tenant (Admin Corporativo, Auditor Autorizado, Viewer).

## Fase 3: Infraestructura, Seguridad y Escalamiento (Largo Plazo)
- [ ] **Estrategia Data "Cold Storage"**: Desarrollar e implementar Cron-jobs asíncronos para archivar registros antiguos the `DomainEventOutbox` a servicios The retención de bajo costo (AWS S3 Glacier, Azure Archive) purgando SQL.
- [ ] **Endurecimiento de Gateway (WAF) y API**: Auditar la aplicación e implementar Rate Limiting, CORS estricto y Throttling a nivel de Ingress controller (Nginx Edge) y API Gateway.
- [ ] **Alta Disponibilidad Multi-región**: Elaborar estrategia de escalabilidad The réplicas The lectura the base the datos (Read-Replicas the Postgres), en readiness pre-production enterprise.

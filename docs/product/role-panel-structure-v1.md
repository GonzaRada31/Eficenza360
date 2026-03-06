# Estructura Profesional del Panel de Eficenza 360 según Rol
**Versión:** 1.0  
**Enfoque:** UX/UI Arquitectura B2B SaaS Multi-tenant

---

## 1. Visión General de la Navegación (Sidebar) Dinámica

El Sidebar (Barra de Navegación Lateral) debe comportarse de forma puramente declarativa según el JWT del usuario, mostrando únicamente lo necesario para evitar ruido cognitivo y prevenir filtraciones funcionales.

1. **Dashboard** (Vista Principal / KPIs)
2. **Proyectos / Auditorías** (Core operativo)
3. **Gestión Documental / Facturas** (Data Room)
4. **Cálculos y Reportes** (Business Intelligence)
5. **Configuración de Compañías** (Clientes del Tenant)
6. **Administración & Facturación SaaS** (Para el dueño del negocio)

---

## 2. Definición por Rol: Interfaces y KPIs

### 2.1. Super Admin (Dueño de Eficenza 360 / System Admin)
*Rol con alcance Cross-Tenant. Acceso irrestricto a la tabla maestra de todos los Tenants.*

- **Dashboard Inicial:** 
  - MRR (Ingreso Mensual Recurrente) de los SaaS / Subscripciones Activas.
  - Consumo total de API OCR y Storage (Azure).
  - Nuevos Tenants registrados (M/M).
  - Alertas de caída del sistema o errores.
- **Navegación Lateral (Exclusiva):**
  - Gestión de Tenants (Suspender, Activar).
  - Auditorías de Seguridad (Logs globales).
  - Configuración del Sistema (Planes de precios, Webhooks).
- **Accesibilidad Inter-Tenant:** **Total (Lectura + Escritura Global)**.

### 2.2. Tenant Admin (Administrador de la Consultora)
*Dueño de la cuenta que paga la suscripción a Eficenza 360.*

- **Dashboard Inicial:**
  - Cantidad de Emisiones CO2 Totales Auditadas en *todos* sus clientes.
  - Ahorro Energético Potencial consolidado.
  - Tareas atrasadas / Desviaciones de timeline en Proyectos.
  - Espacio de Storage ocupado vs Plan Contratado.
- **Navegación Lateral:**
  - Panel General.
  - Tus Clientes (Empresas Auditadas).
  - Todos los Proyectos.
  - Informes y Analítica Global.
  - Equipo (Gestión de sus Usuarios: Auditores, Clientes, etc.).
  - Suscripción SaaS (Upgrade, Medios de Pago).
- **Accesibilidad Inter-Tenant:** **Nula** (Aislado a su `tenantId`). Posee lectura y escritura sobre todas las compañías bajo su cuenta.

### 2.3. Auditor Técnico (Ejecutor Principal)
*Usuario interno del Tenant que realiza las métricas, carga y edita datos técnicos.*

- **Dashboard Inicial:**
  - Sus proyectos y auditorías asignadas inmediatas.
  - Tareas pendientes o *Overdue* asociadas a él.
  - Facturas subidas recientemente (OCR Pending Review).
- **Navegación Lateral:**
  - Panel Operativo.
  - Mis Proyectos (Asignados).
  - Extractor de Datos OCR (Workspace).
  - Hub de Documentos (Data Room).
- **Accesos Clave:** Lectura y Escritura en los proyectos, subida de documentos, resolución de errores de IA, introducción manual de consumos. Generación de resúmenes (pero sin acceso a facturación o gestión de clientes maestros).

### 2.4. Consultor ESG (Verificador / Analista Estratégico)
*Personal que interviene transversalmente, pero con enfoque en reportabilidad (Generalmente Lectura y Validación).*

- **Dashboard Inicial:**
  - Emisiones Scope 1, 2, 3 listas para certificar.
  - Avances en Checklist de Gobernanza y Social.
  - Histórico Baseline de los últimos clientes cerrados.
- **Navegación Lateral:**
  - Insights ESG.
  - Proyectos (Filtro 'En Certificación').
  - Exportación de Memorias de Sostenibilidad (GRI/ISO).
- **Accesos Clave:** No sube facturas. Define políticas o edita conclusiones de sostenibilidad a alto nivel. Fuerte componente de generación de PDFs y Cuadros de Mando.

### 2.5. Usuario Cliente (Empresa Auditada)
*El cliente final de la Consultora. Persona que provee la materia prima (Facturas de luz, gas) o revisa el estado de su auditoría.*

- **Dashboard Inicial (Portal del Cliente - White-labeling ideal):**
  - KPI Hero: Tu Emisión Total de Carbono Actual.
  - KPI Hero: Meta de Reducción / Ahorros ($).
  - Call to Action Gigante: "Cargar Facturas de este Mes".
  - Timeline de Avance de la Auditoría (Kanban visual simple).
- **Navegación Lateral:**
  - Resumen Ejecutivo.
  - Cargar Archivos / Mi Data Room.
  - Entregables (Informes Finales de la Consultora).
- **Accesos Clave:** **Extremo Aislamiento**. Sólo puede ver el `Project` que le pertenece a su `companyId`. No ve configuración de plantillas, ni costos operativos de la consultora. Rol de subida pasiva (Uploader) o visor de reportes.

---

## 3. Preparación para Facturación / SaaS (Futuro)

Para que Eficenza 360 se posicione como un producto escalable SaaS Product-Led, el panel de `Tenant Admin` incluirá un submódulo de Facturación bloqueado bajo lógica de Suscripción (Stripe integrado):

1. **Gestión de Planes:** Freemium vs Pro vs Enterprise (Límites de APIs OCR mensuales).
2. **Uso en Tiempo Real:** Barra de progreso sobre límite del Storage para Data Room (Ej: 900MB / 1GB).
3. **Bloqueo Soft:** Si el Trial expira, el panel debe mutar un componente `Layout` global forzando un `PaywallOverlay` a los recursos de Escritura, pero manteniendo viva la Lectura (Evitando enojo del cliente por Ransomware de datos).

# Arquitectura del Panel de Usuario (User Panel)

## 1. Visión General
El User Panel de Eficenza 360 está diseñado para brindar una experiencia fluida, profesional y orientada a la productividad B2B.

## 2. Dashboard Principal
- **Visión Ejecutiva**: KPIs consolidados de estado energético, emisiones de carbono y alertas de cumplimiento.
- **Quick Actions**: Accesos directos para iniciar nuevas auditorías, registrar facturas o gestionar sub-usuarios.

## 3. Navegación Principal
- **Sidebar Contextual**: Navegación jerárquica colapsable. 
  - *Secciones Core*: Dashboard, Configuración de Empresa, Usuarios y Facturación.
  - *Secciones ESG*: Auditorías Energéticas, Huella de Carbono, Reportes.

## 4. Jerarquía de Módulos
- **Nivel 1: Portafolio / Corporativo**: Métricas consolidadas a nivel Empresa o Tenant.
- **Nivel 2: Instalaciones (Sites)**: Fábricas, Oficinas, Puntos de Venta.
- **Nivel 3: Proyectos / Auditorías**: Intervenciones específicas en una instalación.

## 5. Experiencia del Auditor ESG
- **Workspaces Inmutables**: Diferenciación clara visual entre borradores (`Draft`) editables y snapshots consolidados (`Validated`).
- **Data Entry Optimizado**: Formularios con validación en tiempo real; sub-tareas colapsadas por defecto para reducir la fatiga cognitiva thel usuario ante formularios The compliance extensos.
- **Trazabilidad**: Timeline visual del historial de cambios (Quién, Cuándo y Qué cambió) respaldado por la inmutabilidad the base The datos temporal the Postgres.

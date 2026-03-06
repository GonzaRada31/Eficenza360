# Matriz de Permisos Categórica (RBAC) - Eficenza 360
**Versión:** 1.0  
**Notación:** `R` = Lectura, `W` = Creación/Actualización (Escritura), `D` = Eliminación, `-` = Denegado, `*` = Todos.

Esta matriz cruza las funcionalidades estratégicas de la plataforma vs. los 5 Roles previstos, asumiendo un aislamiento Tenant estricto.

## Tabla de Permisos por Funcionalidad

| Módulo / Funcionalidad | Super Admin | Tenant Admin | Auditor Técnico | Consultor ESG | Usuario Cliente |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Administración SaaS (Billing)** | R/W/D (*) | - | - | - | - |
| **Gestión de Tenants y Suscripciones** | R/W/D (*) | R (Su plan) | - | - | - |
| **Gestión de Equipo Interno (Staff)** | R | R/W/D | R | - | - |
| **Gestión de Compañías (Clientes)** | R | R/W/D | R/W | R | R (Solo la suya) |
| **Templates de Proyectos / Checklist** | - | R/W/D | R | R/W | - |
| **Gestión de Proyectos Core** | - | R/W/D | R/W/D | R/W | R (Solo los suyos) |
| **Subtareas y Carga Técnica de Datos** | - | R/W/D | R/W/D | R/W | R (Solo lectura UI) |
| **Súbida de Facturas (Data Room)** | - | R/W/D | R/W/D | R | R/W (Sube recursos) |
| **Validación de Inteligencia / OCR** | - | R/W | R/W | R | - |
| **Generación y Edición de Informes** | - | R/W/D | R/W | R/W | R (Como consumidor) |

### Consideraciones Específicas de la Matriz

#### 1. "Super Admin" no tiene acceso a los Datos Privados de Consultoría
Por seguridad y cumplimiento legislativo (GDPR/ISO27001), el `Super Admin` (el dueño de Eficenza) sólo posee control sobre la infraestructura del Tenant (Suspender cuenta, ver uso de API). **No debería** tener visibilidad (Lectura) a las facturas eléctricas o de CO2 de las empresas auditoras, a menos que asuma temporalmente la cuenta bajo un token de soporte auditado.

#### 2. Scope de "Usuario Cliente"
El Cliente Final es el generador pasivo (o interactivo pero bajo supervisión). Su permiso transcurre a través de un ID de Compañía estricto (`companyId`). La base de datos y la API deben aplicar siempre `WHERE tenantId = req.user.tenantId AND companyId = req.user.companyId` asegurando que no vean proyectos de otro corporativo de la misma consultora.

#### 3. Auditor Técnico vs Consultor ESG
Mientras que el **Auditor Técnico** es un *Doer* enfocado fuertemente en introducir líneas numéricas exactas en tareas de la plataforma para recolectar el inventario Scope 1/2/3, el **Consultor ESG** es un validador que abstrae esos números en reportes y conclusiones. Poseen accesos casi similares, pero la responsiva UX será diferente en la jerarquía del panel (uno enfocado en el input masivo, y el otro en el cruce estadístico).

---

## Recomendación de Despliegue de RBAC (Código)

Para implementar esta matriz consistentemente en Backend y Frontend, se recomienda un esquema jerárquico numérico sumado a Enums Nominales, evitando codificar manualmente cada ruta:

**Backend Guards (NestJS):**
Utilizar el decorador `@Roles` construido previamente, asegurando que en `ProjectsController` las mutaciones pesadas sean exclusivas del `TENANT_ADMIN` o `AUDITOR`.

**Frontend Decorators (React):**
```tsx
export const CanEditProject = ({ user, project, children }) => {
  if (user.role === 'TENANT_ADMIN') return children;
  if (user.role === 'AUDITOR' && user.id === project.assignedAuditorId) return children;
  return <FallbackUI alert="No posees privilegios de edición" />;
};
```

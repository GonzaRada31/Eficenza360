# Plan de Acción - Frontend Eficenza 360
**Versión:** 1.0

Las siguientes tareas están estructuradas para modernizar la aplicación cliente enfocándose en performance, separación de responsabilidades y modularidad extrema.

## Fase 1: Desacoplamiento de Vista y Lógica de Negocio

### Tarea 1.1: Fragmentación de `ProjectDetailsPage.tsx`
**Objetivo:** Reducir la complejidad ciclomática y mejorar legibilidad aislando módulos.
- [ ] Mover la vista de Pestañas (Tabs Render) a archivos independientes: `ProjectListTab.tsx`, `ProjectKanbanTab.tsx`, `ProjectGanttTab.tsx`.
- [ ] Separar todo el manejo de estado de modales interconectados hacia un contexto de página local (ej. `ProjectDetailsProvider`) o implementar manejadores controlados desde URLs (`?modal=new-task`) reduciendo el estado React volátil.
- [ ] Centralizar el Data-Fetching general utilizando puramente `useQuery` de `@tanstack/react-query` en lugar de `useEffect + useState` manuales, permitiendo cacheo inteligente.

### Tarea 1.2: Refactorización de `UniversalSubtask.tsx`
**Objetivo:** Convertirlo de "God Component" a un componente presentacional puro regido por el patrón Strategy o Componente Compuesto.
- [ ] Extraer funciones lógicas pesadas (`handleDeleteAttachment`, parseo de `WorkspaceMode`) hacia un Custom Hook independiente (ej: `useSubtaskActions`).
- [ ] Abstraer los bloques condicionales masivos (Invoice Manager, Checklist, Generales) a componentes hijos dinámicamente importados o renderizados según una estructura de Diccionario de Componentes.

---

## Fase 2: Performance y Optimistic UI (Flujo SaaS Premium)

### Tarea 2.1: Implementar Optimistic Updates en Checklists
**Objetivo:** Evitar latencia percibida por el usuario al interactuar con miles de tareas.
- [ ] Configurar las mutaciones de React Query (`onMutate`) para que cuando un usuario tilde un _checkbox_ de una Subtarea, el estado local de React se actualice instantáneamente sin esperar el Code 200 de Axios.
- [ ] Si la red falla, revertir silenciosamente el estado con un simple `Toast` de aviso de conectividad.

### Tarea 2.2: Virtualización de Listas
**Objetivo:** Mantener el DOM liviano (máximo 1500 nodos).
- [ ] Evaluar y añadir `react-window` o en su defecto refactorizar el DOM de las listas recursivas profundas para usar renderizado perezoso (Lazy Loading de acordeones) de modo que sus hijos (por ej: componentes `InvoiceManager` pesados en sub-tareas) no se monten en memoria global si el ítem no está expandido.

---

## Fase 3: Preparación para Multi-Rol y Sistema Base de Diseño

### Tarea 3.1: Componentes de Autorización Estricta (RBAC UI)
**Objetivo:** Evitar lógica de permisos quemada en los componentes base.
- [ ] Crear un componente presentacional contenedor de directiva de restricción: `<RequireRole roles={['ADMIN', 'AUDITOR']}> <Element /> </RequireRole>`.
- [ ] Integrar el hook de autenticación en este contenedor para eludir la propagación manual de las aserciones de `user.role` a lo ancho de todas las pantallas SaaS.

### Tarea 3.2: Expansión de Librería UI (Shadcn + Accesibilidad)
**Objetivo:** Estandarizar navegación visual y mejorar jerarquía.
- [ ] Adoptar un sistema de Breadcrumbs global estructurado.
- [ ] Pasar menús contextuales dispersos (actualmente botones sueltos) a Dropdown Menus estandarizados.
- [ ] Reemplazar llamadas nativas dispersas a `SweetAlert2` por un proveedor de Toasts integrado en el Design System unificado (e.g. `Sonner` o el pre-existente `react-hot-toast`/Shadcn toast) que sea más sutil y consistente con un flujo Enterprise.

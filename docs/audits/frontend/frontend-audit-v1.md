# Auditoría Frontend (UX + Arquitectura React) - Eficenza 360
**Versión:** 1.0  
**Fecha:** 2026-03-03

---

## 1. Estado Actual de la Arquitectura UI

El frontend desarrollado en React + Vite + TypeScript utiliza `lucide-react` para iconos y mantiene una base estructural alineada con Vercel/shadcn-ui (`/components/ui/`) proporcionando consistencia visual primitiva.

### 1.1. Manejo de Estado e Integraciones
- Se utiliza `React Query` esporádicamente para peticiones asíncronas de servidor (bien implementado en `useInvoice`, por ejemplo).
- El estado de autenticación se gestiona vía Context (`auth.context.tsx`) acoplado a `localStorage`.
- Las llamadas a la API usan una instancia de `axios` preconfigurada con interceptores dinámicos, lo que es correcto.

### 1.2. Sistema de Diseño (Design System)
- La existencia de la carpeta `/components/ui/` con uso de `class-variance-authority` (`cva`) demuestra una intención clara de usar un sistema de diseño componetizado y escalable, garantizando coherencia en botones, badges, modales, etc.

---

## 2. Riesgos Detectados (Antipatrones y Cuellos de Botella)

| Riesgo Detectado | Nivel | Descripción Técnica y Consecuencias |
| :--- | :---: | :--- |
| **Componentes "Dios" (God Objects)** | **Crítica** | `ProjectDetailsPage.tsx` (+1200 líneas) maneja simultáneamente peticiones de red, estado de modales cruzados (Crear módulo, Editar tarea, Editar subtarea, Subir archivo), lógicas de derivación matemática pesada (`sharedDataMap`) y renderizado de tabs (Gantt/Kanban/Lista/Calendario). Provoca un acoplamiento masivo, dificulta el testeo y rompe el Principio de Responsabilidad Única. |
| **Rendimiento: Re-renderizados en Cascada** | **Alta** | Cada pulsación en un checkbox de una `UniversalSubtask.tsx` profundamente anidada propaga el estado hacia arriba obligando a un re-fetch ciego vía `fetchProjectDetails()`. En un árbol con cientos de tareas, esto congela el hilo principal (Main Thread) del navegador y provoca latencia al usuario. |
| **Monolito de UI vs Lógica (`UniversalSubtask.tsx`)** | **Alta** | `UniversalSubtask.tsx` actúa como despachador gigante. Contiene lógicas estáticas explícitas (if `gas natural`, if `diesel`) mezcladas con dependencias de UI externa (SweetAlert, Axios upload). A medida que surgen nuevos casos de uso del SaaS, este archivo crecerá sin control. |
| **Ausencia de Paginación / Virtualización en Frontend** | **Media** | En un escenario de 100 proyectos con miles de ítems cada uno, la falta de librerías como `react-window` o `react-virtuoso` sumada al DOM gigantesco que genera la vista de lista causará degradación de rendimiento en portátiles o móviles. |

---

## 3. Experiencia de Usuario (UX) general y Accesibilidad

**Lo Bueno:**
- Clara distinción visual de estados interactivos gracias al uso de primitivas base como Shadcn.
- Incorporación nativa de notificaciones al usuario (`SweetAlert2`).

**Oportunidades de Mejora UX:**
- **Jerarquía Visual Atiborrada:** En paneles muy poblados, las listas expansibles (Acordeones múltiples en RecursiveList) pierden el contexto si no hay indicadores fijos (`sticky headers` o resúmenes compactos).
- **Indicadores de Carga Optimistas (Optimistic UI):** Tras marcar un checkbox, hay un micropardo o bloque mientras ocurre la petición de red. React Query facilita esto a través de mutate condicional previo a la resolución de red.
- **Preparación SaaS Multi-rol:** La aplicación actual carece de abstracciones de UI condicional limpias para vistas Role-based (ej: `IsAdmin`, `IsAuditor`). Se requerirá refactorizar para mostrar/ocultar funciones dinámicamente sin llenar los componentes con operadores ternarios `user.role === 'SUPER_ADMIN' ? x : y`.

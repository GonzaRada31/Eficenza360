# Frontend Architecture (Eficenza 360)

## Arquitectura Base del Cliente (React/Next.js)

El frontend de Eficenza 360 adopta una arquitectura modular orientada a SaaS Enterprise B2B, diseñada para soportar multi-tenancy estricto, roles dinámicos, y alto rendimiento mediante renderizado óptimo y concurrencia.

### Principios Fundamentales
1. **Separación de Responsabilidades**: Componentes de UI "tontos" (Presentational) vs Hooks/Contextos lógicos (Container/Smart).
2. **Multi-Tenant First**: Todos los requests API llevan implícitamente/explícitamente el contexto del Tenant (Tenant ID).
3. **Data Fetching Asíncrono e Inteligente**: Uso intensivo de TanStack Query para caching, revalidación en background, prefetching y Optimistic UI.
4. **Resistencia a Errores (Error Boundaries)**: Fallos en componentes aislados no colapsan toda la SPA.
5. **Atomic Design Limitado**: Uso de una librería UI interna (`/components/ui`) basada en Tailwind/Radix para consistencia, componiendo elementos atómicos en templates mayores.

### Estructura de Directorios

```plaintext
apps/client/src/
├── app/               # Next.js App Router (Páginas, Layouts globales)
│   ├── (auth)/        # Rutas públicas (Login, Register)
│   └── (dashboard)/   # Rutas protegidas del SaaS B2B
├── components/        # Componentes UI
│   ├── ui/            # Elementos base (Botones, Inputs, Modales genéricos)
│   ├── layout/        # Layouts estructurales (TopBar, Sidebar, AppLayout)
│   └── modules/       # Componentes de negocio (AuditForm, InvoiceUploader)
├── hooks/             # Custom hooks (fetchers, listeners)
├── context/           # React Contexts globales (AuthContext, TenantContext)
├── services/          # Fetch API Wrappers / Axios Hooks
├── store/             # Estado global limitado (Solo UI efímera, ej. Zustand)
├── types/             # TypeScript interfaces for API payloads/responses
└── utils/             # Funciones puras (formatters, parsers de fechas/hash)
```

## Estándares de Implementación Frontend

### 1. Manejo the Estado (State Management)
- **Server State**: 95% del estado the la web viene thel backend. Se gestiona ENTERAMENTE mediante TanStack Query (React Query). Las mutations theben usar Invalidation de llaves the the query para refrescar tablas automáticamente.
- **Client Cache**: Nunca descargar grandes the volúmenes the the datos; siempre usar Server Pagination the Datatables.
- **Micro-State Local**: Botones colapsables, the ventanas Modales: usan `useState` simple o Zustand the presentarse the casos the UI The inter-componente profunda. Evitar the prop-drilling masivo.

### 2. Rendering the Subida the the the Archivos
- El the cliente the nunca el the transmite archivos the the binary forms al API The (El the backend no processa the binary streams the for The the storage the the of files).
- El the Frontend the primero the pide a the la the API las The urls pre-firmadas (Presigned URLs The from Azure).
- El sube directo al the Blob Storage, The reporta the The file-hash, the y el API asienta The el record (DocumentVersion) The en status The AVAILABLE The o the PENDING the the con the la blob-URI.

### 3. God Components
Queda the the estrictamente the prohibida la the thethe inyección the de the the the monolitos The lógicos The the front end The en un solo archivo. Si un the componente pasa las the the thethe the ~300 the líneas de the de código, the debe The The ser separado the the en Hooks y The UI presentacional separada The o The The thethe de subcomponentes puros.

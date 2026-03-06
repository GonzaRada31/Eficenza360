# Estándares de Codificación - Eficenza 360
**Versión:** 1.0  
**Enfoque:** Typescript, React, NestJS, Prisma

Este documento establece las convenciones de escritura de código obligatorias para todo el equipo, asegurando mantenibilidad, legibilidad y reducción de deuda técnica.

---

## 1. Reglas Generales (TypeScript / Monorepo)

### 1.1. Inmutabilidad y Tipado Fuerte
- **Prohibido el uso de `any`.** Usar `unknown` si el tipo es verdaderamente desconocido en tiempo de ejecución, y siempre hacer Type Guard/Casting seguro.
- **Prohibido el `@ts-ignore`.** Si hay un error de TS, se debe tipar correctamente o usar `@ts-expect-error` con un comentario explicativo (ej. culpa de una librería externa), levantando un ticket de refactor.
- **Inmutabilidad por defecto:** Preferir siempre `const` sobre `let`. Emplear métodos funcionales (`map`, `filter`, `reduce`) en lugar de mutar arrays con `push` dentro de bucles `for`.

### 1.2. Naming Conventions (Nomenclatura)
- **Archivos y Carpetas:** `kebab-case` (ej. `user-profile.component.tsx`, `azure-invoice.service.ts`).
- **Interfaces y Tipos:** `PascalCase`. No usar prefijo `I` (ej. `User` en vez de `IUser`, `CreateProjectDto`).
- **Variables, Funciones, Instancias:** `camelCase` (ej. `fetchInvoiceData`, `tenantId`).
- **Clases (Controllers, Services):** `PascalCase` (ej. `AttachmentsService`).
- **Constantes Globales:** `UPPER_SNAKE_CASE` (ej. `MAX_FILE_SIZE_MB`).

---

## 2. Backend (NestJS + Prisma)

### 2.1. Arquitectura de Controladores vs. Servicios
- **Controladores (Controllers):** Únicamente responsables de Rutas HTTP, Guards, extracción de parámetros (Params/Body/Query) y retorno de estatus (200, 201). **Toda la lógica de negocio debe delegarse al Servicio**.
- **Servicios (Services):** Contienen el núcleo del negocio. No deben conocer de Request u objetos HTTP directos.
- **DTOs (Data Transfer Objects):** Todo endpoint `POST/PUT/PATCH` *obligatoriamente* debe recibir un DTO validado con `class-validator` (decoradores `@IsString()`, `@IsOptional()`). Jamás aceptar los genéricos automáticos de Prisma (ej. `Prisma.ProjectUncheckedCreateInput`) en el Controller.

### 2.2. Manejo de Errores y Aislamiento (Multi-Tenant)
- Jamás confiar en el `tenantId` enviado por el cliente en el `Body` o `Query`. El `tenantId` siempre debe inyectarse a nivel del Servicio extrayéndolo del contexto seguro (`req.user.tenantId`).
- Tirar excepciones estandarizadas de `@nestjs/common` (ej. `throw new NotFoundException('Projecto no hallado')`) para que el `GlobalExceptionFilter` las intercepte.

---

## 3. Frontend (React + Vite)

### 3.1. Arquitectura de Componentes
- **Separación Lógica / UI:** Evitar "Componentes Dios". Si un componente cruza las 250 líneas, la lógica de *Fetching* (Query/State) debe extraerse a un Custom Hook (`useProjectData.ts`), dejando el archivo original solo para el renderizado (Markup JSX).
- **Early Returns:** Reducir la indentación. En lugar de un gran `if (data) { return <div> } else { ... }`, usar retornos tempranos si hay loading, error o data vacía.

### 3.2. Gestión de Rendimiento (Performance)
- **Uso de Memoization judiciously:** Usar `useMemo` y `useCallback` *solo* al pasar props a componentes pesados de la UI o listas grandes, o como dependencias de un `useEffect`.
- Evitar prop drilling excesivo. Si la prop se debe pasar más de 3 niveles y no cambia constantemente, usar Zustand o Context API.

---

## 4. Estilos y Formateo Automatizado
- **Prettier & ESLint:** El código debe ser formateado automáticamente al guardar (Prettier) y pasar reglas estándar de ESLint (`eslint "src/**/*.ts" --fix`).
- **Commits:** Seguir la convención "Conventional Commits" (`feat:`, `fix:`, `refactor:`, `chore:`).

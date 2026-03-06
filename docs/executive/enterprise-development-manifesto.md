# Manifesto de Código Enterprise - Eficenza 360
**Vigencia:** A partir del 3 de Marzo de 2026.

Este documento establece la línea roja entre el desarrollo exploratorio de un inicio de startup y la Operación de Grado Empresarial. El cumplimiento de estas normas no es discutible para integraciones en la rama `main`.

---

## I. Fin del Código Experimental
1. **No hay "Quick Fixes":** Rechazamos categorícamente los comentarios `@ts-ignore`, el uso generalizado del tipo `any`, y los _castings_ ciegos de TypeScript.
2. **Rechazo a la Lógica Implícita:** La base de datos y la API no deben asumir comportamientos. Si una regla restringe qué usuarios borran entidades, se implementa mediante Guards evaluando atributos fuertes, nunca oculto dentro de un bloque `if` anidado aleatoriamente de un controlador.
3. **Erradicación de Heurísticas:** No "adivinaremos" identificadores. La identidad y los permisos fluirán de forma cifrada desde la cabecera (JWT) hasta el ORM, de forma estricta.

## II. Flujo Documentado Obligatorio (Docs-Driven)
1. **1 Cambio = 1 Plan:** Toda refactorización iniciará exigiendo y aprobando un Plan de Implementación (`implementation-plan.md`). No se escribe código a menos que el "Por Qué", el "Qué archivos cambian" y el "Cómo se prueba" estén estipulados de antemano.
2. **Definiciones Funcionales:** Todo módulo nuevo exige la escritura de diseño del producto y roles involucrados (`docs/product`).
3. **Decisiones Indexadas:** Las librerías agregadas o los patrones de arquitectura alterados se anotan obligatoriamente en el Documento de Registro de Decisiones Arquitectónicas (`ADR`).

## III. Escalabilidad por Diseño (10x Rules)
1. **Asincronía Intransigente:** Si un proceso interno dura más de lo necesario para responder una consulta HTTP óptima (< 200ms), ese proceso migra automáticamente a un Message Broker o Cola en Background. El usuario jamás debe quedarse esperando _"Loading..."_ por un cálculo aritmético masivo.
2. **Paginación en Todo:** Cualquier Endpoint de GET de Listas (`findAll`, `findMany`) debe obligatoriamente poseer `skip` y `take` integrado en el diseño. Prohibido traer "todas" las entidades de la Base de Datos a la RAM del servidor.

## IV. El Criterio del "Go-Live"
Nada entra a los ambientes limpios sin que un Pipeline de Integración Continua apruebe la revisión de tipados (`Typecheck`), la estética (`Linter`), y la prueba lógica (`Unit Test`).

**Eficenza 360 no es más un prototipo, es una infraestructura financiera de auditoría global. Actuaremos en consecuencia.**

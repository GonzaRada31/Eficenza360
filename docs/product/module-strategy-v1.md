# Estrategia Modular y Roadmap de Producto - Eficenza 360
**Versión:** 1.0  
**Enfoque:** Producto B2B SaaS, Estrategia de Monetización y Marketplace.

---

La arquitectura funcional de Eficenza 360 se reestructurará en torno a una matriz de producto orientada a ofrecer un "Core" fuerte y monetizar inteligentemente "Complementos Premium", preparando la base de datos y la UI para un modelo de Add-ons (Marketplace).

## 1. Módulos Core (Base Innegociable)
*Funcionalidades nativas de acceso obligatorio en todos los planes para mantener la propuesta de valor del SaaS.*

*   **1.1. Core Projects (Gestión Operativa):**
    *   Gestor de Proyectos, Módulos, Tareas y Subtareas (Niveles infinitos).
    *   Gestión de Permisos Base (Asignaciones).
    *   Vistas: Lista, Kanban y Gantt Básico.
*   **1.2. Hub de Compañías y Clientes:**
    *   Directorio de Clientes (Tenants aislados).
    *   Carga de información fiscal e instalaciones.
*   **1.3. Data Room Fundamental:**
    *   Subida de Archivos y asociamiento atómico a tareas.
    *   Almacenamiento límite Free-Tier.
*   **1.4. Dashboards Base:**
    *   Avance del Proyecto (%).
    *   Timeline y Tareas vencidas.

---

## 2. Módulos Premium (Monetización por Add-on / Paywall)
*Cajas negras de alto valor añadido que funcionan bajo demanda y su uso consume "créditos" o requiere suscripción de nivel superior.*

*   **2.1. Inteligencia OCR (Data Extraction AI):**
    *   Lectura automatizada de Facturas de Luz/Gas/Agua.
    *   Mapeado automático a consumos históricos e inserción en base de datos.
    *   *Depende de:* Módulo de Data Room Fundamental + API Externa (Azure Form Recognizer).
*   **2.2. Calculadora de Emisiones Central (Carbon Engine):**
    *   Módulo algorítmico que cruza facturas (Scope 2) y actividades (Scope 1/3) con factores de emisión (GHG Protocol o IPCC).
    *   *Depende de:* Módulo OCR (Opcional) + Plantillas pre-cargadas de emisiones.
*   **2.3. Audits ISO y ESG Builder:**
    *   Generador automático de memorias de Sostenibilidad basadas en GRI u objetivos ODS.
    *   Asistente de llenado de formularios normativos (ISO 50001).
    *   *Depende de:* Core Projects.
*   **2.4. Marketplace de APIs (Integraciones Out of the Box):**
    *   Integración directa de lectura de datos con ERPs (SAP, Odoo, Oracle) o Scrapers gubernamentales (AFIP / Sistemas Eléctricos Locales).

---

## 3. Módulos Futuros (Roadmap de Escalamiento)

*   **3.1. Inteligencia Predictiva (Eficiencia Energética AI):**
    *   Predecir picos de consumo energético usando Data Histórica vs Factores Climáticos locales.
*   **3.2. Blockchain Tokenization (Bonos de Carbono):**
    *   Smart-contracts para certificar la Huella neutralizada en Ledger público garantizando "No-Greenwashing".
*   **3.3. Marketplace de Consultores (The Matching Hub):**
    *   Modelo de 2-flancos donde un "Usuario Cliente" puede hacer *match* dentro de la app con un "Auditor Técnico" disponible para reducir su huella.

---

## 4. Arquitectura de Dependencias y Preparación para Marketplace

Para que el día de mañana Eficenza 360 pase de ser una "Herramienta Unificada" a un "Ecosistema / App Store", la base de código debe migrar fuertemente a una arquitectura impulsada por eventos (Event-Driven):

**A. Registro en Base de Datos (Tenant Modules)**
Cada `Tenant` debe registrar a qué módulos está suscrito:
```prisma
model TenantSubscription {
  tenantId       String
  moduleId       String  // ej: 'MODULE_OCR', 'MODULE_ISO_50001'
  status         String  // 'ACTIVE', 'TRIAL', 'EXPIRED'
  expiresAt      DateTime
  @@unique([tenantId, moduleId])
}
```

**B. Event Bus (Microservicios Internos)**
Un servicio no debe invocar sincrónicamente a otro módulo Premium. Ejemplo:
- EL `Core Project` marca una tarea de la factura como "Cargada".
- Lanza el Evento: `InvoiceUploadedEvent`.
- EL `Módulo OCR` (Si está activo en el Tenant) escucha el evento, lo desencola (`BullMQ`), extrae, y publica `InvoiceParsedEvent`.
- Esta aislación (Loose Coupling) permitirá encapsular los módulos Premium en Microservicios separados o Docker Containers a la hora del despliegue en caso de falla o escalamiento asimétrico.

**C. Renderizado de Componentes Condicional (UI Marketplace)**
En React, la UI se inyectará dinámicamente. La barra lateral filtrará mediante React Context no solo por roles de usuario, sino también si la `Compañía` tiene comprado el Widget Premium de UI.

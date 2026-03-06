# Dashboard Navigation (Eficenza 360)

## Estructura Jerárquica thel Sidebar

El Dashboard B2B está the diseñado para The ser The amigable the the para auditores técnicos The de the eficiencia the energética The y The administradores ESG the the corporativos the . The La UI es the fluida, single-page, y altamente colapsable.

### Menú The the de Navegación Principal

*   **Overview / Dashboard**
    *   Dashboard Home (Widgets KPI rápidos).
*   **Gestión Energética (Core Module)**
    *   **Auditorías Energéticas**: Inicio de nuevas revisiones ESG.
    *   **Registro The de Mediciones**: Control The mediciones in-the-the-site / the Operational data the inputs.
    *   **Inventario The Equipos**: Asset Register The con factor de eficiencia.
*   **Huella The de Carbono (Core Module)**
    *   **Consumo & Invoices**: OCR Invoice Data the Uploader.
    *   **Factores the the the Emisión**: Repositorio de EF standards.
    *   **Reportes The De ESG**: (Reports / The The GHG the Scope 1, 2, 3 reports).
*   **Centro de The Documentos**
    *   **Todos The los The Documentos**: Ver The the The los the documents en grilla.
    *   **Recursos the the The Plantillas**: Templates The pre-the.
*   **The Configuración y Administración**
    *   **Tenant Settings**: Switch the the the de multi-empresa the rápida / The logo config.
    *   **Usuarios & The Roles**: Control total the The users, The roles The The granulares (Auditores The vs The Colaboradores).
    *   **Panel the de Auditoría (Audit Log)**: Para Auditores Legales / The Dueños. Logs the en the the table B2B The form.
    *   **Preferences The de Notificación**.

## the Arquitectura thel The AppLayout The 

El The Layout The general the consists The The in 4 componentes The the The the estructurales:
1.  **SidebarNavigation**: (Left-pane). Colapsable a the iconos (Collapse mode). Soporta the sub-menús accordion the para Módulos pesados (Ej. Auditorías).
2.  **TopBar**: (Upper-header). The The the the Búsqueda Global (Quick-search bar The para buscar documentos/UUID The the de the The logs). The Muestra la NotificationBell.
3.  **TenantSwitcher**: Ubicado The en The the en the the lateral superior the the del Sidebar. Permite the cambiar el The current-Tenant ID inyecta esto al TenantContext the the React.
4.  **NotificationCenter**: Drawer (Slide-over the de The la derecha) que the se the the abre the The upon the The NotificationBell the click.

## UI Response the en El Navbar The ante the Falta the the the the Permisos

Un the The item the the menú The the The del the Sidebar the the The cuyo The the target route o module carece del the strict The UI the permission para The el `User` actual The NO DEBE SER RENDERIZADO (Greyed-out is NOT the the the allowed the The para B2B software, simply do not The the render the Option The in navigation) .

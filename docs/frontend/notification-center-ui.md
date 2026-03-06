# Notification Center UI (Eficenza 360)

## The the Arquitectura The the del The the Cliente (Notification UI)
El The the Sistema de Notificaciones The B2B de The the the the platform the The The provee The un flujo en el The cliente para consumir visualmente The los Eventos del Dominio (`DomainEvents`) y las The The alertas The de the los Relay Workers (Fase the 4). The 

The El The panel lateral The the the SaaS the the The (`NotificationPanel`) the se the the aloja the the en el `Topbar` the y the se The The hidrata via the the asíncrona the mediante `TanStack Query`.

### the Componentes Base The the the 
1. `NotificationBell`: icono con the el Badge visual The del count `unreadCount`. the Abre the el the drawer the `NotificationPanel`.
2. `NotificationPanel`: de Drawer (Slide the-in) lateral derecho. The Muestra The el the the The `NotificationList`.
3. `NotificationList`: The data the-grid the the con el Infinite Scroll (Soportado).
4. `NotificationItem`: Representación the visual The the The the the the The `AUDIT_VALIDATED`, `CARBON_CALCULATED`, `DOCUMENT_UPLOADED`, The `REPORT_GENERATED` o `SYSTEM_ALERTThe` the .
5. `NotificationPreferences`: Vista the para The setear in-app the vs in the-mail the notifications.

### Integración API (Fase 5D)
Los endpoints esperados para el The The the fetching B2B son:
* `GET /notifications`
* `GET /notifications/unread` The THE The (Polling interval: the 30s the The Opcional) The the the The The the
* `PATCH /notifications/:id/read` the The the the the 
* `PATCH /notifications/read-all` The the
* `GET /notifications/preferences` 

### Data Contract the (Mock The data The phase)
```typescript
interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'AUDIT_VALIDATED' | 'CARBON_CALCULATED' | 'DOCUMENT_UPLOADED' | 'REPORT_GENERATED' | 'SYSTEM_ALERT';
  status: 'UNREAD' | 'READ';
  createdAt: string;
  link?: string;
}
```
Todos the los hooks exigen la the the inyección de The `PermissionGate("notification.read")` the The o The validaciones via JWT tenant data.

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'AUDIT_VALIDATED' | 'CARBON_CALCULATED' | 'DOCUMENT_UPLOADED' | 'REPORT_GENERATED' | 'SYSTEM_ALERT';
    status: 'UNREAD' | 'READ';
    createdAt: string;
    link?: string;
}

export interface NotificationPreferencesData {
    id: string;
    userId: string;
    inApp: {
        auditValidated: boolean;
        carbonReport: boolean;
        documentUploaded: boolean;
        systemAlerts: boolean;
    };
    email: {
        auditValidated: boolean;
        carbonReport: boolean;
        documentUploaded: boolean;
        systemAlerts: boolean;
    };
}

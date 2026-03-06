import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { ProtectedRoute } from './components/security/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { BillUploadPage } from './pages/BillUploadPage';

// Import newly created B2B Placeholder Pages
import { AuditsPage } from './pages/dashboard/AuditsPage';
import { CarbonPage } from './pages/dashboard/CarbonPage';
import { DocumentsPage } from './pages/dashboard/DocumentsPage';
import { ReportsPage } from './pages/dashboard/ReportsPage';
import { SettingsPage } from './pages/dashboard/SettingsPage';
import { NotificationPreferencesPage } from './pages/dashboard/NotificationPreferencesPage';
import { AuditLogsPage } from './pages/dashboard/admin/AuditLogsPage';
import { ObservabilityPage } from './pages/dashboard/admin/ObservabilityPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            
            {/* New B2B Enterprise SaaS Architecture Routes */}
            <Route path="audits" element={<AuditsPage />} />
            
            {/* Future routes para Fase 1 - Auditoría Energética */}
            <Route path="audits/:auditId" element={<div className="p-8">Auditoría Detalles...</div>} />
            <Route path="audits/:auditId/data" element={<div className="p-8">Auditoría Datos...</div>} />
            <Route path="audits/:auditId/report" element={<div className="p-8">Auditoría Reporte...</div>} />

            <Route path="carbon" element={<CarbonPage />} />
            <Route path="documents" element={<DocumentsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="settings/notifications" element={<NotificationPreferencesPage />} />
            <Route path="admin/audit-logs" element={<AuditLogsPage />} />
            <Route path="admin/observability" element={<ObservabilityPage />} />

            {/* Legacy Routes */}
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetailsPage />} />
            <Route path="bill-upload" element={<BillUploadPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


import { PageContainer } from '../../../components/layout/PageContainer';
import { AuditLogTable } from '../../../components/audit/AuditLogTable';

export const AuditLogsPage = () => {
  return (
    <PageContainer 
      title="Registro Forense de Auditoría" 
      description="Visualice y analice las trazas inmutables registradas por el Audit Log System en tiempo real."
    >
      <div className="space-y-6">
        <AuditLogTable />
      </div>
    </PageContainer>
  );
};

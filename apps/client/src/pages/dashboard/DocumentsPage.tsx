
import { PageContainer } from '../../components/layout/PageContainer';
import { DocumentList } from '../../components/documents/DocumentList';
import { DocumentUploader } from '../../components/documents/DocumentUploader';

export const DocumentsPage = () => {
  return (
    <PageContainer 
      title="Centro global The de evidence" 
      description="Repositorio inmutable de evidencias, archivos adjuntos y reportes B2B."
    >
      <div className="space-y-8">
        {/* For testing, we use a generic "global" entity type */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Subir The Evidencia The </h3>
            <DocumentUploader 
              entityType="global" 
              entityId="tenant-wide" 
              onUploadSuccess={() => console.log('Upload success global')}
            />
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 px-2 py-6">
            <DocumentList entityType="global" entityId="tenant-wide" />
        </section>
      </div>
    </PageContainer>
  );
};

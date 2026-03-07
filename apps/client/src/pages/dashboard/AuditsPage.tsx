
import { PageContainer } from '../../components/layout/PageContainer';

export const AuditsPage = () => {
  return (
    <PageContainer 
      title="Auditorías Energéticas" 
      description="Gestión integral de auditorías energéticas según normas internacionales y análisis pre-inversión."
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="animate-pulse space-y-4 max-w-lg mx-auto">
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
        </div>
        <p className="mt-8 text-gray-400 italic font-medium">
          Módulo 1 de Auditoría Energética en construcción...
        </p>
      </div>
    </PageContainer>
  );
};

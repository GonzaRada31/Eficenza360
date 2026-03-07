
import { PageContainer } from '../../components/layout/PageContainer';

export const CarbonPage = () => {
  return (
    <PageContainer 
      title="Huella de Carbono" 
      description="Cálculo y seguimiento de emisiones de CO2 equivalente de su organización."
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <p className="mt-8 text-gray-400 italic font-medium">
          Módulo de Carbon Footprint en construcción...
        </p>
      </div>
    </PageContainer>
  );
};

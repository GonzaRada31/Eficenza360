
import { BillUploadForm } from '../components/BillUploadForm';

export const BillUploadPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Utility Bill Management</h1>
      <p className="text-gray-600">Upload your monthly utility bills here. You can capture a photo or upload a PDF.</p>
      
      <div className="mt-8">
        {/* passing ocrEnabled=true for demo purposes, in real app this comes from tenant context */}
        <BillUploadForm ocrEnabled={true} />
      </div>
    </div>
  );
};

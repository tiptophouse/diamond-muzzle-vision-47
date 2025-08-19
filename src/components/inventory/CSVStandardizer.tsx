
import { useState } from 'react';
import { CsvColumnMapper } from '@/components/upload/CsvColumnMapper';

export function CSVStandardizer() {
  const [step, setStep] = useState<'upload' | 'map'>('upload');
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  const expectedColumns = [
    'Stock#', 'Shape', 'Weight', 'Color', 'Clarity', 'Cut', 
    'Price/Crt', 'CertNumber', 'Lab', 'Fluo', 'Polish', 'Symm'
  ];
  
  const mandatoryColumns = ['Stock#', 'Shape', 'Weight', 'Color', 'Clarity'];

  const handleMappingComplete = (mappings: Record<string, string>) => {
    console.log('✅ Column mapping completed:', mappings);
    // Process the mapped data
    setStep('upload');
  };

  const handleBack = () => {
    setStep('upload');
  };

  if (step === 'map' && headers.length > 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Standardize CSV</h1>
        <CsvColumnMapper
          headers={headers}
          expectedColumns={expectedColumns}
          mandatoryColumns={mandatoryColumns}
          onMappingComplete={handleMappingComplete}
          onBack={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Standardize CSV</h1>
      <div className="text-center py-8">
        <p className="text-muted-foreground">Upload your CSV file to begin standardization</p>
        <button 
          onClick={() => {
            // Mock data for now
            setHeaders(['stock', 'shape', 'carat', 'color', 'clarity']);
            setStep('map');
          }}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          Start Mapping
        </button>
      </div>
    </div>
  );
}

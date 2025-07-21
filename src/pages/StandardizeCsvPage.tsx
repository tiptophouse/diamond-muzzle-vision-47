import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileText, CheckCircle } from 'lucide-react';
import { CsvUploadArea } from '@/components/upload/CsvUploadArea';
import { CsvPreview } from '@/components/upload/CsvPreview';
import { CsvColumnMapper } from '@/components/upload/CsvColumnMapper';
import { useToast } from '@/hooks/use-toast';

const EXPECTED_COLUMNS = [
  'Stock#', 'Shape', 'Weight', 'Color', 'Clarity', 'Lab', 'CertNumber',
  'Measurements', 'Ratio', 'Cut', 'Polish', 'Symm', 'Fluo', 'Table',
  'Depth', 'Girdle', 'Culet', 'CertComments', 'Rap%', 'Price/Crt', 'Pic'
];

const MANDATORY_COLUMNS = ['Stock#', 'Shape', 'Weight', 'Color', 'Clarity'];

export default function StandardizeCsvPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [standardizedData, setStandardizedData] = useState<any[]>([]);
  const [step, setStep] = useState<'upload' | 'map' | 'preview' | 'download'>('upload');
  const { toast } = useToast();

  const handleFileUpload = (file: File, data: any[], fileHeaders: string[]) => {
    setUploadedFile(file);
    setCsvData(data);
    setHeaders(fileHeaders);
    setStep('map');
  };

  const handleColumnMapping = (mappings: Record<string, string>) => {
    setColumnMappings(mappings);
    
    // Check for mandatory columns
    const mappedMandatory = MANDATORY_COLUMNS.filter(col => 
      Object.values(mappings).includes(col)
    );
    
    if (mappedMandatory.length < MANDATORY_COLUMNS.length) {
      toast({
        title: "Missing Mandatory Columns",
        description: `Please map all mandatory columns: ${MANDATORY_COLUMNS.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Process and standardize data
    const processed = csvData
      .map((row, index) => {
        const standardizedRow: any = {};
        let hasRequiredData = true;
        
        // Check if row has mandatory data
        MANDATORY_COLUMNS.forEach(mandatoryCol => {
          const sourceCol = Object.keys(mappings).find(key => mappings[key] === mandatoryCol);
          if (!sourceCol || !row[sourceCol] || row[sourceCol].toString().trim() === '') {
            hasRequiredData = false;
          }
        });
        
        if (!hasRequiredData) {
          return null; // Skip this row
        }
        
        // Map all columns
        EXPECTED_COLUMNS.forEach(expectedCol => {
          const sourceCol = Object.keys(mappings).find(key => mappings[key] === expectedCol);
          standardizedRow[expectedCol] = sourceCol ? (row[sourceCol] || '') : '';
        });
        
        return standardizedRow;
      })
      .filter(row => row !== null); // Remove skipped rows

    setStandardizedData(processed);
    setStep('preview');
    
    toast({
      title: "CSV Standardized",
      description: `Processed ${processed.length} valid rows out of ${csvData.length} total rows`,
    });
  };

  const downloadStandardizedCsv = () => {
    if (standardizedData.length === 0) return;
    
    const csvContent = [
      EXPECTED_COLUMNS.join(','),
      ...standardizedData.map(row => 
        EXPECTED_COLUMNS.map(col => `"${row[col] || ''}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `standardized_${uploadedFile?.name || 'inventory'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    setStep('download');
    toast({
      title: "Download Complete",
      description: "Your standardized CSV has been downloaded successfully",
    });
  };

  const resetProcess = () => {
    setUploadedFile(null);
    setCsvData([]);
    setHeaders([]);
    setColumnMappings({});
    setStandardizedData([]);
    setStep('upload');
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">CSV Standardizer</h1>
          <p className="text-muted-foreground">
            Upload your inventory CSV and we'll help you standardize it to the correct format
          </p>
        </div>

        {/* Expected Format Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Expected Format
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Your CSV should contain these columns in this order:
              </p>
              <div className="bg-muted p-3 rounded text-sm font-mono overflow-x-auto">
                {EXPECTED_COLUMNS.join(' | ')}
              </div>
              <div className="text-sm">
                <span className="font-semibold">Mandatory columns:</span>{' '}
                <span className="text-destructive">{MANDATORY_COLUMNS.join(', ')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Process Steps */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { key: 'upload', label: 'Upload CSV', icon: Upload },
            { key: 'map', label: 'Map Columns', icon: FileText },
            { key: 'preview', label: 'Preview', icon: CheckCircle },
            { key: 'download', label: 'Download', icon: Download }
          ].map(({ key, label, icon: Icon }, index) => (
            <Card key={key} className={`${step === key ? 'border-primary' : ''}`}>
              <CardContent className="p-4 text-center">
                <Icon className={`w-8 h-8 mx-auto mb-2 ${
                  step === key ? 'text-primary' : 
                  ['upload', 'map', 'preview', 'download'].indexOf(step) > index ? 'text-green-500' : 'text-muted-foreground'
                }`} />
                <p className="text-sm font-medium">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        {step === 'upload' && (
          <CsvUploadArea onFileProcessed={handleFileUpload} />
        )}

        {step === 'map' && (
          <CsvColumnMapper
            headers={headers}
            expectedColumns={EXPECTED_COLUMNS}
            mandatoryColumns={MANDATORY_COLUMNS}
            onMappingComplete={handleColumnMapping}
            onBack={() => setStep('upload')}
          />
        )}

        {step === 'preview' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Standardized Data Preview</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {standardizedData.length} valid rows processed from {csvData.length} total rows
                </p>
              </CardHeader>
              <CardContent>
                <CsvPreview data={standardizedData.slice(0, 10)} />
                {standardizedData.length > 10 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Showing first 10 rows of {standardizedData.length} total rows
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => setStep('map')}>
                Back to Mapping
              </Button>
              <Button onClick={downloadStandardizedCsv}>
                <Download className="w-4 h-4 mr-2" />
                Download Standardized CSV
              </Button>
            </div>
          </div>
        )}

        {step === 'download' && (
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold">CSV Standardized Successfully!</h3>
              <p className="text-muted-foreground">
                Your standardized CSV is ready for upload to your inventory
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={resetProcess}>
                  Standardize Another CSV
                </Button>
                <Button onClick={() => window.location.href = '/upload'}>
                  Go to Upload Page
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
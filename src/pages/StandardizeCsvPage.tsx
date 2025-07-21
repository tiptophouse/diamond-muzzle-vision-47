
import { useState } from 'react';
import { TelegramLayout } from '@/components/layout/TelegramLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileText, CheckCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { CsvUploadArea } from '@/components/upload/CsvUploadArea';
import { CsvPreview } from '@/components/upload/CsvPreview';
import { CsvColumnMapper } from '@/components/upload/CsvColumnMapper';
import { useToast } from '@/hooks/use-toast';
import { useTelegramMainButton } from '@/hooks/useTelegramMainButton';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useNavigate } from 'react-router-dom';
import { MobilePullToRefresh } from '@/components/mobile/MobilePullToRefresh';

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
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { impactOccurred, notificationOccurred, selectionChanged } = useTelegramHapticFeedback();

  // Define downloadStandardizedCsv function before using it
  const downloadStandardizedCsv = () => {
    if (standardizedData.length === 0) return;
    
    impactOccurred('light');
    
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
    notificationOccurred('success');
    toast({
      title: "Download Complete",
      description: "Your standardized CSV has been downloaded successfully",
    });
  };

  // Configure Main Button based on current step
  const getMainButtonConfig = () => {
    switch (step) {
      case 'upload':
        return {
          text: 'Choose File',
          isVisible: false,
          isEnabled: false
        };
      case 'map':
        return {
          text: 'Process Mapping',
          isVisible: true,
          isEnabled: Object.keys(columnMappings).length > 0,
          onClick: () => handleColumnMapping(columnMappings)
        };
      case 'preview':
        return {
          text: 'Download CSV',
          isVisible: true,
          isEnabled: standardizedData.length > 0,
          onClick: downloadStandardizedCsv
        };
      case 'download':
        return {
          text: 'Upload to Inventory',
          isVisible: true,
          isEnabled: true,
          onClick: () => navigate('/upload')
        };
      default:
        return { text: '', isVisible: false, isEnabled: false };
    }
  };

  useTelegramMainButton(getMainButtonConfig());

  const handleRefresh = async () => {
    impactOccurred('light');
    if (step !== 'upload') {
      resetProcess();
    }
  };

  const handleFileUpload = async (file: File, data: any[], fileHeaders: string[]) => {
    setUploadedFile(file);
    setCsvData(data);
    setHeaders(fileHeaders);
    setStep('map');
    impactOccurred('medium');
    notificationOccurred('success');
    
    toast({
      title: "File Uploaded Successfully",
      description: `Processing ${data.length} rows with ${fileHeaders.length} columns`,
    });

    // Auto-enhance with AI suggestions
    await enhanceWithAI(data, fileHeaders);
  };

  const enhanceWithAI = async (data: any[], headers: string[]) => {
    if (data.length === 0) return;
    
    setIsEnhancing(true);
    try {
      // Get sample data for AI analysis
      const sampleData = data.slice(0, 3);
      
      const response = await fetch('/api/enhance-csv-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleData,
          validShapes: ['round brilliant', 'princess', 'emerald', 'asscher', 'marquise', 'oval', 'radiant', 'pear', 'heart', 'cushion'],
          validColors: ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'],
          validClarities: ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'SI3', 'I1', 'I2', 'I3'],
          validCuts: ['EXCELLENT', 'VERY GOOD', 'GOOD', 'FAIR', 'POOR']
        })
      });

      if (response.ok) {
        const enhancements = await response.json();
        console.log('AI Enhancement suggestions:', enhancements);
        
        if (enhancements.length > 0) {
          toast({
            title: "AI Enhancement Complete",
            description: `Found ${enhancements.length} suggestions for data improvement`,
          });
        }
      }
    } catch (error) {
      console.warn('AI enhancement failed:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleColumnMapping = (mappings: Record<string, string>) => {
    selectionChanged();
    setColumnMappings(mappings);
    
    // Check for mandatory columns
    const mappedMandatory = MANDATORY_COLUMNS.filter(col => 
      Object.values(mappings).includes(col)
    );
    
    if (mappedMandatory.length < MANDATORY_COLUMNS.length) {
      impactOccurred('heavy');
      notificationOccurred('error');
      toast({
        title: "Missing Mandatory Columns",
        description: `Please map all mandatory columns: ${MANDATORY_COLUMNS.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Process and standardize data
    const processed = csvData
      .map((row) => {
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
          return null;
        }
        
        // Map all columns
        EXPECTED_COLUMNS.forEach(expectedCol => {
          const sourceCol = Object.keys(mappings).find(key => mappings[key] === expectedCol);
          standardizedRow[expectedCol] = sourceCol ? (row[sourceCol] || '') : '';
        });
        
        return standardizedRow;
      })
      .filter(row => row !== null);

    setStandardizedData(processed);
    setStep('preview');
    
    impactOccurred('medium');
    notificationOccurred('success');
    toast({
      title: "CSV Standardized",
      description: `Processed ${processed.length} valid rows out of ${csvData.length} total rows`,
    });
  };


  const resetProcess = () => {
    setUploadedFile(null);
    setCsvData([]);
    setHeaders([]);
    setColumnMappings({});
    setStandardizedData([]);
    setStep('upload');
    selectionChanged();
  };

  const goBack = () => {
    selectionChanged();
    switch (step) {
      case 'map':
        setStep('upload');
        break;
      case 'preview':
        setStep('map');
        break;
      case 'download':
        resetProcess();
        break;
    }
  };

  return (
    <TelegramLayout>
      <MobilePullToRefresh onRefresh={handleRefresh}>
        <div className="container mx-auto p-4 space-y-4 pb-safe">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            {step !== 'upload' && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={goBack}
                className="shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="text-center flex-1">
              <h1 className="text-2xl font-bold">CSV Standardizer</h1>
              <p className="text-muted-foreground text-sm">
                Transform your inventory CSV to the correct format
              </p>
            </div>
          </div>

          {/* Progress Steps - Mobile Optimized */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {[
              { key: 'upload', label: 'Upload', icon: Upload },
              { key: 'map', label: 'Map', icon: FileText },
              { key: 'preview', label: 'Preview', icon: CheckCircle },
              { key: 'download', label: 'Done', icon: Download }
            ].map(({ key, label, icon: Icon }, index) => {
              const isActive = step === key;
              const isCompleted = ['upload', 'map', 'preview', 'download'].indexOf(step) > index;
              
              return (
                <div key={key} className="flex flex-col items-center gap-1">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                    ${isActive 
                      ? 'border-primary bg-primary text-primary-foreground' 
                      : isCompleted 
                        ? 'border-green-500 bg-green-500 text-white' 
                        : 'border-muted-foreground/30 text-muted-foreground'
                    }
                  `}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-medium ${
                    isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Expected Format Card - Collapsible on Mobile */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-4 h-4" />
                Expected Format
                {isEnhancing && <Sparkles className="w-4 h-4 text-primary animate-pulse" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Your CSV should contain these columns:
              </p>
              <div className="bg-muted p-3 rounded text-xs font-mono overflow-x-auto">
                <div className="flex flex-wrap gap-1">
                  {EXPECTED_COLUMNS.map(col => (
                    <span key={col} className={`
                      px-2 py-1 rounded whitespace-nowrap
                      ${MANDATORY_COLUMNS.includes(col) 
                        ? 'bg-destructive/20 text-destructive border border-destructive/30' 
                        : 'bg-background border'
                      }
                    `}>
                      {col}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-xs">
                <span className="font-semibold">Required:</span>{' '}
                <span className="text-destructive">{MANDATORY_COLUMNS.join(', ')}</span>
              </div>
            </CardContent>
          </Card>

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
                  <CardTitle className="text-lg">Standardized Data Preview</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {standardizedData.length} valid rows processed from {csvData.length} total rows
                  </p>
                </CardHeader>
                <CardContent>
                  <CsvPreview data={standardizedData.slice(0, 5)} />
                  {standardizedData.length > 5 && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Showing first 5 rows of {standardizedData.length} total rows
                    </p>
                  )}
                </CardContent>
              </Card>
              
              {/* Download Button */}
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={downloadStandardizedCsv}
                  className="w-full"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Standardized CSV
                </Button>
                <Button 
                  variant="outline" 
                  onClick={goBack}
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Mapping
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
                <div className="flex flex-col gap-3 mt-6">
                  <Button 
                    onClick={() => navigate('/upload')}
                    className="w-full"
                    size="lg"
                  >
                    Upload to Inventory
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetProcess}
                    className="w-full"
                  >
                    Standardize Another CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </MobilePullToRefresh>
    </TelegramLayout>
  );
}

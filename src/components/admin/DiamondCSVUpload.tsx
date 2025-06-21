
import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/components/ui/use-toast';
import { api, apiEndpoints, getCurrentUserId } from '@/lib/api';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface DiamondCSVUploadProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CSVRow {
  [key: string]: string;
}

interface ProcessedDiamond {
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  status: string;
  storeVisible: boolean;
  certificateNumber?: string;
  lab?: string;
}

export function DiamondCSVUpload({ open, onClose, onSuccess }: DiamondCSVUploadProps) {
  const { toast } = useToast();
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedDiamond[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [step, setStep] = useState<'upload' | 'preview' | 'complete'>('upload');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        parseCSV(text);
      };
      reader.readAsText(file);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please upload a CSV file",
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  const parseCSV = (text: string) => {
    setIsProcessing(true);
    setErrors([]);

    try {
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const rows: CSVRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row: CSVRow = {};
        headers.forEach((header, index) => {
          row[header] = values[index]?.trim() || '';
        });
        rows.push(row);
      }

      setCsvData(rows);
      processData(rows, headers);
    } catch (error) {
      setErrors(['Failed to parse CSV file']);
      setIsProcessing(false);
    }
  };

  const processData = (rows: CSVRow[], headers: string[]) => {
    const processed: ProcessedDiamond[] = [];
    const newErrors: string[] = [];

    // Common header mappings
    const headerMappings: { [key: string]: string[] } = {
      stockNumber: ['stock_number', 'stock', 'id', 'diamond_id'],
      shape: ['shape', 'cut_shape'],
      carat: ['carat', 'weight', 'ct'],
      color: ['color', 'colour'],
      clarity: ['clarity'],
      cut: ['cut', 'cut_grade'],
      price: ['price',], 
      status: ['status', 'availability'],
      certificateNumber: ['certificate_number', 'cert_no', 'certificate'],
      lab: ['lab', 'laboratory']
    };

    const findHeader = (field: string): string | null => {
      const possibleHeaders = headerMappings[field] || [field];
      return possibleHeaders.find(h => headers.includes(h)) || null;
    };

    rows.forEach((row, index) => {
      try {
        const stockHeader = findHeader('stockNumber');
        const shapeHeader = findHeader('shape');
        const caratHeader = findHeader('carat');
        const colorHeader = findHeader('color');
        const clarityHeader = findHeader('clarity');
        const cutHeader = findHeader('cut');
        const priceHeader = findHeader('price');

        if (!stockHeader || !shapeHeader || !caratHeader || !colorHeader || !clarityHeader || !cutHeader || !priceHeader) {
          newErrors.push(`Row ${index + 1}: Missing required headers`);
          return;
        }

        const diamond: ProcessedDiamond = {
          stockNumber: row[stockHeader],
          shape: row[shapeHeader],
          carat: parseFloat(row[caratHeader]),
          color: row[colorHeader],
          clarity: row[clarityHeader],
          cut: row[cutHeader],
          price: parseFloat(row[priceHeader]),
          status: row[findHeader('status') || ''] || 'Available',
          storeVisible: true,
          certificateNumber: row[findHeader('certificateNumber') || ''] || '',
          lab: row[findHeader('lab') || ''] || 'GIA'
        };

        // Validation
        if (!diamond.stockNumber) {
          newErrors.push(`Row ${index + 1}: Missing stock number`);
          return;
        }
        if (isNaN(diamond.carat) || diamond.carat <= 0) {
          newErrors.push(`Row ${index + 1}: Invalid carat value`);
          return;
        }
        if (isNaN(diamond.price) || diamond.price <= 0) {
          newErrors.push(`Row ${index + 1}: Invalid price value`);
          return;
        }

        processed.push(diamond);
      } catch (error) {
        newErrors.push(`Row ${index + 1}: Processing error`);
      }
    });

    setProcessedData(processed);
    setErrors(newErrors);
    setIsProcessing(false);
    
    if (processed.length > 0) {
      setStep('preview');
    }
  };

  const handleUpload = async () => {
    if (processedData.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Upload diamonds in batches
      const batchSize = 10;
      let uploadedCount = 0;

      for (let i = 0; i < processedData.length; i += batchSize) {
        const batch = processedData.slice(i, i + batchSize);
        
        for (const diamond of batch) {
          const diamondData = {
            user_id: userId,
            stock_number: diamond.stockNumber,
            shape: diamond.shape,
            weight: diamond.carat,
            color: diamond.color,
            clarity: diamond.clarity,
            cut: diamond.cut,
            price: diamond.price,
            price_per_carat: Math.round(diamond.price / diamond.carat),
            status: diamond.status,
            store_visible: diamond.storeVisible,
            certificate_number: diamond.certificateNumber,
            lab: diamond.lab,
            picture: '',
            certificate_url: ''
          };

          const result = await api.post(apiEndpoints.addDiamond(), diamondData);
          
          if (result.error) {
            console.error('Failed to upload diamond:', diamond.stockNumber, result.error);
          } else {
            uploadedCount++;
          }
        }

        setUploadProgress((uploadedCount / processedData.length) * 100);
      }

      setStep('complete');
      toast({
        title: "Upload Complete ✅",
        description: `Successfully uploaded ${uploadedCount} of ${processedData.length} diamonds`,
      });

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed ❌",
        description: error instanceof Error ? error.message : 'Failed to upload diamonds',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setCsvData([]);
    setProcessedData([]);
    setErrors([]);
    setStep('upload');
    setUploadProgress(0);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Diamond CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === 'upload' && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">CSV Format Requirements</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p><strong>Required columns:</strong> stock_number, shape, carat, color, clarity, cut, price</p>
                  <p><strong>Optional columns:</strong> status, certificate_number, lab</p>
                  <p><strong>Example:</strong> stock_number,shape,carat,color,clarity,cut,price,status</p>
                </CardContent>
              </Card>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                {isDragActive ? (
                  <p>Drop the CSV file here...</p>
                ) : (
                  <div>
                    <p className="text-lg font-medium">Drag & drop a CSV file here</p>
                    <p className="text-gray-500">or click to select a file</p>
                  </div>
                )}
              </div>

              {isProcessing && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p>Processing CSV...</p>
                </div>
              )}
            </>
          )}

          {step === 'preview' && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-2xl font-bold">{processedData.length}</p>
                        <p className="text-sm text-muted-foreground">Valid Diamonds</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <div>
                        <p className="text-2xl font-bold">{errors.length}</p>
                        <p className="text-sm text-muted-foreground">Errors</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-2xl font-bold">${processedData.reduce((sum, d) => sum + d.price, 0).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">Total Value</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {errors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Errors Found
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-600">{error}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Preview - First 5 Diamonds</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {processedData.slice(0, 5).map((diamond, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <Badge variant="outline">#{diamond.stockNumber}</Badge>
                        <span className="text-sm">{diamond.shape}</span>
                        <span className="text-sm">{diamond.carat}ct</span>
                        <span className="text-sm">{diamond.color}</span>
                        <span className="text-sm">{diamond.clarity}</span>
                        <span className="text-sm font-medium">${diamond.price.toLocaleString()}</span>
                      </div>
                    ))}
                    {processedData.length > 5 && (
                      <p className="text-sm text-muted-foreground">+{processedData.length - 5} more diamonds</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {step === 'complete' && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload Complete!</h3>
              <p className="text-muted-foreground">Your diamonds have been successfully uploaded.</p>
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading diamonds...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          <div className="flex justify-end gap-3">
            {step === 'upload' && (
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
            {step === 'preview' && (
              <>
                <Button variant="outline" onClick={resetUpload}>
                  Upload Different File
                </Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={processedData.length === 0 || isUploading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Upload {processedData.length} Diamonds
                </Button>
              </>
            )}
            {step === 'complete' && (
              <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
                Done
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

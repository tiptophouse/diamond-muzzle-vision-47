import { useState } from "react";
import { TelegramLayout } from "@/components/layout/TelegramLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, AlertTriangle, Upload, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { useToast } from "@/hooks/use-toast";
import { useTelegramAuth } from "@/hooks/useTelegramAuth";
import * as XLSX from 'xlsx';

// Mandatory fields - simplified validation
const MANDATORY_FIELDS = ['stock', 'shape', 'weight', 'color', 'clarity', 'lab', 'certificate_number'];

interface UploadState {
  file: File | null;
  processing: boolean;
  uploading: boolean;
  results: {
    success: number;
    failed: number;
    message: string;
  } | null;
}

export default function BulkUploadPage() {
  const { hapticFeedback } = useTelegramWebApp();
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  
  const [state, setState] = useState<UploadState>({
    file: null,
    processing: false,
    uploading: false,
    results: null
  });

  // Simple file processing - extract diamond data
  const processFile = async (file: File): Promise<any[]> => {
    let data: any[] = [];
    
    if (file.name.toLowerCase().endsWith('.csv')) {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header.toLowerCase()] = values[index] || '';
        });
        data.push(row);
      }
    } else {
      // Excel files
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      const headers = (jsonData[0] as any[]).map(h => String(h || '').trim().toLowerCase());
      for (let i = 1; i < jsonData.length; i++) {
        const rowArray = jsonData[i] as any[];
        if (rowArray && rowArray.some(cell => cell !== null && cell !== undefined)) {
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = rowArray[index] ? String(rowArray[index]).trim() : '';
          });
          data.push(row);
        }
      }
    }
    
    return data;
  };

  // Validate and transform diamond data
  const processDiamonds = (rawData: any[]): any[] => {
    const diamonds: any[] = [];
    
    for (const row of rawData) {
      // Find mandatory fields in row (flexible header matching)
      const findField = (fieldName: string) => {
        const variations = {
          stock: ['stock', 'stock#', 'stock_number', 'sku'],
          shape: ['shape', 'diamond_shape', 'form'],
          weight: ['weight', 'carat', 'carats', 'ct', 'size'],
          color: ['color', 'colour', 'grade_color'],
          clarity: ['clarity', 'purity', 'grade_clarity'],
          lab: ['lab', 'laboratory', 'cert', 'certificate'],
          certificate_number: ['certnumber', 'cert_number', 'certificate_number', 'report_number']
        };
        
        const keys = variations[fieldName as keyof typeof variations] || [fieldName];
        for (const key of keys) {
          const value = row[key] || row[key.toLowerCase()] || row[key.toUpperCase()];
          if (value && value.toString().trim()) {
            return value.toString().trim();
          }
        }
        return null;
      };

      // Check for mandatory fields
      const stock = findField('stock') || `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const shape = findField('shape');
      const weight = findField('weight');
      const color = findField('color');
      const clarity = findField('clarity');
      const lab = findField('lab') || 'GIA';
      const certificate_number = findField('certificate_number');

      // Only include if we have the core required fields
      if (shape && weight && color && clarity && certificate_number) {
        diamonds.push({
          stock,
          shape: shape.toLowerCase().includes('round') ? 'round brilliant' : shape.toLowerCase(),
          weight: parseFloat(weight) || 1,
          color: color.toUpperCase(),
          clarity: clarity.toUpperCase(),
          lab: lab.toUpperCase(),
          certificate_number: parseInt(certificate_number) || 0,
          // Default values for API compatibility
          length: 6.5,
          width: 6.5,
          depth: 4.0,
          ratio: 1.0,
          polish: 'EXCELLENT',
          symmetry: 'EXCELLENT',
          fluorescence: 'NONE',
          table: 60,
          depth_percentage: 62,
          gridle: 'Medium',
          culet: 'NONE',
          certificate_comment: 'No comments',
          rapnet: 0,
          price_per_carat: 5000,
          picture: ''
        });
      }
    }
    
    return diamonds;
  };

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setState(prev => ({ ...prev, file, processing: true, results: null }));
    hapticFeedback?.impact('light');

    try {
      const rawData = await processFile(file);
      const diamonds = processDiamonds(rawData);
      
      if (diamonds.length === 0) {
        throw new Error('No valid diamonds found. Check that your file has the required columns: stock, shape, weight, color, clarity, lab, certificate_number');
      }

      toast({
        title: "✅ File processed",
        description: `Found ${diamonds.length} valid diamonds ready for upload`,
      });
      
      setState(prev => ({ ...prev, processing: false }));
    } catch (error) {
      console.error('File processing error:', error);
      toast({
        title: "❌ Processing failed",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
      setState(prev => ({ ...prev, file: null, processing: false }));
    }
  };

  // Upload diamonds to API
  const handleUpload = async () => {
    if (!state.file || !user?.id) return;

    setState(prev => ({ ...prev, uploading: true }));
    hapticFeedback?.impact('heavy');

    try {
      const rawData = await processFile(state.file);
      const diamonds = processDiamonds(rawData);

      console.log(`📤 Uploading ${diamonds.length} diamonds to FastAPI...`);
      
      const response = await fetch(`https://api.mazalbot.com/api/v1/diamonds/batch?user_id=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ diamonds })
      });

      if (response.ok) {
        const result = await response.json();
        const successCount = result.ids?.length || diamonds.length;
        
        setState(prev => ({
          ...prev,
          uploading: false,
          results: {
            success: successCount,
            failed: 0,
            message: `Successfully uploaded ${successCount} diamonds to your inventory!`
          }
        }));

        toast({
          title: "✅ Upload successful!",
          description: `${successCount} diamonds added to inventory`,
        });
        hapticFeedback?.notification('success');
      } else {
        throw new Error('Upload failed - please try again');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "❌ Upload failed",
        description: "Please check your connection and try again",
        variant: "destructive",
      });
      setState(prev => ({ ...prev, uploading: false }));
      hapticFeedback?.notification('error');
    }
  };

  // Reset everything
  const handleReset = () => {
    setState({
      file: null,
      processing: false,
      uploading: false,
      results: null
    });
    hapticFeedback?.impact('light');
  };

  return (
    <TelegramLayout>
      <div className="p-4 space-y-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <FileSpreadsheet className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Bulk CSV Upload</h1>
          <p className="text-muted-foreground">
            Upload multiple diamonds from CSV or Excel files
          </p>
        </div>

        {/* Requirements Notice */}
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-800 mb-1">Required Fields</h3>
                <p className="text-sm text-amber-700">
                  Your file must contain: <strong>stock, shape, weight, color, clarity, lab, certificate_number</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        {!state.file && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Button size="lg" className="w-full h-12 text-base">
                      Choose CSV or Excel File
                    </Button>
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Supports CSV, XLSX, and XLS files
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* File Selected */}
        {state.file && !state.results && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                {state.processing ? (
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{state.file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(state.file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                {!state.processing && !state.uploading && (
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {!state.processing && !state.uploading && (
                <div className="mt-4 pt-4 border-t">
                  <Button onClick={handleUpload} className="w-full" size="lg">
                    {state.uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Diamonds
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upload Results */}
        {state.results && (
          <Card>
            <CardContent className="pt-4">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Upload Complete!</h3>
                  <p className="text-muted-foreground">{state.results.message}</p>
                </div>
                <Button onClick={handleReset} variant="outline" className="w-full">
                  Upload Another File
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TelegramLayout>
  );
}
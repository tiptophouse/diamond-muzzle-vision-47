
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, CheckCircle, XCircle, AlertTriangle, FileSpreadsheet, Download, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface ValidationError {
  row: number;
  column: string;
  value: string;
  error: string;
  severity: 'error' | 'warning';
  columnHeader: string;
}

interface ValidationResult {
  isValid: boolean;
  totalRows: number;
  validRows: number;
  failedRows: number;
  errors: ValidationError[];
  missingColumns: string[];
  missingMandatoryFields: string[];
  processedData: any[];
  columnMappings: { [key: string]: string };
}

interface AdvancedCsvBulkUploadValidatorProps {
  onUploadSuccess: (data: any[], result: ValidationResult) => void;
}

// All 52 required fields as per your specification
const ALL_REQUIRED_FIELDS = [
  'Shape', 'Weight', 'Color', 'Clarity', 'Measurements', 'Cut', 'Lab', 
  'RapnetAskingPrice', 'IndexAskingPrice', 'RapnetDiscountPercent', 'IndexDiscountPercent',
  'DepthPercent', 'TablePercent', 'GirdleMin', 'GirdleMax', 'GirdlePercent',
  'CuletSize', 'CuletCondition', 'Polish', 'Symmetry', 'FluorescenceIntensity',
  'FluorescenceColor', 'CrownHeight', 'CrownAngle', 'PavilionDepth', 'PavilionAngle',
  'Enhancement', 'LaserInscription', 'FancyColor', 'FancyColorIntensity', 'FancyColorOvertone',
  'Member Comments', 'Comments', 'CertificateID', 'Image', 'SarinFile',
  'VendorStockNumber', 'MatchingVendorStockNumber', 'IsMatchedPairSeparable',
  'StateLocation', 'ParcelStoneCount', 'Availability', 'ShowOnRapnet', 'ShowOnIndex',
  'Make', 'CountryLocation', 'CityLocation', 'Video link', 'Brand', 'Trade Show',
  'Location', 'Price'
];

// 7 mandatory fields that MUST have values
const MANDATORY_FIELDS = [
  'Shape', 'Weight', 'Color', 'Clarity', 'VendorStockNumber', 'Lab', 'Price'
];

// Valid values for specific fields
const VALID_SHAPES = ['BR', 'PS', 'RAD', 'CU', 'EM', 'OV', 'MQ', 'AS', 'HT', 'RD'];
const VALID_COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const VALID_CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'SI3', 'I1', 'I2', 'I3'];
const VALID_CUTS = ['EX', 'VG', 'G', 'F', 'P'];
const VALID_LABS = ['GIA', 'AGS', 'GCAL', 'EGL', 'None'];

export function AdvancedCsvBulkUploadValidator({ onUploadSuccess }: AdvancedCsvBulkUploadValidatorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [progress, setProgress] = useState(0);
  
  const { toast } = useToast();
  const { hapticFeedback } = useTelegramWebApp();

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateCsvData = (data: any[], headers: string[]): ValidationResult => {
    const errors: ValidationError[] = [];
    const processedData: any[] = [];
    let validRows = 0;
    let failedRows = 0;

    // Check if all required columns are present
    const missingColumns = ALL_REQUIRED_FIELDS.filter(field => !headers.includes(field));
    const missingMandatoryFields = MANDATORY_FIELDS.filter(field => !headers.includes(field));

    // Create column mappings for the report
    const columnMappings: { [key: string]: string } = {};
    headers.forEach(header => {
      if (ALL_REQUIRED_FIELDS.includes(header)) {
        columnMappings[header] = header;
      }
    });

    // Validate each row
    data.forEach((row, index) => {
      let rowHasErrors = false;
      const rowNumber = index + 2; // +2 because of 0-based index and header row

      // Check mandatory fields first
      MANDATORY_FIELDS.forEach(field => {
        if (headers.includes(field)) {
          const value = row[field];
          if (!value || value.toString().trim() === '') {
            errors.push({
              row: rowNumber,
              column: field,
              columnHeader: field,
              value: value || '',
              error: `${field} is mandatory and cannot be empty`,
              severity: 'error'
            });
            rowHasErrors = true;
          }
        }
      });

      // Validate Shape
      if (row.Shape && !VALID_SHAPES.includes(row.Shape.toUpperCase())) {
        errors.push({
          row: rowNumber,
          column: 'Shape',
          columnHeader: 'Shape',
          value: row.Shape,
          error: `Invalid shape. Must be one of: ${VALID_SHAPES.join(', ')}`,
          severity: 'error'
        });
        rowHasErrors = true;
      }

      // Validate Color
      if (row.Color && !VALID_COLORS.includes(row.Color.toUpperCase())) {
        errors.push({
          row: rowNumber,
          column: 'Color',
          columnHeader: 'Color',
          value: row.Color,
          error: `Invalid color grade. Must be one of: ${VALID_COLORS.join(', ')}`,
          severity: 'error'
        });
        rowHasErrors = true;
      }

      // Validate Clarity
      if (row.Clarity && !VALID_CLARITIES.includes(row.Clarity.toUpperCase())) {
        errors.push({
          row: rowNumber,
          column: 'Clarity',
          columnHeader: 'Clarity',
          value: row.Clarity,
          error: `Invalid clarity grade. Must be one of: ${VALID_CLARITIES.join(', ')}`,
          severity: 'error'
        });
        rowHasErrors = true;
      }

      // Validate Weight (must be positive number)
      if (row.Weight && (isNaN(parseFloat(row.Weight)) || parseFloat(row.Weight) <= 0)) {
        errors.push({
          row: rowNumber,
          column: 'Weight',
          columnHeader: 'Weight',
          value: row.Weight,
          error: 'Weight must be a positive number',
          severity: 'error'
        });
        rowHasErrors = true;
      }

      // Validate Price (must be positive number)
      if (row.Price && (isNaN(parseFloat(row.Price)) || parseFloat(row.Price) <= 0)) {
        errors.push({
          row: rowNumber,
          column: 'Price',
          columnHeader: 'Price',
          value: row.Price,
          error: 'Price must be a positive number',
          severity: 'error'
        });
        rowHasErrors = true;
      }

      // Validate Cut
      if (row.Cut && !VALID_CUTS.includes(row.Cut.toUpperCase())) {
        errors.push({
          row: rowNumber,
          column: 'Cut',
          columnHeader: 'Cut',
          value: row.Cut,
          error: `Invalid cut grade. Must be one of: ${VALID_CUTS.join(', ')}`,
          severity: 'error'
        });
        rowHasErrors = true;
      }

      // Validate Lab
      if (row.Lab && !VALID_LABS.includes(row.Lab.toUpperCase())) {
        errors.push({
          row: rowNumber,
          column: 'Lab',
          columnHeader: 'Lab',
          value: row.Lab,
          error: `Invalid lab. Must be one of: ${VALID_LABS.join(', ')}`,
          severity: 'error'
        });
        rowHasErrors = true;
      }

      // Validate Image URL (if present)
      if (row.Image && row.Image.trim() !== '' && !validateUrl(row.Image)) {
        errors.push({
          row: rowNumber,
          column: 'Image',
          columnHeader: 'Image',
          value: row.Image,
          error: 'Invalid image URL format. Must be a valid URL.',
          severity: 'warning'
        });
      }

      // Validate Video link URL (if present)
      if (row['Video link'] && row['Video link'].trim() !== '' && !validateUrl(row['Video link'])) {
        errors.push({
          row: rowNumber,
          column: 'Video link',
          columnHeader: 'Video link',
          value: row['Video link'],
          error: 'Invalid video URL format. Must be a valid URL.',
          severity: 'warning'
        });
      }

      // Validate SarinFile URL (3D URL - if present)
      if (row.SarinFile && row.SarinFile.trim() !== '' && !validateUrl(row.SarinFile)) {
        errors.push({
          row: rowNumber,
          column: 'SarinFile',
          columnHeader: 'SarinFile',
          value: row.SarinFile,
          error: 'Invalid 3D file URL format. Must be a valid URL.',
          severity: 'warning'
        });
      }

      // Validate percentage fields
      const percentageFields = ['DepthPercent', 'TablePercent', 'RapnetDiscountPercent', 'IndexDiscountPercent'];
      percentageFields.forEach(field => {
        if (row[field] && row[field].trim() !== '') {
          const value = parseFloat(row[field]);
          if (isNaN(value) || value < 0 || value > 100) {
            errors.push({
              row: rowNumber,
              column: field,
              columnHeader: field,
              value: row[field],
              error: `${field} must be a number between 0 and 100`,
              severity: 'error'
            });
            rowHasErrors = true;
          }
        }
      });

      if (rowHasErrors) {
        failedRows++;
      } else {
        validRows++;
        processedData.push(row);
      }
    });

    const isValid = errors.filter(e => e.severity === 'error').length === 0 && 
                   missingMandatoryFields.length === 0;

    return {
      isValid,
      totalRows: data.length,
      validRows,
      failedRows,
      errors,
      missingColumns,
      missingMandatoryFields,
      processedData,
      columnMappings
    };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.csv')) {
      setSelectedFile(file);
      setValidationResult(null);
      hapticFeedback.impact('light');
    } else {
      toast({
        title: "❌ Invalid File Type",
        description: "Please select a CSV file with .csv extension",
        variant: "destructive"
      });
    }
  };

  const validateFile = async () => {
    if (!selectedFile) return;

    setValidating(true);
    setProgress(0);
    hapticFeedback.impact('medium');

    try {
      const text = await selectedFile.text();
      setProgress(25);

      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }

      // Parse CSV more carefully
      const headers = lines[0].split('\t').map(h => h.trim().replace(/"/g, ''));
      setProgress(50);

      const csvData = lines.slice(1).map((line, lineIndex) => {
        const values = line.split('\t').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      }).filter(row => Object.values(row).some(val => val !== ''));

      setProgress(75);

      const result = validateCsvData(csvData, headers);
      setValidationResult(result);
      setProgress(100);

      if (result.isValid) {
        hapticFeedback.notification('success');
        toast({
          title: "✅ Validation Successful",
          description: `${result.validRows} diamonds ready for upload. All requirements met!`,
        });
      } else {
        hapticFeedback.notification('error');
        toast({
          title: "❌ Validation Failed",
          description: `Found ${result.errors.length} issues. Check the detailed report below.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      hapticFeedback.notification('error');
      toast({
        title: "❌ Processing Error",
        description: error instanceof Error ? error.message : "Failed to process CSV file",
        variant: "destructive"
      });
    } finally {
      setValidating(false);
    }
  };

  const handleUpload = async () => {
    if (!validationResult || !validationResult.isValid) return;

    setUploading(true);
    hapticFeedback.impact('heavy');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onUploadSuccess(validationResult.processedData, validationResult);
      hapticFeedback.notification('success');
      
      toast({
        title: "🎉 Upload Successful!",
        description: `Successfully uploaded ${validationResult.validRows} diamonds to your inventory!`,
      });
      
      setSelectedFile(null);
      setValidationResult(null);
    } catch (error) {
      hapticFeedback.notification('error');
      toast({
        title: "❌ Upload Failed",
        description: "Failed to upload diamonds. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadErrorReport = () => {
    if (!validationResult || validationResult.errors.length === 0) return;

    const csvContent = [
      ['Row', 'Column', 'Column Header', 'Value', 'Error', 'Severity'],
      ...validationResult.errors.map(error => [
        error.row.toString(),
        error.column,
        error.columnHeader,
        error.value,
        error.error,
        error.severity
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'validation_error_report.csv';
    a.click();
    URL.revokeObjectURL(url);

    hapticFeedback.impact('light');
    toast({
      title: "📄 Report Downloaded",
      description: "Error report has been downloaded to help you fix the issues.",
    });
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Professional Diamond CSV Upload & Validation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="space-y-2">
              <h3 className="font-medium">Upload Your Diamond Inventory CSV</h3>
              <p className="text-sm text-muted-foreground">
                All {ALL_REQUIRED_FIELDS.length} columns must be present • {MANDATORY_FIELDS.length} fields are mandatory
              </p>
              <Button variant="outline" className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                Choose CSV File
              </Button>
              {selectedFile && (
                <p className="text-sm font-medium text-primary mt-2">
                  📁 Selected: {selectedFile.name}
                </p>
              )}
            </div>
          </div>

          {selectedFile && (
            <div className="flex gap-2">
              <Button onClick={validateFile} disabled={validating} className="flex-1">
                {validating ? 'Validating CSV...' : 'Validate & Analyze CSV'}
              </Button>
              {validationResult?.isValid && (
                <Button onClick={handleUpload} disabled={uploading} variant="default">
                  {uploading ? 'Uploading...' : `✨ Upload ${validationResult.validRows} Diamonds`}
                </Button>
              )}
            </div>
          )}

          {(validating || uploading) && (
            <Progress value={progress} className="w-full" />
          )}
        </CardContent>
      </Card>

      {/* Validation Results */}
      {validationResult && (
        <Card className={validationResult.isValid ? 'border-green-500' : 'border-red-500'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {validationResult.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Detailed Validation Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="errors">Issues</TabsTrigger>
                <TabsTrigger value="columns">Columns</TabsTrigger>
                <TabsTrigger value="stats">Statistics</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-foreground">{validationResult.totalRows}</div>
                    <div className="text-sm text-muted-foreground">Total Rows</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">{validationResult.validRows}</div>
                    <div className="text-sm text-muted-foreground">Valid Diamonds</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-red-600">{validationResult.failedRows}</div>
                    <div className="text-sm text-muted-foreground">Failed Rows</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary">
                      {((validationResult.validRows / validationResult.totalRows) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>

                {validationResult.isValid && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      🎉 Perfect! All {validationResult.validRows} diamonds are valid and ready for upload.
                      Your CSV follows the exact format requirements with all mandatory fields present.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="errors" className="space-y-4">
                {validationResult.missingMandatoryFields.length > 0 && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>❌ Missing Mandatory Columns:</strong> {validationResult.missingMandatoryFields.join(', ')}
                      <br />These columns are required and must be present in your CSV.
                    </AlertDescription>
                  </Alert>
                )}

                {validationResult.missingColumns.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>⚠️ Missing Optional Columns:</strong> {validationResult.missingColumns.join(', ')}
                      <br />These columns should be present but can be empty.
                    </AlertDescription>
                  </Alert>
                )}

                {validationResult.errors.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Validation Issues ({validationResult.errors.length})</h4>
                      <Button variant="outline" size="sm" onClick={downloadErrorReport}>
                        <Download className="h-4 w-4 mr-1" />
                        Download Report
                      </Button>
                    </div>
                    <ScrollArea className="h-64 border rounded p-3">
                      <div className="space-y-3">
                        {validationResult.errors.slice(0, 100).map((error, index) => (
                          <div key={index} className="text-sm border-b pb-2 last:border-b-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant={error.severity === 'error' ? 'destructive' : 'secondary'}>
                                Row {error.row}
                              </Badge>
                              <Badge variant="outline">{error.columnHeader}</Badge>
                              <Badge variant="secondary" className="text-xs">
                                {error.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-muted-foreground">
                              <strong>Value:</strong> "{error.value}"<br />
                              <strong>Issue:</strong> {error.error}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {validationResult.errors.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <p className="text-green-700 font-medium">No validation errors found!</p>
                    <p className="text-green-600 text-sm">All data meets the requirements.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="columns" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-red-600">📋 Mandatory Fields (Must Have Values):</h4>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {MANDATORY_FIELDS.map(field => (
                      <Badge key={field} variant="destructive" className="text-xs">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">📊 All Required Columns ({ALL_REQUIRED_FIELDS.length} total):</h4>
                  <ScrollArea className="h-40 border rounded p-3">
                    <div className="flex flex-wrap gap-1">
                      {ALL_REQUIRED_FIELDS.map(field => (
                        <Badge 
                          key={field} 
                          variant={MANDATORY_FIELDS.includes(field) ? "destructive" : "secondary"} 
                          className="text-xs"
                        >
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="stats" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <div className="text-2xl font-bold">{validationResult.validRows}</div>
                      <div className="text-sm text-muted-foreground">Ready to Upload</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                      <div className="text-2xl font-bold">{validationResult.errors.length}</div>
                      <div className="text-sm text-muted-foreground">Issues Found</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

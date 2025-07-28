
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, CheckCircle, XCircle, AlertTriangle, FileSpreadsheet, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

interface ValidationError {
  row: number;
  column: string;
  value: string;
  error: string;
  severity: 'error' | 'warning';
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
}

interface CsvBulkUploadValidatorProps {
  onUploadSuccess: (data: any[], result: ValidationResult) => void;
}

// All required fields as per your specification
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

// 7 mandatory fields that must have values
const MANDATORY_FIELDS = [
  'Shape', 'Weight', 'Color', 'Clarity', 'VendorStockNumber', 'Lab', 'Price'
];

// Valid values for specific fields
const VALID_SHAPES = ['BR', 'PS', 'RAD', 'CU', 'EM', 'OV', 'MQ', 'AS', 'HT', 'RD'];
const VALID_COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O-Z'];
const VALID_CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'SI3', 'I1', 'I2', 'I3'];
const VALID_CUTS = ['EX', 'VG', 'G', 'F', 'P'];
const VALID_LABS = ['GIA', 'AGS', 'GCAL', 'EGL', 'None'];

export function CsvBulkUploadValidator({ onUploadSuccess }: CsvBulkUploadValidatorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [progress, setProgress] = useState(0);
  
  const { toast } = useToast();
  const { impactOccurred, notificationOccurred } = useTelegramHapticFeedback();

  const validateCsvData = (data: any[]): ValidationResult => {
    const errors: ValidationError[] = [];
    const processedData: any[] = [];
    let validRows = 0;
    let failedRows = 0;

    // Check if file has headers
    if (data.length === 0) {
      return {
        isValid: false,
        totalRows: 0,
        validRows: 0,
        failedRows: 0,
        errors: [{ row: 0, column: 'File', value: '', error: 'CSV file is empty', severity: 'error' }],
        missingColumns: ALL_REQUIRED_FIELDS,
        missingMandatoryFields: MANDATORY_FIELDS,
        processedData: []
      };
    }

    const headers = Object.keys(data[0]);
    const missingColumns = ALL_REQUIRED_FIELDS.filter(field => !headers.includes(field));
    const missingMandatoryFields = MANDATORY_FIELDS.filter(field => !headers.includes(field));

    // Validate each row
    data.forEach((row, index) => {
      let rowHasErrors = false;
      const rowNumber = index + 2; // +2 because of 0-based index and header row

      // Check mandatory fields
      MANDATORY_FIELDS.forEach(field => {
        if (headers.includes(field)) {
          const value = row[field];
          if (!value || value.toString().trim() === '') {
            errors.push({
              row: rowNumber,
              column: field,
              value: value || '',
              error: `${field} is mandatory and cannot be empty`,
              severity: 'error'
            });
            rowHasErrors = true;
          }
        }
      });

      // Validate specific field formats
      if (row.Shape && !VALID_SHAPES.includes(row.Shape.toUpperCase())) {
        errors.push({
          row: rowNumber,
          column: 'Shape',
          value: row.Shape,
          error: `Invalid shape. Must be one of: ${VALID_SHAPES.join(', ')}`,
          severity: 'error'
        });
        rowHasErrors = true;
      }

      if (row.Color && !VALID_COLORS.includes(row.Color.toUpperCase())) {
        errors.push({
          row: rowNumber,
          column: 'Color',
          value: row.Color,
          error: `Invalid color grade. Must be one of: ${VALID_COLORS.join(', ')}`,
          severity: 'error'
        });
        rowHasErrors = true;
      }

      if (row.Clarity && !VALID_CLARITIES.includes(row.Clarity.toUpperCase())) {
        errors.push({
          row: rowNumber,
          column: 'Clarity',
          value: row.Clarity,
          error: `Invalid clarity grade. Must be one of: ${VALID_CLARITIES.join(', ')}`,
          severity: 'error'
        });
        rowHasErrors = true;
      }

      if (row.Weight && (isNaN(parseFloat(row.Weight)) || parseFloat(row.Weight) <= 0)) {
        errors.push({
          row: rowNumber,
          column: 'Weight',
          value: row.Weight,
          error: 'Weight must be a positive number',
          severity: 'error'
        });
        rowHasErrors = true;
      }

      if (row.Price && (isNaN(parseFloat(row.Price)) || parseFloat(row.Price) <= 0)) {
        errors.push({
          row: rowNumber,
          column: 'Price',
          value: row.Price,
          error: 'Price must be a positive number',
          severity: 'error'
        });
        rowHasErrors = true;
      }

      // Validate URLs if present
      if (row.Image && row.Image.trim() !== '') {
        try {
          new URL(row.Image);
        } catch {
          errors.push({
            row: rowNumber,
            column: 'Image',
            value: row.Image,
            error: 'Invalid image URL format',
            severity: 'warning'
          });
        }
      }

      if (row['Video link'] && row['Video link'].trim() !== '') {
        try {
          new URL(row['Video link']);
        } catch {
          errors.push({
            row: rowNumber,
            column: 'Video link',
            value: row['Video link'],
            error: 'Invalid video URL format',
            severity: 'warning'
          });
        }
      }

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
      processedData
    };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setValidationResult(null);
      impactOccurred('light');
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV file",
        variant: "destructive"
      });
    }
  };

  const validateFile = async () => {
    if (!selectedFile) return;

    setValidating(true);
    setProgress(0);
    impactOccurred('medium');

    try {
      const text = await selectedFile.text();
      setProgress(25);

      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      setProgress(50);

      const csvData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      });

      setProgress(75);

      const result = validateCsvData(csvData);
      setValidationResult(result);
      setProgress(100);

      if (result.isValid) {
        notificationOccurred('success');
        toast({
          title: "✅ Validation Successful",
          description: `${result.validRows} diamonds ready for upload`,
        });
      } else {
        notificationOccurred('error');
        toast({
          title: "❌ Validation Failed",
          description: `${result.errors.length} errors found in your CSV`,
          variant: "destructive"
        });
      }
    } catch (error) {
      notificationOccurred('error');
      toast({
        title: "Validation Error",
        description: "Failed to process CSV file",
        variant: "destructive"
      });
    } finally {
      setValidating(false);
    }
  };

  const handleUpload = async () => {
    if (!validationResult || !validationResult.isValid) return;

    setUploading(true);
    impactOccurred('heavy');

    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onUploadSuccess(validationResult.processedData, validationResult);
      notificationOccurred('success');
      
      toast({
        title: "🎉 Upload Successful",
        description: `${validationResult.validRows} diamonds uploaded successfully`,
      });
      
      // Reset form
      setSelectedFile(null);
      setValidationResult(null);
    } catch (error) {
      notificationOccurred('error');
      toast({
        title: "Upload Failed",
        description: "Failed to upload diamonds",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const downloadErrorReport = () => {
    if (!validationResult || validationResult.errors.length === 0) return;

    const csvContent = [
      ['Row', 'Column', 'Value', 'Error', 'Severity'],
      ...validationResult.errors.map(error => [
        error.row.toString(),
        error.column,
        error.value,
        error.error,
        error.severity
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'validation_errors.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Diamond CSV Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="space-y-2">
              <h3 className="font-medium">Upload Diamond Inventory CSV</h3>
              <p className="text-sm text-muted-foreground">
                All {ALL_REQUIRED_FIELDS.length} columns must be present. {MANDATORY_FIELDS.length} fields are mandatory.
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
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
          </div>

          {selectedFile && (
            <div className="flex gap-2">
              <Button onClick={validateFile} disabled={validating} className="flex-1">
                {validating ? 'Validating...' : 'Validate CSV'}
              </Button>
              {validationResult?.isValid && (
                <Button onClick={handleUpload} disabled={uploading} variant="default">
                  {uploading ? 'Uploading...' : `Upload ${validationResult.validRows} Diamonds`}
                </Button>
              )}
            </div>
          )}

          {(validating || uploading) && (
            <Progress value={progress} className="w-full" />
          )}
        </CardContent>
      </Card>

      {/* Required Fields Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Required CSV Format</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Mandatory Fields (Must have values):</h4>
            <div className="flex flex-wrap gap-1">
              {MANDATORY_FIELDS.map(field => (
                <Badge key={field} variant="destructive" className="text-xs">
                  {field}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">All Required Columns ({ALL_REQUIRED_FIELDS.length} total):</h4>
            <ScrollArea className="h-32 border rounded p-3">
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
              Validation Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{validationResult.totalRows}</div>
                <div className="text-sm text-muted-foreground">Total Rows</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{validationResult.validRows}</div>
                <div className="text-sm text-muted-foreground">Valid Diamonds</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{validationResult.failedRows}</div>
                <div className="text-sm text-muted-foreground">Failed Rows</div>
              </div>
            </div>

            {/* Missing Columns */}
            {validationResult.missingColumns.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Missing Required Columns:</strong> {validationResult.missingColumns.join(', ')}
                </AlertDescription>
              </Alert>
            )}

            {/* Missing Mandatory Fields */}
            {validationResult.missingMandatoryFields.length > 0 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Missing Mandatory Columns:</strong> {validationResult.missingMandatoryFields.join(', ')}
                </AlertDescription>
              </Alert>
            )}

            {/* Errors List */}
            {validationResult.errors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Validation Errors ({validationResult.errors.length})</h4>
                  <Button variant="outline" size="sm" onClick={downloadErrorReport}>
                    <Download className="h-4 w-4 mr-1" />
                    Download Report
                  </Button>
                </div>
                <ScrollArea className="h-48 border rounded p-3">
                  <div className="space-y-2">
                    {validationResult.errors.slice(0, 50).map((error, index) => (
                      <div key={index} className="text-sm border-b pb-2 last:border-b-0">
                        <div className="flex items-center gap-2">
                          <Badge variant={error.severity === 'error' ? 'destructive' : 'secondary'}>
                            Row {error.row}
                          </Badge>
                          <Badge variant="outline">{error.column}</Badge>
                        </div>
                        <div className="text-muted-foreground mt-1">
                          Value: "{error.value}" - {error.error}
                        </div>
                      </div>
                    ))}
                    {validationResult.errors.length > 50 && (
                      <p className="text-sm text-muted-foreground text-center mt-2">
                        ... and {validationResult.errors.length - 50} more errors. Download the full report.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Success Message */}
            {validationResult.isValid && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  🎉 Perfect! All {validationResult.validRows} diamonds are valid and ready for upload.
                  Your CSV follows the correct format with all required columns and mandatory fields.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

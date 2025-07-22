
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

// Define the 7 mandatory fields - rows without ALL of these will be skipped
const MANDATORY_FIELDS = ['certificate_number', 'color', 'cut', 'weight', 'clarity', 'fluorescence', 'shape'];

// Enhanced shape aliases from your backend
const SHAPE_ALIASES = {
  "RB": "round brilliant", "PC": "princess", "PR": "princess", "PS": "princess", "CC": "cushion", "CU": "cushion",
  "OC": "oval", "OV": "oval", "EC": "emerald", "EM": "emerald", "PE": "pear", "PR2": "pear", "MC": "marquise",
  "MQ": "marquise", "AC": "asscher", "AS": "asscher", "RC": "radiant", "RD": "radiant", "RA": "radiant",
  "HC": "heart", "HT": "heart", "HS": "heart", "BC": "baguette", "BG": "baguette",
  "OEC": "old european", "RS": "rose", "BR": "round brilliant", "TBC": "tapered baguette",
  "BUC": "bullet", "BU": "bullet", "KC": "kite", "HMC": "half moons", "HM": "half moons",
  "TC": "trillion", "TR": "trillion", "SC": "shield", "HXC": "hexagonal", "OM": "old mine",
  "HH": "horse head", "AF": "asscher", "HD": "horse head",
  "עגול": "round brilliant", "עגולות": "round brilliant", "מרקיזה": "marquise", "מרקיזות": "marquise",
  "קושן": "cushion", "קושנים": "cushion", "אובל": "oval", "אובלים": "oval",
  "אמרלד": "emerald", "אמרלדים": "emerald", "טיפה": "pear", "רדיאנים": "radiant", "משולשת": "trillion"
};

const VALID_SHAPES = ['round brilliant', 'princess', 'emerald', 'asscher', 'marquise', 'oval', 'radiant', 'pear', 'heart', 'cushion'];
const VALID_COLORS = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"];
const VALID_CLARITIES = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "SI3", "I1", "I2", "I3"];
const VALID_CUTS = ['EXCELLENT', 'VERY GOOD', 'GOOD', 'FAIR', 'POOR'];
const VALID_FLUORESCENCE = ['NONE', 'FAINT', 'MEDIUM', 'STRONG', 'VERY STRONG'];

// Cut grade aliases
const CUT_ALIASES = {
  "EX": "EXCELLENT",
  "XE": "EXCELLENT", 
  "VG": "VERY GOOD",
  "G": "GOOD",
  "F": "FAIR",
  "P": "POOR"
};

// Fluorescence aliases
const FLUORESCENCE_ALIASES = {
  "NON": "NONE",
  "N": "NONE",
  "FA": "FAINT",
  "F": "FAINT",
  "M": "MEDIUM",
  "MED": "MEDIUM",
  "S": "STRONG",
  "STR": "STRONG",
  "VS": "VERY STRONG",
  "VST": "VERY STRONG"
};

// Field mapping patterns for intelligent column detection - focused on mandatory fields
const FIELD_MAPPINGS = {
  shape: ['shape', 'diamond_shape', 'form', 'צורה'],
  weight: ['weight', 'carat', 'carats', 'ct', 'cts', 'size', 'measurements', 'משקל'],
  color: ['color', 'colour', 'grade_color', 'color_grade', 'fancycolor', 'צבע'],
  clarity: ['clarity', 'purity', 'grade_clarity', 'clarity_grade', 'ניקיון'],
  cut: ['cut', 'cut_grade', 'make', 'finish', 'חיתוך'],
  fluorescence: ['fluorescence', 'fluo', 'fluor', 'fluorescenceintensity', 'זרחן'],
  certificate_number: ['cert_number', 'certificate_number', 'report_number', 'certificateid', 'מספר_תעודה'],
  // Optional fields - these can be present but are not required
  price_per_carat: ['price/crt', 'price_per_carat', 'price per carat', 'ppc', 'rapnetaskingprice', 'indexaskingprice', 'מחיר_לקרט'],
  lab: ['lab', 'laboratory', 'cert', 'certificate', 'מעבדה'],
  stock: ['stock', 'stock_number', 'sku', 'item_number', 'vendorstocknumber', 'מלאי']
};

interface ProcessedData {
  validRows: any[];
  failedRows: Array<{ rowNumber: number; data: any; errors: string[] }>;
  totalRows: number;
  processingReport: {
    totalProcessed: number;
    successCount: number;
    failureCount: number;
    fileType: string;
    processingTime: number;
    aiExtracted: boolean;
  };
}

interface ValidationResults {
  totalRows: number;
  validRows: number;
  skippedRows: number;
  fieldMappings: Array<{ csvHeader: string; mappedTo: string; confidence: number }>;
  errors: Array<{ row: number; field: string; value: string; reason: string }>;
  warnings: Array<{ message: string }>;
  processingReport: ProcessedData['processingReport'];
}

export function useBulkCsvProcessor() {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResults | null>(null);
  const { toast } = useToast();

  const fuzzyMatch = (input: string, candidates: string[]): { match: string; confidence: number } => {
    const inputLower = input.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    let bestMatch = '';
    let bestConfidence = 0;

    for (const candidate of candidates) {
      const candidateLower = candidate.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      
      // Exact match
      if (inputLower === candidateLower) {
        return { match: candidate, confidence: 1.0 };
      }
      
      // Contains match
      if (inputLower.includes(candidateLower) || candidateLower.includes(inputLower)) {
        const confidence = Math.max(candidateLower.length / inputLower.length, inputLower.length / candidateLower.length) * 0.9;
        if (confidence > bestConfidence) {
          bestConfidence = confidence;
          bestMatch = candidate;
        }
      }
      
      // Partial match with lower confidence
      const maxLen = Math.max(inputLower.length, candidateLower.length);
      const minLen = Math.min(inputLower.length, candidateLower.length);
      let matches = 0;
      for (let i = 0; i < minLen; i++) {
        if (inputLower[i] === candidateLower[i]) matches++;
      }
      const partialConfidence = (matches / maxLen) * 0.6;
      if (partialConfidence > bestConfidence && partialConfidence >= 0.4) {
        bestConfidence = partialConfidence;
        bestMatch = candidate;
      }
    }

    return { match: bestMatch, confidence: bestConfidence };
  };

  const mapHeaders = (headers: string[]) => {
    const mappings: Array<{ csvHeader: string; mappedTo: string; confidence: number }> = [];
    const unmapped: string[] = [];

    console.log('📋 Available headers:', headers);

    for (const header of headers) {
      let bestMapping = '';
      let bestConfidence = 0;
      let bestField = '';

      for (const [standardField, variations] of Object.entries(FIELD_MAPPINGS)) {
        const { match, confidence } = fuzzyMatch(header, variations);
        if (confidence > bestConfidence && confidence >= 0.2) { // Lower threshold
          bestConfidence = confidence;
          bestMapping = match;
          bestField = standardField;
        }
      }

      if (bestMapping && bestConfidence >= 0.2) { // Lower threshold
        mappings.push({
          csvHeader: header,
          mappedTo: bestField,
          confidence: bestConfidence
        });
        console.log(`✅ Mapped: ${header} -> ${bestField} (confidence: ${bestConfidence.toFixed(2)})`);
      } else {
        unmapped.push(header);
        console.log(`❌ Could not map: ${header}`);
      }
    }

    console.log('📊 Final mappings:', mappings);
    console.log('🚫 Unmapped headers:', unmapped);
    return { mappings, unmapped };
  };

  const validateValue = (value: string, field: string): { isValid: boolean; normalizedValue: any; error?: string } => {
    if (!value || value.trim() === '') {
      return { isValid: false, normalizedValue: null, error: 'Empty value' };
    }

    const cleanValue = value.trim();

    switch (field) {
      case 'shape':
        const shapeNormalized = cleanValue.toLowerCase();
        let validShape = VALID_SHAPES.find(s => s.toLowerCase() === shapeNormalized);
        
        if (!validShape) {
          const aliasKey = Object.keys(SHAPE_ALIASES).find(key => 
            key.toUpperCase() === cleanValue.toUpperCase()
          );
          if (aliasKey) {
            validShape = SHAPE_ALIASES[aliasKey as keyof typeof SHAPE_ALIASES];
          }
        }
        
        return {
          isValid: !!validShape,
          normalizedValue: validShape || 'round brilliant',
          error: !validShape ? `Invalid shape: ${cleanValue}` : undefined
        };

      case 'weight':
        const weight = parseFloat(cleanValue);
        return {
          isValid: !isNaN(weight) && weight > 0,
          normalizedValue: weight,
          error: isNaN(weight) ? `Invalid weight: ${cleanValue}` : undefined
        };

      case 'color':
        const colorUpper = cleanValue.toUpperCase();
        const isValidColor = VALID_COLORS.includes(colorUpper);
        return {
          isValid: isValidColor,
          normalizedValue: isValidColor ? colorUpper : 'G',
          error: !isValidColor ? `Invalid color: ${cleanValue}` : undefined
        };

      case 'clarity':
        const clarityUpper = cleanValue.toUpperCase();
        const isValidClarity = VALID_CLARITIES.includes(clarityUpper);
        return {
          isValid: isValidClarity,
          normalizedValue: isValidClarity ? clarityUpper : 'VS1',
          error: !isValidClarity ? `Invalid clarity: ${cleanValue}` : undefined
        };

      case 'cut':
        const cutUpper = cleanValue.toUpperCase();
        let validCut = VALID_CUTS.find(c => c === cutUpper);
        
        if (!validCut) {
          const aliasKey = Object.keys(CUT_ALIASES).find(key => key.toUpperCase() === cutUpper);
          if (aliasKey) {
            validCut = CUT_ALIASES[aliasKey as keyof typeof CUT_ALIASES];
          }
        }
        
        return {
          isValid: !!validCut,
          normalizedValue: validCut || 'EXCELLENT',
          error: !validCut ? `Invalid cut: ${cleanValue}` : undefined
        };

      case 'fluorescence':
        const fluorUpper = cleanValue.toUpperCase();
        let validFluor = VALID_FLUORESCENCE.find(f => f === fluorUpper);
        
        if (!validFluor) {
          const aliasKey = Object.keys(FLUORESCENCE_ALIASES).find(key => key.toUpperCase() === fluorUpper);
          if (aliasKey) {
            validFluor = FLUORESCENCE_ALIASES[aliasKey as keyof typeof FLUORESCENCE_ALIASES];
          }
        }
        
        return {
          isValid: !!validFluor,
          normalizedValue: validFluor || 'NONE',
          error: !validFluor ? `Invalid fluorescence: ${cleanValue}` : undefined
        };

      case 'certificate_number':
        // Accept any non-empty string for certificate number
        return {
          isValid: cleanValue.length > 0,
          normalizedValue: cleanValue,
          error: cleanValue.length === 0 ? 'Certificate number cannot be empty' : undefined
        };

      default:
        return { isValid: true, normalizedValue: cleanValue };
    }
  };

  const processFile = async (file: File) => {
    const startTime = Date.now();
    let fileType = 'unknown';
    
    try {
      let headers: string[] = [];
      let rawData: any[] = [];

      // Parse file based on type
      if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
        fileType = 'Excel';
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        headers = (jsonData[0] as any[]).map(h => String(h || '').trim());
        for (let i = 1; i < jsonData.length; i++) {
          const rowArray = jsonData[i] as any[];
          if (rowArray && rowArray.some(cell => cell !== null && cell !== undefined)) {
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = rowArray[index] ? String(rowArray[index]).trim() : '';
            });
            rawData.push(row);
          }
        }
      } else if (file.name.toLowerCase().endsWith('.csv')) {
        fileType = 'CSV';
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        headers = lines[0].split(',').map(h => h.trim().replace(/['"]/g, ''));
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/['"]/g, ''));
          if (values.some(v => v !== '')) {
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            rawData.push(row);
          }
        }
      } else {
        throw new Error(`Unsupported file format. Please use CSV, XLSX, or XLS files.`);
      }

      // Map headers to standard fields
      const { mappings } = mapHeaders(headers);
      
      console.log('📋 Header mappings:', mappings.map(m => `${m.csvHeader} -> ${m.mappedTo} (${m.confidence.toFixed(2)})`));
      
      // Check if we have all mandatory fields mapped
      const mandatoryFieldsMapped = MANDATORY_FIELDS.every(field => 
        mappings.some(m => m.mappedTo === field)
      );
      
      if (!mandatoryFieldsMapped) {
        const missingFields = MANDATORY_FIELDS.filter(field => 
          !mappings.some(m => m.mappedTo === field)
        );
        throw new Error(`Missing mandatory fields: ${missingFields.join(', ')}. Please ensure your file contains columns for: ${MANDATORY_FIELDS.join(', ')}`);
      }

      // Process and validate data - only check mandatory fields
      const validRows: any[] = [];
      const failedRows: Array<{ rowNumber: number; data: any; errors: string[] }> = [];
      const errors: Array<{ row: number; field: string; value: string; reason: string }> = [];

      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const processedRow: any = {};
        let hasAllMandatory = true;
        let rowErrors: string[] = [];

        // Map and validate each field  
        for (const mapping of mappings) {
          const value = row[mapping.csvHeader];
          const { isValid, normalizedValue, error } = validateValue(value, mapping.mappedTo);
          
          processedRow[mapping.mappedTo] = normalizedValue;
          
          // Only fail if it's a mandatory field AND has invalid data
          if (!isValid && MANDATORY_FIELDS.includes(mapping.mappedTo)) {
            hasAllMandatory = false;
            const errorMsg = `${mapping.mappedTo}: ${error}`;
            rowErrors.push(errorMsg);
            errors.push({
              row: i + 2,
              field: mapping.mappedTo,
              value: value || '',
              reason: error || 'Invalid value'
            });
          }
        }
        
        // Check if we have all mandatory fields with valid data
        for (const mandatoryField of MANDATORY_FIELDS) {
          if (!processedRow[mandatoryField]) {
            hasAllMandatory = false;
            rowErrors.push(`Missing mandatory field: ${mandatoryField}`);
          }
        }

        // Only add default values for API required fields if row has all mandatory fields
        if (hasAllMandatory) {
          // Add minimal defaults only for fields required by API but not mandatory for upload
          if (!processedRow.stock) {
            processedRow.stock = `AUTO-${Date.now()}-${i}`;
          }
          if (!processedRow.lab) {
            processedRow.lab = 'GIA';
          }
          if (!processedRow.price_per_carat) {
            processedRow.price_per_carat = 5000;
          }
          
          // Add other API required fields with minimal defaults
          processedRow.length = processedRow.length || 6.5;
          processedRow.width = processedRow.width || 6.5;
          processedRow.depth = processedRow.depth || 4.0;
          processedRow.ratio = processedRow.ratio || 1.0;
          processedRow.polish = processedRow.polish || 'EXCELLENT';
          processedRow.symmetry = processedRow.symmetry || 'EXCELLENT';
          processedRow.table = processedRow.table || 60;
          processedRow.depth_percentage = processedRow.depth_percentage || 62;
          processedRow.gridle = processedRow.gridle || 'Medium';
          processedRow.culet = processedRow.culet || 'NONE';
          processedRow.certificate_comment = processedRow.certificate_comment || 'No comments';
          processedRow.rapnet = processedRow.rapnet || 0;
          processedRow.picture = processedRow.picture || '';
          
          validRows.push(processedRow);
        } else {
          failedRows.push({
            rowNumber: i + 2,
            data: processedRow,
            errors: rowErrors
          });
        }
      }

      const processingTime = Date.now() - startTime;
      const processingReport = {
        totalProcessed: rawData.length,
        successCount: validRows.length,
        failureCount: failedRows.length,
        fileType,
        processingTime,
        aiExtracted: false
      };

      const results: ValidationResults = {
        totalRows: rawData.length,
        validRows: validRows.length,
        skippedRows: failedRows.length,
        fieldMappings: mappings,
        errors,
        warnings: [],
        processingReport
      };

      setProcessedData({ 
        validRows, 
        failedRows, 
        totalRows: rawData.length, 
        processingReport 
      });
      setValidationResults(results);

    } catch (error) {
      console.error('CSV processing error:', error);
      throw new Error(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const resetProcessor = () => {
    setProcessedData(null);
    setValidationResults(null);
  };

  const downloadFailedRecords = () => {
    if (!processedData?.failedRows.length) return;

    const csvHeaders = ['Row Number', 'Errors', ...Object.keys(processedData.failedRows[0].data)];
    const csvData = processedData.failedRows.map(failed => [
      failed.rowNumber,
      failed.errors.join('; '),
      ...Object.values(failed.data)
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `failed_diamonds_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    processedData,
    validationResults,
    processFile,
    resetProcessor,
    downloadFailedRecords,
  };
}

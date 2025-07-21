
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

// Define required fields for diamond validation
const REQUIRED_FIELDS = ['shape', 'weight', 'color', 'clarity', 'cut', 'fluorescence'];

// Enum mappings for validation
const VALID_SHAPES = ['round brilliant', 'princess', 'emerald', 'asscher', 'marquise', 'oval', 'radiant', 'pear', 'heart', 'cushion'];
const VALID_COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
const VALID_CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'SI3', 'I1', 'I2', 'I3'];
const VALID_CUTS = ['EXCELLENT', 'VERY GOOD', 'GOOD', 'FAIR', 'POOR'];
const VALID_FLUORESCENCE = ['NONE', 'FAINT', 'MEDIUM', 'STRONG', 'VERY STRONG'];

// Field mapping patterns for intelligent column detection
const FIELD_MAPPINGS = {
  shape: ['shape', 'cut_shape', 'diamond_shape', 'form'],
  weight: ['weight', 'carat', 'carats', 'ct', 'cts', 'size'],
  color: ['color', 'colour', 'grade_color', 'color_grade'],
  clarity: ['clarity', 'purity', 'grade_clarity', 'clarity_grade'],
  cut: ['cut', 'cut_grade', 'make', 'finish'],
  fluorescence: ['fluorescence', 'fluo', 'fluor'],
  price_per_carat: ['price/crt', 'price_per_carat', 'price per carat', 'ppc'],
  lab: ['lab', 'laboratory', 'cert', 'certificate'],
  certificate_number: ['cert_number', 'certificate_number', 'report_number'],
  stock: ['stock', 'stock_number', 'sku', 'item_number']
};

interface ProcessedData {
  validRows: any[];
  totalRows: number;
}

interface ValidationResults {
  totalRows: number;
  validRows: number;
  skippedRows: number;
  fieldMappings: Array<{ csvHeader: string; mappedTo: string; confidence: number }>;
  errors: Array<{ row: number; field: string; value: string; reason: string }>;
  warnings: Array<{ message: string }>;
}

export function useBulkCsvProcessor() {
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResults | null>(null);
  const { toast } = useToast();

  const fuzzyMatch = (input: string, candidates: string[]): { match: string; confidence: number } => {
    const inputLower = input.toLowerCase().trim();
    let bestMatch = '';
    let bestConfidence = 0;

    for (const candidate of candidates) {
      const candidateLower = candidate.toLowerCase();
      
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
    }

    return { match: bestMatch, confidence: bestConfidence };
  };

  const mapHeaders = (headers: string[]) => {
    const mappings: Array<{ csvHeader: string; mappedTo: string; confidence: number }> = [];
    const unmapped: string[] = [];

    for (const header of headers) {
      let bestMapping = '';
      let bestConfidence = 0;
      let bestField = '';

      for (const [standardField, variations] of Object.entries(FIELD_MAPPINGS)) {
        const { match, confidence } = fuzzyMatch(header, variations);
        if (confidence > bestConfidence && confidence >= 0.6) {
          bestConfidence = confidence;
          bestMapping = match;
          bestField = standardField;
        }
      }

      if (bestMapping && bestConfidence >= 0.6) {
        mappings.push({
          csvHeader: header,
          mappedTo: bestField,
          confidence: bestConfidence
        });
      } else {
        unmapped.push(header);
      }
    }

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
        const validShape = VALID_SHAPES.find(s => s.toLowerCase() === shapeNormalized);
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
        const isValidCut = VALID_CUTS.includes(cutUpper);
        return {
          isValid: isValidCut,
          normalizedValue: isValidCut ? cutUpper : 'EXCELLENT',
          error: !isValidCut ? `Invalid cut: ${cleanValue}` : undefined
        };

      case 'fluorescence':
        const fluorUpper = cleanValue.toUpperCase();
        const isValidFluor = VALID_FLUORESCENCE.includes(fluorUpper);
        return {
          isValid: isValidFluor,
          normalizedValue: isValidFluor ? fluorUpper : 'NONE',
          error: !isValidFluor ? `Invalid fluorescence: ${cleanValue}` : undefined
        };

      default:
        return { isValid: true, normalizedValue: cleanValue };
    }
  };

  const processFile = async (file: File) => {
    try {
      let headers: string[] = [];
      let rawData: any[] = [];

      // Parse file based on type
      if (file.name.toLowerCase().endsWith('.xlsx')) {
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
      } else {
        // CSV processing
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
      }

      // Map headers to standard fields
      const { mappings } = mapHeaders(headers);
      
      // Process and validate data
      const validRows: any[] = [];
      const errors: Array<{ row: number; field: string; value: string; reason: string }> = [];
      const warnings: Array<{ message: string }> = [];

      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const processedRow: any = {};
        let hasAllRequired = true;
        let rowErrors: Array<{ field: string; value: string; reason: string }> = [];

        // Map and validate each field
        for (const mapping of mappings) {
          const value = row[mapping.csvHeader];
          const { isValid, normalizedValue, error } = validateValue(value, mapping.mappedTo);
          
          processedRow[mapping.mappedTo] = normalizedValue;
          
          if (!isValid && REQUIRED_FIELDS.includes(mapping.mappedTo)) {
            hasAllRequired = false;
            rowErrors.push({
              field: mapping.mappedTo,
              value: value || '',
              reason: error || 'Invalid value'
            });
          }
        }

        // Add default values for missing fields
        if (!processedRow.stock) {
          processedRow.stock = `AUTO-${Date.now()}-${i}`;
        }
        if (!processedRow.lab) {
          processedRow.lab = 'GIA';
        }
        if (!processedRow.certificate_number) {
          processedRow.certificate_number = Math.floor(Math.random() * 1000000);
        }
        if (!processedRow.price_per_carat) {
          processedRow.price_per_carat = 5000;
        }

        if (hasAllRequired) {
          validRows.push(processedRow);
        } else {
          errors.push(...rowErrors.map(err => ({ row: i + 2, ...err })));
        }
      }

      const results: ValidationResults = {
        totalRows: rawData.length,
        validRows: validRows.length,
        skippedRows: rawData.length - validRows.length,
        fieldMappings: mappings,
        errors,
        warnings: mappings.length < REQUIRED_FIELDS.length ? 
          [{ message: `Missing mappings for required fields. Please ensure your CSV has columns for: ${REQUIRED_FIELDS.join(', ')}` }] : []
      };

      setProcessedData({ validRows, totalRows: rawData.length });
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

  return {
    processedData,
    validationResults,
    processFile,
    resetProcessor,
  };
}

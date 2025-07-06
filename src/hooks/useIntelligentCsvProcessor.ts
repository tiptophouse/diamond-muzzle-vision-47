import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';

interface FieldMapping {
  detectedField: string;
  mappedTo: string;
  confidence: number;
}

interface ProcessedCsvData {
  data: any[];
  fieldMappings: FieldMapping[];
  unmappedFields: string[];
  totalRows: number;
  successfulMappings: number;
}

export function useIntelligentCsvProcessor() {
  const { toast } = useToast();

  // Comprehensive field mapping definitions
  const fieldMappings = {
    stock: [
      'stock', 'stock_number', 'stocknumber', 'stock number', 'sku', 'item_number', 
      'item number', 'product_id', 'id', 'ref', 'reference', 'lot', 'lot_number',
      'certificate_id', 'stone_id', 'diamond_id', 'inventory_id'
    ],
    shape: [
      'shape', 'cut_shape', 'diamond_shape', 'form', 'tipo', 'forma', 'round',
      'princess', 'emerald', 'oval', 'marquise', 'pear', 'heart', 'asscher',
      'radiant', 'cushion', 'brilliant'
    ],
    weight: [
      'weight', 'carat', 'carats', 'ct', 'cts', 'size', 'peso', 'poids',
      'carat_weight', 'diamond_weight', 'stone_weight'
    ],
    color: [
      'color', 'colour', 'grade_color', 'color_grade', 'couleur', 'cor',
      'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n'
    ],
    clarity: [
      'clarity', 'purity', 'purete', 'pureza', 'grade_clarity', 'clarity_grade',
      'fl', 'if', 'vvs1', 'vvs2', 'vs1', 'vs2', 'si1', 'si2', 'si3', 'i1', 'i2', 'i3'
    ],
    cut: [
      'cut', 'cut_grade', 'polish', 'make', 'finish', 'excellent', 'very_good',
      'good', 'fair', 'poor', 'ideal', 'premium'
    ],
    price_per_carat: [
      'price', 'cost', 'amount', 'value', 'precio', 'prix', 'preco',
      'total_price', 'unit_price', 'price_per_carat', 'price/crt', 'price per carat',
      'rap', 'rapnet', 'asking_price', 'selling_price', 'market_price', 'wholesale_price'
    ],
    lab: [
      'lab', 'laboratory', 'cert', 'certificate', 'certification', 'grading_lab',
      'gia', 'ags', 'ssef', 'gubelin', 'grs', 'agl', 'lotus', 'ggtl'
    ],
    certificate_number: [
      'certificate_number', 'cert_number', 'certification_number', 'report_number',
      'gia_number', 'lab_number', 'grading_report', 'certificate_id'
    ],
    fluorescence: [
      'fluorescence', 'fluor', 'fluorescencia', 'fluorescente', 'none', 'faint',
      'medium', 'strong', 'very_strong'
    ],
    length: ['length', 'l', 'largo', 'longueur', 'comprimento'],
    width: ['width', 'w', 'ancho', 'largeur', 'largura'],
    depth: ['depth', 'd', 'profondeur', 'profundidad', 'altura'],
    table: ['table', 'table_percentage', 'table%', 'mesa'],
    depth_percentage: ['depth_percentage', 'depth%', 'total_depth', 'profundidad%'],
    girdle: ['girdle', 'gridle', 'cinta', 'rondiste'],
    culet: ['culet', 'culeta', 'colette'],
    symmetry: ['symmetry', 'simetria', 'symetrie'],
    polish: ['polish', 'pulido', 'polissage']
  };

  const fuzzyMatch = (input: string, candidates: string[]): { match: string; score: number } => {
    const inputLower = input.toLowerCase().replace(/[_\s-]/g, '');
    let bestMatch = '';
    let bestScore = 0;

    for (const candidate of candidates) {
      const candidateLower = candidate.toLowerCase().replace(/[_\s-]/g, '');
      
      // Exact match gets highest score
      if (inputLower === candidateLower) {
        return { match: candidate, score: 1.0 };
      }
      
      // Contains match
      if (inputLower.includes(candidateLower) || candidateLower.includes(inputLower)) {
        const score = Math.max(candidateLower.length / inputLower.length, inputLower.length / candidateLower.length) * 0.8;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = candidate;
        }
      }
      
      // Levenshtein distance for similar strings
      const distance = levenshteinDistance(inputLower, candidateLower);
      const maxLen = Math.max(inputLower.length, candidateLower.length);
      const similarity = (maxLen - distance) / maxLen;
      
      if (similarity > 0.7 && similarity > bestScore) {
        bestScore = similarity;
        bestMatch = candidate;
      }
    }

    return { match: bestMatch, score: bestScore };
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  };

  const mapHeaders = (headers: string[]): { mappings: FieldMapping[]; unmapped: string[] } => {
    const mappings: FieldMapping[] = [];
    const unmapped: string[] = [];

    for (const header of headers) {
      let bestMapping = '';
      let bestScore = 0;
      let bestField = '';

      for (const [standardField, variations] of Object.entries(fieldMappings)) {
        const { match, score } = fuzzyMatch(header, variations);
        if (score > bestScore && score >= 0.6) { // Minimum confidence threshold
          bestScore = score;
          bestMapping = match;
          bestField = standardField;
        }
      }

      if (bestMapping && bestScore >= 0.6) {
        mappings.push({
          detectedField: header,
          mappedTo: bestField,
          confidence: bestScore
        });
      } else {
        unmapped.push(header);
      }
    }

    return { mappings, unmapped };
  };

  const transformDataRow = (row: any, fieldMappings: FieldMapping[]) => {
    const transformedRow: any = {};
    
    // Map detected fields to standard fields
    for (const mapping of fieldMappings) {
      const value = row[mapping.detectedField];
      if (value !== undefined && value !== null && value !== '') {
        transformedRow[mapping.mappedTo] = cleanValue(value, mapping.mappedTo);
      }
    }

    console.log('🔍 Raw row data:', row);
    console.log('🎯 Transformed row data:', transformedRow);

    // Build the final diamond data, using the correctly mapped field names
    const result = {
      stock: transformedRow.stock || `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      shape: transformedRow.shape || 'round brilliant',
      weight: transformedRow.weight || 1.0,
      color: transformedRow.color || 'G', 
      clarity: transformedRow.clarity || 'VS1',
      cut: transformedRow.cut || 'EXCELLENT',
      // Fixed: Use price_per_carat field name, not just 'price'
      price_per_carat: transformedRow.price_per_carat || transformedRow.price || 5000,
      lab: transformedRow.lab || 'GIA',
      certificate_number: transformedRow.certificate_number || Math.floor(Math.random() * 1000000),
      length: transformedRow.length || 6.5,
      width: transformedRow.width || 6.5,
      depth: transformedRow.depth || 4.0,
      ratio: transformedRow.ratio || 1.0,
      polish: transformedRow.polish || 'EXCELLENT',
      symmetry: transformedRow.symmetry || 'EXCELLENT',
      fluorescence: transformedRow.fluorescence || 'NONE',
      table: transformedRow.table || 60,
      depth_percentage: transformedRow.depth_percentage || 62,
      gridle: transformedRow.girdle || 'Medium',
      culet: transformedRow.culet || 'NONE',
      certificate_comment: transformedRow.certificate_comment || 'No comments',
      rapnet: transformedRow.rapnet || 0,
      picture: transformedRow.picture || ''
    };

    console.log('✅ Final diamond data:', result);
    return result;
  };

  const cleanValue = (value: any, fieldType: string): any => {
    if (value === null || value === undefined) return null;
    
    const strValue = String(value).trim();
    
    switch (fieldType) {
      case 'weight':
      case 'length':
      case 'width': 
      case 'depth':
      case 'table':
      case 'depth_percentage':
        // Remove any non-numeric characters except decimal point
        const numStr = strValue.replace(/[^\d.]/g, '');
        return parseFloat(numStr) || 0;
        
      case 'price':
        // Remove currency symbols and commas
        const priceStr = strValue.replace(/[$,€£¥]/g, '').replace(/[^\d.]/g, '');
        return parseFloat(priceStr) || 0;
        
      case 'certificate_number':
        // Extract numbers only
        const certStr = strValue.replace(/\D/g, '');
        return parseInt(certStr) || 0;
        
      case 'color':
        // Strict validation for color grades
        const colorUpper = strValue.toUpperCase();
        const validColors = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
        return validColors.includes(colorUpper) ? colorUpper : 'G';
        
      case 'clarity':
        const clarityUpper = strValue.toUpperCase();
        const validClarities = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'SI3', 'I1', 'I2', 'I3'];
        return validClarities.includes(clarityUpper) ? clarityUpper : 'VS1';
        
      case 'cut':
      case 'polish':
      case 'symmetry':
        const gradeUpper = strValue.toUpperCase();
        const validGrades = ['EXCELLENT', 'VERY GOOD', 'GOOD', 'FAIR', 'POOR'];
        return validGrades.includes(gradeUpper) ? gradeUpper : 'EXCELLENT';
        
      case 'fluorescence':
        const fluorUpper = strValue.toUpperCase();
        const validFluor = ['NONE', 'FAINT', 'MEDIUM', 'STRONG', 'VERY STRONG'];
        return validFluor.includes(fluorUpper) ? fluorUpper : 'NONE';
        
      case 'shape':
        // Map common shape variants to API accepted values
        const shapeLower = strValue.toLowerCase().trim();
        const shapeMap: { [key: string]: string } = {
          'round': 'round brilliant',
          'rd': 'round brilliant', 
          'rbc': 'round brilliant',
          'brilliant': 'round brilliant',
          'round brilliant': 'round brilliant',
          'princess': 'princess',
          'pr': 'princess',
          'cushion': 'cushion',
          'cu': 'cushion',
          'oval': 'oval',
          'ov': 'oval',
          'emerald': 'emerald',
          'em': 'emerald',
          'pear': 'pear',
          'ps': 'pear',
          'marquise': 'marquise',
          'mq': 'marquise',
          'asscher': 'asscher',
          'as': 'asscher',
          'radiant': 'radiant',
          'ra': 'radiant',
          'heart': 'heart',
          'ht': 'heart'
        };
        return shapeMap[shapeLower] || 'round brilliant';
        
      case 'culet':
        const culetUpper = strValue.toUpperCase();
        const validCulets = ['NONE', 'VERY SMALL', 'SMALL', 'MEDIUM', 'SLIGHTLY LARGE', 'LARGE', 'VERY LARGE'];
        return validCulets.includes(culetUpper) ? culetUpper : 'NONE';
        
      default:
        return strValue;
    }
  };

  const processIntelligentCsv = async (file: File): Promise<ProcessedCsvData> => {
    try {
      const fileName = file.name.toLowerCase();
      let headers: string[] = [];
      let rawData: any[] = [];

      if (fileName.endsWith('.xlsx')) {
        console.log('📱 Processing XLSX file for mobile upload...');
        
        // Read XLSX file
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          throw new Error('XLSX file must contain at least a header row and one data row');
        }
        
        headers = (jsonData[0] as any[]).map(h => String(h || '').trim());
        
        // Convert remaining rows to objects
        for (let i = 1; i < jsonData.length; i++) {
          const rowArray = jsonData[i] as any[];
          if (rowArray && rowArray.some(cell => cell !== null && cell !== undefined && cell !== '')) {
            const row: any = {};
            headers.forEach((header, index) => {
              const value = rowArray[index];
              row[header] = value !== null && value !== undefined ? String(value).trim() : '';
            });
            rawData.push(row);
          }
        }
      } else {
        console.log('📱 Processing CSV file for mobile upload...');
        
        // Handle CSV as before
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          throw new Error('CSV file must contain at least a header row and one data row');
        }

        // Parse headers
        const headerLine = lines[0];
        headers = headerLine.split(',').map(h => h.trim().replace(/['"]/g, ''));
        
        // Process each data row
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;
          
          // Parse CSV line handling quoted values
          const values = parseCsvLine(line);
          
          if (values.length >= headers.length) {
            const row: any = {};
            headers.forEach((header, index) => {
              const value = values[index] || '';
              row[header] = value.replace(/['"]/g, '').trim();
            });
            rawData.push(row);
          }
        }
      }
      
      console.log('🔍 Headers detected:', headers);
      
      // Map headers to standard fields
      const { mappings, unmapped } = mapHeaders(headers);
      
      console.log('🎯 Field mappings:', mappings);
      console.log('❓ Unmapped fields:', unmapped);

      const processedData = rawData.map(row => transformDataRow(row, mappings));
      
      return {
        data: processedData,
        fieldMappings: mappings,
        unmappedFields: unmapped,
        totalRows: processedData.length,
        successfulMappings: mappings.length
      };
      
    } catch (error) {
      console.error('Intelligent file processing error:', error);
      throw new Error(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Helper function to parse CSV line with proper quote handling
  const parseCsvLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  };

  const validateFile = (file: File | null): boolean => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return false;
    }

    // Check file type - support both CSV and XLSX for mobile users
    const fileName = file.name.toLowerCase();
    const isValidType = file.type === 'text/csv' || 
                       file.type === 'application/vnd.ms-excel' ||
                       file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                       fileName.endsWith('.csv') ||
                       fileName.endsWith('.xlsx');
    
    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV or XLSX file (.csv or .xlsx)",
        variant: "destructive",
      });
      return false;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return {
    validateFile,
    processIntelligentCsv,
  };
}
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

  // Comprehensive field mapping definitions with exact CSV header matches
  const fieldMappings = {
    stock: [
      'stock#', 'stock', 'stock_number', 'stocknumber', 'stock number', 'sku', 'item_number', 
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
      'cut', 'cut_grade', 'make', 'finish', 'excellent', 'very_good',
      'good', 'fair', 'poor', 'ideal', 'premium'
    ],
    price_per_carat: [
      'price/crt', 'price_per_carat', 'price per carat', 'price/ct', 'price/carat', 
      'ppc', 'per_carat', 'carat_price', 'unit_price', 'asking_price', 'selling_price'
    ],
    price: [
      'price', 'total_price', 'cost', 'amount', 'value', 'precio', 'prix', 'preco', 
      'market_price', 'wholesale_price'
    ],
    lab: [
      'lab', 'laboratory', 'cert', 'certificate', 'certification', 'grading_lab',
      'gia', 'ags', 'ssef', 'gubelin', 'grs', 'agl', 'lotus', 'ggtl'
    ],
    certificate_number: [
      'certnumber', 'certificate_number', 'cert_number', 'certification_number', 'report_number',
      'gia_number', 'lab_number', 'grading_report', 'certificate_id'
    ],
    fluorescence: [
      'fluo', 'fluorescence', 'fluor', 'fluorescencia', 'fluorescente', 'none', 'faint',
      'medium', 'strong', 'very_strong'
    ],
    length: ['length', 'l', 'largo', 'longueur', 'comprimento'],
    width: ['width', 'w', 'ancho', 'largeur', 'largura'],
    depth: ['depth', 'd', 'profondeur', 'profundidad', 'altura'],
    table: ['table', 'table_percentage', 'table%', 'mesa'],
    depth_percentage: ['depth%', 'depth_percentage', 'total_depth', 'profundidad%'],
    girdle: ['girdle', 'gridle', 'cinta', 'rondiste'],
    culet: ['culet', 'culeta', 'colette'],
    symmetry: ['symm', 'symmetry', 'simetria', 'symetrie'],
    polish: ['polish', 'pulido', 'polissage'],
    ratio: ['ratio', 'measurements'],
    rapnet: ['rap%', 'rap_percent', 'rapnet', 'rap'],
    certificate_comment: ['certcomments', 'cert_comments', 'certificate_comment', 'comments'],
    picture: ['pic', 'picture', 'image', 'photo']
  };

  const fuzzyMatch = (input: string, candidates: string[]): { match: string; score: number } => {
    const inputLower = input.toLowerCase().trim();
    let bestMatch = '';
    let bestScore = 0;

    for (const candidate of candidates) {
      const candidateLower = candidate.toLowerCase().trim();
      
      // Exact match (case insensitive) gets highest score
      if (inputLower === candidateLower) {
        return { match: candidate, score: 1.0 };
      }
      
      // Handle special characters by creating normalized versions
      const inputNormalized = inputLower.replace(/[#\/%\s_-]/g, '');
      const candidateNormalized = candidateLower.replace(/[#\/%\s_-]/g, '');
      
      // Exact match on normalized versions
      if (inputNormalized === candidateNormalized) {
        return { match: candidate, score: 0.95 };
      }
      
      // Contains match on original strings
      if (inputLower.includes(candidateLower) || candidateLower.includes(inputLower)) {
        const score = Math.max(candidateLower.length / inputLower.length, inputLower.length / candidateLower.length) * 0.9;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = candidate;
        }
      }
      
      // Contains match on normalized strings
      if (inputNormalized.includes(candidateNormalized) || candidateNormalized.includes(inputNormalized)) {
        const score = Math.max(candidateNormalized.length / inputNormalized.length, inputNormalized.length / candidateNormalized.length) * 0.85;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = candidate;
        }
      }
      
      // Levenshtein distance for similar strings (normalized)
      const distance = levenshteinDistance(inputNormalized, candidateNormalized);
      const maxLen = Math.max(inputNormalized.length, candidateNormalized.length);
      const similarity = maxLen > 0 ? (maxLen - distance) / maxLen : 0;
      
      if (similarity > 0.7 && similarity > bestScore) {
        bestScore = similarity * 0.8;
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

    console.log('🔍 MAPPING HEADERS:', headers);

    for (const header of headers) {
      let bestMapping = '';
      let bestScore = 0;
      let bestField = '';

      console.log(`\n🎯 Processing header: "${header}"`);

      for (const [standardField, variations] of Object.entries(fieldMappings)) {
        const { match, score } = fuzzyMatch(header, variations);
        console.log(`   Checking ${standardField}: score=${score.toFixed(3)}, match="${match}"`);
        
        if (score > bestScore && score >= 0.6) { // Minimum confidence threshold
          bestScore = score;
          bestMapping = match;
          bestField = standardField;
        }
      }

      if (bestMapping && bestScore >= 0.6) {
        console.log(`✅ MAPPED: "${header}" -> ${bestField} (confidence: ${bestScore.toFixed(3)})`);
        mappings.push({
          detectedField: header,
          mappedTo: bestField,
          confidence: bestScore
        });
      } else {
        console.log(`❌ UNMAPPED: "${header}" (best score: ${bestScore.toFixed(3)})`);
        unmapped.push(header);
      }
    }

    return { mappings, unmapped };
  };

  const transformDataRow = (row: any, fieldMappings: FieldMapping[]) => {
    console.log('🔍 RAW ROW INPUT:', JSON.stringify(row, null, 2));
    console.log('🎯 FIELD MAPPINGS:', JSON.stringify(fieldMappings, null, 2));
    
    const transformedRow: any = {};
    
    // Map detected fields to standard fields
    for (const mapping of fieldMappings) {
      const value = row[mapping.detectedField];
      console.log(`🔍 MAPPING: ${mapping.detectedField} -> ${mapping.mappedTo}, value: "${value}"`);
      
      if (value !== undefined && value !== null && value !== '') {
        const cleanedValue = cleanValue(value, mapping.mappedTo);
        transformedRow[mapping.mappedTo] = cleanedValue;
        console.log(`✅ MAPPED: ${mapping.mappedTo} = "${cleanedValue}"`);
      } else {
        console.log(`❌ EMPTY VALUE for ${mapping.detectedField}`);
      }
    }

    console.log('🎯 FINAL TRANSFORMED ROW:', JSON.stringify(transformedRow, null, 2));

    // Determine shape first to decide on cut field inclusion
    const shape = transformedRow.shape ?? 'round brilliant';
    const isRound = shape.toLowerCase().includes('round') || shape.toLowerCase().includes('brilliant');

    // Build the final diamond data, using the correctly mapped field names
    // Use nullish coalescing (??) to only apply defaults when values are null/undefined
    const result = {
      stock: transformedRow.stock ?? `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      shape: shape,
      weight: transformedRow.weight ?? 1.0,
      color: transformedRow.color ?? 'G', 
      clarity: transformedRow.clarity ?? 'VS1',
      // Only include cut for round diamonds and if it has a valid value
      ...(isRound && transformedRow.cut ? { cut: transformedRow.cut } : {}),
      // Enhanced price handling - prioritize price_per_carat, fallback to calculated price, then default
      price_per_carat: transformedRow.price_per_carat ?? 
                      (transformedRow.price != null && transformedRow.weight != null && transformedRow.weight > 0 
                        ? transformedRow.price / transformedRow.weight 
                        : 5000),
      lab: transformedRow.lab ?? 'GIA',
      certificate_number: transformedRow.certificate_number ?? Math.floor(Math.random() * 1000000),
      length: transformedRow.length ?? 6.5,
      width: transformedRow.width ?? 6.5,
      depth: transformedRow.depth ?? 4.0,
      ratio: transformedRow.ratio ?? 1.0,
      polish: transformedRow.polish ?? 'EXCELLENT',
      symmetry: transformedRow.symmetry ?? 'EXCELLENT',
      fluorescence: transformedRow.fluorescence ?? 'NONE',
      table: transformedRow.table ?? 60,
      depth_percentage: transformedRow.depth_percentage ?? 62,
      gridle: transformedRow.girdle ?? 'Medium',
      culet: transformedRow.culet ?? 'NONE',
      certificate_comment: transformedRow.certificate_comment ?? 'No comments',
      rapnet: transformedRow.rapnet ?? 0,
      picture: transformedRow.picture ?? ''
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
      case 'price_per_carat':
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
        
        // Map common abbreviations to full names
        const gradeMap: { [key: string]: string } = {
          'EX': 'EXCELLENT',
          'EXCELLENT': 'EXCELLENT',
          'VG': 'VERY GOOD',
          'VERY GOOD': 'VERY GOOD',
          'G': 'GOOD',
          'GOOD': 'GOOD',
          'F': 'POOR',
          'FAIR': 'POOR',
          'POOR': 'POOR',
          'P': 'POOR'
        };
        
        return gradeMap[gradeUpper] || 'EXCELLENT';
        
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
        
        // Handle percentage values for culet (convert to descriptive terms)
        if (strValue.includes('%')) {
          const percentage = parseFloat(strValue.replace('%', ''));
          if (percentage === 0 || strValue.toLowerCase().includes('none')) return 'NONE';
          if (percentage <= 2) return 'VERY SMALL';
          if (percentage <= 4) return 'SMALL';
          if (percentage <= 6) return 'MEDIUM';
          if (percentage <= 8) return 'SLIGHTLY LARGE';
          if (percentage <= 10) return 'LARGE';
          return 'VERY LARGE';
        }
        
        // Handle text values
        const culetMap: { [key: string]: string } = {
          'NONE': 'NONE',
          'POINTED': 'NONE',
          'VERY SMALL': 'VERY SMALL',
          'SMALL': 'SMALL',
          'MEDIUM': 'MEDIUM',
          'SLIGHTLY LARGE': 'SLIGHTLY LARGE',
          'LARGE': 'LARGE',
          'VERY LARGE': 'VERY LARGE'
        };
        
        return culetMap[culetUpper] || 'NONE';
        
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
                       file.type === 'application/csv' ||
                       file.type === 'text/plain' ||
                       file.type === 'application/vnd.ms-excel' ||
                       file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                       file.type === '' || // Some mobile browsers don't set MIME type correctly
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

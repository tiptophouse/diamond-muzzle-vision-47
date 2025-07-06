import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

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
    price: [
      'price', 'cost', 'amount', 'value', 'precio', 'prix', 'preco',
      'total_price', 'unit_price', 'price_per_carat', 'rap', 'rapnet',
      'asking_price', 'selling_price', 'market_price', 'wholesale_price'
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

    // Set defaults for missing required fields
    return {
      stock: transformedRow.stock || `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      shape: transformedRow.shape || 'round',
      weight: parseFloat(transformedRow.weight) || 1.0,
      color: transformedRow.color || 'G', 
      clarity: transformedRow.clarity || 'VS1',
      cut: transformedRow.cut || 'EXCELLENT',
      price_per_carat: parseFloat(transformedRow.price) || 5000,
      lab: transformedRow.lab || 'GIA',
      certificate_number: parseInt(transformedRow.certificate_number) || Math.floor(Math.random() * 1000000),
      length: parseFloat(transformedRow.length) || 6.5,
      width: parseFloat(transformedRow.width) || 6.5,
      depth: parseFloat(transformedRow.depth) || 4.0,
      ratio: 1.0,
      polish: transformedRow.polish || 'EXCELLENT',
      symmetry: transformedRow.symmetry || 'EXCELLENT',
      fluorescence: transformedRow.fluorescence || 'NONE',
      table: parseFloat(transformedRow.table) || 60,
      depth_percentage: parseFloat(transformedRow.depth_percentage) || 62,
      gridle: transformedRow.girdle || 'Medium',
      culet: transformedRow.culet || 'NONE',
      certificate_comment: null,
      rapnet: null,
      picture: null
    };
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
      case 'clarity':
      case 'cut':
      case 'fluorescence':
      case 'polish':
      case 'symmetry':
        return strValue.toUpperCase();
        
      case 'shape':
        return strValue.toLowerCase().replace(/\s+/g, ' ');
        
      default:
        return strValue;
    }
  };

  const processIntelligentCsv = async (file: File): Promise<ProcessedCsvData> => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }

      // Parse headers
      const headerLine = lines[0];
      const headers = headerLine.split(',').map(h => h.trim().replace(/['"]/g, ''));
      
      console.log('🔍 CSV Headers detected:', headers);
      
      // Map headers to standard fields
      const { mappings, unmapped } = mapHeaders(headers);
      
      console.log('🎯 Field mappings:', mappings);
      console.log('❓ Unmapped fields:', unmapped);

      const processedData = [];
      
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
          
          // Transform row using intelligent mapping
          const transformedRow = transformDataRow(row, mappings);
          processedData.push(transformedRow);
        }
      }
      
      return {
        data: processedData,
        fieldMappings: mappings,
        unmappedFields: unmapped,
        totalRows: processedData.length,
        successfulMappings: mappings.length
      };
      
    } catch (error) {
      console.error('Intelligent CSV processing error:', error);
      throw new Error(`Failed to process CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

    // Check file type
    const isValidType = file.type === 'text/csv' || 
                       file.type === 'application/vnd.ms-excel' ||
                       file.name.toLowerCase().endsWith('.csv');
    
    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file (.csv)",
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
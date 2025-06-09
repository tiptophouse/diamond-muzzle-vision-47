
import { toast } from "@/components/ui/use-toast";

interface CsvRow {
  [key: string]: string;
}

interface ParsedDiamond {
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut: string;
  price_per_carat: number;
  lab?: string;
  certificate_number?: number;
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
  table_percentage?: number;
  depth_percentage?: number;
  ratio?: number;
  girdle?: string;
  culet?: string;
  certificate_comment?: string;
  picture?: string;
  status: string;
  user_id: number;
  store_visible: boolean;
}

export const useEnhancedCsvProcessor = () => {
  const parseCSVFile = (file: File): Promise<CsvRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          console.log('CSV file content preview:', text.substring(0, 500));
          
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            reject(new Error('CSV file must have at least a header row and one data row'));
            return;
          }

          // Auto-detect delimiter
          const firstLine = lines[0];
          let delimiter = ',';
          
          // Check for tab first (most specific)
          if (firstLine.includes('\t')) {
            delimiter = '\t';
          } 
          // Then semicolon
          else if (firstLine.includes(';') && firstLine.split(';').length > firstLine.split(',').length) {
            delimiter = ';';
          }

          console.log('Using delimiter:', delimiter === '\t' ? 'TAB' : delimiter);

          // Parse with proper quote handling
          const parseCSVLine = (line: string): string[] => {
            const result: string[] = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === delimiter && !inQuotes) {
                result.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            result.push(current.trim());
            return result;
          };

          const headers = parseCSVLine(lines[0]).map(h => h.replace(/"/g, ''));
          console.log('CSV Headers:', headers);
          
          const rows: CsvRow[] = [];

          for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]).map(v => v.replace(/"/g, ''));
            if (values.length >= headers.length && values.some(v => v)) {
              const row: CsvRow = {};
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });
              rows.push(row);
            }
          }

          console.log('Parsed CSV rows:', rows.length);
          console.log('Sample row:', rows[0]);
          resolve(rows);
        } catch (error) {
          console.error('CSV parsing error:', error);
          reject(new Error('Failed to parse CSV file. Please check the format.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read CSV file'));
      reader.readAsText(file);
    });
  };

  const mapCsvToInventory = (csvData: CsvRow[], userId: number): ParsedDiamond[] => {
    console.log('Mapping CSV data to inventory format...');
    
    // Shape mapping
    const shapeMapping: Record<string, string> = {
      'BR': 'Round',
      'Round': 'Round',
      'PS': 'Princess',
      'Princess': 'Princess',
      'EM': 'Emerald',
      'Emerald': 'Emerald',
      'AS': 'Asscher',
      'Asscher': 'Asscher',
      'CU': 'Cushion',
      'Cushion': 'Cushion',
      'OV': 'Oval',
      'Oval': 'Oval',
      'RD': 'Radiant',
      'Radiant': 'Radiant',
      'PE': 'Pear',
      'Pear': 'Pear',
      'MQ': 'Marquise',
      'Marquise': 'Marquise',
      'HT': 'Heart',
      'Heart': 'Heart'
    };

    // Fluorescence mapping
    const fluorescenceMapping: Record<string, string> = {
      'NON': 'None',
      'None': 'None',
      'FNT': 'Faint',
      'Faint': 'Faint',
      'MED': 'Medium',
      'Medium': 'Medium',
      'STG': 'Strong',
      'Strong': 'Strong',
      'VST': 'Very Strong',
      'Very Strong': 'Very Strong'
    };

    // Cut/Polish/Symmetry mapping
    const gradeMapping: Record<string, string> = {
      'EX': 'Excellent',
      'Excellent': 'Excellent',
      'VG': 'Very Good',
      'Very Good': 'Very Good',
      'G': 'Good',
      'Good': 'Good',
      'F': 'Fair',
      'Fair': 'Fair',
      'P': 'Poor',
      'Poor': 'Poor'
    };
    
    return csvData.map((row, index) => {
      try {
        const getColumnValue = (variations: string[]) => {
          for (const variation of variations) {
            if (row[variation] !== undefined && row[variation] !== '') {
              return row[variation];
            }
          }
          return null;
        };

        const stockNumber = getColumnValue([
          'Stock#', 'stock_number', 'Stock Number', 'stock', 'Stock', 'ID', 'id'
        ]) || `STOCK-${Date.now()}-${index}`;

        const shapeRaw = getColumnValue([
          'Shape', 'shape', 'Cut Shape', 'cut_shape'
        ]) || 'BR';
        const shape = shapeMapping[shapeRaw] || shapeRaw || 'Round';

        const weight = parseFloat(getColumnValue([
          'Weight', 'weight', 'carat', 'Carat', 'Ct', 'ct', 'Size'
        ]) || '1.0');

        const color = getColumnValue([
          'Color', 'color', 'Colour'
        ]) || 'G';

        const clarity = getColumnValue([
          'Clarity', 'clarity', 'Purity'
        ]) || 'VS1';

        const cutRaw = getColumnValue([
          'Cut', 'cut', 'Cut Grade', 'cut_grade'
        ]) || 'EX';
        const cut = gradeMapping[cutRaw] || cutRaw || 'Excellent';

        const pricePerCarat = parseInt(getColumnValue([
          'Price/Crt', 'Price/Carat', 'price_per_carat', 'Price Per Carat', 'price', 'Price'
        ]) || '5000');

        const lab = getColumnValue([
          'Lab', 'lab', 'Certificate', 'Cert', 'Laboratory'
        ]) || 'GIA';

        const certificateNumber = getColumnValue([
          'CertNumber', 'Certificate Number', 'Cert Number', 'cert_number', 'Report Number'
        ]);

        const fluorescenceRaw = getColumnValue([
          'Fluo', 'fluorescence', 'Fluorescence', 'FL'
        ]) || 'NON';
        const fluorescence = fluorescenceMapping[fluorescenceRaw] || fluorescenceRaw || 'None';

        const polishRaw = getColumnValue([
          'Polish', 'polish', 'Pol'
        ]) || 'EX';
        const polish = gradeMapping[polishRaw] || polishRaw || 'Excellent';

        const symmRaw = getColumnValue([
          'Symm', 'symmetry', 'Symmetry', 'Sym'
        ]) || 'EX';
        const symmetry = gradeMapping[symmRaw] || symmRaw || 'Excellent';

        const table = getColumnValue([
          'Table', 'table', 'Table %', 'table_percentage'
        ]);

        const depth = getColumnValue([
          'Depth', 'depth', 'Depth %', 'depth_percentage', 'Total Depth'
        ]);

        const ratio = getColumnValue([
          'Ratio', 'ratio'
        ]);

        const girdle = getColumnValue([
          'Girdle', 'girdle'
        ]);

        const culet = getColumnValue([
          'Culet', 'culet'
        ]);

        const certComments = getColumnValue([
          'CertComments', 'certificate_comment', 'Comments', 'comments'
        ]);

        const picture = getColumnValue([
          'Pic', 'picture', 'Picture', 'Image', 'image'
        ]);

        const inventoryItem: ParsedDiamond = {
          stock_number: stockNumber,
          shape: shape,
          weight: isNaN(weight) ? 1.0 : weight,
          color: color,
          clarity: clarity,
          cut: cut,
          price_per_carat: isNaN(pricePerCarat) ? 5000 : pricePerCarat,
          status: 'Available',
          lab: lab,
          certificate_number: certificateNumber ? parseInt(certificateNumber) : undefined,
          fluorescence: fluorescence,
          polish: polish,
          symmetry: symmetry,
          table_percentage: table ? parseInt(table) : undefined,
          depth_percentage: depth ? parseFloat(depth) : undefined,
          ratio: ratio ? parseFloat(ratio) : undefined,
          girdle: girdle || undefined,
          culet: culet || undefined,
          certificate_comment: certComments || undefined,
          picture: picture || undefined,
          user_id: userId,
          store_visible: true,
        };

        console.log(`Mapped item ${index + 1}:`, inventoryItem);
        return inventoryItem;
      } catch (error) {
        console.error(`Error mapping row ${index + 1}:`, error, row);
        throw new Error(`Error processing row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
  };

  const validateFile = (file: File | null): boolean => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a CSV or TXT file.",
      });
      return false;
    }

    const validExtensions = ['.csv', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select a CSV or TXT file.",
      });
      return false;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select a file smaller than 10MB.",
      });
      return false;
    }

    return true;
  };

  return {
    parseCSVFile,
    mapCsvToInventory,
    validateFile
  };
};

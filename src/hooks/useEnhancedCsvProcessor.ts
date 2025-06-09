import { useState, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";

interface CsvRow {
  [key: string]: string | number | undefined;
}

interface InventoryItem {
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut?: string;
  price_per_carat?: number;
  lab?: string;
  certificate_number?: string;
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
  table_percentage?: number;
  depth_percentage?: number;
  measurements?: string;
  ratio?: number;
  status?: string;
  store_visible?: boolean;
  user_id: number;
  picture?: string;
  additional_images?: string[];
}

export function useEnhancedCsvProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);

  const validateFile = useCallback((file: File): boolean => {
    const validExtensions = ['.csv', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a CSV or TXT file.",
      });
      return false;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
      });
      return false;
    }

    return true;
  }, []);

  const parseCSVFile = useCallback(async (file: File): Promise<CsvRow[]> => {
    setIsProcessing(true);
    
    try {
      const text = await file.text();
      
      // Auto-detect delimiter
      const delimiters = [',', ';', '\t'];
      let bestDelimiter = ',';
      let maxColumns = 0;
      
      for (const delimiter of delimiters) {
        const lines = text.trim().split('\n');
        if (lines.length > 0) {
          const columns = lines[0].split(delimiter).length;
          if (columns > maxColumns) {
            maxColumns = columns;
            bestDelimiter = delimiter;
          }
        }
      }

      console.log('📊 CSV: Using delimiter:', bestDelimiter === '\t' ? 'TAB' : bestDelimiter);

      const lines = text.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }

      // Parse header
      const headers = lines[0].split(bestDelimiter).map(h => h.trim().replace(/['"]/g, ''));
      console.log('📊 CSV: Headers found:', headers);

      // Parse data rows
      const rows: CsvRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(bestDelimiter).map(v => v.trim().replace(/['"]/g, ''));
        const row: CsvRow = {};
        
        headers.forEach((header, index) => {
          const value = values[index];
          if (value !== undefined && value !== '') {
            // Try to parse as number if it looks like one
            const numValue = parseFloat(value);
            row[header] = !isNaN(numValue) && isFinite(numValue) ? numValue : value;
          }
        });
        
        rows.push(row);
      }

      console.log('📊 CSV: Parsed rows:', rows.length);
      return rows;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const mapCsvToInventory = useCallback((csvData: CsvRow[], userId: number): InventoryItem[] => {
    console.log('🔄 CSV: Mapping data for user:', userId);
    
    return csvData.map((row, index) => {
      // Enhanced field mapping with multiple image support
      const stockNumber = (row['Stock#'] || row['Stock'] || row['stock_number'] || row['StockNumber'] || `STOCK-${index}`) as string;
      
      // Handle multiple image fields
      const additionalImages: string[] = [];
      const picture2 = row['Picture2'] || row['Pic2'] || row['picture2'];
      const picture3 = row['Picture3'] || row['Pic3'] || row['picture3'];
      const picture4 = row['Picture4'] || row['Pic4'] || row['picture4'];
      
      if (picture2) additionalImages.push(picture2 as string);
      if (picture3) additionalImages.push(picture3 as string);
      if (picture4) additionalImages.push(picture4 as string);

      const item: InventoryItem = {
        stock_number: stockNumber,
        shape: (row['Shape'] || row['shape'] || 'Round') as string,
        weight: Number(row['Weight'] || row['Carat'] || row['weight'] || row['carat'] || 1),
        color: (row['Color'] || row['color'] || 'G') as string,
        clarity: (row['Clarity'] || row['clarity'] || 'VS1') as string,
        cut: (row['Cut'] || row['cut'] || 'Excellent') as string,
        price_per_carat: Number(row['Price/Crt'] || row['PriceCrt'] || row['price_per_carat'] || row['price'] || 1000),
        lab: (row['Lab'] || row['lab'] || 'GIA') as string,
        certificate_number: row['CertNumber'] || row['CertificateNumber'] || row['certificate_number'] as string,
        polish: (row['Polish'] || row['polish'] || 'Excellent') as string,
        symmetry: (row['Symm'] || row['Symmetry'] || row['symmetry'] || 'Excellent') as string,
        fluorescence: (row['Fluo'] || row['Fluorescence'] || row['fluorescence'] || 'None') as string,
        table_percentage: Number(row['Table'] || row['table_percentage'] || row['table']),
        depth_percentage: Number(row['Depth'] || row['depth_percentage'] || row['depth']),
        measurements: (row['Measurements'] || row['measurements']) as string,
        ratio: Number(row['Ratio'] || row['ratio']),
        status: (row['Status'] || row['status'] || 'Available') as string,
        store_visible: true, // Make all imported items visible by default
        user_id: userId,
        picture: (row['Picture'] || row['Pic'] || row['picture'] || row['Image']) as string,
        additional_images: additionalImages.length > 0 ? additionalImages : undefined,
      };

      // Remove undefined values
      Object.keys(item).forEach(key => {
        if (item[key as keyof InventoryItem] === undefined || item[key as keyof InventoryItem] === '') {
          delete item[key as keyof InventoryItem];
        }
      });

      return item;
    });
  }, []);

  return {
    validateFile,
    parseCSVFile,
    mapCsvToInventory,
    isProcessing
  };
}

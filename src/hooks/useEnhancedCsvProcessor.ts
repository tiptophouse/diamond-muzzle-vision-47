import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

export interface InventoryItem {
  stock_number: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut?: string;
  price_per_carat: number;
  lab?: string;
  certificate_number?: string;
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
  table_percentage?: number;
  depth_percentage?: number;
  picture?: string;
  picture2?: string;
  picture3?: string;
  picture4?: string;
  status?: string;
  store_visible?: boolean;
}

export function useEnhancedCsvProcessor() {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const validateFile = (file: File): boolean => {
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'text/plain'];
    const validExtensions = ['.csv', '.txt'];
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a CSV or TXT file.",
      });
      return false;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
      });
      return false;
    }

    return true;
  };

  const detectDelimiter = (csvText: string): string => {
    const firstLine = csvText.split('\n')[0];
    const delimiters = [',', ';', '\t'];
    
    let maxCount = 0;
    let bestDelimiter = ',';
    
    delimiters.forEach(delimiter => {
      const count = (firstLine.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
      if (count > maxCount) {
        maxCount = count;
        bestDelimiter = delimiter;
      }
    });
    
    return bestDelimiter;
  };

  const parseCSVRow = (row: string, delimiter: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      const nextChar = row[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
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

  const normalizeHeaders = (headers: string[]): string[] => {
    const headerMap: { [key: string]: string } = {
      'stock': 'stock_number',
      'stock#': 'stock_number',
      'stock_no': 'stock_number',
      'stocknumber': 'stock_number',
      'weight': 'weight',
      'carat': 'weight',
      'carats': 'weight',
      'size': 'weight',
      'color': 'color',
      'colour': 'color',
      'clarity': 'clarity',
      'cut': 'cut',
      'shape': 'shape',
      'price': 'price_per_carat',
      'price/ct': 'price_per_carat',
      'price/crt': 'price_per_carat',
      'pricepercarat': 'price_per_carat',
      'lab': 'lab',
      'laboratory': 'lab',
      'cert': 'certificate_number',
      'certificate': 'certificate_number',
      'certnumber': 'certificate_number',
      'cert_number': 'certificate_number',
      'polish': 'polish',
      'pol': 'polish',
      'symmetry': 'symmetry',
      'symm': 'symmetry',
      'sym': 'symmetry',
      'fluorescence': 'fluorescence',
      'fluor': 'fluorescence',
      'fluo': 'fluorescence',
      'table': 'table_percentage',
      'table%': 'table_percentage',
      'depth': 'depth_percentage',
      'depth%': 'depth_percentage',
      'picture': 'picture',
      'image': 'picture',
      'photo': 'picture',
      'pic': 'picture',
      'picture2': 'picture2',
      'picture3': 'picture3',
      'picture4': 'picture4',
      'status': 'status',
      'availability': 'status'
    };

    return headers.map(header => {
      const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, '');
      return headerMap[normalized] || header;
    });
  };

  const processCSV = async (file: File): Promise<InventoryItem[]> => {
    if (!validateFile(file)) {
      throw new Error('Invalid file');
    }

    setProcessing(true);
    setProgress(0);

    try {
      const text = await file.text();
      const delimiter = detectDelimiter(text);
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }

      const rawHeaders = parseCSVRow(lines[0], delimiter);
      const headers = normalizeHeaders(rawHeaders);
      
      console.log('📊 CSV Headers detected:', headers);
      
      const items: InventoryItem[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        setProgress((i / lines.length) * 100);
        
        const values = parseCSVRow(lines[i], delimiter);
        
        if (values.length < 3) continue; // Skip incomplete rows
        
        const item: any = {};
        
        headers.forEach((header, index) => {
          const value = values[index]?.trim();
          if (value && value !== '') {
            // Handle numeric conversions safely
            if (['weight', 'price_per_carat', 'table_percentage', 'depth_percentage'].includes(header)) {
              const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
              if (!isNaN(numValue)) {
                item[header] = numValue;
              }
            } else if (header === 'certificate_number') {
              // Keep certificate number as string to handle both numeric and alphanumeric certs
              item[header] = String(value);
            } else {
              item[header] = value;
            }
          }
        });

        // Ensure required fields exist
        if (item.stock_number && item.weight && item.color && item.clarity) {
          // Set defaults
          item.shape = item.shape || 'Round';
          item.cut = item.cut || 'Excellent';
          item.status = item.status || 'Available';
          item.store_visible = item.store_visible !== undefined ? item.store_visible : true;
          
          items.push(item as InventoryItem);
        }
      }

      console.log(`✅ Processed ${items.length} valid items from CSV`);
      
      if (items.length === 0) {
        throw new Error('No valid diamond records found in the CSV file');
      }

      return items;
    } catch (error) {
      console.error('CSV processing error:', error);
      throw error;
    } finally {
      setProcessing(false);
      setProgress(100);
    }
  };

  return {
    processCSV,
    processing,
    progress,
    validateFile
  };
}


import { toast } from "@/components/ui/use-toast";

export const useCsvProcessor = () => {
  const parseCSVFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          if (!text || text.trim() === '') {
            reject(new Error('File is empty'));
            return;
          }

          const lines = text.split('\n').filter(line => line.trim() !== '');
          if (lines.length < 2) {
            reject(new Error('CSV file must contain at least a header row and one data row'));
            return;
          }

          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          console.log('CSV headers found:', headers);
          
          const data = lines.slice(1)
            .map((line, index) => {
              try {
                const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
                const item: any = {};
                headers.forEach((header, headerIndex) => {
                  item[header] = values[headerIndex] || '';
                });
                return item;
              } catch (error) {
                console.warn(`Error parsing line ${index + 2}:`, line, error);
                return null;
              }
            })
            .filter(item => item !== null && Object.keys(item).some(key => item[key] !== ''));
          
          console.log(`Parsed ${data.length} rows from CSV`);
          resolve(data);
        } catch (error) {
          console.error('CSV parsing error:', error);
          reject(new Error('Failed to parse CSV file. Please check the file format.'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  };

  const mapCsvData = (csvData: any[]) => {
    return csvData.map((row, index) => {
      try {
        return {
          shape: row.Shape || row.shape || row.SHAPE || 'Round',
          weight: parseFloat(row.Carat || row.carat || row.CARAT || row.Weight || row.weight || '0') || 1,
          color: row.Color || row.color || row.COLOR || 'G',
          clarity: row.Clarity || row.clarity || row.CLARITY || 'VS1',
          price: parseFloat(row.Price || row.price || row.PRICE || '0') || 0,
          cut: row.Cut || row.cut || row.CUT || 'Excellent',
          stock_number: row['Stock #'] || row.stock_number || row.STOCK_NUMBER || row['Stock Number'] || `AUTO${Date.now()}-${index}`,
          certificate_number: row.Certificate || row.certificate || row.CERTIFICATE || row['Cert #'] || '',
          status: 'Available',
          lab: row.Lab || row.lab || row.LAB || 'GIA'
        };
      } catch (error) {
        console.warn(`Error mapping row ${index}:`, row, error);
        return null;
      }
    }).filter(item => item !== null);
  };

  const validateFile = (file: File | null): boolean => {
    if (!file) {
      return false;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select a CSV file.",
      });
      return false;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select a CSV file smaller than 10MB.",
      });
      return false;
    }

    return true;
  };

  return {
    parseCSVFile,
    mapCsvData,
    validateFile
  };
};

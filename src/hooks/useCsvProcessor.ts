
import { toast } from "@/components/ui/use-toast";

export const useCsvProcessor = () => {
  const parseCSVFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          const data = lines.slice(1)
            .filter(line => line.trim())
            .map(line => {
              const values = line.split(',').map(v => v.trim());
              const item: any = {};
              headers.forEach((header, index) => {
                item[header] = values[index] || '';
              });
              return item;
            });
          
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const isImageUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false;
    
    // Check if it's a valid URL format
    try {
      new URL(url);
      // Check for common image extensions or image hosting domains
      const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i;
      const imageHosts = /(imgur|unsplash|cloudinary|amazonaws|googleusercontent)/i;
      
      return imageExtensions.test(url) || imageHosts.test(url);
    } catch {
      return false;
    }
  };

  const extractImageUrl = (row: any): string => {
    // Look for common image column names
    const imageFields = [
      'Image', 'ImageUrl', 'Image_Url', 'image_url', 'imageUrl',
      'Picture', 'Photo', 'Pic', 'picture', 'photo', 'pic',
      'URL', 'url', 'Link', 'link'
    ];
    
    for (const field of imageFields) {
      if (row[field] && isImageUrl(row[field])) {
        return row[field];
      }
    }
    
    // If no dedicated image field, check all fields for valid image URLs
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === 'string' && isImageUrl(value)) {
        return value;
      }
    }
    
    return '';
  };

  const mapCsvData = (csvData: any[]) => {
    return csvData.map(row => ({
      shape: row.Shape || row.shape || '',
      weight: parseFloat(row.Carat || row.carat || row.Weight || row.weight || '0'),
      color: row.Color || row.color || '',
      clarity: row.Clarity || row.clarity || '',
      price: parseFloat(row.Price || row.price || '0'),
      cut: row.Cut || row.cut || 'Excellent',
      stock_number: row['Stock #'] || row.stock_number || `D${Math.floor(Math.random() * 10000)}`,
      certificate_number: row.Certificate || row.certificate || '',
      picture: extractImageUrl(row), // Enhanced image extraction
      status: 'Available'
    }));
  };

  const validateFile = (file: File | null): boolean => {
    if (file && !file.name.toLowerCase().endsWith('.csv')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select a CSV file.",
      });
      return false;
    }
    return true;
  };

  return {
    parseCSVFile,
    mapCsvData,
    validateFile,
    isImageUrl,
    extractImageUrl
  };
};

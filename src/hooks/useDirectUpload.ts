
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { supabase } from "@/integrations/supabase/client";

interface UploadResultData {
  totalItems: number;
  successCount: number;
  errors: string[];
}

interface CsvRow {
  [key: string]: string;
}

export const useDirectUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResultData | null>(null);
  const { user, isAuthenticated } = useTelegramAuth();

  const parseCSVFile = (file: File): Promise<CsvRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          reject(new Error('CSV file must have at least a header row and one data row'));
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const rows: CsvRow[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          if (values.length === headers.length) {
            const row: CsvRow = {};
            headers.forEach((header, index) => {
              row[header] = values[index];
            });
            rows.push(row);
          }
        }

        resolve(rows);
      };
      reader.onerror = () => reject(new Error('Failed to read CSV file'));
      reader.readAsText(file);
    });
  };

  const mapCsvToInventory = (csvData: CsvRow[]) => {
    return csvData.map(row => ({
      stock_number: row.stock_number || row['Stock Number'] || `STOCK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      shape: row.shape || row.Shape || 'Round',
      weight: parseFloat(row.weight || row.Weight || row.carat || row.Carat || '1.0'),
      color: row.color || row.Color || 'G',
      clarity: row.clarity || row.Clarity || 'VS1',
      cut: row.cut || row.Cut || 'Excellent',
      price_per_carat: parseInt(row.price_per_carat || row['Price Per Carat'] || row.price || row.Price || '5000'),
      status: row.status || row.Status || 'Available',
      lab: row.lab || row.Lab || 'GIA',
      certificate_number: row.certificate_number || row['Certificate Number'] ? parseInt(row.certificate_number || row['Certificate Number']) : null,
      fluorescence: row.fluorescence || row.Fluorescence || 'None',
      polish: row.polish || row.Polish || 'Excellent',
      symmetry: row.symmetry || row.Symmetry || 'Excellent',
      depth_percentage: row.depth_percentage || row['Depth %'] ? parseFloat(row.depth_percentage || row['Depth %']) : null,
      table_percentage: row.table_percentage || row['Table %'] ? parseInt(row.table_percentage || row['Table %']) : null,
      user_id: user?.id || 0,
      store_visible: true, // Make new uploads visible in store by default
    }));
  };

  const simulateProgress = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress > 90) {
        clearInterval(interval);
        currentProgress = 90;
      }
      setProgress(Math.min(currentProgress, 90));
    }, 200);

    return () => clearInterval(interval);
  };

  const handleUpload = async (selectedFile: File) => {
    if (!selectedFile || !isAuthenticated || !user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please make sure you're logged in to upload files.",
      });
      return;
    }

    setUploading(true);
    setProgress(0);
    
    const cleanup = simulateProgress();

    try {
      console.log('Starting direct upload for user:', user.id);
      
      // Parse CSV file
      const csvData = await parseCSVFile(selectedFile);
      console.log('Parsed CSV data:', csvData.length, 'rows');
      
      // Map to inventory format
      const inventoryData = mapCsvToInventory(csvData);
      console.log('Mapped inventory data:', inventoryData.length, 'items');
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('inventory')
        .insert(inventoryData)
        .select();
      
      setProgress(100);
      
      if (error) {
        throw error;
      }
      
      const uploadResult: UploadResultData = {
        totalItems: inventoryData.length,
        successCount: data?.length || 0,
        errors: [],
      };
      
      setResult(uploadResult);
      
      toast({
        title: "Upload successful",
        description: `Successfully uploaded ${data?.length || 0} diamonds to your inventory.`,
      });
      
    } catch (error) {
      console.error('Upload failed:', error);
      
      const uploadResult: UploadResultData = {
        totalItems: 0,
        successCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
      };
      
      setResult(uploadResult);
      
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your CSV file.",
      });
    } finally {
      setUploading(false);
      cleanup();
    }
  };

  const resetState = () => {
    setResult(null);
    setProgress(0);
  };

  return {
    uploading,
    progress,
    result,
    handleUpload,
    resetState
  };
};

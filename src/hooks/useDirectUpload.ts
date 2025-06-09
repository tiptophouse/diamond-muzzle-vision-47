
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
        try {
          const text = e.target?.result as string;
          console.log('CSV file content preview:', text.substring(0, 500));
          
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            reject(new Error('CSV file must have at least a header row and one data row'));
            return;
          }

          // Handle different CSV formats (comma, semicolon, tab)
          const firstLine = lines[0];
          let delimiter = ',';
          if (firstLine.includes(';') && !firstLine.includes(',')) {
            delimiter = ';';
          } else if (firstLine.includes('\t')) {
            delimiter = '\t';
          }

          console.log('Using delimiter:', delimiter);

          const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''));
          console.log('CSV Headers:', headers);
          
          const rows: CsvRow[] = [];

          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(delimiter).map(v => v.trim().replace(/"/g, ''));
            if (values.length >= headers.length && values.some(v => v)) { // At least some non-empty values
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

  const mapCsvToInventory = (csvData: CsvRow[]) => {
    console.log('Mapping CSV data to inventory format...');
    
    return csvData.map((row, index) => {
      try {
        // Try multiple column name variations for each field
        const getColumnValue = (variations: string[]) => {
          for (const variation of variations) {
            if (row[variation] !== undefined && row[variation] !== '') {
              return row[variation];
            }
          }
          return null;
        };

        const stockNumber = getColumnValue([
          'stock_number', 'Stock Number', 'stock', 'Stock', 'ID', 'id', 'Stock #', 'Stock#'
        ]) || `STOCK-${Date.now()}-${index}`;

        const shape = getColumnValue([
          'shape', 'Shape', 'Cut Shape', 'cut_shape'
        ]) || 'Round';

        const weight = parseFloat(getColumnValue([
          'weight', 'Weight', 'carat', 'Carat', 'Ct', 'ct', 'Size'
        ]) || '1.0');

        const color = getColumnValue([
          'color', 'Color', 'Colour'
        ]) || 'G';

        const clarity = getColumnValue([
          'clarity', 'Clarity', 'Purity'
        ]) || 'VS1';

        const cut = getColumnValue([
          'cut', 'Cut', 'Cut Grade', 'cut_grade'
        ]) || 'Excellent';

        const pricePerCarat = parseInt(getColumnValue([
          'price_per_carat', 'Price Per Carat', 'price', 'Price', 'Price/Ct', 'PricePerCarat'
        ]) || '5000');

        const lab = getColumnValue([
          'lab', 'Lab', 'Certificate', 'Cert', 'Laboratory'
        ]) || 'GIA';

        const certificateNumber = getColumnValue([
          'certificate_number', 'Certificate Number', 'Cert Number', 'cert_number', 'Report Number'
        ]);

        const fluorescence = getColumnValue([
          'fluorescence', 'Fluorescence', 'Fluor', 'FL'
        ]) || 'None';

        const polish = getColumnValue([
          'polish', 'Polish', 'Pol'
        ]) || 'Excellent';

        const symmetry = getColumnValue([
          'symmetry', 'Symmetry', 'Sym'
        ]) || 'Excellent';

        const depthPercentage = getColumnValue([
          'depth_percentage', 'Depth %', 'Depth', 'depth', 'Total Depth'
        ]);

        const tablePercentage = getColumnValue([
          'table_percentage', 'Table %', 'Table', 'table'
        ]);

        const inventoryItem = {
          stock_number: stockNumber,
          shape: shape,
          weight: isNaN(weight) ? 1.0 : weight,
          color: color,
          clarity: clarity,
          cut: cut,
          price_per_carat: isNaN(pricePerCarat) ? 5000 : pricePerCarat,
          status: 'Available',
          lab: lab,
          certificate_number: certificateNumber ? parseInt(certificateNumber) : null,
          fluorescence: fluorescence,
          polish: polish,
          symmetry: symmetry,
          depth_percentage: depthPercentage ? parseFloat(depthPercentage) : null,
          table_percentage: tablePercentage ? parseInt(tablePercentage) : null,
          user_id: user?.id || 0,
          store_visible: true, // Make new uploads visible in store by default
        };

        console.log(`Mapped item ${index + 1}:`, inventoryItem);
        return inventoryItem;
      } catch (error) {
        console.error(`Error mapping row ${index + 1}:`, error, row);
        throw new Error(`Error processing row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });
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
    setResult(null);
    
    const cleanup = simulateProgress();

    try {
      console.log('Starting direct upload for user:', user.id);
      console.log('File details:', { name: selectedFile.name, size: selectedFile.size, type: selectedFile.type });
      
      // Parse CSV file
      const csvData = await parseCSVFile(selectedFile);
      console.log('Parsed CSV data:', csvData.length, 'rows');
      
      if (csvData.length === 0) {
        throw new Error('No data found in CSV file');
      }
      
      // Map to inventory format
      const inventoryData = mapCsvToInventory(csvData);
      console.log('Mapped inventory data:', inventoryData.length, 'items');
      
      // Insert into Supabase in batches to avoid timeout
      const batchSize = 100;
      let successCount = 0;
      let errors: string[] = [];
      
      for (let i = 0; i < inventoryData.length; i += batchSize) {
        const batch = inventoryData.slice(i, i + batchSize);
        console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}:`, batch.length, 'items');
        
        try {
          const { data, error } = await supabase
            .from('inventory')
            .insert(batch)
            .select();
          
          if (error) {
            console.error('Batch insert error:', error);
            errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
          } else {
            successCount += data?.length || 0;
            console.log(`Batch ${Math.floor(i / batchSize) + 1} success:`, data?.length, 'items inserted');
          }
        } catch (batchError) {
          console.error('Batch processing error:', batchError);
          errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${batchError instanceof Error ? batchError.message : 'Unknown error'}`);
        }
      }
      
      setProgress(100);
      
      const uploadResult: UploadResultData = {
        totalItems: inventoryData.length,
        successCount: successCount,
        errors: errors,
      };
      
      setResult(uploadResult);
      
      if (successCount > 0) {
        toast({
          title: "Upload successful",
          description: `Successfully uploaded ${successCount} diamonds to your inventory.`,
        });
      }
      
      if (errors.length > 0) {
        toast({
          variant: "destructive",
          title: "Partial upload failure",
          description: `${errors.length} batches failed. Check the upload results for details.`,
        });
      }
      
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

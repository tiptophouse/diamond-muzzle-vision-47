
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { api, apiEndpoints } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { FileUploadArea } from "./FileUploadArea";
import { UploadProgress } from "./UploadProgress";
import { UploadResult } from "./UploadResult";
import { UploadInstructions } from "./UploadInstructions";

interface UploadResultData {
  totalItems: number;
  matchedPairs: number;
  errors: string[];
}

interface UploadResponse {
  matched_pairs?: number;
  errors?: string[];
}

export function UploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResultData | null>(null);
  const { user, isAuthenticated } = useTelegramAuth();

  const handleFileChange = (file: File | null) => {
    if (file && !file.name.toLowerCase().endsWith('.csv')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select a CSV file.",
      });
      return;
    }
    
    setSelectedFile(file);
    setResult(null);
  };

  const simulateProgress = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 10;
      if (currentProgress > 95) {
        clearInterval(interval);
        currentProgress = 95;
      }
      setProgress(Math.min(currentProgress, 95));
    }, 300);

    return () => clearInterval(interval);
  };

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

  const handleUpload = async () => {
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
      console.log('Starting upload for user:', user.id);
      
      const csvData = await parseCSVFile(selectedFile);
      
      const mappedData = csvData.map(row => ({
        shape: row.Shape || row.shape || '',
        weight: parseFloat(row.Carat || row.carat || row.Weight || row.weight || '0'),
        color: row.Color || row.color || '',
        clarity: row.Clarity || row.clarity || '',
        price: parseFloat(row.Price || row.price || '0'),
        cut: row.Cut || row.cut || 'Excellent',
        stock_number: row['Stock #'] || row.stock_number || `D${Math.floor(Math.random() * 10000)}`,
        certificate_number: row.Certificate || row.certificate || '',
        status: 'Available'
      }));
      
      const response = await api.uploadCsv<UploadResponse>(
        apiEndpoints.uploadInventory(),
        mappedData,
        user.id
      );
      
      setProgress(100);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      const uploadResult: UploadResultData = {
        totalItems: mappedData.length,
        matchedPairs: response.data?.matched_pairs || 0,
        errors: response.data?.errors || [],
      };
      
      setResult(uploadResult);
      
      toast({
        title: "Upload successful",
        description: `Successfully uploaded ${mappedData.length} diamonds to your inventory.`,
      });
      
    } catch (error) {
      console.error('Upload failed:', error);
      
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

  const resetForm = () => {
    setSelectedFile(null);
    setResult(null);
    setProgress(0);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto">
        <Card className="diamond-card">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Please log in to upload your inventory files.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <Card className="diamond-card mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <FileUploadArea
              selectedFile={selectedFile}
              onFileChange={handleFileChange}
              onReset={resetForm}
            />
            
            <UploadProgress progress={progress} uploading={uploading} />
            
            <UploadResult result={result} />
            
            {selectedFile && (
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={uploading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button 
                  onClick={handleUpload}
                  disabled={uploading || !!result}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Processing..." : "Process CSV"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <UploadInstructions userId={user?.id} />
    </div>
  );
}

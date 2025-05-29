
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, File, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { api, apiEndpoints, getCurrentUserId } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

interface UploadResult {
  totalItems: number;
  matchedPairs: number;
  errors: string[];
}

export function UploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, isAuthenticated } = useTelegramAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select a CSV file.",
        });
        return;
      }
      
      setSelectedFile(file);
      setResult(null);
    }
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
      console.log('File details:', { name: selectedFile.name, size: selectedFile.size });
      
      // Use the actual API endpoint for uploading inventory
      const userId = getCurrentUserId() || user.id;
      const endpoint = apiEndpoints.uploadInventory(userId);
      
      console.log('Uploading to endpoint:', endpoint);
      
      const response = await api.upload<UploadResult>(endpoint, selectedFile);
      
      setProgress(100);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.data) {
        setResult(response.data);
        
        toast({
          title: "Upload successful",
          description: `Processed ${response.data.totalItems} diamonds successfully.`,
        });
        
        console.log('Upload completed successfully:', response.data);
      } else {
        // Handle case where backend doesn't return the expected format
        const mockResult: UploadResult = {
          totalItems: 1,
          matchedPairs: 0,
          errors: [],
        };
        
        setResult(mockResult);
        
        toast({
          title: "Upload successful",
          description: "File uploaded successfully to your inventory.",
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
      
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your inventory.",
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
            {!selectedFile ? (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-diamond-300 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-4 text-sm text-gray-600">
                  Drag and drop your CSV file here, or <span className="text-diamond-600 font-medium">browse</span> to select
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Supported format: CSV
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <File className="h-8 w-8 text-diamond-600 mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={resetForm}
                    className="text-gray-600"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
                
                {uploading && (
                  <div className="space-y-2">
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-gray-500 text-right">
                      {Math.round(progress)}%
                    </p>
                  </div>
                )}
                
                {result && (
                  <div className="bg-diamond-50 border border-diamond-100 rounded-lg p-4 space-y-3">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <p className="text-sm font-medium">Upload complete</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500">Total Items</p>
                        <p className="font-medium">{result.totalItems}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Matched Pairs</p>
                        <p className="font-medium">{result.matchedPairs}</p>
                      </div>
                    </div>
                    
                    {result.errors.length > 0 && (
                      <div className="text-sm">
                        <p className="text-gray-500">Errors</p>
                        <ul className="list-disc list-inside text-red-600 text-xs mt-1">
                          {result.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
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
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Instructions</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>Please ensure your CSV file follows the required format:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>One diamond per row</li>
            <li>Required columns: Stock #, Shape, Carat, Color, Clarity, Cut, Price</li>
            <li>Optional columns: Certificate, Measurements, Depth, Table</li>
            <li>First row should contain column headers</li>
          </ul>
          <p className="mt-4 text-gray-500 text-xs">
            Need a template? <a href="#" className="text-diamond-600 hover:underline">Download sample CSV</a>
          </p>
        </div>
      </div>
    </div>
  );
}

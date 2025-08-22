
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { CheckCircle, XCircle } from 'lucide-react';
import { CSVPreview } from '@/components/upload/CSVPreview';

interface CSVRow {
  [key: string]: string;
}

const StandardizeCsvPage = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [mapping, setMapping] = useState<{ [key: string]: string }>({
    stockNumber: '',
    shape: '',
    carat: '',
    color: '',
    clarity: '',
  });
  const [enhancedData, setEnhancedData] = useState<CSVRow[] | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    setCsvFile(file);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data as CSVRow[]);
      },
      error: (error) => {
        toast({
          title: "Error parsing CSV",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'] } });

  const handleMappingChange = (field: string, value: string) => {
    setMapping(prev => ({ ...prev, [field]: value }));
  };

  const enhanceData = () => {
    if (!csvData.length) {
      toast({
        title: "No data to enhance",
        description: "Please upload a CSV file first.",
        variant: "destructive",
      });
      return;
    }

    const mappedData = csvData.map(row => {
      const newRow: CSVRow = {};
      for (const key in mapping) {
        if (mapping[key]) {
          newRow[key] = row[mapping[key]] || '';
        }
      }
      return newRow;
    });

    setEnhancedData(mappedData);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Standardize CSV Data</CardTitle>
          <CardDescription>Map columns to the required fields</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div {...getRootProps()} className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer">
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>Drag 'n' drop a CSV file here, or click to select files</p>
            )}
          </div>

          {csvFile && (
            <div className="mb-4">
              <p>Uploaded file: {csvFile.name}</p>
              <p>Rows: {csvData.length}</p>
            </div>
          )}

          {csvData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Stock Number Column</Label>
                <select 
                  value={mapping.stockNumber} 
                  onChange={(e) => handleMappingChange('stockNumber', e.target.value)} 
                  className="border rounded px-2 py-1 w-full"
                >
                  <option value="">Select Column</option>
                  {Object.keys(csvData[0]).map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Shape Column</Label>
                <select 
                  value={mapping.shape} 
                  onChange={(e) => handleMappingChange('shape', e.target.value)} 
                  className="border rounded px-2 py-1 w-full"
                >
                  <option value="">Select Column</option>
                  {Object.keys(csvData[0]).map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Carat Column</Label>
                <select 
                  value={mapping.carat} 
                  onChange={(e) => handleMappingChange('carat', e.target.value)} 
                  className="border rounded px-2 py-1 w-full"
                >
                  <option value="">Select Column</option>
                  {Object.keys(csvData[0]).map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Color Column</Label>
                <select 
                  value={mapping.color} 
                  onChange={(e) => handleMappingChange('color', e.target.value)} 
                  className="border rounded px-2 py-1 w-full"
                >
                  <option value="">Select Column</option>
                  {Object.keys(csvData[0]).map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Clarity Column</Label>
                <select 
                  value={mapping.clarity} 
                  onChange={(e) => handleMappingChange('clarity', e.target.value)} 
                  className="border rounded px-2 py-1 w-full"
                >
                  <option value="">Select Column</option>
                  {Object.keys(csvData[0]).map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {csvData.length > 0 && (
            <Button onClick={enhanceData}>Enhance Data</Button>
          )}

          {enhancedData && (
            <CSVPreview
              data={enhancedData}
              fileName="enhanced-data.csv"
              onConfirm={() => console.log('Confirmed')}
              onCancel={() => setEnhancedData(null)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StandardizeCsvPage;


import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

export function useCsvProcessor() {
  const { toast } = useToast();

  const validateFile = (file: File | null): boolean => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return false;
    }

    // Check file type
    const isValidType = file.type === 'text/csv' || 
                       file.type === 'application/vnd.ms-excel' ||
                       file.name.toLowerCase().endsWith('.csv');
    
    if (!isValidType) {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file (.csv)",
        variant: "destructive",
      });
      return false;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const processCsvData = async (file: File): Promise<any[]> => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }

      // Parse headers - handle different formats
      const headerLine = lines[0];
      const headers = headerLine.split(',').map(h => h.trim().replace(/['"]/g, ''));
      
      console.log('CSV Headers detected:', headers);
      
      const data = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Parse CSV line handling quoted values
        const values = parseCsvLine(line);
        
        if (values.length >= headers.length) {
          const row: any = {};
          headers.forEach((header, index) => {
            const value = values[index] || '';
            row[header] = value.replace(/['"]/g, '').trim();
          });
          
          // Only add rows that have essential diamond data
          if (row[headers[0]] && row[headers[0]] !== '') {
            data.push(row);
          }
        }
      }
      
      console.log('Processed CSV data:', data.slice(0, 3)); // Log first 3 rows
      return data;
      
    } catch (error) {
      console.error('CSV processing error:', error);
      throw new Error(`Failed to process CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Helper function to parse CSV line with proper quote handling
  const parseCsvLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  };

  return {
    validateFile,
    processCsvData,
  };
}

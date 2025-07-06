import { useState } from 'react';

interface OpenAIEnhancedMapping {
  originalValue: string;
  enhancedValue: string;
  field: string;
  confidence: number;
}

export function useOpenAICsvEnhancer() {
  const [isEnhancing, setIsEnhancing] = useState(false);

  const enhanceDataWithOpenAI = async (csvData: any[]): Promise<any[]> => {
    if (!csvData.length) return csvData;

    setIsEnhancing(true);
    
    try {
      // Create a sample of problematic data to send to OpenAI
      const sampleData = csvData.slice(0, 5).map(row => ({
        stock: row.stock,
        shape: row.shape,
        color: row.color,
        clarity: row.clarity,
        cut: row.cut,
        weight: row.weight
      }));

      console.log('🤖 Enhancing CSV data with OpenAI...');
      
      const response = await fetch('https://bc6a5b8a-3262-41f9-a127-aae26f8063fe.supabase.co/functions/v1/enhance-csv-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaGxqcWd4aGRoYmJocG9oeGxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODY1NTMsImV4cCI6MjA2MzA2MjU1M30._CGnKnTyltp1lIUmmOVI1nC4jRew2WkAU-bSf22HCDE`,
        },
        body: JSON.stringify({
          sampleData: sampleData,
          validShapes: ['round brilliant', 'princess', 'cushion', 'oval', 'emerald', 'pear', 'marquise', 'asscher', 'radiant', 'heart'],
          validColors: ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'],
          validClarities: ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'SI3', 'I1', 'I2', 'I3'],
          validCuts: ['EXCELLENT', 'VERY GOOD', 'GOOD', 'FAIR', 'POOR']
        }),
      });

      if (response.ok) {
        const enhancedMappings = await response.json();
        
        // Apply the enhanced mappings to all data
        const enhancedData = csvData.map(row => {
          const enhanced = { ...row };
          
          // Apply OpenAI enhancements if available
          enhancedMappings.forEach((mapping: OpenAIEnhancedMapping) => {
            if (enhanced[mapping.field] === mapping.originalValue) {
              enhanced[mapping.field] = mapping.enhancedValue;
            }
          });
          
          return enhanced;
        });

        console.log('✅ OpenAI enhancement complete');
        return enhancedData;
      }
    } catch (error) {
      console.warn('⚠️ OpenAI enhancement failed, using fallback logic:', error);
    } finally {
      setIsEnhancing(false);
    }

    // Fallback: return original data
    return csvData;
  };

  return {
    enhanceDataWithOpenAI,
    isEnhancing
  };
}
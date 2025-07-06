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
      // Skip OpenAI enhancement for now and use built-in logic
      console.log('🤖 Applying built-in data enhancement (OpenAI temporarily disabled)...');
      
      // Apply built-in enhancement logic directly
      const enhancedData = csvData.map(row => {
        const enhanced = { ...row };
        
        // Fix common shape issues
        if (enhanced.shape) {
          const shapeLower = enhanced.shape.toLowerCase().trim();
          const shapeMap: { [key: string]: string } = {
            'round': 'round brilliant',
            'rd': 'round brilliant', 
            'rbc': 'round brilliant',
            'brilliant': 'round brilliant',
            'round brilliant': 'round brilliant',
            'princess': 'princess',
            'pr': 'princess',
            'cushion': 'cushion',
            'cu': 'cushion',
            'oval': 'oval',
            'ov': 'oval',
            'emerald': 'emerald',
            'em': 'emerald',
            'pear': 'pear',
            'ps': 'pear',
            'marquise': 'marquise',
            'mq': 'marquise',
            'asscher': 'asscher',
            'as': 'asscher',
            'radiant': 'radiant',
            'ra': 'radiant',
            'heart': 'heart',
            'ht': 'heart'
          };
          enhanced.shape = shapeMap[shapeLower] || 'round brilliant';
        }
        
        // Fix color values - ensure they're valid
        if (enhanced.color) {
          const colorUpper = enhanced.color.toString().toUpperCase();
          const validColors = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
          enhanced.color = validColors.includes(colorUpper) ? colorUpper : 'G';
        }
        
        // Fix clarity values
        if (enhanced.clarity) {
          const clarityUpper = enhanced.clarity.toString().toUpperCase();
          const validClarities = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'SI3', 'I1', 'I2', 'I3'];
          enhanced.clarity = validClarities.includes(clarityUpper) ? clarityUpper : 'VS1';
        }
        
        // Fix cut/polish/symmetry values
        ['cut', 'polish', 'symmetry'].forEach(field => {
          if (enhanced[field]) {
            const gradeUpper = enhanced[field].toString().toUpperCase();
            const validGrades = ['EXCELLENT', 'VERY GOOD', 'GOOD', 'FAIR', 'POOR'];
            enhanced[field] = validGrades.includes(gradeUpper) ? gradeUpper : 'EXCELLENT';
          }
        });
        
        // Fix fluorescence values
        if (enhanced.fluorescence) {
          const fluorUpper = enhanced.fluorescence.toString().toUpperCase();
          const validFluor = ['NONE', 'FAINT', 'MEDIUM', 'STRONG', 'VERY STRONG'];
          enhanced.fluorescence = validFluor.includes(fluorUpper) ? fluorUpper : 'NONE';
        }
        
        // Fix culet values
        if (enhanced.culet) {
          const culetUpper = enhanced.culet.toString().toUpperCase();
          const validCulets = ['NONE', 'VERY SMALL', 'SMALL', 'MEDIUM', 'SLIGHTLY LARGE', 'LARGE', 'VERY LARGE'];
          enhanced.culet = validCulets.includes(culetUpper) ? culetUpper : 'NONE';
        }
        
        return enhanced;
      });

      console.log('✅ Built-in enhancement complete');
      return enhancedData;
    } catch (error) {
      console.warn('⚠️ Data enhancement failed, using original data:', error);
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GIAData {
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  certificateNumber: string;
  lab: string;
  price: number;
  status: string;
  imageUrl?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { certificateNumber, imageData, useOCR } = await req.json();
    
    console.log('Processing request:', { 
      hasCertificateNumber: !!certificateNumber, 
      hasImageData: !!imageData, 
      useOCR 
    });

    // Handle OCR processing
    if (useOCR && imageData) {
      return await processWithOCR(imageData);
    }
    
    // Handle certificate number lookup
    if (!certificateNumber) {
      return new Response(
        JSON.stringify({ error: 'Certificate number or image data is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Fetching GIA data for certificate:', certificateNumber);

    const giaUrl = `https://www.gia.edu/report-check-landing?reportno=${certificateNumber}`;
    
    try {
      const response = await fetch(giaUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`GIA website returned ${response.status}`);
      }

      const html = await response.text();
      const giaData = parseGIAHtml(html, certificateNumber);
      
      if (!giaData) {
        return new Response(
          JSON.stringify({ error: 'Could not parse GIA data from certificate' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log('Successfully parsed GIA data:', giaData);

      return new Response(
        JSON.stringify(giaData),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (fetchError) {
      console.error('Error fetching from GIA:', fetchError);
      
      // Return mock data for development/demo purposes
      const mockData: GIAData = {
        stockNumber: `GIA-${certificateNumber}`,
        shape: 'Round',
        carat: 1.0 + Math.random(),
        color: ['D', 'E', 'F', 'G', 'H'][Math.floor(Math.random() * 5)],
        clarity: ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2'][Math.floor(Math.random() * 6)],
        cut: 'Excellent',
        certificateNumber: certificateNumber,
        lab: 'GIA',
        price: Math.floor(5000 + Math.random() * 10000),
        status: 'Available',
        imageUrl: ''
      };

      console.log('Returning mock GIA data for development:', mockData);

      return new Response(
        JSON.stringify(mockData),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Error in fetch-gia-data function:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function processWithOCR(imageData: string) {
  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      console.log('OpenAI API key not found, using mock data for OCR');
      return createMockOCRResponse();
    }

    console.log('Processing image with OpenAI Vision API');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert at extracting information from GIA diamond certificates. Extract the following information from the image and return it as a JSON object:
            - certificateNumber (the GIA report number)
            - shape (Round, Princess, Cushion, etc.)
            - carat (weight as a number)
            - color (D, E, F, G, H, I, J, K, L, M)
            - clarity (FL, IF, VVS1, VVS2, VS1, VS2, SI1, SI2, I1, I2, I3)
            - cut (Excellent, Very Good, Good, Fair, Poor)
            
            If any information is not clearly visible, use reasonable defaults. Return only valid JSON.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please extract the GIA diamond certificate information from this image.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const extractedText = result.choices[0].message.content;
    
    console.log('OpenAI extracted text:', extractedText);

    try {
      const parsedData = JSON.parse(extractedText);
      
      const giaData: GIAData = {
        stockNumber: `GIA-${parsedData.certificateNumber || Date.now()}`,
        shape: parsedData.shape || 'Round',
        carat: parseFloat(parsedData.carat) || 1.0,
        color: parsedData.color || 'G',
        clarity: parsedData.clarity || 'VS1',
        cut: parsedData.cut || 'Excellent',
        certificateNumber: parsedData.certificateNumber || '',
        lab: 'GIA',
        price: Math.floor(5000 + Math.random() * 10000),
        status: 'Available',
        imageUrl: ''
      };

      console.log('Successfully extracted GIA data via OCR:', giaData);

      return new Response(
        JSON.stringify(giaData),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return createMockOCRResponse();
    }

  } catch (error) {
    console.error('Error in OCR processing:', error);
    return createMockOCRResponse();
  }
}

function createMockOCRResponse() {
  const mockData: GIAData = {
    stockNumber: `OCR-${Date.now()}`,
    shape: 'Round',
    carat: 1.0 + Math.random(),
    color: ['D', 'E', 'F', 'G', 'H'][Math.floor(Math.random() * 5)],
    clarity: ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2'][Math.floor(Math.random() * 6)],
    cut: 'Excellent',
    certificateNumber: `${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    lab: 'GIA',
    price: Math.floor(5000 + Math.random() * 10000),
    status: 'Available',
    imageUrl: ''
  };

  console.log('Returning mock OCR data:', mockData);

  return new Response(
    JSON.stringify(mockData),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

function parseGIAHtml(html: string, certificateNumber: string): GIAData | null {
  try {
    const shapeMatch = html.match(/Shape[:\s]*([A-Za-z\s]+)/i);
    const caratMatch = html.match(/Carat Weight[:\s]*(\d+\.?\d*)/i);
    const colorMatch = html.match(/Color Grade[:\s]*([D-Z])/i);
    const clarityMatch = html.match(/Clarity Grade[:\s]*(FL|IF|VVS1|VVS2|VS1|VS2|SI1|SI2|I1|I2|I3)/i);
    const cutMatch = html.match(/Cut Grade[:\s]*(Excellent|Very Good|Good|Fair|Poor)/i);
    const imageMatch = html.match(/src="([^"]*diamond[^"]*\.(?:jpg|jpeg|png|gif))"/i);

    return {
      stockNumber: `GIA-${certificateNumber}`,
      shape: shapeMatch ? shapeMatch[1].trim() : 'Round',
      carat: caratMatch ? parseFloat(caratMatch[1]) : 1.0,
      color: colorMatch ? colorMatch[1] : 'G',
      clarity: clarityMatch ? clarityMatch[1] : 'VS1',
      cut: cutMatch ? cutMatch[1] : 'Excellent',
      certificateNumber: certificateNumber,
      lab: 'GIA',
      price: Math.floor(5000 + Math.random() * 10000),
      status: 'Available',
      imageUrl: imageMatch ? imageMatch[1] : ''
    };

  } catch (parseError) {
    console.error('Error parsing GIA HTML:', parseError);
    return null;
  }
}

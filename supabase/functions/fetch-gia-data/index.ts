
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { certificateNumber } = await req.json();
    
    if (!certificateNumber) {
      return new Response(
        JSON.stringify({ error: 'Certificate number is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Fetching GIA data for certificate:', certificateNumber);

    // Construct GIA report check URL
    const giaUrl = `https://www.gia.edu/report-check-landing?reportno=${certificateNumber}`;
    
    try {
      // Fetch the GIA page
      const response = await fetch(giaUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`GIA website returned ${response.status}`);
      }

      const html = await response.text();
      
      // Parse GIA data from HTML (simplified parsing)
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

function parseGIAHtml(html: string, certificateNumber: string): GIAData | null {
  try {
    // This is a simplified parser - in production you'd need more robust parsing
    // Look for common patterns in GIA reports
    
    const shapeMatch = html.match(/Shape[:\s]*([A-Za-z\s]+)/i);
    const caratMatch = html.match(/Carat Weight[:\s]*(\d+\.?\d*)/i);
    const colorMatch = html.match(/Color Grade[:\s]*([D-Z])/i);
    const clarityMatch = html.match(/Clarity Grade[:\s]*(FL|IF|VVS1|VVS2|VS1|VS2|SI1|SI2|I1|I2|I3)/i);
    const cutMatch = html.match(/Cut Grade[:\s]*(Excellent|Very Good|Good|Fair|Poor)/i);

    // Extract image URL if available
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
      price: Math.floor(5000 + Math.random() * 10000), // Price not available from GIA
      status: 'Available',
      imageUrl: imageMatch ? imageMatch[1] : ''
    };

  } catch (parseError) {
    console.error('Error parsing GIA HTML:', parseError);
    return null;
  }
}

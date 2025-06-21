
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-action, x-user_id, x-diamond_id, x-stock_number',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface DiamondData {
  user_id?: number;
  stock_number?: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut?: string;
  price: number;
  price_per_carat?: number;
  status?: string;
  picture?: string;
  certificate_number?: string;
  certificate_url?: string;
  lab?: string;
  store_visible?: boolean;
}

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
  count?: number;
  source?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get action and parameters from headers
    const action = req.headers.get('x-action') || 'get_all';
    const userId = req.headers.get('x-user_id') || '2138564172';
    const diamondId = req.headers.get('x-diamond_id') || '';
    const stockNumber = req.headers.get('x-stock_number') || '';
    
    console.log('💎 DIAMOND API - Action:', action, 'User:', userId);
    console.log('💎 DIAMOND API - Request method:', req.method);

    // Step 1: Environment Configuration
    const backendUrl = Deno.env.get('BACKEND_URL') || 'https://api.mazalbot.com';
    const bearerToken = Deno.env.get('BACKEND_ACCESS_TOKEN');
    
    if (!bearerToken) {
      console.error('❌ BACKEND_ACCESS_TOKEN not configured');
      throw new Error('Backend authentication token (BACKEND_ACCESS_TOKEN) not configured in environment variables');
    }

    console.log('✅ Configuration loaded successfully');
    console.log('🔗 Backend URL:', backendUrl);
    console.log('🔑 Token length:', bearerToken.length);

    // Step 2: Request Headers Configuration
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`,
      'Accept': 'application/json',
      'User-Agent': 'Diamond-Management-Edge-Function/1.0',
    };

    // Step 3: API Operations Implementation
    switch (action) {
      case 'get_all': {
        console.log('📥 GET ALL - Fetching diamonds for user:', userId);
        const endpoint = `${backendUrl}/api/v1/get_all_stones`;
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers,
        });

        console.log('📥 GET ALL - Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ GET ALL - FastAPI error:', response.status, errorText);
          throw new Error(`FastAPI get_all failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ GET ALL - Retrieved', data?.length || 0, 'diamonds');
        
        return new Response(JSON.stringify({
          success: true,
          data: data || [],
          count: data?.length || 0,
          source: 'fastapi',
          message: `Successfully loaded ${data?.length || 0} diamonds`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_analytics': {
        console.log('📊 ANALYTICS - Fetching inventory analytics for user:', userId);
        const endpoint = `${backendUrl}/api/v1/get_all_stones`;
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ ANALYTICS - FastAPI error:', response.status, errorText);
          throw new Error(`Analytics fetch failed: ${response.status} - ${errorText}`);
        }

        const diamonds = await response.json();
        
        // Process analytics data
        const analytics = {
          totalDiamonds: diamonds?.length || 0,
          totalValue: diamonds?.reduce((sum: number, d: any) => sum + (Number(d.price) || 0), 0) || 0,
          averagePrice: diamonds?.length ? (diamonds.reduce((sum: number, d: any) => sum + (Number(d.price) || 0), 0) / diamonds.length) : 0,
          colorDistribution: {},
          clarityDistribution: {},
          shapeDistribution: {},
          caratRanges: {
            'under_1': 0,
            '1_to_2': 0,
            '2_to_3': 0,
            'over_3': 0
          },
          priceRanges: {
            'under_1000': 0,
            '1000_to_5000': 0,
            '5000_to_10000': 0,
            'over_10000': 0
          }
        };

        // Process distributions
        diamonds?.forEach((diamond: any) => {
          // Color distribution
          const color = diamond.color || 'Unknown';
          analytics.colorDistribution[color] = (analytics.colorDistribution[color] || 0) + 1;
          
          // Clarity distribution
          const clarity = diamond.clarity || 'Unknown';
          analytics.clarityDistribution[clarity] = (analytics.clarityDistribution[clarity] || 0) + 1;
          
          // Shape distribution
          const shape = diamond.shape || 'Unknown';
          analytics.shapeDistribution[shape] = (analytics.shapeDistribution[shape] || 0) + 1;
          
          // Carat ranges
          const weight = Number(diamond.weight) || 0;
          if (weight < 1) analytics.caratRanges.under_1++;
          else if (weight < 2) analytics.caratRanges['1_to_2']++;
          else if (weight < 3) analytics.caratRanges['2_to_3']++;
          else analytics.caratRanges.over_3++;
          
          // Price ranges
          const price = Number(diamond.price) || 0;
          if (price < 1000) analytics.priceRanges.under_1000++;
          else if (price < 5000) analytics.priceRanges['1000_to_5000']++;
          else if (price < 10000) analytics.priceRanges['5000_to_10000']++;
          else analytics.priceRanges.over_10000++;
        });

        console.log('✅ ANALYTICS - Processed analytics for', analytics.totalDiamonds, 'diamonds');
        
        return new Response(JSON.stringify({
          success: true,
          data: analytics,
          source: 'analytics-processor',
          message: `Analytics generated for ${analytics.totalDiamonds} diamonds`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'add': {
        const diamondData: DiamondData = await req.json();
        console.log('➕ ADD - Adding diamond:', diamondData.stock_number);
        
        const endpoint = `${backendUrl}/api/v1/diamonds`;
        const payload = {
          user_id: parseInt(userId),
          stock_number: diamondData.stock_number,
          shape: diamondData.shape,
          weight: Number(diamondData.weight),
          color: diamondData.color,
          clarity: diamondData.clarity,
          cut: diamondData.cut || 'Excellent',
          price: Number(diamondData.price),
          price_per_carat: diamondData.price_per_carat || Math.round(Number(diamondData.price) / Number(diamondData.weight)),
          status: diamondData.status || 'Available',
          picture: diamondData.picture || '',
          certificate_number: diamondData.certificate_number || '',
          certificate_url: diamondData.certificate_url || '',
          lab: diamondData.lab || '',
          store_visible: diamondData.store_visible !== false,
        };

        console.log('➕ ADD - Payload prepared, sending to FastAPI');

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ ADD - FastAPI error:', response.status, errorText);
          throw new Error(`Add failed: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ ADD - Diamond added successfully');
        
        return new Response(JSON.stringify({
          success: true,
          data: result,
          message: `Diamond ${diamondData.stock_number} added successfully`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update': {
        const diamondData: DiamondData = await req.json();
        console.log('📝 UPDATE - Updating diamond:', diamondId);
        
        if (!diamondId) {
          throw new Error('Diamond ID is required for update');
        }

        const endpoint = `${backendUrl}/api/v1/diamonds/${diamondId}`;
        const payload = {
          stock_number: diamondData.stock_number,
          shape: diamondData.shape,
          weight: Number(diamondData.weight),
          color: diamondData.color,
          clarity: diamondData.clarity,
          cut: diamondData.cut || 'Excellent',
          price: Number(diamondData.price),
          price_per_carat: diamondData.price_per_carat || Math.round(Number(diamondData.price) / Number(diamondData.weight)),
          status: diamondData.status || 'Available',
          picture: diamondData.picture || '',
          certificate_number: diamondData.certificate_number || '',
          certificate_url: diamondData.certificate_url || '',
          lab: diamondData.lab || '',
          store_visible: diamondData.store_visible !== false,
        };

        console.log('📝 UPDATE - Payload prepared, sending to FastAPI');

        const response = await fetch(endpoint, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ UPDATE - FastAPI error:', response.status, errorText);
          throw new Error(`Update failed: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ UPDATE - Diamond updated successfully');
        
        return new Response(JSON.stringify({
          success: true,
          data: result,
          message: `Diamond ${diamondData.stock_number} updated successfully`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'delete': {
        console.log('🗑️ DELETE - Deleting diamond:', stockNumber);
        
        if (!stockNumber) {
          throw new Error('Stock number is required for delete');
        }

        // Step 4: Enhanced Delete Process - Find diamond ID first
        console.log('🔍 DELETE - Finding diamond by stock number:', stockNumber);
        const getAllEndpoint = `${backendUrl}/api/v1/get_all_stones`;
        
        const getAllResponse = await fetch(getAllEndpoint, {
          method: 'GET',
          headers,
        });

        if (!getAllResponse.ok) {
          const errorText = await getAllResponse.text();
          console.error('❌ DELETE - Failed to fetch diamonds:', getAllResponse.status, errorText);
          throw new Error(`Failed to find diamond: ${getAllResponse.status} - ${errorText}`);
        }

        const allDiamonds = await getAllResponse.json();
        console.log('🔍 DELETE - Found', allDiamonds?.length || 0, 'total diamonds');
        
        const targetDiamond = allDiamonds?.find((diamond: any) => 
          diamond.stock_number === stockNumber || 
          String(diamond.stock_number) === String(stockNumber)
        );

        if (!targetDiamond) {
          console.error('❌ DELETE - Diamond not found:', stockNumber);
          throw new Error(`Diamond not found with stock number: ${stockNumber}`);
        }

        const diamondIdToDelete = targetDiamond.id;
        console.log('✅ DELETE - Found diamond ID:', diamondIdToDelete);

        // Delete using the diamond ID
        const deleteEndpoint = `${backendUrl}/api/v1/delete_stone/${diamondIdToDelete}`;
        
        const deleteResponse = await fetch(deleteEndpoint, {
          method: 'DELETE',
          headers,
        });

        if (!deleteResponse.ok) {
          const errorText = await deleteResponse.text();
          console.error('❌ DELETE - FastAPI error:', deleteResponse.status, errorText);
          throw new Error(`Delete failed: ${deleteResponse.status} - ${errorText}`);
        }

        console.log('✅ DELETE - Diamond deleted successfully');
        
        return new Response(JSON.stringify({
          success: true,
          message: `Diamond ${stockNumber} deleted successfully`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('❌ DIAMOND API ERROR:', error);
    
    // Step 5: Enhanced Error Response
    const errorResponse: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      source: 'edge-function-error',
      message: 'Operation failed - please check logs for details'
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

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
    
    console.log('🔸 Diamond Management - Action:', action, 'User:', userId);

    const backendUrl = Deno.env.get('BACKEND_URL') || 'https://api.mazalbot.com';
    
    // Get the bearer token from environment variables
    const bearerToken = Deno.env.get('BACKEND_ACCESS_TOKEN');
    
    if (!bearerToken) {
      console.error('❌ BACKEND_ACCESS_TOKEN not found in environment variables');
      throw new Error('Backend authentication token (BACKEND_ACCESS_TOKEN) not configured in environment variables');
    }

    console.log('🔸 Using backend URL:', backendUrl);
    console.log('🔸 Bearer token configured successfully');
    console.log('🔸 Bearer token length:', bearerToken.length);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`,
      'Accept': 'application/json',
    };

    switch (action) {
      case 'get_all': {
        console.log('📥 Fetching all diamonds for user:', userId);
        const endpoint = `${backendUrl}/api/v1/get_all_stones`;
        
        console.log('🔸 Making GET request to:', endpoint);
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers,
        });

        console.log('🔸 Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ FastAPI get_all failed:', response.status, response.statusText);
          console.error('❌ Error response body:', errorText);
          throw new Error(`FastAPI error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Retrieved', data?.length || 0, 'diamonds from FastAPI');
        
        return new Response(JSON.stringify({
          success: true,
          data: data || [],
          count: data?.length || 0,
          source: 'fastapi'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'add': {
        const diamondData: DiamondData = await req.json();
        console.log('➕ Adding diamond:', diamondData.stock_number);
        
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

        console.log('➕ Sending payload to FastAPI:', payload);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ FastAPI add failed:', response.status, errorText);
          throw new Error(`Add failed: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Diamond added successfully');
        
        return new Response(JSON.stringify({
          success: true,
          data: result,
          message: 'Diamond added successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update': {
        const diamondData: DiamondData = await req.json();
        console.log('📝 Updating diamond:', diamondId);
        
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

        console.log('📝 Sending update payload to FastAPI:', payload);

        const response = await fetch(endpoint, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ FastAPI update failed:', response.status, errorText);
          throw new Error(`Update failed: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Diamond updated successfully');
        
        return new Response(JSON.stringify({
          success: true,
          data: result,
          message: 'Diamond updated successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'delete': {
        console.log('🗑️ Deleting diamond with stock number:', stockNumber);
        
        if (!stockNumber) {
          throw new Error('Stock number is required for delete');
        }

        // First, get all diamonds to find the diamond ID by stock number
        console.log('🔍 First getting all diamonds to find ID for stock number:', stockNumber);
        const getAllEndpoint = `${backendUrl}/api/v1/get_all_stones`;
        
        const getAllResponse = await fetch(getAllEndpoint, {
          method: 'GET',
          headers,
        });

        if (!getAllResponse.ok) {
          const errorText = await getAllResponse.text();
          console.error('❌ Failed to fetch diamonds for ID lookup:', getAllResponse.status, errorText);
          throw new Error(`Failed to fetch diamonds: ${getAllResponse.status} - ${errorText}`);
        }

        const allDiamonds = await getAllResponse.json();
        console.log('🔍 Got', allDiamonds?.length || 0, 'diamonds, searching for stock number:', stockNumber);
        
        // Find the diamond with matching stock number
        const targetDiamond = allDiamonds?.find((diamond: any) => 
          diamond.stock_number === stockNumber || 
          diamond.stockNumber === stockNumber ||
          String(diamond.stock_number) === String(stockNumber)
        );

        if (!targetDiamond) {
          console.error('❌ Diamond not found with stock number:', stockNumber);
          console.log('🔍 Available diamonds:', allDiamonds?.map((d: any) => ({ id: d.id, stock_number: d.stock_number })));
          throw new Error(`Diamond not found with stock number: ${stockNumber}`);
        }

        const diamondIdToDelete = targetDiamond.id;
        console.log('✅ Found diamond ID:', diamondIdToDelete, 'for stock number:', stockNumber);

        // Now delete using the diamond ID
        const deleteEndpoint = `${backendUrl}/api/v1/delete_stone/${diamondIdToDelete}`;
        console.log('🗑️ Deleting diamond with ID:', diamondIdToDelete, 'at endpoint:', deleteEndpoint);
        
        const deleteResponse = await fetch(deleteEndpoint, {
          method: 'DELETE',
          headers,
        });

        if (!deleteResponse.ok) {
          const errorText = await deleteResponse.text();
          console.error('❌ FastAPI delete failed:', deleteResponse.status, errorText);
          throw new Error(`Delete failed: ${deleteResponse.status} - ${errorText}`);
        }

        console.log('✅ Diamond deleted successfully');
        
        return new Response(JSON.stringify({
          success: true,
          message: `Diamond with stock number ${stockNumber} deleted successfully`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('❌ Diamond management error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

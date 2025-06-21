
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const userId = url.searchParams.get('user_id') || '2138564172';
    
    console.log('🔸 Diamond Management - Action:', action, 'User:', userId);

    const backendUrl = Deno.env.get('BACKEND_URL') || 'https://api.mazalbot.com';
    const bearerToken = Deno.env.get('FASTAPI_BEARER_TOKEN') || Deno.env.get('BACKEND_ACCESS_TOKEN');
    
    if (!bearerToken) {
      console.error('❌ No bearer token available');
      throw new Error('Backend authentication token not configured');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${bearerToken}`,
      'Accept': 'application/json',
    };

    console.log('🔸 Using backend URL:', backendUrl);
    console.log('🔸 Has bearer token:', !!bearerToken);

    switch (action) {
      case 'get_all': {
        console.log('📥 Fetching all diamonds for user:', userId);
        const endpoint = `${backendUrl}/api/v1/get_all_stones?user_id=${userId}`;
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          console.error('❌ FastAPI get_all failed:', response.status, response.statusText);
          throw new Error(`FastAPI error: ${response.status} ${response.statusText}`);
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
        const diamondId = url.searchParams.get('diamond_id');
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
        const stockNumber = url.searchParams.get('stock_number');
        console.log('🗑️ Deleting diamond:', stockNumber);
        
        if (!stockNumber) {
          throw new Error('Stock number is required for delete');
        }

        const endpoint = `${backendUrl}/api/v1/delete_stone/${encodeURIComponent(stockNumber)}`;
        
        const response = await fetch(endpoint, {
          method: 'DELETE',
          headers,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ FastAPI delete failed:', response.status, errorText);
          throw new Error(`Delete failed: ${response.status} - ${errorText}`);
        }

        console.log('✅ Diamond deleted successfully');
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Diamond deleted successfully'
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

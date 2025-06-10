
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface DiamondData {
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  status: string;
  imageUrl?: string;
  store_visible: boolean;
  fluorescence?: string;
  lab?: string;
  certificate_number?: string;
  polish?: string;
  symmetry?: string;
  table_percentage?: number;
  depth_percentage?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, diamondData, diamondId, userId } = await req.json();
    
    console.log(`Diamond CRUD operation: ${action} for user: ${userId}`);

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    switch (action) {
      case 'create':
        return await createDiamond(diamondData, userId);
      case 'update':
        return await updateDiamond(diamondId, diamondData, userId);
      case 'delete':
        return await deleteDiamond(diamondId, userId);
      case 'get':
        return await getDiamonds(userId);
      case 'get-one':
        return await getDiamond(diamondId, userId);
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }
  } catch (error) {
    console.error('Diamond CRUD error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function createDiamond(diamondData: DiamondData, userId: string) {
  console.log('Creating diamond:', diamondData);
  
  // Validate required fields
  if (!diamondData.stockNumber || !diamondData.shape || !diamondData.carat) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: stockNumber, shape, carat' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  // Check if stock number already exists for this user
  const { data: existing } = await supabase
    .from('inventory')
    .select('id')
    .eq('stock_number', diamondData.stockNumber)
    .eq('user_id', userId)
    .single();

  if (existing) {
    return new Response(
      JSON.stringify({ error: 'Stock number already exists' }),
      { 
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  const { data, error } = await supabase
    .from('inventory')
    .insert({
      user_id: parseInt(userId),
      stock_number: diamondData.stockNumber,
      shape: diamondData.shape,
      weight: diamondData.carat,
      color: diamondData.color,
      clarity: diamondData.clarity,
      cut: diamondData.cut,
      price_per_carat: diamondData.carat > 0 ? Math.round(diamondData.price / diamondData.carat) : Math.round(diamondData.price),
      status: diamondData.status || 'Available',
      picture: diamondData.imageUrl,
      store_visible: diamondData.store_visible ?? true,
      fluorescence: diamondData.fluorescence,
      lab: diamondData.lab,
      certificate_number: diamondData.certificate_number ? parseInt(diamondData.certificate_number) : null,
      polish: diamondData.polish,
      symmetry: diamondData.symmetry,
      table_percentage: diamondData.table_percentage,
      depth_percentage: diamondData.depth_percentage,
    })
    .select()
    .single();

  if (error) {
    console.error('Create diamond error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create diamond', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  console.log('Diamond created successfully:', data);
  return new Response(
    JSON.stringify({ success: true, data }),
    { 
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function updateDiamond(diamondId: string, diamondData: DiamondData, userId: string) {
  console.log('Updating diamond:', diamondId, diamondData);

  if (!diamondId) {
    return new Response(
      JSON.stringify({ error: 'Diamond ID is required' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (diamondData.stockNumber) updateData.stock_number = diamondData.stockNumber;
  if (diamondData.shape) updateData.shape = diamondData.shape;
  if (diamondData.carat) updateData.weight = diamondData.carat;
  if (diamondData.color) updateData.color = diamondData.color;
  if (diamondData.clarity) updateData.clarity = diamondData.clarity;
  if (diamondData.cut) updateData.cut = diamondData.cut;
  if (diamondData.price && diamondData.carat) {
    updateData.price_per_carat = Math.round(diamondData.price / diamondData.carat);
  }
  if (diamondData.status) updateData.status = diamondData.status;
  if (diamondData.imageUrl !== undefined) updateData.picture = diamondData.imageUrl;
  if (diamondData.store_visible !== undefined) updateData.store_visible = diamondData.store_visible;
  if (diamondData.fluorescence !== undefined) updateData.fluorescence = diamondData.fluorescence;
  if (diamondData.lab !== undefined) updateData.lab = diamondData.lab;
  if (diamondData.certificate_number !== undefined) {
    updateData.certificate_number = diamondData.certificate_number ? parseInt(diamondData.certificate_number) : null;
  }
  if (diamondData.polish !== undefined) updateData.polish = diamondData.polish;
  if (diamondData.symmetry !== undefined) updateData.symmetry = diamondData.symmetry;
  if (diamondData.table_percentage !== undefined) updateData.table_percentage = diamondData.table_percentage;
  if (diamondData.depth_percentage !== undefined) updateData.depth_percentage = diamondData.depth_percentage;

  const { data, error } = await supabase
    .from('inventory')
    .update(updateData)
    .eq('id', diamondId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Update diamond error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update diamond', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  if (!data) {
    return new Response(
      JSON.stringify({ error: 'Diamond not found or access denied' }),
      { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  console.log('Diamond updated successfully:', data);
  return new Response(
    JSON.stringify({ success: true, data }),
    { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function deleteDiamond(diamondId: string, userId: string) {
  console.log('Deleting diamond:', diamondId, 'for user:', userId);

  if (!diamondId) {
    return new Response(
      JSON.stringify({ error: 'Diamond ID is required' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  const { data, error } = await supabase
    .from('inventory')
    .delete()
    .eq('id', diamondId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Delete diamond error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to delete diamond', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  if (!data) {
    return new Response(
      JSON.stringify({ error: 'Diamond not found or access denied' }),
      { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  console.log('Diamond deleted successfully:', data);
  return new Response(
    JSON.stringify({ success: true, data }),
    { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function getDiamonds(userId: string) {
  console.log('Getting diamonds for user:', userId);

  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get diamonds error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get diamonds', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  console.log(`Retrieved ${data?.length || 0} diamonds`);
  return new Response(
    JSON.stringify({ success: true, data: data || [] }),
    { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function getDiamond(diamondId: string, userId: string) {
  console.log('Getting diamond:', diamondId, 'for user:', userId);

  if (!diamondId) {
    return new Response(
      JSON.stringify({ error: 'Diamond ID is required' }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('id', diamondId)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Get diamond error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get diamond', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  if (!data) {
    return new Response(
      JSON.stringify({ error: 'Diamond not found or access denied' }),
      { 
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  console.log('Diamond retrieved successfully:', data);
  return new Response(
    JSON.stringify({ success: true, data }),
    { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

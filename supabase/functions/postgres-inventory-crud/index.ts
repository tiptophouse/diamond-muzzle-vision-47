
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, user_id, data, diamond_id, filters } = await req.json()
    
    console.log(`🚀 PostgreSQL CRUD Action: ${action} for user: ${user_id}`)
    
    // Use Supabase client instead of direct PostgreSQL connection
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    let result

    switch (action) {
      case 'get_inventory':
        result = await getInventoryOptimized(supabase, user_id, filters)
        break
      
      case 'create_diamond':
        result = await createDiamondOptimized(supabase, user_id, data)
        break
      
      case 'update_diamond':
        result = await updateDiamondOptimized(supabase, user_id, diamond_id, data)
        break
      
      case 'delete_diamond':
        result = await deleteDiamondOptimized(supabase, user_id, diamond_id, data?.hard_delete || false)
        break
      
      case 'bulk_operations':
        result = await bulkOperationsOptimized(supabase, user_id, data)
        break
      
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    console.log(`✅ Action ${action} completed successfully`)

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ PostgreSQL CRUD Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Ultra-fast inventory retrieval using Supabase client
async function getInventoryOptimized(supabase: any, userId: number, filters: any = {}) {
  console.log(`📦 Fetching inventory for user ${userId} with filters:`, filters)
  
  let query = supabase
    .from('inventory')
    .select(`
      id, stock_number, shape, weight, color, clarity, cut,
      price_per_carat, status, picture, store_visible, fluorescence,
      lab, certificate_number, polish, symmetry, table_percentage,
      depth_percentage, created_at, updated_at
    `)
    .eq('user_id', userId)
    .is('deleted_at', null)

  // Add filters for super-fast querying
  if (filters.shape) {
    query = query.eq('shape', filters.shape)
  }
  
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters.store_visible !== undefined) {
    query = query.eq('store_visible', filters.store_visible)
  }

  if (filters.search) {
    query = query.or(`
      stock_number.ilike.%${filters.search}%,
      shape.ilike.%${filters.search}%,
      color.ilike.%${filters.search}%,
      clarity.ilike.%${filters.search}%
    `)
  }

  query = query.order('created_at', { ascending: false })
  
  if (filters.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('❌ Get inventory error:', error)
    throw error
  }

  console.log(`✅ Retrieved ${data?.length || 0} diamonds`)
  return data || []
}

// Optimized diamond creation using Supabase client
async function createDiamondOptimized(supabase: any, userId: number, data: any) {
  console.log(`➕ Creating diamond for user ${userId}:`, data.stock_number)
  
  const insertData = {
    user_id: userId,
    stock_number: data.stockNumber || data.stock_number,
    shape: data.shape,
    weight: data.weight || data.carat,
    color: data.color,
    clarity: data.clarity,
    cut: data.cut,
    price_per_carat: data.price_per_carat || Math.round((data.price || 0) / (data.weight || data.carat || 1)),
    status: data.status || 'Available',
    picture: data.picture || data.imageUrl,
    store_visible: data.store_visible ?? false,
    fluorescence: data.fluorescence,
    lab: data.lab,
    certificate_number: data.certificate_number,
    polish: data.polish,
    symmetry: data.symmetry,
    table_percentage: data.table_percentage,
    depth_percentage: data.depth_percentage
  }

  const { data: result, error } = await supabase
    .from('inventory')
    .insert(insertData)
    .select('id, stock_number')
    .single()

  if (error) {
    console.error('❌ Create diamond error:', error)
    throw error
  }

  console.log(`✅ Created diamond: ${result.stock_number}`)
  return result
}

// Lightning-fast update using Supabase client
async function updateDiamondOptimized(supabase: any, userId: number, diamondId: string, data: any) {
  console.log(`📝 Updating diamond ${diamondId} for user ${userId}`)
  
  const updateData: any = {}
  
  // Build dynamic update object for maximum performance
  const fieldMappings = {
    stockNumber: 'stock_number',
    stock_number: 'stock_number',
    shape: 'shape',
    weight: 'weight',
    carat: 'weight',
    color: 'color',
    clarity: 'clarity',
    cut: 'cut',
    price_per_carat: 'price_per_carat',
    status: 'status',
    picture: 'picture',
    imageUrl: 'picture',
    store_visible: 'store_visible',
    fluorescence: 'fluorescence',
    lab: 'lab',
    certificate_number: 'certificate_number',
    polish: 'polish',
    symmetry: 'symmetry',
    table_percentage: 'table_percentage',
    depth_percentage: 'depth_percentage'
  }

  Object.keys(fieldMappings).forEach(key => {
    if (data[key] !== undefined) {
      updateData[fieldMappings[key]] = data[key]
    }
  })

  // Calculate price_per_carat if price and weight are provided
  if (data.price && (data.weight || data.carat)) {
    updateData.price_per_carat = Math.round(data.price / (data.weight || data.carat))
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error('No fields to update')
  }

  updateData.updated_at = new Date().toISOString()

  const { data: result, error } = await supabase
    .from('inventory')
    .update(updateData)
    .eq('user_id', userId)
    .eq('id', diamondId)
    .select('id, stock_number')
    .single()

  if (error) {
    console.error('❌ Update diamond error:', error)
    throw error
  }

  console.log(`✅ Updated diamond: ${result.stock_number}`)
  return result
}

// Optimized delete (soft/hard) using Supabase client
async function deleteDiamondOptimized(supabase: any, userId: number, diamondId: string, hardDelete: boolean) {
  console.log(`🗑️ ${hardDelete ? 'Hard' : 'Soft'} deleting diamond ${diamondId} for user ${userId}`)
  
  let result
  
  if (hardDelete) {
    const { data, error } = await supabase
      .from('inventory')
      .delete()
      .eq('user_id', userId)
      .eq('id', diamondId)
      .select('id, stock_number')
      .single()
      
    if (error) throw error
    result = data
  } else {
    const { data, error } = await supabase
      .from('inventory')
      .update({ 
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('id', diamondId)
      .select('id, stock_number')
      .single()
      
    if (error) throw error
    result = data
  }

  console.log(`✅ Deleted diamond: ${result.stock_number}`)
  return result
}

// Super-fast bulk operations using Supabase client
async function bulkOperationsOptimized(supabase: any, userId: number, data: any) {
  const { operation, items } = data
  console.log(`🔄 Bulk ${operation} for ${items.length} items`)
  
  const results = []
  
  if (operation === 'bulk_delete') {
    for (const itemId of items) {
      const result = await deleteDiamondOptimized(supabase, userId, itemId, false)
      results.push(result)
    }
  } else if (operation === 'bulk_update') {
    for (const item of items) {
      const result = await updateDiamondOptimized(supabase, userId, item.id, item.updates)
      results.push(result)
    }
  }
  
  console.log(`✅ Bulk operation completed: ${results.length} items processed`)
  return { operation, count: results.length, results }
}

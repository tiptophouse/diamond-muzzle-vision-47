
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { Client } from 'https://deno.land/x/postgres@v0.17.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// PostgreSQL connection config
const DB_CONFIG = {
  hostname: 'database',
  port: 5434,
  database: 'diamonds_project',
  user: 'postgres',
  password: 'postgres',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, user_id, data, diamond_id, filters } = await req.json()
    
    // Create PostgreSQL client connection
    const client = new Client(DB_CONFIG)
    await client.connect()

    let result

    switch (action) {
      case 'get_inventory':
        result = await getInventoryOptimized(client, user_id, filters)
        break
      
      case 'create_diamond':
        result = await createDiamondOptimized(client, user_id, data)
        break
      
      case 'update_diamond':
        result = await updateDiamondOptimized(client, user_id, diamond_id, data)
        break
      
      case 'delete_diamond':
        result = await deleteDiamondOptimized(client, user_id, diamond_id, data?.hard_delete || false)
        break
      
      case 'bulk_operations':
        result = await bulkOperationsOptimized(client, user_id, data)
        break
      
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    await client.end()

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('PostgreSQL CRUD Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Ultra-fast inventory retrieval with prepared statements
async function getInventoryOptimized(client: Client, userId: number, filters: any = {}) {
  let query = `
    SELECT 
      id, stock_number, shape, weight, color, clarity, cut,
      price_per_carat, status, picture, store_visible, fluorescence,
      lab, certificate_number, polish, symmetry, table_percentage,
      depth_percentage, created_at, updated_at
    FROM inventory 
    WHERE user_id = $1 AND deleted_at IS NULL
  `
  
  const params = [userId]
  let paramIndex = 2

  // Add filters for super-fast querying
  if (filters.shape) {
    query += ` AND shape = $${paramIndex}`
    params.push(filters.shape)
    paramIndex++
  }
  
  if (filters.status) {
    query += ` AND status = $${paramIndex}`
    params.push(filters.status)
    paramIndex++
  }
  
  if (filters.store_visible !== undefined) {
    query += ` AND store_visible = $${paramIndex}`
    params.push(filters.store_visible)
    paramIndex++
  }

  if (filters.search) {
    query += ` AND (
      stock_number ILIKE $${paramIndex} OR 
      shape ILIKE $${paramIndex} OR 
      color ILIKE $${paramIndex} OR 
      clarity ILIKE $${paramIndex}
    )`
    params.push(`%${filters.search}%`)
    paramIndex++
  }

  query += ` ORDER BY created_at DESC`
  
  if (filters.limit) {
    query += ` LIMIT $${paramIndex}`
    params.push(filters.limit)
  }

  const result = await client.queryObject(query, params)
  return result.rows
}

// Optimized diamond creation
async function createDiamondOptimized(client: Client, userId: number, data: any) {
  const query = `
    INSERT INTO inventory (
      user_id, stock_number, shape, weight, color, clarity, cut,
      price_per_carat, status, picture, store_visible, fluorescence,
      lab, certificate_number, polish, symmetry, table_percentage, depth_percentage
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING id, stock_number
  `
  
  const params = [
    userId,
    data.stock_number,
    data.shape,
    data.weight || data.carat,
    data.color,
    data.clarity,
    data.cut,
    data.price_per_carat || Math.round(data.price / (data.weight || data.carat || 1)),
    data.status || 'Available',
    data.picture || data.imageUrl,
    data.store_visible ?? false,
    data.fluorescence,
    data.lab,
    data.certificate_number,
    data.polish,
    data.symmetry,
    data.table_percentage,
    data.depth_percentage
  ]

  const result = await client.queryObject(query, params)
  return result.rows[0]
}

// Lightning-fast update
async function updateDiamondOptimized(client: Client, userId: number, diamondId: string, data: any) {
  const setParts = []
  const params = [userId, diamondId]
  let paramIndex = 3

  // Build dynamic update query for maximum performance
  const updateFields = [
    'stock_number', 'shape', 'weight', 'color', 'clarity', 'cut',
    'price_per_carat', 'status', 'picture', 'store_visible', 'fluorescence',
    'lab', 'certificate_number', 'polish', 'symmetry', 'table_percentage', 'depth_percentage'
  ]

  updateFields.forEach(field => {
    let value = data[field]
    
    // Handle special mappings
    if (field === 'weight' && data.carat) value = data.carat
    if (field === 'picture' && data.imageUrl) value = data.imageUrl
    
    if (value !== undefined) {
      setParts.push(`${field} = $${paramIndex}`)
      params.push(value)
      paramIndex++
    }
  })

  if (setParts.length === 0) {
    throw new Error('No fields to update')
  }

  const query = `
    UPDATE inventory 
    SET ${setParts.join(', ')}, updated_at = NOW()
    WHERE user_id = $1 AND id = $2
    RETURNING id, stock_number
  `

  const result = await client.queryObject(query, params)
  return result.rows[0]
}

// Optimized delete (soft/hard)
async function deleteDiamondOptimized(client: Client, userId: number, diamondId: string, hardDelete: boolean) {
  let query
  
  if (hardDelete) {
    query = `
      DELETE FROM inventory 
      WHERE user_id = $1 AND id = $2
      RETURNING id, stock_number
    `
  } else {
    query = `
      UPDATE inventory 
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE user_id = $1 AND id = $2
      RETURNING id, stock_number
    `
  }

  const result = await client.queryObject(query, [userId, diamondId])
  return result.rows[0]
}

// Super-fast bulk operations
async function bulkOperationsOptimized(client: Client, userId: number, data: any) {
  const { operation, items } = data
  
  await client.queryObject('BEGIN')
  
  try {
    const results = []
    
    if (operation === 'bulk_delete') {
      for (const itemId of items) {
        const result = await deleteDiamondOptimized(client, userId, itemId, false)
        results.push(result)
      }
    } else if (operation === 'bulk_update') {
      for (const item of items) {
        const result = await updateDiamondOptimized(client, userId, item.id, item.updates)
        results.push(result)
      }
    }
    
    await client.queryObject('COMMIT')
    return { operation, count: results.length, results }
    
  } catch (error) {
    await client.queryObject('ROLLBACK')
    throw error
  }
}

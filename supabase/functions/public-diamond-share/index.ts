import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

const FASTAPI_BASE_URL = 'https://diamondmazalbot.com'

interface Diamond {
  id: string
  stock_number: string
  shape: string
  carat: number
  color: string
  clarity: string
  cut: string
  price: number
  price_per_carat?: number
  certificate_number?: string
  lab?: string
  status: string
  picture?: string
  gem360_url?: string
  store_visible: boolean
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const stockNumber = url.searchParams.get('stock')
    
    if (!stockNumber) {
      return new Response(
        JSON.stringify({ error: 'Stock number is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`🔍 PUBLIC SHARE: Fetching diamond with stock number: ${stockNumber}`)

    // First try to get all diamonds and find the one with matching stock number
    // This approach works without needing user authentication
    const response = await fetch(`${FASTAPI_BASE_URL}/api/v1/get_all_stones`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      console.error('❌ PUBLIC SHARE: FastAPI request failed:', response.status)
      return new Response(
        JSON.stringify({ error: 'Diamond not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const allDiamonds = await response.json()
    console.log(`📊 PUBLIC SHARE: Retrieved ${allDiamonds.length} diamonds from FastAPI`)

    // Find the diamond with matching stock number and is store visible
    const diamond = allDiamonds.find((d: any) => 
      String(d.stock_number) === String(stockNumber) && 
      d.store_visible !== false &&
      d.status === 'Available'
    )

    if (!diamond) {
      console.log(`❌ PUBLIC SHARE: Diamond ${stockNumber} not found or not available for public sharing`)
      return new Response(
        JSON.stringify({ error: 'Diamond not found or not available' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Transform the data for public sharing (remove sensitive info)
    const publicDiamond = {
      stockNumber: diamond.stock_number,
      shape: diamond.shape || 'Round',
      carat: Number(diamond.weight || diamond.carat || 0),
      color: diamond.color || 'D',
      clarity: diamond.clarity || 'FL',
      cut: diamond.cut || 'Excellent',
      price: Math.round(Number(diamond.price || diamond.price_per_carat * diamond.carat || 0)),
      certificateNumber: diamond.certificate_number,
      lab: diamond.lab,
      imageUrl: diamond.picture || diamond.image_url,
      gem360Url: diamond['3D Link'] || diamond.gem360_url,
      // Generate Telegram deep link for viewing in app
      telegramLink: `https://t.me/${Deno.env.get('TELEGRAM_BOT_USERNAME') || 'diamondmazalbot'}/app?startapp=diamond_${stockNumber}`,
      // Social sharing data
      shareData: {
        title: `${Number(diamond.weight || diamond.carat || 0)}ct ${diamond.shape || 'Round'} Diamond`,
        description: `${diamond.color || 'D'} ${diamond.clarity || 'FL'} ${diamond.cut || 'Excellent'} Cut Diamond`,
        price: Math.round(Number(diamond.price || diamond.price_per_carat * diamond.carat || 0)),
        image: diamond.picture || diamond.image_url,
        formattedPrice: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(Math.round(Number(diamond.price || diamond.price_per_carat * diamond.carat || 0)))
      }
    }

    console.log('✅ PUBLIC SHARE: Successfully prepared diamond data for sharing:', {
      stockNumber: publicDiamond.stockNumber,
      hasImage: !!publicDiamond.imageUrl,
      has360: !!publicDiamond.gem360Url,
      price: publicDiamond.price
    })

    return new Response(
      JSON.stringify(publicDiamond),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ PUBLIC SHARE: Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
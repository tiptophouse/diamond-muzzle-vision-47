import { corsHeaders } from '../_shared/cors.ts'

const FASTAPI_BASE_URL = 'https://api.mazalbot.com'

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

    // Fetch all diamonds from FastAPI (public endpoint)
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

    // Find the diamond with matching stock number
    const diamond = allDiamonds.find((d: any) => 
      String(d.stock_number) === String(stockNumber) && 
      d.store_visible !== false &&
      d.status === 'Available'
    )

    if (!diamond) {
      console.log(`❌ PUBLIC SHARE: Diamond ${stockNumber} not found or not available`)
      return new Response(
        JSON.stringify({ error: 'Diamond not found or not available' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Calculate price
    const price = Math.round(Number(diamond.price || (diamond.price_per_carat * diamond.weight) || 0));
    const carat = Number(diamond.weight || diamond.carat || 0);

    // Transform the data for public sharing
    const publicDiamond = {
      stockNumber: diamond.stock_number,
      shape: diamond.shape || 'Round',
      carat: carat,
      color: diamond.color || 'D',
      clarity: diamond.clarity || 'FL',
      cut: diamond.cut || 'Excellent',
      price: price,
      certificateNumber: diamond.certificate_number,
      lab: diamond.lab,
      imageUrl: diamond.picture || diamond.image_url,
      gem360Url: diamond['3D Link'] || diamond.gem360_url,
      // Generate Telegram deep link - use the correct bot username and format
      telegramLink: `https://t.me/MazalBotApp?startapp=diamond_${stockNumber}`,
      // Social sharing data
      shareData: {
        title: `${carat}ct ${diamond.shape || 'Round'} Diamond`,
        description: `${diamond.color || 'D'} ${diamond.clarity || 'FL'} ${diamond.cut || 'Excellent'} Cut`,
        price: price,
        image: diamond.picture || diamond.image_url,
        formattedPrice: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(price)
      }
    }

    console.log('✅ PUBLIC SHARE: Successfully prepared diamond:', {
      stockNumber: publicDiamond.stockNumber,
      hasImage: !!publicDiamond.imageUrl,
      has360: !!publicDiamond.gem360Url,
      telegramLink: publicDiamond.telegramLink
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
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

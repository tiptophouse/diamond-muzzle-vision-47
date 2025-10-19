
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { searchCriteria, searcherTelegramId, searcherName } = await req.json()

    console.log('🔍 Processing diamond search:', { searchCriteria, searcherTelegramId })

    // Find matching diamonds in inventory
    let query = supabaseClient
      .from('inventory')
      .select('*')
      .eq('store_visible', true)
      .is('deleted_at', null)

    // Apply search filters
    if (searchCriteria.shape) {
      query = query.ilike('shape', `%${searchCriteria.shape}%`)
    }
    if (searchCriteria.color) {
      query = query.eq('color', searchCriteria.color)
    }
    if (searchCriteria.clarity) {
      query = query.eq('clarity', searchCriteria.clarity)
    }
    if (searchCriteria.weight_min) {
      query = query.gte('weight', searchCriteria.weight_min)
    }
    if (searchCriteria.weight_max) {
      query = query.lte('weight', searchCriteria.weight_max)
    }
    if (searchCriteria.price_min) {
      query = query.gte('price_per_carat', searchCriteria.price_min)
    }
    if (searchCriteria.price_max) {
      query = query.lte('price_per_carat', searchCriteria.price_max)
    }

    const { data: matchingDiamonds, error } = await query

    if (error) {
      console.error('Error finding matching diamonds:', error)
      throw error
    }

    console.log(`📋 Found ${matchingDiamonds?.length || 0} matching diamonds`)

    if (!matchingDiamonds || matchingDiamonds.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No matching diamonds found', matches: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Group diamonds by owner and send notifications
    const ownerGroups = new Map()
    
    matchingDiamonds.forEach(diamond => {
      if (diamond.user_id === searcherTelegramId) return // Don't notify searcher about their own diamonds
      
      if (!ownerGroups.has(diamond.user_id)) {
        ownerGroups.set(diamond.user_id, [])
      }
      ownerGroups.get(diamond.user_id).push(diamond)
    })

    const notifications = []

    for (const [ownerId, diamonds] of ownerGroups) {
      try {
        // Calculate match scores and sort diamonds
        const diamondsWithScores = diamonds.map(diamond => {
          let score = 0
          let criteria = 0
          
          if (searchCriteria.shape) {
            criteria++
            if (diamond.shape.toLowerCase().includes(searchCriteria.shape.toLowerCase())) score++
          }
          if (searchCriteria.color) {
            criteria++
            if (diamond.color === searchCriteria.color) score++
          }
          if (searchCriteria.clarity) {
            criteria++
            if (diamond.clarity === searchCriteria.clarity) score++
          }
          if (searchCriteria.weight_min || searchCriteria.weight_max) {
            criteria++
            const weight = parseFloat(diamond.weight)
            const min = searchCriteria.weight_min || 0
            const max = searchCriteria.weight_max || 999
            if (weight >= min && weight <= max) score++
          }
          
          return {
            ...diamond,
            match_score: criteria > 0 ? score / criteria : 0
          }
        })

        // Sort by match score
        diamondsWithScores.sort((a, b) => b.match_score - a.match_score)

        // Create dynamic message with individual diamond links
        const searcherInfo = searcherName ? ` (${searcherName})` : ''
        const baseUrl = 'https://miniapp.mazalbot.com'
        
        // Create search criteria display
        const criteriaText = [
          searchCriteria.shape ? `צורה: ${searchCriteria.shape}` : '',
          searchCriteria.color ? `צבע: ${searchCriteria.color}` : '',
          searchCriteria.clarity ? `בהירות: ${searchCriteria.clarity}` : '',
          (searchCriteria.weight_min || searchCriteria.weight_max) ? 
            `משקל: ${searchCriteria.weight_min || 0}-${searchCriteria.weight_max || '∞'} קרט` : ''
        ].filter(Boolean).join('\n• ')

        // Create individual diamond cards with share buttons
        const diamondButtons = diamondsWithScores.slice(0, 5).map(diamond => {
          const price = diamond.price_per_carat ? (diamond.price_per_carat * diamond.weight) : 'צור קשר'
          const matchPercent = Math.round(diamond.match_score * 100)
          
          // Create secure share link for this specific diamond
          const shareData = {
            stockNumber: diamond.stock_number,
            ownerId: ownerId,
            timestamp: Date.now()
          }
          const encryptedData = btoa(JSON.stringify(shareData))
          
          return [
            {
              text: `💎 ${diamond.shape} ${diamond.weight}ct ${diamond.color} ${diamond.clarity}`,
              callback_data: `view_diamond_${diamond.stock_number}`
            },
            {
              text: `💰 $${typeof price === 'number' ? price.toLocaleString() : price} | 📊 ${matchPercent}% התאמה`,
              callback_data: `diamond_info_${diamond.stock_number}`
            },
            {
              text: `🔗 שתף עם לקוח`,
              web_app: {
                url: `${baseUrl}/secure-diamond/${encryptedData}`
              }
            },
            {
              text: `📞 יצירת קשר עם ${searcherName || 'הלקוח'}`,
              callback_data: `contact_client_${searcherTelegramId}_${diamond.stock_number}`
            }
          ]
        }).flat()

        // Create the main message with buyer contact info
        const contactInfo = searcherName || `User ${searcherTelegramId}`
        const message = `🔍 *חיפוש יהלומים - ${diamonds.length} התאמות נמצאו!*

👤 *קונה מעוניין: ${contactInfo}*${searcherName ? `\n📱 Telegram: @${searcherName}` : ''}
📞 *ליצירת קשר:* [לחץ כאן](tg://user?id=${searcherTelegramId})

🔎 *מחפש:*
• ${criteriaText}

💎 *היהלומים שלך שמתאימים:*

_בחר יהלום לצפייה או שיתוף עם הלקוח_`

        // Create inline keyboard with diamond options
        const inline_keyboard = []
        
        // Add diamond buttons in groups of 4 per row for better mobile display
        for (let i = 0; i < diamondButtons.length; i += 4) {
          inline_keyboard.push(diamondButtons.slice(i, i + 4))
        }
        
        // Add action buttons with buyer's telegram ID for contact
        inline_keyboard.push([
          {
            text: `📊 צפה בכל ה-${diamonds.length} התאמות`,
            web_app: {
              url: `${baseUrl}/store?search=${encodeURIComponent(JSON.stringify(searchCriteria))}`
            }
          }
        ])
        
        inline_keyboard.push([
          {
            text: `💬 שלח הודעה ל${contactInfo}`,
            url: `tg://user?id=${searcherTelegramId}`
          }
        ])

        const { data: notification, error: notificationError } = await supabaseClient
          .from('notifications')
          .insert({
            telegram_id: ownerId,
            message_type: 'dynamic_diamond_match',
            message_content: message,
            metadata: {
              search_criteria: searchCriteria,
              matches: diamondsWithScores,
              match_count: diamonds.length,
              searcher_info: {
                telegram_id: searcherTelegramId,
                name: searcherName
              },
              inline_keyboard: inline_keyboard,
              source: 'diamond_search_v2'
            },
            status: 'sent'
          })

        if (notificationError) {
          console.error('Error creating notification:', notificationError)
        } else {
          notifications.push(notification)
          console.log(`✅ Dynamic notification sent to user ${ownerId} for ${diamonds.length} matches`)
        }
      } catch (error) {
        console.error(`Error processing notification for owner ${ownerId}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Dynamic diamond search processed successfully',
        totalMatches: matchingDiamonds.length,
        ownersNotified: ownerGroups.size,
        notifications: notifications.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in diamond-search-match function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

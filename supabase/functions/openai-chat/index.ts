
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Analyze search intent using OpenAI
async function analyzeSearchIntent(message: string, apiKey: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `אתה מומחה לניתוח בקשות חיפוש יהלומים. נתח את ההודעה ובדוק אם זה חיפוש יהלום. אם כן, חלץ את הקריטריונים.
          
          החזר תשובה בפורמט JSON בלבד:
          {
            "isSearchQuery": boolean,
            "criteria": {
              "shape": "string או null",
              "color": "string או null", 
              "clarity": "string או null",
              "weight_min": number או null,
              "weight_max": number או null,
              "price_min": number או null,
              "price_max": number או null
            },
            "customerInfo": {
              "name": "string או null",
              "phone": "string או null"
            }
          }`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.1,
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    console.error('OpenAI analysis failed:', response.status);
    return { isSearchQuery: false, criteria: null, customerInfo: null };
  }

  const data = await response.json();
  try {
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Failed to parse search analysis:', error);
    return { isSearchQuery: false, criteria: null, customerInfo: null };
  }
}

// Process search matches and send notifications
async function processSearchMatches(criteria: any, allInventory: any[], searcherUserId: number) {
  console.log('🔍 Processing search matches for criteria:', criteria);
  
  const userMatches = new Map();
  
  // Group diamonds by owner and calculate matches
  for (const diamond of allInventory) {
    const ownerId = diamond.owner_id || diamond.user_id;
    if (!ownerId || ownerId === searcherUserId) continue; // Skip searcher's own diamonds
    
    const matchResult = calculateMatch(diamond, criteria);
    if (matchResult.score > 0.3) { // Minimum 30% match threshold
      
      if (!userMatches.has(ownerId)) {
        userMatches.set(ownerId, []);
      }
      
      userMatches.get(ownerId).push({
        id: diamond.id,
        stock_number: diamond.stock_number,
        shape: diamond.shape,
        color: diamond.color,
        clarity: diamond.clarity,
        weight: diamond.weight,
        price_per_carat: diamond.price_per_carat,
        match_score: matchResult.score,
        match_reasons: matchResult.reasons
      });
    }
  }
  
  // Send notifications to owners with matches
  for (const [ownerId, matches] of userMatches) {
    if (matches.length > 0) {
      await sendMatchNotification(matches, criteria, ownerId);
    }
  }
  
  console.log(`📨 Sent match notifications to ${userMatches.size} diamond owners`);
}

// Calculate match score between diamond and search criteria
function calculateMatch(diamond: any, criteria: any): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  let totalCriteria = 0;

  // Shape match (high importance)
  if (criteria.shape) {
    totalCriteria++;
    if (diamond.shape?.toLowerCase() === criteria.shape.toLowerCase()) {
      score += 0.3;
      reasons.push(`צורה זהה: ${criteria.shape}`);
    }
  }

  // Color match (high importance)
  if (criteria.color) {
    totalCriteria++;
    if (diamond.color === criteria.color) {
      score += 0.25;
      reasons.push(`צבע זהה: ${criteria.color}`);
    } else if (isColorSimilar(diamond.color, criteria.color)) {
      score += 0.15;
      reasons.push(`צבע דומה: ${diamond.color} ~ ${criteria.color}`);
    }
  }

  // Clarity match
  if (criteria.clarity) {
    totalCriteria++;
    if (diamond.clarity === criteria.clarity) {
      score += 0.2;
      reasons.push(`בהירות זהה: ${criteria.clarity}`);
    } else if (isClaritySimilar(diamond.clarity, criteria.clarity)) {
      score += 0.1;
      reasons.push(`בהירות דומה: ${diamond.clarity} ~ ${criteria.clarity}`);
    }
  }

  // Weight range match
  if (criteria.weight_min || criteria.weight_max) {
    totalCriteria++;
    const weight = parseFloat(diamond.weight);
    const minWeight = criteria.weight_min || 0;
    const maxWeight = criteria.weight_max || 999;
    
    if (weight >= minWeight && weight <= maxWeight) {
      score += 0.15;
      reasons.push(`משקל בטווח: ${weight} קרט`);
    }
  }

  // Price range match
  if (criteria.price_min || criteria.price_max) {
    totalCriteria++;
    const price = diamond.price_per_carat;
    const minPrice = criteria.price_min || 0;
    const maxPrice = criteria.price_max || 999999;
    
    if (price >= minPrice && price <= maxPrice) {
      score += 0.1;
      reasons.push(`מחיר בטווח: $${price}/קרט`);
    }
  }

  // Normalize score
  if (totalCriteria > 0) {
    score = score / Math.max(totalCriteria * 0.2, 1);
  }

  return { score: Math.min(score, 1), reasons };
}

function isColorSimilar(color1: string, color2: string): boolean {
  const colorOrder = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
  const index1 = colorOrder.indexOf(color1);
  const index2 = colorOrder.indexOf(color2);
  
  if (index1 === -1 || index2 === -1) return false;
  return Math.abs(index1 - index2) <= 1;
}

function isClaritySimilar(clarity1: string, clarity2: string): boolean {
  const clarityOrder = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'];
  const index1 = clarityOrder.indexOf(clarity1);
  const index2 = clarityOrder.indexOf(clarity2);
  
  if (index1 === -1 || index2 === -1) return false;
  return Math.abs(index1 - index2) <= 1;
}

// Send match notification to diamond owner
async function sendMatchNotification(matches: any[], criteria: any, ownerTelegramId: number) {
  const topMatch = matches.sort((a, b) => b.match_score - a.match_score)[0];
  const matchCount = matches.length;
  
  let message = `🔍 התראת התאמה חדשה!\n\n`;
  message += `מישהו מחפש יהלום שדומה למלאי שלך:\n`;
  
  if (criteria.shape) message += `• צורה: ${criteria.shape}\n`;
  if (criteria.color) message += `• צבע: ${criteria.color}\n`;
  if (criteria.clarity) message += `• בהירות: ${criteria.clarity}\n`;
  if (criteria.weight_min || criteria.weight_max) {
    message += `• משקל: ${criteria.weight_min || 0}-${criteria.weight_max || '∞'} קרט\n`;
  }
  
  message += `\n💎 נמצאו ${matchCount} התאמות במלאי שלך\n`;
  message += `📍 התאמה הטובה ביותר: ${topMatch.stock_number}\n`;
  message += `⭐ ציון התאמה: ${Math.round(topMatch.match_score * 100)}%\n`;
  message += `\n💬 פתח את האפליקציה לפרטים נוספים`;

  try {
    await supabase.from('notifications').insert({
      telegram_id: ownerTelegramId,
      message_type: 'diamond_match',
      message_content: message,
      status: 'sent',
      metadata: {
        search_criteria: criteria,
        matches: matches.slice(0, 5),
        match_count: matchCount,
        top_match_score: topMatch.match_score
      }
    });
    
    console.log('📨 Match notification sent to user:', ownerTelegramId);
  } catch (error) {
    console.error('Failed to send match notification:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversation_history = [], user_id } = await req.json();
    
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Analyze search intent
    const searchAnalysis = await analyzeSearchIntent(message, openaiApiKey);
    console.log('🔍 Search analysis:', searchAnalysis);

    // If search detected, process matches
    if (searchAnalysis.isSearchQuery && searchAnalysis.criteria && user_id) {
      try {
        const inventoryResponse = await fetch(`https://api.mazalbot.com/api/v1/get_all_stones?user_id=1`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ifj9ov1rh20fslfp',
            'Content-Type': 'application/json',
          },
        });

        if (inventoryResponse.ok) {
          const allInventory = await inventoryResponse.json();
          await processSearchMatches(searchAnalysis.criteria, allInventory, user_id);
        }
      } catch (error) {
        console.error('Error processing search matches:', error);
      }
    }

    // Get user inventory for context
    let inventoryContext = '';
    if (user_id) {
      try {
        const inventoryResponse = await fetch(`https://api.mazalbot.com/api/v1/get_all_stones?user_id=${user_id}`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ifj9ov1rh20fslfp',
            'Content-Type': 'application/json',
          },
        });

        if (inventoryResponse.ok) {
          const inventoryData = await inventoryResponse.json();
          console.log('Retrieved inventory data:', inventoryData.length, 'diamonds');
          
          if (inventoryData && inventoryData.length > 0) {
            const userDiamonds = inventoryData.filter(d => 
              d.owners?.includes(user_id) || d.owner_id === user_id
            );
            
            inventoryContext = `
המלאי הנוכחי שלך (${userDiamonds.length} יהלומים):
${userDiamonds.slice(0, 20).map(d => {
  const shape = d.shape || 'Unknown';
  const weight = d.weight || 'N/A';
  const color = d.color || 'N/A';
  const clarity = d.clarity || 'N/A';
  const pricePerCarat = d.price_per_carat || 'N/A';
  const stockNumber = d.stock_number || 'N/A';
  
  return `- ${shape} ${weight}ct ${color} ${clarity} - $${pricePerCarat}/ct (Stock: ${stockNumber})`;
}).join('\n')}
${userDiamonds.length > 20 ? `\n... ועוד ${userDiamonds.length - 20} יהלומים` : ''}
            `;
          } else {
            inventoryContext = 'אין יהלומים במלאי כרגע.';
          }
        }
      } catch (error) {
        console.error('Error fetching inventory:', error);
        inventoryContext = 'לא ניתן לגשת לנתוני המלאי כרגע.';
      }
    } else {
      inventoryContext = 'משתמש לא מזוהה - לא ניתן לגשת לנתוני המלאי.';
    }

    const systemPrompt = `אתה עוזר AI מתקדם למסחר יהלומים עבור פלטפורמת מסחר יהלומים יוקרתית. יש לך גישה לנתוני מלאי בזמן אמת ואתה יכול לספק תובנות מומחה על יהלומים, תמחור, מגמות שוק והמלצות.

${inventoryContext}

היכולות שלך כוללות:
- ניתוח מאפייני יהלומים ותמחור
- מתן תובנות שוק ומגמות
- המלצה על יהלומים על בסיס קריטריונים
- מענה על שאלות לגבי איכות יהלומים, הסמכה ופוטנציאל השקעה
- עזרה בניהול מלאי
- מתן ניתוח תמחור
- זיהוי אוטומטי של בקשות חיפוש ושליחת התראות לבעלי יהלומים דומים

כאשר משתמש מחפש יהלום ספציפי, המערכת אוטומטית מחפשת התאמות במלאי של משתמשים אחרים ושולחת להם התראות.

תמיד היה מקצועי, בעל ידע ועוזר. השתמש בנתוני המלאי כדי לספק המלצות ספציפיות כשרלוונטי. אם נשאל על יהלומים ספציפיים, התייחס למספרי המלאי ולפרטים מהמלאי למעלה.

אם זוהתה בקשת חיפוש יהלום, הודע למשתמש שהמערכת אוטומטית חיפשה התאמות ושלחה התראות לבעלי יהלומים דומים.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation_history.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let aiResponse = data.choices[0].message.content;

    // Add notification info if search was detected
    if (searchAnalysis.isSearchQuery && searchAnalysis.criteria) {
      aiResponse += `\n\n🔔 **התראה אוטומטית נשלחה!**\nהמערכת חיפשה יהלומים דומים במלאי של סוחרים אחרים ושלחה להם התראות על הבקשה שלך.`;
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      status: 'success',
      search_detected: searchAnalysis.isSearchQuery
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in openai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      status: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

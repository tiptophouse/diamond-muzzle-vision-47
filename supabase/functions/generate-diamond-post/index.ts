import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { diamond, platform = 'social' } = await req.json();
    
    console.log('🎯 Generating post for diamond:', diamond?.stock_number);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate post content using OpenAI
    const result = await generatePostContent(diamond, platform, openAIApiKey);
    
    console.log('✅ Generated post content:', result.content);

    return new Response(
      JSON.stringify({ 
        content: result.content,
        imageUrl: result.imageUrl,
        diamond_data: diamond,
        platform: platform
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Error in generate-diamond-post function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function generatePostContent(diamond: any, platform: string, apiKey: string): Promise<{ content: string; imageUrl?: string }> {
  console.log('🤖 Calling OpenAI to generate post content...');
  
  const prompt = createPostPrompt(diamond, platform);
  
  try {
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
            content: `You are a professional diamond dealer creating engaging social media posts. 
            Create posts that are clear, professional, and attract potential buyers.
            Always include specific diamond details and make it sound appealing.
            Use emojis appropriately and format text for readability.
            Keep posts concise but informative.
            Write in Hebrew for the Hebrew market.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Use existing diamond image from database if available
    const imageUrl = diamond.picture || null;
    if (imageUrl) {
      console.log('📸 Using existing diamond image from database');
    }
    
    return { content, imageUrl };
    
  } catch (error) {
    console.error('❌ OpenAI API call failed:', error);
    // Fallback to simple post generation
    return { 
      content: generateFallbackPost(diamond, platform),
      imageUrl: diamond.picture || null
    };
  }
}

function createPostPrompt(diamond: any, platform: string): string {
  const diamondInfo = `
    מידע על היהלום:
    - מספר מלאי: ${diamond.stock_number || 'לא צוין'}
    - צורה: ${diamond.shape || 'לא צוין'}
    - משקל: ${diamond.carat || 'לא צוין'} קרט
    - צבע: ${diamond.color || 'לא צוין'}
    - ניקיון: ${diamond.clarity || 'לא צוין'}
    - חיתוך: ${diamond.cut || 'לא צוין'}
    - מחיר: $${diamond.price?.toLocaleString() || 'לא צוין'}
    - מעבדה: ${diamond.lab || 'לא צוין'}
    - מספר תעודה: ${diamond.certificate_number || 'לא צוין'}
  `;

  if (platform === 'wanted') {
    return `צור פוסט "מחפש יהלום" עבור הפרטים הבאים:
    ${diamondInfo}
    
    הפוסט צריך להיות בפורמט של "מחפש יהלום" כמו:
    "מחפש יהלום [צורה] [משקל] קרט [צבע] [ניקיון]
    תקציב: [טווח מחירים]"
    
    השתמש בעברית, הוסף אימוג'י רלוונטיים, וודא שהפוסט נראה מקצועי ומזמין.`;
  }

  return `צור פוסט מכירה מקצועי ומעניין עבור היהלום הבא:
  ${diamondInfo}
  
  הפוסט צריך:
  - להיות בעברית
  - להכיל את כל הפרטים החשובים
  - להישמע מקצועי ומזמין
  - להוסיף אימוג'י רלוונטיים
  - להדגיש את הייחודיות של היהלום
  - לכלול קריאה לפעולה (יצירת קשר)
  
  שמור על פורמט קריא וברור.`;
}

function generateFallbackPost(diamond: any, platform: string): string {
  if (platform === 'wanted') {
    return `💎 מחפש יהלום ${diamond.shape || ''} ${diamond.carat || ''} קרט ${diamond.color || ''} ${diamond.clarity || ''}
    
🎯 תקציב: $${diamond.price?.toLocaleString() || 'לא צוין'}

📞 לפרטים נוספים צרו קשר`;
  }

  return `💎 יהלום מעולה למכירה!

🔹 צורה: ${diamond.shape || 'לא צוין'}
🔹 משקל: ${diamond.carat || 'לא צוין'} קרט
🔹 צבע: ${diamond.color || 'לא צוין'}
🔹 ניקיון: ${diamond.clarity || 'לא צוין'}
🔹 חיתוך: ${diamond.cut || 'לא צוין'}
💰 מחיר: $${diamond.price?.toLocaleString() || 'לא צוין'}

${diamond.certificate_number ? `📋 תעודה: ${diamond.certificate_number}` : ''}
${diamond.lab ? `🏛️ מעבדה: ${diamond.lab}` : ''}

📞 לפרטים נוספים ולקביעת פגישה צרו קשר`;
}
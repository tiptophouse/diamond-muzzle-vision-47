import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConversationStarterRequest {
  customerInfo: {
    searchQuery?: string;
    diamonds?: any[];
    customerName?: string;
    telegramId?: number;
  };
  language?: 'he' | 'en';
}

serve(async (req) => {
  console.log('💬 Conversation starter function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerInfo, language = 'he' }: ConversationStarterRequest = await req.json();
    
    console.log('📥 Request data:', { customerInfo, language });

    if (!customerInfo) {
      console.error('❌ Missing customerInfo');
      return new Response(
        JSON.stringify({ error: 'Missing customerInfo' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare context for OpenAI
    const { searchQuery, diamonds = [], customerName = 'הלקוח' } = customerInfo;
    
    const diamondsSummary = diamonds.length > 0 
      ? diamonds.slice(0, 3).map((d: any) => 
          `${d.shape} ${d.weight}ct ${d.color}/${d.clarity} - מלאי #${d.stock_number}${d.total_price ? ` ($${d.total_price.toLocaleString()})` : ''}`
        ).join('\n')
      : '';

    const isHebrew = language === 'he';
    
    const systemPrompt = isHebrew 
      ? `אתה מומחה יהלומים מנוסה שעוזר למוכרי יהלומים ליצור קשר אישי ומקצועי עם לקוחות פוטנציאליים. 
תפקידך ליצור הודעות פתיחה טבעיות, חמות ומקצועיות שיעודדו דיאלוג.

כללים חשובים:
- כתב בעברית טבעית ושוטפת
- השתמש בטון חם ומקצועי
- התמקד בערך ללקוח
- אל תהיה דחוף מדי במכירה
- הזכר פרטים ספציפיים על היהלומים שמעניינים את הלקוח
- הציע עזרה ויעוץ אישי
- שמור על זהות ישראלית אותנטית`
      : `You are an experienced diamond expert helping diamond sellers create personal and professional contact with potential customers. 
Your role is to create natural, warm and professional opening messages that encourage dialogue.

Important rules:
- Write in natural, flowing English
- Use a warm and professional tone
- Focus on customer value
- Don't be too pushy with sales
- Mention specific details about diamonds that interest the customer
- Offer personal help and consultation
- Maintain authentic professional identity`;

    const userPrompt = isHebrew
      ? `צור 3 הודעות פתיחה שונות לחלוטין ללקוח שחיפש יהלומים.

פרטי החיפוש: ${searchQuery || 'חיפוש כללי'}
יהלומים מתאימים שנמצאו:
${diamondsSummary || 'מגוון יהלומים במלאי'}

דרישות:
1. כל הודעה צריכה להיות ייחודית באופיה וגישתה
2. הודעה 1: גישה ישירה ומקצועית
3. הודעה 2: גישה יועצת ומסבירה  
4. הודעה 3: גישה אישית וחמה
5. כל הודעה באורך 2-4 משפטים
6. הזכר פרטים ספציפיים מהחיפוש או היהלומים
7. כלול קריאה לפעולה עדינה

החזר JSON עם המבנה הבא:
{
  "conversation_starters": [
    {
      "type": "professional",
      "message": "הודעה 1...",
      "tone": "מקצועי וישיר"
    },
    {
      "type": "consultative", 
      "message": "הודעה 2...",
      "tone": "יועץ ומסביר"
    },
    {
      "type": "personal",
      "message": "הודעה 3...", 
      "tone": "אישי וחם"
    }
  ]
}`
      : `Create 3 completely different opening messages for a customer who searched for diamonds.

Search details: ${searchQuery || 'General search'}
Suitable diamonds found:
${diamondsSummary || 'Various diamonds in inventory'}

Requirements:
1. Each message should be unique in character and approach
2. Message 1: Direct and professional approach
3. Message 2: Consultative and explanatory approach
4. Message 3: Personal and warm approach
5. Each message 2-4 sentences long
6. Mention specific details from the search or diamonds
7. Include a gentle call to action

Return JSON with the following structure:
{
  "conversation_starters": [
    {
      "type": "professional",
      "message": "Message 1...",
      "tone": "Professional and direct"
    },
    {
      "type": "consultative", 
      "message": "Message 2...",
      "tone": "Consultative and explanatory"
    },
    {
      "type": "personal",
      "message": "Message 3...", 
      "tone": "Personal and warm"
    }
  ]
}`;

    console.log('🤖 Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 1000,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ OpenAI API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to generate conversation starters', details: error }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const conversationStarters = JSON.parse(data.choices[0].message.content);

    console.log('✅ Conversation starters generated successfully');
    return new Response(
      JSON.stringify({ 
        success: true,
        conversationStarters: conversationStarters.conversation_starters,
        customer_info: customerInfo
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error generating conversation starters:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
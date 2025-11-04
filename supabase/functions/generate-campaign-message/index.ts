import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { segment, userCount } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get AI learning patterns for optimization
    const { data: patterns } = await supabaseClient
      .from('ai_learning_patterns')
      .select('*')
      .order('success_score', { ascending: false })
      .limit(5);

    const segmentPrompts: Record<string, string> = {
      'inactive_no_stock': `Create an engaging message for inactive users who haven't uploaded any diamonds yet. 
        They need encouragement to start using the platform. Focus on easy onboarding and quick wins.`,
      'inactive_with_stock': `Create a re-engagement message for users who uploaded diamonds but became inactive. 
        Remind them of their inventory value and new features that can help them sell.`,
      'active_no_stock': `Create a message encouraging active users to upload their first diamond. 
        They're engaged but haven't added inventory yet.`,
      'active_with_stock': `Create an upsell message for engaged users with active inventory. 
        Focus on premium features, analytics, and advanced tools.`,
      'all': `Create a general engagement message for all users about platform value and features.`
    };

    const systemPrompt = `You are an expert campaign copywriter for a diamond trading platform.

CRITICAL RULES:
1. Write in Hebrew (עברית)
2. Use 2-3 emojis maximum
3. Keep message between 50-100 words
4. Include clear value proposition
5. End with compelling call-to-action
6. Use conversational, friendly tone
7. NO markdown formatting

Based on AI learning patterns:
- Personalized greetings increase engagement by 41%
- 2-3 emojis boost clicks by 23%
- Messages 50-100 words have 28% better CTR
- Clear value props increase conversion by 34%

${patterns?.length ? `Top performing patterns:\n${patterns.map(p => `- ${p.pattern_type}: ${JSON.stringify(p.pattern_data)}`).join('\n')}` : ''}

Target audience: ${userCount} users in segment "${segment}"
`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: segmentPrompts[segment] || segmentPrompts['all'] }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || "Hi! 💎 We have exciting updates for you!";

    // Log AI generation for learning
    await supabaseClient.from('ai_learning_patterns').insert({
      user_telegram_id: 0, // System
      pattern_type: 'message_generation',
      pattern_data: {
        segment,
        prompt_length: segmentPrompts[segment].length,
        response_length: message.length,
        timestamp: new Date().toISOString()
      },
      success_score: 0.8 // Initial score, will be updated based on campaign performance
    });

    return new Response(
      JSON.stringify({ message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error generating message:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

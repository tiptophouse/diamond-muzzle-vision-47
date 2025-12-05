import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userFirstName, baseMessage, tutorialUrl } = await req.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: `You are a marketing expert creating promotional messages for a diamond management system in Hebrew. 
            Create an engaging, professional, and exciting onboarding message that:
            - Welcomes the user warmly in Hebrew
            - Explains the benefits of the diamond management system
            - Encourages them to start the tutorial immediately
            - Uses emojis strategically 
            - Includes the tutorial link prominently
            - Sounds professional but friendly
            - Emphasizes time-saving and ease of use
            - Makes them excited to try the system`
          },
          { 
            role: 'user', 
            content: `Create a promotional onboarding message in Hebrew for a user named "${userFirstName}". 
            The tutorial URL is: ${tutorialUrl}
            
            Make it compelling and encourage immediate action. Include benefits like:
            - Certificate scanning
            - Inventory management  
            - Virtual store
            - Analytics and tracking
            
            Keep it concise but exciting.` 
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    const improvedMessage = data.choices[0].message.content;

    return new Response(JSON.stringify({ improvedMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in improve-message function:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface FlowState {
  step: 'welcome' | 'education' | 'budget' | 'style_selection' | 'design_generation' | 'refinement' | 'final';
  education_progress: {
    cut: boolean;
    color: boolean;
    clarity: boolean;
    carat: boolean;
  };
  budget?: number;
  preferences: {
    cut?: string;
    color?: string;
    clarity?: string;
    carat?: number;
    style?: 'classic' | 'vintage' | 'modern';
  };
  generated_images: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, flow_state, action } = await req.json();

    if (!openAIApiKey) {
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured',
        response: 'I apologize, but I\'m currently unable to access my AI capabilities. Please contact support.'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle different actions
    if (action === 'generate_ring_image') {
      return await generateRingImage(flow_state);
    }

    // Handle conversational flow
    const systemPrompt = getSystemPrompt(flow_state);
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API Error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I had trouble processing that. Could you try again?';

    // Update flow state based on conversation
    const updatedFlowState = updateFlowState(flow_state, message, aiResponse);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      flow_state: updatedFlowState,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ring-design-chat function:', error);
    
    return new Response(JSON.stringify({ 
      response: 'I\'m experiencing some technical difficulties. Let me try to help you in a different way. What would you like to know about diamonds?',
      error: error.message,
      success: false
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateRingImage(flowState: FlowState): Promise<Response> {
  try {
    const prompt = createRingDesignPrompt(flowState);
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'hd',
        style: 'natural'
      }),
    });

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.data[0]?.url;

    return new Response(JSON.stringify({ 
      image_url: imageUrl,
      prompt_used: prompt,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating ring image:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate ring image',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

function getSystemPrompt(flowState: FlowState): string {
  const basePrompt = `You are a friendly diamond and jewelry expert helping customers learn about diamonds and design their perfect engagement ring. You explain things in simple, easy-to-understand terms.`;

  switch (flowState.step) {
    case 'welcome':
      return `${basePrompt} 

Start by welcoming the customer and explaining that you'll help them understand the 4Cs of diamonds (Cut, Color, Clarity, Carat) in a fun, interactive way. Ask what they'd like to learn about first, or if they have a specific budget in mind.

Keep responses warm, encouraging, and educational. Use emojis sparingly but effectively.`;

    case 'education':
      return `${basePrompt}

You're teaching about the 4Cs of diamonds. Current progress:
- Cut: ${flowState.education_progress.cut ? '✅ Learned' : '❌ Not yet'}
- Color: ${flowState.education_progress.color ? '✅ Learned' : '❌ Not yet'}  
- Clarity: ${flowState.education_progress.clarity ? '✅ Learned' : '❌ Not yet'}
- Carat: ${flowState.education_progress.carat ? '✅ Learned' : '❌ Not yet'}

Explain each concept clearly with examples. When they understand all 4Cs, ask about their budget and preferences.`;

    case 'budget':
      return `${basePrompt}

Help the customer think about their budget and what's most important to them in a diamond. Guide them towards realistic expectations and help them prioritize among the 4Cs based on their budget.`;

    case 'style_selection':
      return `${basePrompt}

Present three ring styles: Classic (timeless solitaire), Vintage (antique-inspired), and Modern (contemporary designs). Ask which style resonates with them and why.`;

    case 'design_generation':
      return `${basePrompt}

You're about to show them AI-generated ring designs based on their preferences. Explain what you're creating and build excitement for seeing their custom design.`;

    case 'refinement':
      return `${basePrompt}

Help the customer refine their ring design using natural language. They can ask for changes like "make it more sparkly," "add vintage details," "make the band thinner," etc. Translate their requests into specific design modifications.`;

    default:
      return basePrompt;
  }
}

function updateFlowState(currentState: FlowState, userMessage: string, aiResponse: string): FlowState {
  const newState = { ...currentState };
  const lowerMessage = userMessage.toLowerCase();

  // Update education progress
  if (lowerMessage.includes('cut') && aiResponse.includes('cut')) {
    newState.education_progress.cut = true;
  }
  if (lowerMessage.includes('color') && aiResponse.includes('color')) {
    newState.education_progress.color = true;
  }
  if (lowerMessage.includes('clarity') && aiResponse.includes('clarity')) {
    newState.education_progress.clarity = true;
  }
  if (lowerMessage.includes('carat') && aiResponse.includes('carat')) {
    newState.education_progress.carat = true;
  }

  // Detect budget mentions
  const budgetMatch = userMessage.match(/\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/);
  if (budgetMatch) {
    newState.budget = parseInt(budgetMatch[1].replace(/,/g, ''));
  }

  // Detect style preferences
  if (lowerMessage.includes('classic')) newState.preferences.style = 'classic';
  if (lowerMessage.includes('vintage')) newState.preferences.style = 'vintage';
  if (lowerMessage.includes('modern')) newState.preferences.style = 'modern';

  // Progress through steps
  const allEducationComplete = Object.values(newState.education_progress).every(Boolean);
  
  if (currentState.step === 'welcome' && (lowerMessage.includes('learn') || lowerMessage.includes('4c'))) {
    newState.step = 'education';
  } else if (currentState.step === 'education' && allEducationComplete) {
    newState.step = 'budget';
  } else if (currentState.step === 'budget' && newState.budget) {
    newState.step = 'style_selection';
  } else if (currentState.step === 'style_selection' && newState.preferences.style) {
    newState.step = 'design_generation';
  }

  return newState;
}

function createRingDesignPrompt(flowState: FlowState): string {
  const style = flowState.preferences.style || 'classic';
  const budget = flowState.budget || 5000;
  
  let basePrompt = `Create a photorealistic ${style} engagement ring design. `;
  
  if (style === 'classic') {
    basePrompt += 'Timeless solitaire setting with clean lines, simple elegance, ';
  } else if (style === 'vintage') {
    basePrompt += 'Antique-inspired with intricate details, milgrain work, art deco elements, ';
  } else if (style === 'modern') {
    basePrompt += 'Contemporary design with unique setting, geometric elements, ';
  }

  basePrompt += `featuring a brilliant diamond as the center stone. Professional jewelry photography, white background, high-end lighting, luxury presentation. The ring should look premium and suitable for a $${budget} budget range.`;

  return basePrompt;
}

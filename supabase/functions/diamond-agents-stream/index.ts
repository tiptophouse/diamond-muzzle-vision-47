import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// AG-UI Event Types for streaming responses
interface AGUIEvent {
  type: 'message' | 'thinking' | 'agent_switch' | 'tool_call' | 'error' | 'complete';
  data: any;
  timestamp: string;
}

interface DiamondAgentsRequest {
  message: string;
  user_id: number;
  agent_type: string;
  conversation_history: Array<{
    role: 'user' | 'assistant';
    content: string;
    agent_used?: string;
  }>;
  stream: boolean;
  telegram_user: {
    id: number;
    first_name: string;
    username?: string;
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Stream AG-UI compatible events for Diamond Agents
 * Provides real-time streaming responses with event-driven architecture
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const requestData: DiamondAgentsRequest = await req.json();
    console.log('🤖 Diamond Agents Streaming Request:', {
      user_id: requestData.user_id,
      agent_type: requestData.agent_type,
      message_length: requestData.message.length,
      history_length: requestData.conversation_history.length,
      stream: requestData.stream
    });

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        // Helper function to send AG-UI events
        const sendEvent = (event: AGUIEvent) => {
          const eventData = JSON.stringify(event) + '\n';
          controller.enqueue(encoder.encode(eventData));
        };

        try {
          // Send thinking event
          sendEvent({
            type: 'thinking',
            data: { agent: requestData.agent_type },
            timestamp: new Date().toISOString()
          });

          // Simulate agent processing with realistic diamond expertise
          const agentResponses = await generateDiamondExpertResponse(
            requestData.message,
            requestData.agent_type,
            requestData.conversation_history,
            sendEvent
          );

          // Stream the response in chunks
          for (const chunk of agentResponses) {
            sendEvent({
              type: 'message',
              data: { content: chunk },
              timestamp: new Date().toISOString()
            });

            // Add small delay for realistic streaming
            await new Promise(resolve => setTimeout(resolve, 50));
          }

          // Send completion event
          sendEvent({
            type: 'complete',
            data: { 
              agent_used: requestData.agent_type,
              total_chunks: agentResponses.length
            },
            timestamp: new Date().toISOString()
          });

          // Log interaction to Supabase
          await supabase.from('agent_interactions').insert({
            user_id: requestData.user_id,
            agent_type: requestData.agent_type,
            message: requestData.message,
            response_chunks: agentResponses.length,
            telegram_user_id: requestData.telegram_user.id,
            telegram_username: requestData.telegram_user.username,
            created_at: new Date().toISOString()
          });

        } catch (error) {
          console.error('🤖 Streaming error:', error);
          
          sendEvent({
            type: 'error',
            data: { 
              message: 'I apologize, but I encountered an issue. Please try again.',
              error_code: 'STREAM_ERROR'
            },
            timestamp: new Date().toISOString()
          });
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('🤖 Diamond Agents Stream Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process diamond agent request',
        details: (error as Error).message 
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      }
    );
  }
});

/**
 * Generate diamond expert responses with specialized knowledge
 * Returns response chunks for streaming
 */
async function generateDiamondExpertResponse(
  message: string,
  agentType: string,
  history: Array<any>,
  sendEvent: (event: AGUIEvent) => void
): Promise<string[]> {
  
  // Agent-specific response generation
  const agentPrompts = {
    main: "You are a Diamond Consultant Coordinator. Provide comprehensive diamond consultation and route to specialists when needed.",
    grading: "You are a Certified Diamond Grading Expert specializing in 4Cs analysis, certificate verification, and quality assessment.",
    inventory: "You are an Inventory Management Expert providing portfolio analysis, stock optimization, and investment strategies.",
    pricing: "You are a Diamond Pricing Expert with deep market knowledge providing valuations and pricing strategies.",
    customer_service: "You are a Customer Service Expert specializing in personalized recommendations and client education.",
    business_intelligence: "You are a Business Intelligence Expert providing daily insights, analytics, and strategic recommendations.",
    operations: "You are an Inventory Operations Expert handling CRUD operations, data management, and mobile-friendly diamond operations."
  };

  const prompt = agentPrompts[agentType as keyof typeof agentPrompts] || agentPrompts.main;
  
  // Simulate intelligent response based on message content and agent type
  let response = await generateContextualResponse(message, agentType, prompt, history);
  
  // Check if agent switching is needed
  const suggestedAgent = detectAgentSwitch(message);
  if (suggestedAgent && suggestedAgent !== agentType) {
    sendEvent({
      type: 'agent_switch',
      data: { 
        from: agentType, 
        to: suggestedAgent,
        reason: 'Query better suited for specialist'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Split response into chunks for streaming effect
  const chunks = splitIntoChunks(response, 20);
  return chunks;
}

/**
 * Generate contextual response based on diamond expertise
 */
async function generateContextualResponse(
  message: string,
  agentType: string,
  prompt: string,
  history: Array<any>
): Promise<string> {
  
  const messageLower = message.toLowerCase();
  
  // Diamond-specific keyword responses
  if (messageLower.includes('4c') || messageLower.includes('grading')) {
    return `As a diamond grading expert, I can analyze the 4Cs: Cut, Color, Clarity, and Carat weight. ${getGradingAdvice(message)}`;
  }
  
  if (messageLower.includes('price') || messageLower.includes('value') || messageLower.includes('cost')) {
    return `From a pricing perspective, diamond valuation depends on multiple factors. ${getPricingAdvice(message)}`;
  }
  
  if (messageLower.includes('inventory') || messageLower.includes('portfolio')) {
    return `Looking at your inventory management needs, I recommend ${getInventoryAdvice(message)}`;
  }
  
  if (messageLower.includes('customer') || messageLower.includes('client') || messageLower.includes('sell')) {
    return `For customer service excellence, I suggest ${getCustomerServiceAdvice(message)}`;
  }
  
  if (messageLower.includes('report') || messageLower.includes('analytics') || messageLower.includes('insights')) {
    return `Based on business intelligence analysis, ${getBusinessInsights(message)}`;
  }
  
  if (messageLower.includes('add') || messageLower.includes('delete') || messageLower.includes('edit')) {
    return `For inventory operations, I can help you ${getOperationsAdvice(message)}`;
  }
  
  // General diamond consultation
  return `As your diamond consultant, ${getGeneralAdvice(message, agentType)}. How can I further assist you with your diamond business needs?`;
}

/**
 * Detect if message requires different agent
 */
function detectAgentSwitch(message: string): string | null {
  const messageLower = message.toLowerCase();
  
  if (messageLower.includes('grade') || messageLower.includes('4c') || messageLower.includes('certificate')) {
    return 'grading';
  }
  if (messageLower.includes('price') || messageLower.includes('value') || messageLower.includes('market')) {
    return 'pricing';
  }
  if (messageLower.includes('inventory') || messageLower.includes('portfolio') || messageLower.includes('stock')) {
    return 'inventory';
  }
  if (messageLower.includes('customer') || messageLower.includes('client') || messageLower.includes('service')) {
    return 'customer_service';
  }
  if (messageLower.includes('report') || messageLower.includes('analytics') || messageLower.includes('business')) {
    return 'business_intelligence';
  }
  if (messageLower.includes('add') || messageLower.includes('delete') || messageLower.includes('edit') || messageLower.includes('crud')) {
    return 'operations';
  }
  
  return null;
}

/**
 * Split response into chunks for streaming
 */
function splitIntoChunks(text: string, wordsPerChunk: number): string[] {
  const words = text.split(' ');
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    const chunk = words.slice(i, i + wordsPerChunk).join(' ');
    chunks.push(chunk + ' ');
  }
  
  return chunks;
}

/**
 * Specialized advice functions
 */
function getGradingAdvice(message: string): string {
  return "For accurate grading, examine cut proportions, color grade (D-Z), clarity inclusions, and precise carat weight. Consider certification from GIA, AGS, or similar reputable labs.";
}

function getPricingAdvice(message: string): string {
  return "current market trends suggest focusing on premium cuts with excellent grades. The Rapaport price list serves as a baseline, but adjust for market conditions, certification, and unique characteristics.";
}

function getInventoryAdvice(message: string): string {
  return "analyzing your portfolio for optimal turnover rates, diversifying across different price points, and maintaining balanced inventory of popular shapes and sizes.";
}

function getCustomerServiceAdvice(message: string): string {
  return "educating clients about diamond characteristics, providing detailed certificates, offering trade-in options, and maintaining long-term relationships through excellent service.";
}

function getBusinessInsights(message: string): string {
  return "your sales data indicates strong performance in certain categories. I recommend monitoring market trends, optimizing pricing strategies, and tracking customer preferences for better business decisions.";
}

function getOperationsAdvice(message: string): string {
  return "efficiently manage your diamond database with proper categorization, regular updates, and accurate record-keeping for optimal business operations.";
}

function getGeneralAdvice(message: string, agentType: string): string {
  const responses = [
    "I'm here to provide expert guidance on all aspects of your diamond business",
    "Let me help you navigate the diamond industry with professional expertise",
    "I can assist with comprehensive diamond consultation and specialized services",
    "My role is to ensure you make informed decisions in the diamond market"
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}
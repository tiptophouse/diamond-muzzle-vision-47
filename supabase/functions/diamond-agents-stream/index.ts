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

          // AI responses are already streamed in real-time
          // No additional processing needed since callLovableAI sends events directly

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
        details: error.message 
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
 * Generate diamond expert responses using Lovable AI Gateway
 * Streams real AI responses token-by-token
 */
async function generateDiamondExpertResponse(
  message: string,
  agentType: string,
  history: Array<any>,
  sendEvent: (event: AGUIEvent) => void
): Promise<string[]> {
  
  // Agent-specific system prompts
  const agentPrompts = {
    main: "You are a Diamond Consultant Coordinator for BrilliantBot, a Telegram-native diamond trading system. Provide comprehensive diamond consultation and route to specialists when needed. Keep responses professional, concise, and actionable.",
    grading: "You are a Certified Diamond Grading Expert specializing in 4Cs analysis (Cut, Color, Clarity, Carat), certificate verification (GIA, AGS), and quality assessment. Provide technical expertise with practical recommendations.",
    inventory: "You are an Inventory Management Expert providing portfolio analysis, stock optimization, turnover strategies, and investment guidance. Focus on data-driven insights for diamond dealers.",
    pricing: "You are a Diamond Pricing Expert with deep market knowledge. Provide valuations based on Rapaport, market trends, and competitive analysis. Help dealers optimize pricing strategies.",
    customer_service: "You are a Customer Service Expert specializing in personalized diamond recommendations and client education. Help dealers build relationships and close sales with expert guidance.",
    business_intelligence: "You are a Business Intelligence Expert providing daily insights, analytics dashboards, and strategic recommendations based on sales data, market trends, and competitive intelligence.",
    operations: "You are an Inventory Operations Expert handling diamond CRUD operations, data management, bulk uploads, and mobile-friendly workflows for Telegram Mini App users."
  };

  const systemPrompt = agentPrompts[agentType as keyof typeof agentPrompts] || agentPrompts.main;
  
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

  // Call Lovable AI Gateway with streaming
  const chunks = await callLovableAI(systemPrompt, message, history, sendEvent);
  return chunks;
}

/**
 * Call Lovable AI Gateway with streaming support
 */
async function callLovableAI(
  systemPrompt: string,
  userMessage: string,
  history: Array<any>,
  sendEvent: (event: AGUIEvent) => void
): Promise<string[]> {
  
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    console.error('❌ LOVABLE_API_KEY not configured');
    throw new Error('AI service not configured. Please contact support.');
  }

  // Build conversation messages
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    { role: 'user', content: userMessage }
  ];

  console.log('🤖 Calling Lovable AI Gateway with', messages.length, 'messages');

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error('AI service quota exceeded. Please contact support.');
      }
      const errorText = await response.text();
      console.error('❌ Lovable AI error:', response.status, errorText);
      throw new Error('AI service temporarily unavailable.');
    }

    if (!response.body) {
      throw new Error('No response body from AI service');
    }

    // Process streaming response
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const chunks: string[] = [];
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Keep the last incomplete line in buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          
          if (data === '[DONE]') {
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              chunks.push(content);
              
              // Send each token as it arrives
              sendEvent({
                type: 'message',
                data: { content: content },
                timestamp: new Date().toISOString()
              });
            }
          } catch (parseError) {
            // Skip invalid JSON lines
            console.warn('⚠️ Failed to parse SSE line:', line);
          }
        }
      }
    }

    console.log('✅ AI response complete:', chunks.length, 'chunks');
    return chunks;

  } catch (error) {
    console.error('❌ Lovable AI Gateway error:', error);
    throw error;
  }
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


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;
const backendUrl = Deno.env.get('BACKEND_URL');
const backendAccessToken = Deno.env.get('BACKEND_ACCESS_TOKEN');
const monitoredGroupId = '-1001009290613'; // The group to monitor

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GroupMessage {
  message_id: number;
  from: {
    id: number;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    title: string;
  };
  text: string;
  date: number;
}

interface DiamondRequest {
  shape?: string;
  carat_min?: number;
  carat_max?: number;
  color?: string;
  clarity?: string;
  price_max?: number;
  keywords: string[];
  confidence: number;
}

interface MarketInsight {
  request_summary: string;
  market_demand: string;
  price_trends: string;
  recommendations: string[];
  competitive_analysis: string;
  opportunity_score: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📊 Telegram Group Analyzer invoked');
    
    const { user_id } = await req.json();
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔍 Analyzing group messages for user:', user_id);

    // Get recent group messages
    const recentMessages = await getRecentGroupMessages();
    
    // Analyze diamond requests from messages
    const diamondRequests = await analyzeDiamondRequests(recentMessages);
    
    // Get user's inventory
    const userInventory = await getUserInventory(user_id);
    
    // Generate market insights with AI
    const marketInsights = await generateMarketInsights(diamondRequests, userInventory);
    
    // Find matching opportunities
    const matchingOpportunities = await findMatchingOpportunities(diamondRequests, userInventory);
    
    // Store analytics data
    await storeGroupAnalytics(user_id, diamondRequests, marketInsights, matchingOpportunities);

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          total_requests: diamondRequests.length,
          market_insights: marketInsights,
          matching_opportunities: matchingOpportunities,
          analysis_timestamp: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in telegram group analyzer:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getRecentGroupMessages(): Promise<GroupMessage[]> {
  try {
    // Get messages from the last 24 hours from our database
    const { data: messages, error } = await supabase
      .from('group_messages')
      .select('*')
      .eq('chat_id', monitoredGroupId)
      .gte('message_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('message_date', { ascending: false })
      .limit(100);

    if (error) {
      console.error('❌ Error fetching group messages:', error);
      return [];
    }

    return messages || [];
  } catch (error) {
    console.error('❌ Error in getRecentGroupMessages:', error);
    return [];
  }
}

async function analyzeDiamondRequests(messages: GroupMessage[]): Promise<DiamondRequest[]> {
  const diamondRequests: DiamondRequest[] = [];
  
  for (const message of messages) {
    if (!message.text) continue;
    
    const request = parseDiamondRequest(message.text);
    if (request.confidence > 0.3) {
      diamondRequests.push(request);
    }
  }
  
  return diamondRequests;
}

function parseDiamondRequest(text: string): DiamondRequest {
  const lowerText = text.toLowerCase();
  
  // Diamond shape detection
  const shapes = ['round', 'princess', 'cushion', 'emerald', 'oval', 'radiant', 'asscher', 'marquise', 'heart', 'pear'];
  const foundShape = shapes.find(shape => lowerText.includes(shape));
  
  // Carat weight detection
  const caratMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:ct|carat|carats)/);
  const caratRangeMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*[-to]\s*(\d+(?:\.\d+)?)\s*(?:ct|carat|carats)/);
  
  // Color detection
  const colors = ['d', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm'];
  const foundColor = colors.find(color => lowerText.includes(` ${color} `) || lowerText.includes(`${color}+`));
  
  // Clarity detection
  const clarities = ['fl', 'if', 'vvs1', 'vvs2', 'vs1', 'vs2', 'si1', 'si2', 'si3', 'i1', 'i2', 'i3'];
  const foundClarity = clarities.find(clarity => lowerText.includes(clarity));
  
  // Price detection
  const priceMatch = lowerText.match(/\$?(\d+(?:,\d{3})*(?:k|000)?)/);
  
  // Calculate confidence
  let confidence = 0;
  const keywords = [];
  
  if (foundShape) { confidence += 0.3; keywords.push(`shape:${foundShape}`); }
  if (caratMatch || caratRangeMatch) { confidence += 0.25; keywords.push('carat'); }
  if (foundColor) { confidence += 0.2; keywords.push(`color:${foundColor}`); }
  if (foundClarity) { confidence += 0.2; keywords.push(`clarity:${foundClarity}`); }
  if (priceMatch) { confidence += 0.15; keywords.push('price'); }
  
  const diamondKeywords = ['diamond', 'stone', 'brilliant', 'engagement', 'wedding', 'ring'];
  if (diamondKeywords.some(keyword => lowerText.includes(keyword))) {
    confidence += 0.1;
    keywords.push('diamond_context');
  }

  return {
    shape: foundShape,
    carat_min: caratRangeMatch ? parseFloat(caratRangeMatch[1]) : caratMatch ? parseFloat(caratMatch[1]) * 0.9 : undefined,
    carat_max: caratRangeMatch ? parseFloat(caratRangeMatch[2]) : caratMatch ? parseFloat(caratMatch[1]) * 1.1 : undefined,
    color: foundColor,
    clarity: foundClarity,
    price_max: priceMatch ? parsePrice(priceMatch[1]) : undefined,
    keywords,
    confidence
  };
}

function parsePrice(priceStr: string): number {
  const cleanPrice = priceStr.replace(/,/g, '');
  if (cleanPrice.endsWith('k')) {
    return parseFloat(cleanPrice.slice(0, -1)) * 1000;
  }
  return parseFloat(cleanPrice);
}

async function getUserInventory(userId: number): Promise<any[]> {
  if (!backendUrl || !backendAccessToken) {
    console.log('📱 Backend not configured');
    return [];
  }

  try {
    const inventoryUrl = `${backendUrl}/api/v1/get_all_stones?user_id=${userId}`;
    
    const response = await fetch(inventoryUrl, {
      headers: {
        'Authorization': `Bearer ${backendAccessToken}`,
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch user inventory:', response.status);
      return [];
    }

    const inventoryData = await response.json();
    return Array.isArray(inventoryData) ? inventoryData : inventoryData.data || [];
  } catch (error) {
    console.error('❌ Error fetching user inventory:', error);
    return [];
  }
}

async function generateMarketInsights(requests: DiamondRequest[], inventory: any[]): Promise<MarketInsight[]> {
  if (!openaiApiKey || requests.length === 0) {
    return [];
  }

  try {
    const requestSummary = requests.map(r => 
      `${r.shape || 'any'} ${r.carat_min ? r.carat_min + '-' + (r.carat_max || r.carat_min) : 'any'}ct ${r.color || 'any'} ${r.clarity || 'any'} ${r.price_max ? '$' + r.price_max : ''}`
    ).join(', ');

    const inventorySummary = inventory.map(item => 
      `${item.shape} ${item.weight}ct ${item.color} ${item.clarity} $${item.price_per_carat * item.weight}`
    ).join(', ');

    const prompt = `
    Analyze this diamond market data:
    
    Recent Group Requests: ${requestSummary}
    Your Inventory: ${inventorySummary}
    
    Provide insights on:
    1. Market demand trends
    2. Price opportunities
    3. Inventory gaps
    4. Competitive positioning
    5. Business recommendations
    
    Format as JSON with fields: request_summary, market_demand, price_trends, recommendations (array), competitive_analysis, opportunity_score (1-10).
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: 'You are a diamond market analyst providing business insights.' },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 1000,
      }),
    });

    const data = await response.json();
    const analysis = JSON.parse(data.choices[0].message.content);
    
    return [analysis];
  } catch (error) {
    console.error('❌ Error generating market insights:', error);
    return [];
  }
}

async function findMatchingOpportunities(requests: DiamondRequest[], inventory: any[]): Promise<any[]> {
  const opportunities = [];
  
  for (const request of requests) {
    const matches = inventory.filter(diamond => {
      let score = 0;
      
      if (request.shape && diamond.shape?.toLowerCase() === request.shape.toLowerCase()) score += 0.3;
      if (request.carat_min && diamond.weight >= request.carat_min) score += 0.15;
      if (request.carat_max && diamond.weight <= request.carat_max) score += 0.15;
      if (request.color && diamond.color?.toLowerCase() === request.color.toLowerCase()) score += 0.2;
      if (request.clarity && diamond.clarity?.toLowerCase() === request.clarity.toLowerCase()) score += 0.2;
      if (request.price_max && (diamond.price_per_carat * diamond.weight) <= request.price_max) score += 0.1;
      
      return score >= 0.3;
    });
    
    if (matches.length > 0) {
      opportunities.push({
        request: request,
        matching_diamonds: matches.slice(0, 3),
        match_score: matches.length > 0 ? Math.min(matches.length / 5, 1) : 0
      });
    }
  }
  
  return opportunities;
}

async function storeGroupAnalytics(userId: number, requests: DiamondRequest[], insights: MarketInsight[], opportunities: any[]) {
  try {
    const { error } = await supabase
      .from('group_analytics')
      .insert([{
        user_id: userId,
        analysis_date: new Date().toISOString(),
        total_requests: requests.length,
        matching_opportunities: opportunities.length,
        market_insights: insights,
        opportunities_data: opportunities,
        group_id: monitoredGroupId
      }]);

    if (error) {
      console.error('❌ Error storing group analytics:', error);
    } else {
      console.log('✅ Group analytics stored successfully');
    }
  } catch (error) {
    console.error('❌ Error in storeGroupAnalytics:', error);
  }
}

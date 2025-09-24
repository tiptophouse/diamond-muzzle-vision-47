import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { message, user_id, agent_type = 'operations', conversation_history = [] } = await req.json();
    
    console.log('🤖 Diamond Agents: Processing message:', { message, user_id, agent_type });
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Natural Language Processing for Diamond Operations
    const response = await processNaturalLanguage(message, user_id, supabase);
    
    return new Response(JSON.stringify({
      response,
      agent_used: agent_type,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Diamond Agents error:', error);
    return new Response(JSON.stringify({
      response: "I encountered an error processing your request. Please try again.",
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processNaturalLanguage(message: string, userId: string, supabase: any): Promise<string> {
  const lowerMessage = message.toLowerCase();
  
  // Delete operations
  if (lowerMessage.includes('delete') || lowerMessage.includes('remove')) {
    return await handleDeleteOperation(message, userId, supabase);
  }
  
  // Add operations
  if (lowerMessage.includes('add') || lowerMessage.includes('create') || lowerMessage.includes('new diamond')) {
    return await handleAddOperation(message, userId, supabase);
  }
  
  // Update operations
  if (lowerMessage.includes('update') || lowerMessage.includes('edit') || lowerMessage.includes('modify')) {
    return await handleUpdateOperation(message, userId, supabase);
  }
  
  // General diamond info
  return await handleGeneralQuery(message, userId, supabase);
}

async function handleDeleteOperation(message: string, userId: string, supabase: any): Promise<string> {
  const lowerMessage = message.toLowerCase();
  
  // Get user's diamonds first
  const { data: diamonds, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('price_per_carat', { ascending: false });
    
  if (error || !diamonds?.length) {
    return "I couldn't find any diamonds in your inventory to delete.";
  }
  
  let targetDiamond = null;
  let deleteReason = '';
  
  // Parse different delete patterns
  if (lowerMessage.includes('certificate number') || lowerMessage.includes('cert number')) {
    const certMatch = message.match(/\b\d{10,}\b/); // Look for long numbers (certificate numbers)
    if (certMatch) {
      const certNumber = parseInt(certMatch[0]);
      targetDiamond = diamonds.find(d => d.certificate_number === certNumber);
      deleteReason = `diamond with certificate number ${certNumber}`;
    }
  } else if (lowerMessage.includes('most expensive')) {
    targetDiamond = diamonds[0]; // Already sorted by price descending
    deleteReason = 'most expensive diamond';
  } else if (lowerMessage.includes('cheapest') || lowerMessage.includes('least expensive')) {
    targetDiamond = diamonds[diamonds.length - 1];
    deleteReason = 'cheapest diamond';
  } else if (lowerMessage.includes('stock number') || lowerMessage.includes('stock')) {
    const stockMatch = message.match(/stock\s+(?:number\s+)?(\w+)/i);
    if (stockMatch) {
      const stockNumber = stockMatch[1];
      targetDiamond = diamonds.find(d => d.stock_number.toLowerCase().includes(stockNumber.toLowerCase()));
      deleteReason = `diamond with stock number ${stockNumber}`;
    }
  } else if (lowerMessage.includes('round') || lowerMessage.includes('pear') || lowerMessage.includes('emerald') || lowerMessage.includes('princess')) {
    const shapeMatch = lowerMessage.match(/(round|pear|emerald|princess|radiant|cushion|oval|marquise|heart|asscher)/);
    if (shapeMatch) {
      const shape = shapeMatch[1];
      const shapeDiamonds = diamonds.filter(d => d.shape.toLowerCase().includes(shape));
      if (shapeDiamonds.length > 0) {
        targetDiamond = shapeDiamonds[0]; // Take first match
        deleteReason = `${shape} diamond`;
      }
    }
  }
  
  if (!targetDiamond) {
    return `I couldn't identify which diamond you want to delete. You have ${diamonds.length} diamonds. Please be more specific, for example:
- "Delete my most expensive diamond"
- "Delete diamond with certificate number 123456789"
- "Delete my round diamond"
- "Delete stock number ABC123"`;
  }
  
  // Delete the diamond
  const { error: deleteError } = await supabase
    .from('inventory')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', targetDiamond.id);
    
  if (deleteError) {
    console.error('Delete error:', deleteError);
    return `I encountered an error deleting the ${deleteReason}. Please try again.`;
  }
  
  return `✅ Successfully deleted the ${deleteReason}: ${targetDiamond.weight} carat ${targetDiamond.shape} ${targetDiamond.color} ${targetDiamond.clarity} (Stock: ${targetDiamond.stock_number}) worth $${(targetDiamond.price_per_carat * targetDiamond.weight).toLocaleString()}.`;
}

async function handleAddOperation(message: string, userId: string, supabase: any): Promise<string> {
  return `I can help you add diamonds to your inventory! To add a diamond, I need some basic information:
- Shape (round, pear, emerald, etc.)
- Weight in carats
- Color grade (D-Z)
- Clarity grade (FL, IF, VVS1, VVS2, etc.)
- Price per carat

For example: "Add a 1.5 carat round diamond, color F, clarity VS1, priced at $8000 per carat"

Would you like to provide these details for your new diamond?`;
}

async function handleUpdateOperation(message: string, userId: string, supabase: any): Promise<string> {
  return `I can help you update diamond information! Please specify:
1. Which diamond (by stock number, certificate number, or description)
2. What you want to update (price, status, etc.)

For example: "Update stock number ABC123 price to $9000 per carat"`;
}

async function handleGeneralQuery(message: string, userId: string, supabase: any): Promise<string> {
  // Get user's inventory summary
  const { data: diamonds, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null);
    
  if (error) {
    return "I'm having trouble accessing your inventory. Please try again.";
  }
  
  const count = diamonds?.length || 0;
  const totalValue = diamonds?.reduce((sum, d) => sum + (d.price_per_carat * d.weight), 0) || 0;
  
  if (count === 0) {
    return "You don't have any diamonds in your inventory yet. I can help you add, edit, or delete diamonds using natural language. Just tell me what you'd like to do!";
  }
  
  return `💎 Your Diamond Portfolio:
• ${count} diamonds in inventory
• Total value: $${totalValue.toLocaleString()}
• Average value: $${Math.round(totalValue / count).toLocaleString()}

I can help you:
• Add new diamonds: "Add a 2 carat round diamond"
• Delete diamonds: "Delete my most expensive diamond"
• Update diamonds: "Update stock ABC123 price to $10000"
• Get specific info: "Show me my round diamonds"

What would you like to do?`;
}
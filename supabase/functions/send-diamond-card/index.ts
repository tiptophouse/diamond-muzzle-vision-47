import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sendDiamondCard, DiamondCardData, DiamondCardOptions } from '../_shared/diamond-card-template.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendCardRequest {
  chatId: number;
  diamond: DiamondCardData;
  options?: DiamondCardOptions;
}

serve(async (req) => {
  console.log('📨 Send diamond card function invoked');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chatId, diamond, options }: SendCardRequest = await req.json();
    
    console.log('📥 Request:', { 
      chatId, 
      stockNumber: diamond.stockNumber,
      hasOptions: !!options 
    });

    if (!chatId || !diamond) {
      console.error('❌ Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing chatId or diamond data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send the diamond card
    const result = await sendDiamondCard(chatId, diamond, options);

    if (result.success) {
      console.log('✅ Diamond card sent successfully:', result.messageId);
      return new Response(
        JSON.stringify({
          success: true,
          messageId: result.messageId,
          message: 'Diamond card sent successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      console.error('❌ Failed to send diamond card:', result.error);
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error || 'Failed to send diamond card'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

  } catch (error) {
    console.error('❌ Send diamond card error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Failed to send diamond card'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

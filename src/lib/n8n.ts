import { supabase } from '@/integrations/supabase/client';

export interface N8NResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Call n8n workflow via Supabase edge function
 */
export async function callN8NWorkflow<T = any>(
  action: 'auction_create' | 'auction_bid' | 'diamond_ai',
  payload: Record<string, any>
): Promise<N8NResponse<T>> {
  try {
    console.log('🔧 Calling n8n workflow:', { action, payload });

    const { data, error } = await supabase.functions.invoke('call-n8n-workflow', {
      body: {
        action,
        ...payload,
      },
    });

    if (error) {
      console.error('❌ n8n workflow error:', error);
      return {
        success: false,
        error: error.message || 'Failed to execute workflow',
      };
    }

    console.log('✅ n8n workflow success:', data);
    return data as N8NResponse<T>;
  } catch (error) {
    console.error('💥 n8n workflow exception:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

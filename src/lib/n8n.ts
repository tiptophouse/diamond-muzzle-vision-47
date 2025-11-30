import { supabase } from '@/integrations/supabase/client';

export interface N8NResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: Record<string, any>;
}

export interface DiamondAIRequest {
  searchText: string;
  telegramId: number;
}

const N8N_WEBHOOK_URL = 'https://n8nlo.app.n8n.cloud/webhook/ae74c72e-bb87-4235-a5a8-392b0c3ea291';

/**
 * Call n8n AI Diamond Concierge workflow directly via webhook
 */
export async function callDiamondAI(request: DiamondAIRequest): Promise<N8NResponse> {
  try {
    console.log('🤖 Calling Diamond AI Concierge:', request);

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Diamond AI response:', data);
    
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('❌ Diamond AI error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to call Diamond AI',
    };
  }
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

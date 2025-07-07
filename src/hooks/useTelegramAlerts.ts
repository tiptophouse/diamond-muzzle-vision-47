import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export interface AlertData {
  type: 'inventory' | 'sale' | 'system' | 'price_change' | 'low_stock';
  message: string;
  telegram_id?: number;
  group_id?: number;
  bot_type?: 'main' | 'clients' | 'sellers';
  data?: {
    diamond?: any;
    user?: any;
    stats?: Record<string, any>;
  };
}

export function useTelegramAlerts() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const sendAlert = async (alertData: AlertData): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log('📱 Sending Telegram alert:', alertData);

      // If no telegram_id provided, use current user's ID
      if (!alertData.telegram_id && !alertData.group_id && user?.id) {
        alertData.telegram_id = user.id;
      }

      const { data, error } = await supabase.functions.invoke('telegram-alerts', {
        body: alertData
      });

      if (error) {
        console.error('❌ Error sending alert:', error);
        toast({
          title: "❌ Alert Failed",
          description: `Failed to send Telegram alert: ${error.message}`,
          variant: "destructive",
        });
        return false;
      }

      if (data?.success) {
        console.log('✅ Alert sent successfully');
        toast({
          title: "📱 Alert Sent",
          description: "Telegram notification sent successfully",
        });
        return true;
      } else {
        console.error('❌ Alert failed:', data?.error);
        toast({
          title: "❌ Alert Failed",
          description: data?.error || "Failed to send alert",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending Telegram alert:', error);
      toast({
        title: "❌ Alert Error",
        description: "An error occurred while sending the alert",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Predefined alert templates
  const sendInventoryAlert = (action: 'added' | 'updated' | 'deleted', diamond: any) => {
    const messages = {
      added: `New diamond added to inventory! 💎`,
      updated: `Diamond inventory updated! 📝`,
      deleted: `Diamond removed from inventory! 🗑️`
    };

    return sendAlert({
      type: 'inventory',
      message: messages[action],
      data: { diamond }
    });
  };

  const sendSaleAlert = (diamond: any, buyerInfo?: any) => {
    return sendAlert({
      type: 'sale',
      message: `Diamond sold! 🎉`,
      data: { 
        diamond,
        user: buyerInfo 
      }
    });
  };

  const sendPriceChangeAlert = (diamond: any, oldPrice: number, newPrice: number) => {
    const change = newPrice > oldPrice ? 'increased' : 'decreased';
    const percentage = Math.abs(((newPrice - oldPrice) / oldPrice) * 100).toFixed(1);
    
    return sendAlert({
      type: 'price_change',
      message: `Price ${change} by ${percentage}%! 💹`,
      data: { 
        diamond,
        stats: {
          'Old Price': `$${oldPrice}/ct`,
          'New Price': `$${newPrice}/ct`,
          'Change': `${change === 'increased' ? '+' : '-'}${percentage}%`
        }
      }
    });
  };

  const sendLowStockAlert = (totalDiamonds: number, threshold: number = 10) => {
    return sendAlert({
      type: 'low_stock',
      message: `Low inventory warning! Only ${totalDiamonds} diamonds remaining.`,
      data: {
        stats: {
          'Current Inventory': totalDiamonds,
          'Threshold': threshold,
          'Status': 'Below Threshold'
        }
      }
    });
  };

  const sendSystemAlert = (message: string, additionalData?: any) => {
    return sendAlert({
      type: 'system',
      message,
      data: additionalData
    });
  };

  const sendToGroup = (groupId: number, alertData: Omit<AlertData, 'group_id'>) => {
    return sendAlert({
      ...alertData,
      group_id: groupId
    });
  };

  return {
    sendAlert,
    sendInventoryAlert,
    sendSaleAlert,
    sendPriceChangeAlert,
    sendLowStockAlert,
    sendSystemAlert,
    sendToGroup,
    isLoading,
  };
}
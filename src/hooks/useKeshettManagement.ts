import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Diamond } from '@/components/inventory/InventoryTable';

export interface KeshettAgreement {
  id: string;
  diamond_stock_number: string;
  diamond_data: any;
  seller_telegram_id: number;
  buyer_telegram_id: number;
  agreed_price: number;
  terms: any;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'expired';
  created_at: string;
  accepted_at?: string;
  completed_at?: string;
  expiry_at: string;
  notes?: string;
  updated_at: string;
}

export interface CreateKeshettData {
  buyer_telegram_id: number;
  agreed_price: number;
  expiry_hours: number;
  terms?: any;
  notes?: string;
}

export function useKeshettManagement() {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [isLoading, setIsLoading] = useState(false);

  const createKeshett = async (diamond: Diamond, data: CreateKeshettData): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + data.expiry_hours);

      const { error } = await supabase
        .from('keshett_agreements')
        .insert({
          diamond_stock_number: diamond.stockNumber,
          diamond_data: JSON.parse(JSON.stringify(diamond)),
          seller_telegram_id: user.id,
          buyer_telegram_id: data.buyer_telegram_id,
          agreed_price: data.agreed_price,
          terms: data.terms || {},
          expiry_at: expiryDate.toISOString(),
          notes: data.notes,
        });

      if (error) {
        console.error('❌ KESHETT: Create failed:', error);
        toast({
          title: "Error",
          description: "Failed to create Keshett agreement",
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ KESHETT: Agreement created successfully');
      toast({
        title: "Success",
        description: "Keshett agreement created successfully",
      });
      return true;
    } catch (error) {
      console.error('❌ KESHETT: Unexpected error:', error);
      toast({
        title: "Error",
        description: "Failed to create Keshett agreement",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const acceptKeshett = async (agreementId: string): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('keshett_agreements')
        .update({
          status: 'active',
          accepted_at: new Date().toISOString(),
        })
        .eq('id', agreementId)
        .eq('buyer_telegram_id', user.id);

      if (error) {
        console.error('❌ KESHETT: Accept failed:', error);
        toast({
          title: "Error",
          description: "Failed to accept Keshett agreement",
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ KESHETT: Agreement accepted successfully');
      toast({
        title: "Success",
        description: "Keshett agreement accepted",
      });
      return true;
    } catch (error) {
      console.error('❌ KESHETT: Unexpected error:', error);
      toast({
        title: "Error",
        description: "Failed to accept Keshett agreement",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const completeMazal = async (agreementId: string): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('keshett_agreements')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', agreementId)
        .or(`seller_telegram_id.eq.${user.id},buyer_telegram_id.eq.${user.id}`);

      if (error) {
        console.error('❌ KESHETT: Mazal completion failed:', error);
        toast({
          title: "Error",
          description: "Failed to complete Mazal",
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ KESHETT: Mazal completed successfully');
      toast({
        title: "Mazal! 🎉",
        description: "Keshett agreement completed successfully",
      });
      return true;
    } catch (error) {
      console.error('❌ KESHETT: Unexpected error:', error);
      toast({
        title: "Error",
        description: "Failed to complete Mazal",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelKeshett = async (agreementId: string): Promise<boolean> => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('keshett_agreements')
        .update({
          status: 'cancelled',
        })
        .eq('id', agreementId)
        .eq('seller_telegram_id', user.id);

      if (error) {
        console.error('❌ KESHETT: Cancel failed:', error);
        toast({
          title: "Error",
          description: "Failed to cancel Keshett agreement",
          variant: "destructive",
        });
        return false;
      }

      console.log('✅ KESHETT: Agreement cancelled successfully');
      toast({
        title: "Success",
        description: "Keshett agreement cancelled",
      });
      return true;
    } catch (error) {
      console.error('❌ KESHETT: Unexpected error:', error);
      toast({
        title: "Error",
        description: "Failed to cancel Keshett agreement",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getKeshettAgreements = async (): Promise<KeshettAgreement[]> => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase
        .from('keshett_agreements')
        .select('*')
        .or(`seller_telegram_id.eq.${user.id},buyer_telegram_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ KESHETT: Fetch failed:', error);
        return [];
      }

      return (data || []) as KeshettAgreement[];
    } catch (error) {
      console.error('❌ KESHETT: Unexpected error:', error);
      return [];
    }
  };

  return {
    createKeshett,
    acceptKeshett,
    completeMazal,
    cancelKeshett,
    getKeshettAgreements,
    isLoading,
  };
}
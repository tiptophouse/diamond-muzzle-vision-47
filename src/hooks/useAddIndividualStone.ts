
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface StoneData {
  stockNumber: string;
  shape: string;
  weight: number;
  color: string;
  clarity: string;
  cut?: string;
  polish?: string;
  symmetry?: string;
  pricePerCarat: number;
  status?: string;
  picture?: string;
  certificateUrl?: string;
}

export function useAddIndividualStone() {
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const addStone = async (stoneData: StoneData) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User authentication required",
        variant: "destructive"
      });
      return false;
    }

    setIsAdding(true);

    try {
      // Call the database function to add the diamond
      const { data, error } = await supabase.rpc('add_diamond_for_user', {
        p_user_id: user.id,
        p_stock_number: stoneData.stockNumber,
        p_shape: stoneData.shape,
        p_weight: stoneData.weight,
        p_color: stoneData.color,
        p_clarity: stoneData.clarity,
        p_cut: stoneData.cut || 'Unknown',
        p_polish: stoneData.polish || 'Unknown',
        p_symmetry: stoneData.symmetry || 'Unknown',
        p_price_per_carat: stoneData.pricePerCarat,
        p_status: stoneData.status || 'Available',
        p_picture: stoneData.picture || '',
        p_certificate_url: stoneData.certificateUrl || ''
      });

      if (error) {
        console.error('Error adding stone:', error);
        toast({
          title: "Add Failed",
          description: error.message || "Failed to add diamond",
          variant: "destructive"
        });
        return false;
      }

      if (data) {
        toast({
          title: "Success",
          description: `Diamond ${stoneData.stockNumber} has been added successfully`,
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to add diamond - no data returned",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Unexpected error adding stone:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding the diamond",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  return {
    addStone,
    isAdding
  };
}

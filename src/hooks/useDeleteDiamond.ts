
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export function useDeleteDiamond() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const deleteDiamond = async (stockNumber: string) => {
    if (!user?.id || !stockNumber) {
      toast({
        title: "Error",
        description: "Missing user information or stock number",
        variant: "destructive"
      });
      return false;
    }

    setIsDeleting(true);

    try {
      // Call the database function to delete the diamond
      const { data, error } = await supabase.rpc('delete_diamond_by_stock', {
        p_stock_number: stockNumber,
        p_user_id: user.id
      });

      if (error) {
        console.error('Error deleting diamond:', error);
        toast({
          title: "Delete Failed",
          description: error.message || "Failed to delete diamond",
          variant: "destructive"
        });
        return false;
      }

      if (data) {
        toast({
          title: "Success",
          description: `Diamond ${stockNumber} has been deleted successfully`,
        });
        return true;
      } else {
        toast({
          title: "Not Found",
          description: `Diamond ${stockNumber} was not found or already deleted`,
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Unexpected error deleting diamond:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the diamond",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteDiamond,
    isDeleting
  };
}

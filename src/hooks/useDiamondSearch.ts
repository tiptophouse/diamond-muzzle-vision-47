import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DiamondSearchCriteria {
  shape?: string;
  color?: string;
  clarity?: string;
  weight_min?: number;
  weight_max?: number;
  price_min?: number;
  price_max?: number;
  cut?: string;
  polish?: string;
  symmetry?: string;
  fluorescence?: string;
}

export interface DiamondSearchResult {
  totalMatches: number;
  ownersNotified: number;
  notifications: number;
  message: string;
}

export function useDiamondSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchDiamonds = async (
    searchCriteria: DiamondSearchCriteria,
    searcherTelegramId: number,
    searcherName?: string
  ): Promise<DiamondSearchResult | null> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('diamond-search-match', {
        body: {
          searchCriteria,
          searcherTelegramId,
          searcherName
        }
      });

      if (error) {
        console.error('Error in diamond search:', error);
        toast({
          title: "שגיאה בחיפוש",
          description: "לא הצלחנו לבצע חיפוש יהלומים. נסה שוב מאוחר יותר.",
          variant: "destructive"
        });
        return null;
      }

      if (data?.totalMatches > 0) {
        toast({
          title: "🔍 חיפוש הושלם בהצלחה",
          description: `נמצאו ${data.totalMatches} יהלומים מתאימים. ${data.ownersNotified} בעלי יהלומים קיבלו התראה.`,
        });
      } else {
        toast({
          title: "לא נמצאו התאמות",
          description: "לא נמצאו יהלומים התואמים לקריטריוני החיפוש שלך.",
        });
      }

      return data;
    } catch (error) {
      console.error('Error searching diamonds:', error);
      toast({
        title: "שגיאה בחיפוש",
        description: "אירעה שגיאה בעת חיפוש יהלומים. נסה שוב מאוחר יותר.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to simulate a search from Telegram bot (for testing)
  const simulateSearchFromBot = async (
    searchCriteria: DiamondSearchCriteria,
    searcherTelegramId: number = 123456789,
    searcherName: string = "Test User"
  ) => {
    return await searchDiamonds(searchCriteria, searcherTelegramId, searcherName);
  };

  return {
    searchDiamonds,
    simulateSearchFromBot,
    isLoading
  };
}
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useInventoryCrud } from '@/hooks/useInventoryCrud';
import { DiamondFormData } from '@/components/inventory/form/types';
import { useFormValidation } from '@/components/upload/form/useFormValidation';

interface UseStoneFormSubmitProps {
  showCutField: boolean;
  onSuccess?: () => void;
  onApiStatusChange?: (connected: boolean) => void;
}

export function useStoneFormSubmit({ 
  showCutField, 
  onSuccess,
  onApiStatusChange 
}: UseStoneFormSubmitProps) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const { validateFormData, formatFormData } = useFormValidation();
  const { addDiamond, isLoading } = useInventoryCrud({ onSuccess });

  const submitForm = useCallback(async (data: DiamondFormData) => {
    // Check authentication
    if (!user?.id) {
      toast({
        title: "שגיאת הזדהות",
        description: "אנא התחבר כדי להוסיף יהלומים",
        variant: "destructive",
      });
      return false;
    }

    // Validate form data
    if (!validateFormData(data)) {
      toast({
        title: "שגיאת ולידציה",
        description: "אנא מלא את כל השדות הנדרשים",
        variant: "destructive",
      });
      return false;
    }

    // Format and submit
    const formattedData = formatFormData(data, showCutField);
    
    try {
      const success = await addDiamond(formattedData);
      
      if (!success) {
        onApiStatusChange?.(false);
        toast({
          title: "❌ העלאה נכשלה",
          description: "לא הצלחנו להוסיף את היהלום. אנא נסה שוב.",
          variant: "destructive",
        });
        return false;
      }
      
      onApiStatusChange?.(true);
      toast({
        title: "✅ יהלום נוסף בהצלחה!",
        description: "היהלום נוסף ל-Dashboard, Store ו-Inventory שלך",
        duration: 5000,
      });
      
      return true;
    } catch (error) {
      onApiStatusChange?.(false);
      toast({
        title: "❌ שגיאה בהעלאה",
        description: "אירעה שגיאה בהעלאה. אנא נסה שוב.",
        variant: "destructive",
      });
      return false;
    }
  }, [user?.id, validateFormData, formatFormData, showCutField, addDiamond, toast, onApiStatusChange]);

  return {
    submitForm,
    isLoading
  };
}

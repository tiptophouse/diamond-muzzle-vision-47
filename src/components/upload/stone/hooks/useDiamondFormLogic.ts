import { useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { validateDiamondForm, DiamondFormValues } from '../DiamondFormSchema';
import { useAddDiamond } from '@/hooks/inventory/useAddDiamond';
import { DiamondFormData } from '@/components/inventory/form/types';

interface UseDiamondFormLogicProps {
  form: UseFormReturn<DiamondFormData>;
  onSuccess?: () => void;
}

/**
 * Custom hook for diamond form submission logic
 * Handles validation, API calls, and success/error states
 */
export function useDiamondFormLogic({ form, onSuccess }: UseDiamondFormLogicProps) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const { addDiamond } = useAddDiamond(() => {
    setUploadSuccess(true);
    onSuccess?.();
  });

  /**
   * Handle form submission with validation
   */
  const handleSubmit = useCallback(async (data: DiamondFormData) => {
    // Prevent double submission
    if (isSubmitting) {
      console.log('⚠️ Form already submitting, ignoring duplicate request');
      return;
    }

    // Check authentication
    if (!user?.id) {
      toast({
        variant: 'destructive',
        title: '❌ Authentication Required',
        description: 'אנא התחבר כדי להוסיף יהלומים',
      });
      return;
    }

    setIsSubmitting(true);
    console.log('📝 Starting diamond form submission:', data.stockNumber);

    try {
      // Validate with Zod schema
      const validation = validateDiamondForm(data);
      
      if (!validation.success) {
        const errorMessage = validation.error.errors[0]?.message || 'שגיאת אימות';
        console.error('❌ Validation failed:', validation.error.errors);
        
        toast({
          variant: 'destructive',
          title: '❌ שגיאת אימות',
          description: errorMessage,
        });
        
        setIsSubmitting(false);
        return;
      }

      // Submit to API
      console.log('✅ Validation passed, submitting to API...');
      const success = await addDiamond(data);

      if (success) {
        console.log('✅ Diamond added successfully');
        // Success state will be set by onSuccess callback
      } else {
        console.error('❌ Diamond addition failed');
      }
    } catch (error) {
      console.error('❌ Form submission error:', error);
      toast({
        variant: 'destructive',
        title: '❌ שגיאה',
        description: error instanceof Error ? error.message : 'שגיאה בהוספת יהלום',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, user, addDiamond, toast]);

  /**
   * Reset form to initial state
   */
  const handleReset = useCallback(() => {
    form.reset();
    setUploadSuccess(false);
    console.log('🔄 Form reset to defaults');
  }, [form]);

  return {
    isSubmitting,
    uploadSuccess,
    setUploadSuccess,
    handleSubmit,
    handleReset,
  };
}

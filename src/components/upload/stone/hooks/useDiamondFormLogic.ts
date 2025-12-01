import { useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useCreateDiamond } from '@/hooks/api/useDiamonds';
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
  
  const createDiamond = useCreateDiamond();

  /**
   * Handle form submission with validation
   */
  const handleSubmit = useCallback(async (data: DiamondFormData) => {
    if (isSubmitting || createDiamond.isPending) {
      console.log('⚠️ Form already submitting, ignoring duplicate request');
      return;
    }

    if (!user?.id) {
      console.error('❌ FORM: User not authenticated');
      toast({
        variant: 'destructive',
        title: '❌ Authentication Required',
        description: 'Please refresh the app to re-authenticate',
      });
      return;
    }

    setIsSubmitting(true);
    console.log('🔵 FORM: Starting diamond form submission');
    console.log('🔵 FORM: Stock Number:', data.stockNumber);
    console.log('🔵 FORM: User ID:', user.id);

    try {
      console.log('🚀 Submitting diamond to FastAPI:', {
        stockNumber: data.stockNumber,
        userId: user.id,
        shape: data.shape,
        carat: data.carat
      });
      
      await createDiamond.mutateAsync({ 
        data, 
        userId: user.id 
      });
      
      console.log('✅ Diamond added successfully via FastAPI');
      setUploadSuccess(true);
      onSuccess?.();
    } catch (error: any) {
      console.error('❌ Form submission error:', error);
      console.error('❌ Error details:', {
        message: error?.message,
        status: error?.status,
        response: error?.response
      });
      
      // Show user-friendly error
      toast({
        title: '❌ שגיאה בהוספת יהלום',
        description: error?.message || 'נסה שוב או פנה לתמיכה',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, createDiamond, user, toast, onSuccess]);

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

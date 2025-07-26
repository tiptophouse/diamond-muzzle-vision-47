import React from 'react';
import { Plus, Loader2, Camera } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { DiamondDetailsSection } from './form/DiamondDetailsSection';
import { MeasurementsSection } from './form/MeasurementsSection';
import { CertificateSection } from './form/CertificateSection';
import { DetailedGradingSection } from './form/DetailedGradingSection';
import { BusinessInfoSection } from './form/BusinessInfoSection';
import { ManualInputSection } from './form/ManualInputSection';
import { DiamondFormData, diamondFormSchema } from '@/components/inventory/form/types';
import { useWizardInteraction } from '@/hooks/useWizardInteraction';

interface SingleStoneUploadFormProps {
  initialData?: Partial<DiamondFormData> | null;
  showScanButton?: boolean;
  onSuccess?: () => void;
}

export function SingleStoneUploadForm({ 
  initialData, 
  showScanButton = true, 
  onSuccess 
}: SingleStoneUploadFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hapticFeedback } = useTelegramWebApp();
  const { language } = useTelegramWebApp();

  const form = useForm<DiamondFormData>({
    resolver: zodResolver(diamondFormSchema),
    defaultValues: {
      shape: 'Round',
      color: 'G',
      clarity: 'VS1',
      cut: 'Excellent',
      polish: 'Excellent',
      symmetry: 'Excellent',
      fluorescence: 'None',
      status: 'Available',
      storeVisible: true,
      lab: 'GIA',
      gridle: 'Medium',
      culet: 'None',
      ...initialData,
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = form;

  const onSubmit = async (data: DiamondFormData) => {
    hapticFeedback.notification('success');
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log('Form Data Submitted:', data);
    
    toast({
      title: language === 'he' ? 'היהלום נוסף בהצלחה!' : 'Diamond Added Successfully!',
      description: language === 'he' ? 'הנתונים שלך נשמרו' : 'Your data has been saved',
    });
    
    onSuccess?.();
    navigate('/inventory');
  };
  
  // Add wizard interaction
  useWizardInteraction('submit-diamond-button', 'form');

  return (
    <div className="space-y-6 pb-safe">
      {showScanButton && (
        <div className="text-center">
          <Button
            onClick={() => navigate('/upload')}
            size="lg"
            className="scan-certificate-button bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg active:scale-95 transition-all"
            style={{ minHeight: '48px' }}
          >
            <Camera className="mr-2 h-4 w-4" />
            {language === 'he' ? 'סרוק תעודה שוב' : 'Scan Certificate Again'}
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <DiamondDetailsSection
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
        />

        <MeasurementsSection
          register={register}
          watch={watch}
          errors={errors}
        />

        <CertificateSection
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
        />

        <DetailedGradingSection
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
        />

        <BusinessInfoSection
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
        />

        <ManualInputSection
          register={register}
          setValue={setValue}
          watch={watch}
          errors={errors}
        />

        {/* Form Actions */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t pt-4 pb-safe">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="submit-diamond-button w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold disabled:opacity-50"
            style={{ minHeight: '48px' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {language === 'he' ? 'מעלה...' : 'Uploading...'}
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                {language === 'he' ? 'הוסף יהלום' : 'Add Diamond'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

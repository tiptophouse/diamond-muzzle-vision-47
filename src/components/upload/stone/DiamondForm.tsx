import React, { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Camera, AlertCircle, RefreshCw, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { QRCodeScanner } from '@/components/inventory/QRCodeScanner';
import { UploadSuccessCard } from '../UploadSuccessCard';
import { DiamondFormData } from '@/components/inventory/form/types';
import { FormActions } from '../form/FormActions';
import { ApiStatusIndicator } from '@/components/ui/ApiStatusIndicator';
import { ApiTestButton } from '@/components/ui/ApiTestButton';
import { useDiamondFormLogic } from './hooks/useDiamondFormLogic';
import { mapGiaDataToForm } from '@/utils/diamond/giaDataMapper';

// Refactored form sections
import { BasicInfoSection } from './sections/BasicInfoSection';
import { GradingSection } from './sections/GradingSection';
import { MeasurementsFormSection } from './sections/MeasurementsFormSection';
import { CertificateFormSection } from './sections/CertificateFormSection';
import { PricingSection } from './sections/PricingSection';
import { MediaSection } from './sections/MediaSection';

interface DiamondFormProps {
  initialData?: any;
  showScanButton?: boolean;
  onSuccess?: () => void;
}

/**
 * Get default form values with proper typing
 */
const getDefaultValues = (initialData?: any): DiamondFormData => {
  const defaults: DiamondFormData = {
    stockNumber: '',
    carat: 1,
    price: 0,
    status: 'Available',
    picture: '',
    shape: 'Round',
    color: 'G',
    clarity: 'VS1',
    cut: 'Excellent',
    fluorescence: 'None',
    polish: 'Excellent',
    symmetry: 'Excellent',
    lab: 'GIA',
    gridle: 'Medium',
    culet: 'None',
    storeVisible: true
  };

  if (!initialData) return defaults;

  return {
    ...defaults,
    stockNumber: initialData.stock || defaults.stockNumber,
    shape: initialData.shape || defaults.shape,
    carat: Number(initialData.weight) || defaults.carat,
    color: initialData.color || defaults.color,
    clarity: initialData.clarity || defaults.clarity,
    cut: initialData.cut || defaults.cut,
    certificateNumber: initialData.certificate_number?.toString() || '',
    lab: initialData.lab || defaults.lab,
    fluorescence: initialData.fluorescence || defaults.fluorescence,
    polish: initialData.polish || defaults.polish,
    symmetry: initialData.symmetry || defaults.symmetry,
    gridle: initialData.gridle || defaults.gridle,
    culet: initialData.culet || defaults.culet,
    length: Number(initialData.length) || undefined,
    width: Number(initialData.width) || undefined,
    depth: Number(initialData.depth) || undefined,
    ratio: Number(initialData.ratio) || undefined,
    tablePercentage: Number(initialData.table_percentage) || undefined,
    depthPercentage: Number(initialData.depth_percentage) || undefined,
    pricePerCarat: Number(initialData.price_per_carat) || undefined,
    rapnet: Number(initialData.rapnet) || undefined,
    picture: initialData.picture || defaults.picture,
    certificateUrl: initialData.certificate_url || initialData.certificateUrl || '',
    certificateComment: initialData.certificate_comment || ''
  };
};

/**
 * Main diamond form component (refactored)
 * Cleaner architecture with separated sections and validation
 */
export function DiamondForm({ 
  initialData, 
  showScanButton = true, 
  onSuccess 
}: DiamondFormProps) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [apiConnected, setApiConnected] = useState(true);

  const defaultValues = useMemo(() => getDefaultValues(initialData), [initialData]);

  const form = useForm<DiamondFormData>({
    defaultValues
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = form;

  const { 
    isSubmitting, 
    uploadSuccess,
    uploadError,
    setUploadSuccess,
    setUploadError,
    handleSubmit: submitForm,
    handleReset 
  } = useDiamondFormLogic({
    form,
    onSuccess
  });

  const handleGiaScanSuccess = useCallback((giaData: any) => {
    mapGiaDataToForm(giaData, setValue);
    setIsScanning(false);
    toast({
      title: "✅ תעודה נסרקה בהצלחה",
      description: "כל פרטי היהלום הוזנו אוטומטית ותמונת התעודה הועלתה",
    });
  }, [setValue, toast]);

  const onFormSubmit = useCallback(async (data: DiamondFormData) => {
    await submitForm(data);
    
    // Reset form after successful submission
    if (uploadSuccess) {
      setTimeout(() => {
        reset(defaultValues);
        setUploadSuccess(false);
      }, 4000);
    }
  }, [submitForm, uploadSuccess, reset, defaultValues, setUploadSuccess]);

  // Success screen
  if (uploadSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <UploadSuccessCard
          title="יהלום הועלה בהצלחה"
          description="היהלום נוסף למלאי שלך. אפשר להמשיך ולהוסיף עוד יהלומים."
          onContinue={() => {
            setUploadSuccess(false);
            handleReset();
          }}
          onShare={() => {
            toast({
              title: "✨ מוכן לשיתוף",
              description: "היהלום שלך מופיע כעת בחנות",
            });
          }}
        />
      </div>
    );
  }

  // Login required
  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">אנא התחבר כדי להוסיף יהלומים למלאי שלך.</p>
        </CardContent>
      </Card>
    );
  }

  // Main form
  return (
    <>
      <div className="space-y-3">
        {/* Error Alert */}
        {uploadError && (
          <Alert variant="destructive" className="border-2">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-bold">שגיאה בהעלאת יהלום</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-3">{uploadError}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setUploadError(null);
                    form.handleSubmit(onFormSubmit)();
                  }}
                  className="bg-background hover:bg-accent"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  נסה שוב
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setUploadError(null)}
                >
                  <X className="h-4 w-4 mr-2" />
                  סגור
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {showScanButton && (
          <Card className="border-primary/20">
            <CardContent className="p-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsScanning(true)}
                className="w-full h-11 text-sm active:scale-95 transition-transform"
              >
                <Camera className="h-4 w-4 mr-2" />
                סריקת תעודה
              </Button>
            </CardContent>
          </Card>
        )}

        <ApiTestButton />
        <ApiStatusIndicator isConnected={apiConnected} className="mb-2" />
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col">
          <div className="space-y-4">
            {/* Basic Information */}
            <BasicInfoSection
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
            />

            {/* Grading Details */}
            <div className="border-t border-border/20 pt-4">
              <GradingSection
                setValue={setValue}
                watch={watch}
              />
            </div>

            {/* Physical Measurements */}
            <div className="border-t border-border/20 pt-4">
              <MeasurementsFormSection
                register={register}
                watch={watch}
                errors={errors}
              />
            </div>

            {/* Certificate Information */}
            <div className="border-t border-border/20 pt-4">
              <CertificateFormSection
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
              />
            </div>

            {/* Business / Pricing */}
            <div className="border-t border-border/20 pt-4">
              <PricingSection
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
              />
            </div>

            {/* Media Uploads */}
            <div className="border-t border-border/20 pt-4">
              <MediaSection
                setValue={setValue}
                watch={watch}
                onGiaDataExtracted={handleGiaScanSuccess}
              />
            </div>

            <div className="h-20"></div>
          </div>

          {/* Fixed bottom actions */}
          <div className="sticky bottom-0 bg-background border-t border-border/20 safe-area-inset-bottom z-10">
            <div data-tutorial="submit-diamond">
              <FormActions
                onReset={handleReset}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        </form>
      </div>

      {/* QR Scanner Modal */}
      {showScanButton && (
        <QRCodeScanner
          isOpen={isScanning}
          onClose={() => setIsScanning(false)}
          onScanSuccess={handleGiaScanSuccess}
        />
      )}
    </>
  );
}

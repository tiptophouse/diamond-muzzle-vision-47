import { useState, useCallback, useMemo } from "react";
import { useForm } from 'react-hook-form';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { QRCodeScanner } from "@/components/inventory/QRCodeScanner";
import { UploadSuccessCard } from "./UploadSuccessCard";
import { DiamondFormData } from '@/components/inventory/form/types';
import { DiamondDetailsSection } from './form/DiamondDetailsSection';
import { CertificateSection } from './form/CertificateSection';
import { MeasurementsSection } from './form/MeasurementsSection';
import { BusinessInfoSection } from './form/BusinessInfoSection';
import { ImageUploadSection } from './form/ImageUploadSection';
import { FormActions } from './form/FormActions';
import { ApiStatusIndicator } from '@/components/ui/ApiStatusIndicator';
import { ApiTestButton } from '@/components/ui/ApiTestButton';
import { useStoneFormSubmit } from '@/hooks/upload/useStoneFormSubmit';
import { mapGiaDataToForm } from '@/utils/diamond/giaDataMapper';

interface StoneFormContainerProps {
  initialData?: any;
  showScanButton?: boolean;
  onSuccess?: () => void;
}

const getDefaultValues = (initialData?: any): DiamondFormData => {
  const defaults = {
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

export function StoneFormContainer({ 
  initialData, 
  showScanButton = true, 
  onSuccess 
}: StoneFormContainerProps) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [apiConnected, setApiConnected] = useState(true);

  const defaultValues = useMemo(() => getDefaultValues(initialData), [initialData]);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<DiamondFormData>({
    defaultValues
  });

  const currentShape = watch('shape');
  const showCutField = currentShape === 'Round';

  const { submitForm, isLoading } = useStoneFormSubmit({
    showCutField,
    onSuccess: () => {
      setUploadSuccess(true);
      onSuccess?.();
    },
    onApiStatusChange: setApiConnected
  });

  const handleGiaScanSuccess = useCallback((giaData: any) => {
    mapGiaDataToForm(giaData, setValue);
    setIsScanning(false);
    toast({
      title: "✅ תעודה נסרקה בהצלחה",
      description: "כל פרטי היהלום הוזנו אוטומטית ותמונת התעודה הועלתה",
    });
  }, [setValue, toast]);

  const handleFormSubmit = useCallback(async (data: DiamondFormData) => {
    const success = await submitForm(data);
    if (success) {
      setTimeout(() => {
        reset(defaultValues);
        setUploadSuccess(false);
      }, 3000);
    }
  }, [submitForm, reset, defaultValues]);

  const resetForm = useCallback(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  // Success screen
  if (uploadSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <UploadSuccessCard
          title="יהלום הועלה בהצלחה"
          description="היהלום נוסף למלאי שלך. אפשר להמשיך ולהוסיף עוד יהלומים."
          onContinue={() => {
            setUploadSuccess(false);
            resetForm();
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
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col">
          <div className="space-y-4">
            <DiamondDetailsSection
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
            />

            <div className="border-t border-border/20 pt-4">
              <MeasurementsSection
                register={register}
                watch={watch}
                errors={errors}
              />
            </div>

            <div className="border-t border-border/20 pt-4 px-3">
              <h3 className="text-base font-semibold text-foreground mb-3">תעודה</h3>
              <CertificateSection
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
              />
            </div>

            <div className="border-t border-border/20 pt-4 px-3">
              <h3 className="text-base font-semibold text-foreground mb-3">מידע עסקי</h3>
              <BusinessInfoSection
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
              />
            </div>

            <div className="border-t border-border/20 pt-4 px-3">
              <h3 className="text-base font-semibold text-foreground mb-3">תמונות</h3>
              <ImageUploadSection
                setValue={setValue}
                watch={watch}
                onGiaDataExtracted={handleGiaScanSuccess}
              />
            </div>

            <div className="h-20"></div>
          </div>

          <div className="sticky bottom-0 bg-background border-t border-border/20 safe-area-inset-bottom z-10">
            <div data-tutorial="submit-diamond">
              <FormActions
                onReset={resetForm}
                isLoading={isLoading}
              />
            </div>
          </div>
        </form>
      </div>

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

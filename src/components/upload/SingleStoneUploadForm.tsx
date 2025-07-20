
import { useState, useMemo, useCallback } from "react";
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { QRCodeScanner } from "@/components/inventory/QRCodeScanner";
import { Camera } from "lucide-react";
import { UploadSuccessCard } from "./UploadSuccessCard";
import { DiamondFormData } from '@/components/inventory/form/types';
import { DiamondDetailsSection } from './form/DiamondDetailsSection';
import { CertificateSection } from './form/CertificateSection';
import { MeasurementsSection } from './form/MeasurementsSection';
import { DetailedGradingSection } from './form/DetailedGradingSection';
import { BusinessInfoSection } from './form/BusinessInfoSection';
import { ImageUploadSection } from './form/ImageUploadSection';
import { FormActions } from './form/FormActions';
import { useFormValidation } from './form/useFormValidation';
import { ApiStatusIndicator } from '@/components/ui/ApiStatusIndicator';
import { ApiTestButton } from '@/components/ui/ApiTestButton';

interface SingleStoneUploadFormProps {
  initialData?: any;
  showScanButton?: boolean;
  onSuccess?: () => void;
}

export function SingleStoneUploadForm({ 
  initialData, 
  showScanButton = true, 
  onSuccess 
}: SingleStoneUploadFormProps) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [apiConnected, setApiConnected] = useState(true); // Track API connection status
  const { addDiamond, isLoading } = useInventoryCrud({
    onSuccess: () => {
      console.log('✅ Diamond added successfully, showing success card');
      setUploadSuccess(true);
    }
  });

  // Memoize default values to prevent unnecessary re-calculations
  const defaultValues = useMemo(() => {
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

    if (initialData) {
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
    }

    return defaults;
  }, [initialData]);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<DiamondFormData>({
    defaultValues
  });

  const { validateFormData, formatFormData } = useFormValidation();

  const handleGiaScanSuccess = useCallback((giaData: any) => {
    console.log('GIA data received:', giaData);
    
    // Comprehensive mapping of all GIA data fields including certificate URL
    if (giaData.stock) setValue('stockNumber', giaData.stock);
    if (giaData.shape) setValue('shape', giaData.shape);
    if (giaData.weight) setValue('carat', Number(giaData.weight));
    if (giaData.color) setValue('color', giaData.color);
    if (giaData.clarity) setValue('clarity', giaData.clarity);
    if (giaData.cut) setValue('cut', giaData.cut);
    if (giaData.certificate_number) setValue('certificateNumber', giaData.certificate_number.toString());
    if (giaData.lab) setValue('lab', giaData.lab);
    if (giaData.fluorescence) setValue('fluorescence', giaData.fluorescence);
    if (giaData.polish) setValue('polish', giaData.polish);
    if (giaData.symmetry) setValue('symmetry', giaData.symmetry);
    if (giaData.gridle) setValue('gridle', giaData.gridle);
    if (giaData.culet) setValue('culet', giaData.culet);
    if (giaData.length) setValue('length', Number(giaData.length));
    if (giaData.width) setValue('width', Number(giaData.width));
    if (giaData.depth) setValue('depth', Number(giaData.depth));
    if (giaData.ratio) setValue('ratio', Number(giaData.ratio));
    if (giaData.table_percentage) setValue('tablePercentage', Number(giaData.table_percentage));
    if (giaData.depth_percentage) setValue('depthPercentage', Number(giaData.depth_percentage));
    if (giaData.price_per_carat) setValue('pricePerCarat', Number(giaData.price_per_carat));
    if (giaData.rapnet) setValue('rapnet', Number(giaData.rapnet));
    if (giaData.picture) setValue('picture', giaData.picture);
    
    // Handle certificate URL from uploaded certificate image
    if (giaData.certificate_url || giaData.certificateUrl) {
      setValue('certificateUrl', giaData.certificate_url || giaData.certificateUrl);
      console.log('Certificate image uploaded to:', giaData.certificate_url || giaData.certificateUrl);
    }
    
    if (giaData.certificate_comment) setValue('certificateComment', giaData.certificate_comment);
    
    setIsScanning(false);
    
    toast({
      title: "✅ Certificate Scanned Successfully",
      description: "All diamond information auto-filled and certificate image uploaded",
    });
  }, [setValue, toast]);

  const currentShape = watch('shape');
  const showCutField = currentShape === 'Round';

  const handleFormSubmit = useCallback((data: DiamondFormData) => {
    console.log('🔍 UPLOAD: Form submitted', { user: user?.id, data });
    console.log('🔍 UPLOAD: Shape captured:', data.shape);
    console.log('🔍 UPLOAD: Table % captured:', data.tablePercentage);
    console.log('🔍 UPLOAD: Form submit button clicked - processing data...');
    
    if (!user?.id) {
      console.log('❌ UPLOAD: No user ID found');
      toast({
        title: "Authentication Error",
        description: "Please log in to add diamonds",
        variant: "destructive",
      });
      return;
    }

    console.log('🔍 UPLOAD: User authenticated, validating form data...');
    if (!validateFormData(data)) {
      console.log('❌ UPLOAD: Form validation failed');
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    console.log('✅ UPLOAD: Form validation passed, formatting data...');
    const formattedData = formatFormData(data, showCutField);
    console.log('🔍 UPLOAD: Calling addDiamond with:', formattedData);
    console.log('🔍 UPLOAD: About to make API call to FastAPI create diamond endpoint...');
    
    addDiamond(formattedData).then(success => {
      console.log('🔍 UPLOAD: addDiamond result:', success);
      console.log('🔍 UPLOAD: API call completed, success:', success);
      
      if (!success) {
        console.log('❌ UPLOAD: Diamond creation failed');
        setApiConnected(false);
        toast({
          title: "❌ Upload Failed",
          description: "Failed to add diamond to inventory. Please try again.",
          variant: "destructive",
        });
      } else {
        console.log('✅ UPLOAD: Diamond creation successful!');
        setApiConnected(true);
        setUploadSuccess(true);
        toast({
          title: "Diamond Added Successfully",
          description: "Your diamond has been added to your inventory.",
        });
        
        // Call success callback if provided
        onSuccess?.();
        
        // Reset form after 3 seconds
        setTimeout(() => {
          resetForm();
          setUploadSuccess(false);
        }, 3000);
      }
    }).catch(error => {
      console.error('❌ UPLOAD: Error in addDiamond promise:', error);
      setApiConnected(false);
      toast({
        title: "❌ Upload Error",
        description: "An error occurred while uploading. Please try again.",
        variant: "destructive",
      });
    });
  }, [user?.id, validateFormData, formatFormData, showCutField, addDiamond, toast, setApiConnected]);

  const resetForm = useCallback(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  // Show success card after successful upload
  if (uploadSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <UploadSuccessCard
          title="Stone Uploaded Successfully"
          description="Your diamond has been added to your inventory. Ready to share or continue adding more stones."
          onContinue={() => {
            setUploadSuccess(false);
            resetForm();
          }}
          onShare={() => {
            toast({
              title: "✨ Ready to Share",
              description: "Your diamond is now visible in your store",
            });
          }}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Please log in to add diamonds to your inventory.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* iPhone/TMA optimized form */}
      <div className="space-y-4">
        {showScanButton && (
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Add Single Diamond</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsScanning(true)}
                className="w-full h-12 text-base active:scale-95 transition-transform"
              >
                <Camera className="h-5 w-5 mr-2" />
                Scan Diamond Certificate
              </Button>
            </CardContent>
          </Card>
        )}

        <ApiTestButton />
        <ApiStatusIndicator isConnected={apiConnected} className="mb-4" />
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col min-h-screen">
          {/* Main form content - scrollable */}
          <div className="flex-1 overflow-y-auto smooth-scroll">
            <DiamondDetailsSection
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
            />

            <div className="border-t border-border/20 mt-8">
              <MeasurementsSection
                register={register}
                watch={watch}
                errors={errors}
              />
            </div>

            <div className="border-t border-border/20 mt-8 pt-8 px-4 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Certificate</h3>
              </div>
              <CertificateSection
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
              />
            </div>

            <div className="border-t border-border/20 mt-8 pt-8 px-4 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Business Info</h3>
              </div>
              <BusinessInfoSection
                register={register}
                setValue={setValue}
                watch={watch}
                errors={errors}
              />
            </div>

            <div className="border-t border-border/20 mt-8 pt-8 px-4 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">Images</h3>
              </div>
              <ImageUploadSection
                setValue={setValue}
                watch={watch}
              />
            </div>

            {/* Bottom padding for safe area */}
            <div className="h-24"></div>
          </div>

          {/* Sticky bottom actions */}
          <div className="sticky bottom-0 bg-background border-t border-border/20 safe-area-inset-bottom">
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

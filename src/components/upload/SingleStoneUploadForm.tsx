
import { useState } from "react";
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

export function SingleStoneUploadForm() {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { addDiamond, isLoading } = useInventoryCrud({
    onSuccess: () => {
      console.log('✅ Diamond added successfully, showing success card');
      setUploadSuccess(true);
    }
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<DiamondFormData>({
    defaultValues: {
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
    }
  });

  const { validateFormData, formatFormData } = useFormValidation();

  const handleGiaScanSuccess = (giaData: any) => {
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
      description: "Diamond information loaded - please review and confirm upload",
    });

    // Auto-submit the form after successful scan
    setTimeout(() => {
      handleSubmit(handleFormSubmit)();
    }, 1000);
  };

  const currentShape = watch('shape');
  const showCutField = currentShape === 'Round';

  const handleFormSubmit = (data: DiamondFormData) => {
    console.log('🔍 UPLOAD: Form submitted', { user: user?.id, data });
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
        toast({
          title: "❌ Upload Failed",
          description: "Failed to add diamond to inventory. Please try again.",
          variant: "destructive",
        });
      } else {
        console.log('✅ UPLOAD: Diamond creation successful!');
      }
    }).catch(error => {
      console.error('❌ UPLOAD: Error in addDiamond promise:', error);
      toast({
        title: "❌ Upload Error",
        description: "An error occurred while uploading. Please try again.",
        variant: "destructive",
      });
    });
  };

  const resetForm = () => {
    reset({
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
    });
  };

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
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center text-center space-y-4">
            <CardTitle>Scan Diamond Certificate</CardTitle>
            <p className="text-muted-foreground">
              Upload diamonds by scanning their GIA certificate. The form will auto-fill and upload after scanning.
            </p>
            <Button
              type="button"
              onClick={() => setIsScanning(true)}
              className="flex items-center gap-2"
              size="lg"
            >
              <Camera className="h-5 w-5" />
              Scan Certificate to Upload Diamond
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {watch('certificateNumber') ? (
            <div className="space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-center mb-4">Scanned Diamond Information</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Information extracted from certificate. Processing upload...
                </p>
              </div>
              
              <form className="space-y-6 opacity-75 pointer-events-none">
                <DiamondDetailsSection
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  errors={errors}
                />

                <CertificateSection
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

                <ImageUploadSection
                  setValue={setValue}
                  watch={watch}
                />
              </form>
            </div>
          ) : (
            <div className="text-center py-12">
              <Camera className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No certificate scanned yet. Click the button above to start scanning.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <QRCodeScanner
        isOpen={isScanning}
        onClose={() => setIsScanning(false)}
        onScanSuccess={handleGiaScanSuccess}
      />
    </>
  );
}

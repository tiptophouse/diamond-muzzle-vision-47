import { useState } from "react";
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { QRCodeScanner } from "@/components/inventory/QRCodeScanner";
import { Camera, Smartphone, Plus } from "lucide-react";
import { UploadSuccessCard } from "./UploadSuccessCard";
import { DiamondFormData } from '@/components/inventory/form/types';
import { MobileDiamondDetailsSection } from './form/MobileDiamondDetailsSection';
import { MobileCertificateSection } from './form/MobileCertificateSection';
import { MobileMeasurementsSection } from './form/MobileMeasurementsSection';
import { MobileDetailedGradingSection } from './form/MobileDetailedGradingSection';
import { MobileBusinessInfoSection } from './form/MobileBusinessInfoSection';
import { MobileImageUploadSection } from './form/MobileImageUploadSection';
import { MobileFormActions } from './form/MobileFormActions';
import { useFormValidation } from './form/useFormValidation';
import { useIsMobile } from "@/hooks/use-mobile";

export function SingleStoneUploadForm() {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const isMobile = useIsMobile();
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
  };

  const currentShape = watch('shape');
  const showCutField = currentShape === 'Round';

  const handleFormSubmit = (data: DiamondFormData) => {
    console.log('🔍 UPLOAD: Form submitted', { user: user?.id, data });
    
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in to add diamonds",
        variant: "destructive",
      });
      return;
    }

    if (!validateFormData(data)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const formattedData = formatFormData(data, showCutField);
    console.log('🔍 UPLOAD: Calling addDiamond with:', formattedData);
    
    addDiamond(formattedData).then(success => {
      console.log('🔍 UPLOAD: addDiamond result:', success);
      
      if (!success) {
        toast({
          title: "❌ Upload Failed",
          description: "Failed to add diamond to inventory. Please try again.",
          variant: "destructive",
        });
      }
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
      <Card className="mx-4">
        <CardContent className="pt-6 text-center">
          <div className="space-y-3 py-8">
            <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto">
              <Smartphone className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Login Required</h3>
            <p className="text-sm text-gray-600">Please log in to add diamonds to your inventory.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 px-4 pb-6">
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
                {isMobile && <Plus className="h-5 w-5 text-diamond-600" />}
                Add Single Diamond
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {isMobile ? "Fill details or scan GIA certificate" : "Enter diamond details manually or scan GIA certificate"}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsScanning(true)}
              className="flex items-center gap-2 w-full sm:w-auto bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
            >
              <Camera className="h-4 w-4" />
              {isMobile ? "Scan GIA" : "Scan GIA Certificate"}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <MobileDiamondDetailsSection
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
            />

            <MobileCertificateSection
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
            />

            <MobileMeasurementsSection
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
            />

            <MobileDetailedGradingSection
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
            />

            <MobileBusinessInfoSection
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
            />

            <MobileImageUploadSection
              setValue={setValue}
              watch={watch}
            />

            <MobileFormActions
              onReset={resetForm}
              isLoading={isLoading}
            />
          </form>
        </CardContent>
      </Card>

      <QRCodeScanner
        isOpen={isScanning}
        onClose={() => setIsScanning(false)}
        onScanSuccess={handleGiaScanSuccess}
      />
    </div>
  );
}

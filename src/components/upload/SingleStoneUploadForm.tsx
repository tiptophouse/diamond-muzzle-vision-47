
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
    console.log('🔍 GIA scan received data:', giaData);
    
    // Enhanced mapping for GIA data to form fields
    const mappingLog: string[] = [];

    // Stock/Certificate mapping
    if (giaData.stock || giaData.certificate_number) {
      const stockValue = giaData.stock || giaData.certificate_number?.toString() || '';
      setValue('stockNumber', stockValue);
      mappingLog.push(`✅ Stock: ${stockValue}`);
    }

    if (giaData.certificate_number) {
      setValue('certificateNumber', giaData.certificate_number.toString());
      mappingLog.push(`✅ Cert Number: ${giaData.certificate_number}`);
    }

    // Basic diamond properties
    if (giaData.shape) {
      setValue('shape', giaData.shape);
      mappingLog.push(`✅ Shape: ${giaData.shape}`);
    }

    if (giaData.weight) {
      setValue('carat', Number(giaData.weight));
      mappingLog.push(`✅ Weight: ${giaData.weight}`);
    }

    if (giaData.color) {
      setValue('color', giaData.color);
      mappingLog.push(`✅ Color: ${giaData.color}`);
    }

    if (giaData.clarity) {
      setValue('clarity', giaData.clarity);
      mappingLog.push(`✅ Clarity: ${giaData.clarity}`);
    }

    if (giaData.cut) {
      setValue('cut', giaData.cut);
      mappingLog.push(`✅ Cut: ${giaData.cut}`);
    }

    // Lab and certificate info
    if (giaData.lab) {
      setValue('lab', giaData.lab);
      mappingLog.push(`✅ Lab: ${giaData.lab}`);
    }

    // Detailed grading
    if (giaData.fluorescence) {
      setValue('fluorescence', giaData.fluorescence);
      mappingLog.push(`✅ Fluorescence: ${giaData.fluorescence}`);
    }

    if (giaData.polish) {
      setValue('polish', giaData.polish);
      mappingLog.push(`✅ Polish: ${giaData.polish}`);
    }

    if (giaData.symmetry) {
      setValue('symmetry', giaData.symmetry);
      mappingLog.push(`✅ Symmetry: ${giaData.symmetry}`);
    }

    if (giaData.gridle) {
      setValue('gridle', giaData.gridle);
      mappingLog.push(`✅ Girdle: ${giaData.gridle}`);
    }

    if (giaData.culet) {
      setValue('culet', giaData.culet);
      mappingLog.push(`✅ Culet: ${giaData.culet}`);
    }

    // Measurements
    if (giaData.length) {
      setValue('length', Number(giaData.length));
      mappingLog.push(`✅ Length: ${giaData.length}`);
    }

    if (giaData.width) {
      setValue('width', Number(giaData.width));
      mappingLog.push(`✅ Width: ${giaData.width}`);
    }

    if (giaData.depth) {
      setValue('depth', Number(giaData.depth));
      mappingLog.push(`✅ Depth: ${giaData.depth}`);
    }

    if (giaData.ratio) {
      setValue('ratio', Number(giaData.ratio));
      mappingLog.push(`✅ Ratio: ${giaData.ratio}`);
    }

    // Percentages and additional measurements
    if (giaData.table_percentage || giaData.table) {
      const tableValue = giaData.table_percentage || giaData.table;
      setValue('tablePercentage', Number(tableValue));
      mappingLog.push(`✅ Table %: ${tableValue}`);
    }

    if (giaData.depth_percentage) {
      setValue('depthPercentage', Number(giaData.depth_percentage));
      mappingLog.push(`✅ Depth %: ${giaData.depth_percentage}`);
    }

    // Business data
    if (giaData.price_per_carat) {
      setValue('pricePerCarat', Number(giaData.price_per_carat));
      mappingLog.push(`✅ Price/Carat: ${giaData.price_per_carat}`);
    }

    if (giaData.rapnet) {
      setValue('rapnet', Number(giaData.rapnet));
      mappingLog.push(`✅ RapNet: ${giaData.rapnet}`);
    }

    // Images and URLs
    if (giaData.picture) {
      setValue('picture', giaData.picture);
      mappingLog.push(`✅ Picture: ${giaData.picture}`);
    }
    
    if (giaData.certificate_url || giaData.certificateUrl) {
      const certUrl = giaData.certificate_url || giaData.certificateUrl;
      setValue('certificateUrl', certUrl);
      mappingLog.push(`✅ Certificate URL: ${certUrl}`);
    }
    
    if (giaData.certificate_comment) {
      setValue('certificateComment', giaData.certificate_comment);
      mappingLog.push(`✅ Certificate Comment: ${giaData.certificate_comment}`);
    }
    
    console.log('🔍 GIA Data Mapping Summary:', mappingLog);
    
    setIsScanning(false);
    
    toast({
      title: "✅ Certificate Scanned Successfully",
      description: `Mapped ${mappingLog.length} fields from GIA certificate`,
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
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
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
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Please log in to add diamonds to your inventory.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="pb-4 px-4">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <CardTitle className="text-2xl font-bold text-gray-900">Add Single Diamond</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Scan certificate or enter manually</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsScanning(true)}
            className="w-full h-14 mt-4 text-base font-semibold border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <Camera className="h-5 w-5 mr-3" />
            Scan GIA Certificate
          </Button>
        </CardHeader>
        
        <CardContent className="p-0">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-0">
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

            <FormActions
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

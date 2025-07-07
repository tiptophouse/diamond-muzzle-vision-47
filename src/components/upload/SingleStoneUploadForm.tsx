import { useState, useEffect } from "react";
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { QRCodeScanner } from "@/components/inventory/QRCodeScanner";
import { Camera } from "lucide-react";
import { UploadSuccessCard } from "./UploadSuccessCard";
import { DiamondFormData } from '@/components/inventory/form/types';
import { shapes, colors, clarities, cuts, fluorescences, polishGrades, symmetryGrades, girdleTypes, culetGrades, labOptions, statuses } from '@/components/inventory/form/diamondFormConstants';
import { useFormValidation } from './form/useFormValidation';
import { MobileSelectField } from './form/MobileSelectField';
import { MobileInputField } from './form/MobileInputField';

export function SingleStoneUploadForm() {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { addDiamond, isLoading } = useInventoryCrud({
    onSuccess: () => {
      console.log('✅ Diamond added successfully, showing success card');
      setUploadSuccess(true);
      toast({
        title: "✅ Success",
        description: "Diamond has been added to your inventory",
      });
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

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as Element;
      if (target.closest('[aria-expanded="true"]')) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

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
    
    addDiamond(formattedData).then((success) => {
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
      <div className="p-4 text-center">
        <p className="text-muted-foreground">Please log in to add diamonds to your inventory.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Add Diamond</h1>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsScanning(true)}
          className="flex items-center gap-2 h-12 px-4"
        >
          <Camera className="h-5 w-5" />
          Scan
        </Button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <MobileInputField
          id="stockNumber"
          label="Stock Number *"
          type="text"
          placeholder="Enter stock number"
          register={register}
          errors={errors}
          validation={{ required: 'Stock number is required' }}
        />

        <MobileSelectField
          id="shape"
          label="Shape"
          value={watch('shape')}
          options={shapes}
          onValueChange={(value) => setValue('shape', value)}
        />

        <MobileInputField
          id="carat"
          label="Carat Weight *"
          type="number"
          step="0.01"
          placeholder="Enter carat weight"
          register={register}
          errors={errors}
          validation={{ 
            required: 'Carat is required',
            min: { value: 0.01, message: 'Carat must be greater than 0' }
          }}
        />

        <MobileSelectField
          id="color"
          label="Color"
          value={watch('color')}
          options={colors}
          onValueChange={(value) => setValue('color', value)}
        />

        <MobileSelectField
          id="clarity"
          label="Clarity"
          value={watch('clarity')}
          options={clarities}
          onValueChange={(value) => setValue('clarity', value)}
        />

        {showCutField && (
          <MobileSelectField
            id="cut"
            label="Cut"
            value={watch('cut')}
            options={cuts}
            onValueChange={(value) => setValue('cut', value)}
          />
        )}

        <MobileInputField
          id="price"
          label="Price (USD) *"
          type="number"
          placeholder="Enter price"
          register={register}
          errors={errors}
          validation={{ 
            required: 'Price is required',
            min: { value: 1, message: 'Price must be greater than 0' }
          }}
        />

        <MobileInputField
          id="certificateNumber"
          label="Certificate Number"
          type="text"
          placeholder="Enter certificate number"
          register={register}
          errors={errors}
        />

        <MobileSelectField
          id="lab"
          label="Laboratory"
          value={watch('lab')}
          options={labOptions}
          onValueChange={(value) => setValue('lab', value)}
        />

        <MobileSelectField
          id="fluorescence"
          label="Fluorescence"
          value={watch('fluorescence')}
          options={fluorescences}
          onValueChange={(value) => setValue('fluorescence', value)}
        />

        <MobileSelectField
          id="polish"
          label="Polish"
          value={watch('polish')}
          options={polishGrades}
          onValueChange={(value) => setValue('polish', value)}
        />

        <MobileSelectField
          id="symmetry"
          label="Symmetry"
          value={watch('symmetry')}
          options={symmetryGrades}
          onValueChange={(value) => setValue('symmetry', value)}
        />

        <MobileSelectField
          id="status"
          label="Status"
          value={watch('status')}
          options={statuses}
          onValueChange={(value) => setValue('status', value)}
        />

        <div className="flex gap-3 pt-4 sticky bottom-4 bg-white">
          <Button 
            type="button"
            variant="outline" 
            onClick={resetForm}
            disabled={isLoading}
            className="flex-1 h-12 text-lg"
          >
            Reset
          </Button>
          <Button 
            type="submit"
            disabled={isLoading}
            className="flex-1 h-12 text-lg"
          >
            {isLoading ? "Adding..." : "Add Diamond"}
          </Button>
        </div>
      </form>

      <QRCodeScanner
        isOpen={isScanning}
        onClose={() => setIsScanning(false)}
        onScanSuccess={handleGiaScanSuccess}
      />
    </div>
  );
}


import { useState } from "react";
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { QRCodeScanner } from "@/components/inventory/QRCodeScanner";
import { Camera, ChevronRight } from "lucide-react";
import { UploadSuccessCard } from "./UploadSuccessCard";
import { DiamondFormData } from '@/components/inventory/form/types';
import { MobileFormDrawer } from './form/MobileFormDrawer';
import { useFormValidation } from './form/useFormValidation';

export function SingleStoneUploadForm() {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const { addDiamond, isLoading } = useInventoryCrud({
    onSuccess: () => {
      console.log('✅ Diamond added successfully, showing success card');
      setUploadSuccess(true);
      toast({
        title: "✅ Diamond Added Successfully",
        description: "Your diamond has been added to your inventory",
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
      <div className="px-4 py-8 text-center">
        <p className="text-lg text-muted-foreground">Please log in to add diamonds to your inventory.</p>
      </div>
    );
  }

  const formSections = [
    { id: 'basic', title: 'Basic Info', subtitle: 'Stock, shape, carat, color, clarity' },
    { id: 'certificate', title: 'Certificate', subtitle: 'GIA/Lab details' },
    { id: 'measurements', title: 'Measurements', subtitle: 'Dimensions & proportions' },
    { id: 'grading', title: 'Detailed Grading', subtitle: 'Polish, symmetry, fluorescence' },
    { id: 'business', title: 'Pricing', subtitle: 'Price, status, visibility' },
    { id: 'image', title: 'Photo', subtitle: 'Diamond image upload' },
  ];

  return (
    <>
      {/* Mobile-first form sections list */}
      <div className="space-y-3 px-4">
        {/* Quick scan button - prominent mobile placement */}
        <Button
          type="button"
          onClick={() => setIsScanning(true)}
          className="w-full h-14 bg-primary text-primary-foreground rounded-xl flex items-center gap-3 text-lg font-medium"
          size="lg"
        >
          <Camera className="h-6 w-6" />
          Scan GIA Certificate
        </Button>

        {/* Form sections as mobile-friendly cards */}
        {formSections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className="w-full p-4 bg-card border border-border rounded-xl flex items-center justify-between hover:bg-accent transition-colors"
          >
            <div className="text-left">
              <h3 className="font-semibold text-base text-foreground">{section.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{section.subtitle}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        ))}

        {/* Submit button */}
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          disabled={isLoading}
          className="w-full h-14 bg-secondary text-secondary-foreground rounded-xl text-lg font-medium mt-6"
          size="lg"
        >
          {isLoading ? "Adding Diamond..." : "Add Diamond to Inventory"}
        </Button>
      </div>

      {/* Mobile drawer for form sections */}
      <MobileFormDrawer
        isOpen={!!activeSection}
        onClose={() => setActiveSection(null)}
        title={formSections.find(s => s.id === activeSection)?.title || ''}
        sectionId={activeSection}
        register={register}
        setValue={setValue}
        watch={watch}
        errors={errors}
      />

      <QRCodeScanner
        isOpen={isScanning}
        onClose={() => setIsScanning(false)}
        onScanSuccess={handleGiaScanSuccess}
      />
    </>
  );
}

import { useState } from "react";
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { QRCodeScanner } from "@/components/inventory/QRCodeScanner";
import { Camera, Save, RefreshCw, Diamond, FileText, Image, Settings } from "lucide-react";
import { UploadSuccessCard } from "./UploadSuccessCard";
import { DiamondFormData } from '@/components/inventory/form/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicDetailsTab } from './tabs/BasicDetailsTab';
import { CertificateTab } from './tabs/CertificateTab';
import { MeasurementsTab } from './tabs/MeasurementsTab';
import { BusinessTab } from './tabs/BusinessTab';
import { useFormValidation } from './form/useFormValidation';

export function ModernSingleStoneForm() {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
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
    
    // Map all GIA data fields
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
    
    addDiamond(formattedData).then(success => {
      console.log('🔍 UPLOAD: addDiamond result:', success);
      
      if (!success) {
        console.log('❌ UPLOAD: Diamond creation failed');
        toast({
          title: "❌ Upload Failed",
          description: "Failed to add diamond to inventory. Please try again.",
          variant: "destructive",
        });
      } else {
        console.log('✅ UPLOAD: Diamond creation successful!');
        toast({
          title: "✅ Diamond Added Successfully",
          description: "Your diamond has been added to your inventory",
        });
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
    setActiveTab("basic");
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
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Please log in to add diamonds to your inventory.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Diamond className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Add Single Diamond</CardTitle>
                <p className="text-sm text-muted-foreground">Fill in diamond details or scan certificate</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsScanning(true)}
              className="flex items-center gap-2 min-h-10"
            >
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Scan Certificate</span>
              <span className="sm:hidden">Scan</span>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Main Form */}
      <Card>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b bg-muted/30 px-6 py-4">
                <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                  <TabsTrigger 
                    value="basic" 
                    className="flex flex-col sm:flex-row items-center gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm"
                  >
                    <Diamond className="h-4 w-4" />
                    <span className="hidden sm:inline">Basic Details</span>
                    <span className="sm:hidden">Basic</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="certificate" 
                    className="flex flex-col sm:flex-row items-center gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Certificate</span>
                    <span className="sm:hidden">Cert</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="measurements" 
                    className="flex flex-col sm:flex-row items-center gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Measurements</span>
                    <span className="sm:hidden">Measure</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="business" 
                    className="flex flex-col sm:flex-row items-center gap-2 py-3 px-2 sm:px-4 text-xs sm:text-sm"
                  >
                    <Image className="h-4 w-4" />
                    <span className="hidden sm:inline">Business</span>
                    <span className="sm:hidden">Biz</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
                <TabsContent value="basic" className="mt-0">
                  <BasicDetailsTab
                    register={register}
                    setValue={setValue}
                    watch={watch}
                    errors={errors}
                    showCutField={showCutField}
                  />
                </TabsContent>

                <TabsContent value="certificate" className="mt-0">
                  <CertificateTab
                    register={register}
                    setValue={setValue}
                    watch={watch}
                    errors={errors}
                  />
                </TabsContent>

                <TabsContent value="measurements" className="mt-0">
                  <MeasurementsTab
                    register={register}
                    setValue={setValue}
                    watch={watch}
                    errors={errors}
                  />
                </TabsContent>

                <TabsContent value="business" className="mt-0">
                  <BusinessTab
                    register={register}
                    setValue={setValue}
                    watch={watch}
                    errors={errors}
                  />
                </TabsContent>
              </div>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 p-6 bg-muted/30 border-t">
              <Button 
                type="button"
                variant="outline" 
                onClick={resetForm}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reset Form
              </Button>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {activeTab !== "business" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const tabs = ["basic", "certificate", "measurements", "business"];
                      const currentIndex = tabs.indexOf(activeTab);
                      if (currentIndex < tabs.length - 1) {
                        setActiveTab(tabs[currentIndex + 1]);
                      }
                    }}
                  >
                    Next Step
                  </Button>
                )}
                
                <Button 
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 min-w-[140px]"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? "Adding..." : "Add Diamond"}
                </Button>
              </div>
            </div>
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
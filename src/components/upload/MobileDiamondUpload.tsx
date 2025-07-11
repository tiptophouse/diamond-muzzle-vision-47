import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Plus, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { TelegramCertificateScanner } from "./TelegramCertificateScanner";
import { MobileDiamondForm } from "./MobileDiamondForm";
import { MobileUploadSuccess } from "./MobileUploadSuccess";
import { DiamondFormData } from '@/components/inventory/form/types';
import { useIsMobile } from "@/hooks/use-mobile";
import { useTelegramBackButton } from "@/hooks/useTelegramBackButton";

export function MobileDiamondUpload() {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState<'scan' | 'form' | 'success'>('scan');
  const [scannedData, setScannedData] = useState<Partial<DiamondFormData> | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  const { addDiamond, isLoading } = useInventoryCrud({
    onSuccess: () => {
      setCurrentStep('success');
      toast({
        title: "✅ Diamond Added Successfully",
        description: "Your diamond has been uploaded to your inventory",
      });
    }
  });

  // Handle Telegram back button
  const backHandler = currentStep === 'form' ? () => {
    setCurrentStep('scan');
    return true;
  } : undefined;
  
  useTelegramBackButton(backHandler);

  const handleScanSuccess = (giaData: any) => {
    console.log('📱 Mobile: Certificate scanned successfully', giaData);
    
    // Map all OCR data comprehensively
    const formData: Partial<DiamondFormData> = {
      stockNumber: giaData.stock || giaData.certificate_number?.toString() || '',
      shape: giaData.shape || 'Round',
      carat: giaData.weight ? Number(giaData.weight) : 1,
      color: giaData.color || 'G',
      clarity: giaData.clarity || 'VS1',
      cut: giaData.cut || 'Excellent',
      certificateNumber: giaData.certificate_number?.toString() || '',
      certificateUrl: giaData.certificate_url || giaData.certificateUrl || '',
      certificateComment: giaData.certificate_comment || '',
      lab: giaData.lab || 'GIA',
      fluorescence: giaData.fluorescence || 'None',
      polish: giaData.polish || 'Excellent',
      symmetry: giaData.symmetry || 'Excellent',
      gridle: giaData.gridle || 'Medium',
      culet: giaData.culet || 'None',
      length: giaData.length ? Number(giaData.length) : undefined,
      width: giaData.width ? Number(giaData.width) : undefined,
      depth: giaData.depth ? Number(giaData.depth) : undefined,
      ratio: giaData.ratio ? Number(giaData.ratio) : undefined,
      tablePercentage: giaData.table_percentage ? Number(giaData.table_percentage) : undefined,
      depthPercentage: giaData.depth_percentage ? Number(giaData.depth_percentage) : undefined,
      pricePerCarat: giaData.price_per_carat ? Number(giaData.price_per_carat) : undefined,
      rapnet: giaData.rapnet ? Number(giaData.rapnet) : undefined,
      picture: giaData.picture || '',
      price: 0,
      status: 'Available',
      storeVisible: true
    };
    
    setScannedData(formData);
    setIsScanning(false);
    setCurrentStep('form');
    
    // Haptic feedback for success
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  };

  const handleFormSubmit = (data: DiamondFormData) => {
    console.log('📱 Mobile: Form submitted', data);
    
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in to add diamonds",
        variant: "destructive",
      });
      return;
    }

    // Haptic feedback for submission
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }

    addDiamond(data);
  };

  const handleSkipScan = () => {
    setCurrentStep('form');
    setScannedData({
      stockNumber: '',
      shape: 'Round',
      carat: 1,
      color: 'G',
      clarity: 'VS1',
      cut: 'Excellent',
      fluorescence: 'None',
      polish: 'Excellent',
      symmetry: 'Excellent',
      lab: 'GIA',
      gridle: 'Medium',
      culet: 'None',
      price: 0,
      status: 'Available',
      storeVisible: true
    });
  };

  const handleStartOver = () => {
    setCurrentStep('scan');
    setScannedData(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Please log in to add diamonds to your inventory.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render based on current step
  switch (currentStep) {
    case 'scan':
      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-accent/20">
          <div className="container mx-auto px-4 py-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Upload Diamond</h1>
              <p className="text-muted-foreground">Scan certificate or add manually</p>
            </div>

            {/* Scan Option */}
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Scan GIA Certificate</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Auto-fill all diamond details from certificate
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => setIsScanning(true)}
                  className="w-full h-12 text-lg font-medium"
                  size="lg"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Scan Certificate
                </Button>
              </CardContent>
            </Card>

            {/* Manual Option */}
            <Card className="border border-border">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl">Add Manually</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Enter diamond details manually
                </p>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleSkipScan}
                  variant="outline"
                  className="w-full h-12 text-lg font-medium"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Manually
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Scanner Modal */}
          <TelegramCertificateScanner
            isOpen={isScanning}
            onClose={() => setIsScanning(false)}
            onScanSuccess={handleScanSuccess}
          />
        </div>
      );

    case 'form':
      return (
        <MobileDiamondForm
          initialData={scannedData}
          onSubmit={handleFormSubmit}
          onBack={handleStartOver}
          isLoading={isLoading}
        />
      );

    case 'success':
      return (
        <MobileUploadSuccess
          onContinue={handleStartOver}
          onViewStore={() => {
            // Navigate to store page
            window.location.href = '/store';
          }}
        />
      );

    default:
      return null;
  }
}
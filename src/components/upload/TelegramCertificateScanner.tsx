import { useState, useEffect } from "react";
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { QRCodeScanner } from "@/components/inventory/QRCodeScanner";
import { Camera, Check, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { DiamondFormData } from '@/components/inventory/form/types';
import { MobileDiamondForm } from './MobileDiamondForm';
import { getTelegramWebApp } from "@/utils/telegramWebApp";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function TelegramCertificateScanner() {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [scannedData, setScannedData] = useState<Partial<DiamondFormData> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addDiamond } = useInventoryCrud({
    onSuccess: () => {
      handleSuccess();
    }
  });

  const form = useForm<DiamondFormData>({
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

  // Initialize Telegram WebApp
  useEffect(() => {
    const tg = getTelegramWebApp();
    if (tg) {
      tg.ready?.();
      tg.expand?.();
      
      // Handle back button
      if (tg.BackButton && showForm) {
        tg.BackButton.show();
        tg.BackButton.onClick(() => {
          setShowForm(false);
          setScannedData(null);
          form.reset();
        });
      } else if (tg.BackButton) {
        tg.BackButton.hide();
      }
    }

    return () => {
      const tg = getTelegramWebApp();
      if (tg?.BackButton) {
        tg.BackButton.hide();
      }
    };
  }, [showForm, form]);

  const handleGiaScanSuccess = (giaData: any) => {
    console.log('Certificate data scanned:', giaData);
    
    // Populate all available fields
    const formData: Partial<DiamondFormData> = {};
    
    // Basic diamond details
    if (giaData.stock) formData.stockNumber = giaData.stock;
    if (giaData.shape) formData.shape = giaData.shape;
    if (giaData.weight) formData.carat = Number(giaData.weight);
    if (giaData.color) formData.color = giaData.color;
    if (giaData.clarity) formData.clarity = giaData.clarity;
    if (giaData.cut) formData.cut = giaData.cut;
    
    // Certificate information
    if (giaData.certificate_number) formData.certificateNumber = giaData.certificate_number.toString();
    if (giaData.lab) formData.lab = giaData.lab;
    if (giaData.certificate_url || giaData.certificateUrl) {
      formData.certificateUrl = giaData.certificate_url || giaData.certificateUrl;
    }
    if (giaData.certificate_comment) formData.certificateComment = giaData.certificate_comment;
    
    // Grading details
    if (giaData.fluorescence) formData.fluorescence = giaData.fluorescence;
    if (giaData.polish) formData.polish = giaData.polish;
    if (giaData.symmetry) formData.symmetry = giaData.symmetry;
    if (giaData.gridle) formData.gridle = giaData.gridle;
    if (giaData.culet) formData.culet = giaData.culet;
    
    // Physical measurements
    if (giaData.length) formData.length = Number(giaData.length);
    if (giaData.width) formData.width = Number(giaData.width);
    if (giaData.depth) formData.depth = Number(giaData.depth);
    if (giaData.ratio) formData.ratio = Number(giaData.ratio);
    if (giaData.table_percentage) formData.tablePercentage = Number(giaData.table_percentage);
    if (giaData.depth_percentage) formData.depthPercentage = Number(giaData.depth_percentage);
    
    // Business information
    if (giaData.price_per_carat) formData.pricePerCarat = Number(giaData.price_per_carat);
    if (giaData.rapnet) formData.rapnet = Number(giaData.rapnet);
    if (giaData.picture) formData.picture = giaData.picture;
    
    // Auto-calculate total price if price per carat and carat are available
    if (formData.pricePerCarat && formData.carat) {
      formData.price = formData.pricePerCarat * formData.carat;
    }
    
    // Update form with scanned data
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined) {
        form.setValue(key as keyof DiamondFormData, value);
      }
    });
    
    setScannedData(formData);
    setIsScanning(false);
    setShowForm(true);
    
    // Trigger haptic feedback
    const tg = getTelegramWebApp();
    if (tg && 'HapticFeedback' in tg) {
      (tg as any).HapticFeedback?.notificationOccurred?.('success');
    }
    
    toast({
      title: "✅ Certificate Scanned",
      description: "Verify the auto-filled data before saving",
    });
  };

  const handleFormSubmit = async (data: DiamondFormData) => {
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in to add diamonds",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await addDiamond(data);
      if (!success) {
        handleError('Failed to add diamond to inventory');
      }
    } catch (error) {
      console.error('Failed to add diamond:', error);
      handleError('An error occurred while adding the diamond');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccess = () => {
    // Trigger haptic feedback
    const tg = getTelegramWebApp();
    if (tg && 'HapticFeedback' in tg) {
      (tg as any).HapticFeedback?.notificationOccurred?.('success');
    }
    
    toast({
      title: "✅ Diamond Added Successfully",
      description: "Your diamond has been added to inventory",
    });
    
    // Reset form
    setShowForm(false);
    setScannedData(null);
    form.reset();
  };

  const handleError = (error: string) => {
    // Trigger haptic feedback
    const tg = getTelegramWebApp();
    if (tg && 'HapticFeedback' in tg) {
      (tg as any).HapticFeedback?.notificationOccurred?.('error');
    }
    
    toast({
      title: "❌ Upload Failed",
      description: error || "Failed to add diamond. Please try again.",
      variant: "destructive",
    });
  };

  const resetForm = () => {
    setShowForm(false);
    setScannedData(null);
    form.reset();
  };

  if (!user) {
    return (
      <Card className="border-destructive/20">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">Please log in to scan certificates and add diamonds</p>
        </CardContent>
      </Card>
    );
  }

  if (showForm && scannedData) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={resetForm}
            className="text-sm"
          >
            ← Back to Scanner
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-success" />
            Certificate Scanned
          </div>
        </div>
        
        <MobileDiamondForm
          form={form}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
          scannedData={scannedData}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-3 text-xl">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="h-6 w-6 text-primary" />
            </div>
            Scan Diamond Certificate
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Scan GIA or other certificates to auto-fill diamond details
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-0">
          <Button
            onClick={() => setIsScanning(true)}
            className="w-full h-14 text-lg font-medium bg-primary hover:bg-primary/90 active:scale-95 transition-all"
            size="lg"
          >
            <Camera className="h-5 w-5 mr-2" />
            Start Scanning
          </Button>

          <Collapsible>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-sm bg-muted/50 rounded-lg hover:bg-muted transition-colors">
              <span className="font-medium">What can be scanned?</span>
              <ChevronDown className="h-4 w-4" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2 p-3 text-xs text-muted-foreground bg-background border rounded-lg space-y-2">
              <div>• <strong>GIA Certificates:</strong> Full diamond details and measurements</div>
              <div>• <strong>Other Lab Certificates:</strong> Basic diamond information</div>
              <div>• <strong>QR Codes:</strong> Quick access to certificate data</div>
              <div>• <strong>Certificate Numbers:</strong> Auto-lookup when possible</div>
            </CollapsibleContent>
          </Collapsible>
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

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { DiamondFormData } from "@/components/inventory/form/types";
import { BasicInfoSection } from "./form/BasicInfoSection";
import { CertificateInfoSection } from "./form/CertificateInfoSection";
import { useSingleStoneValidation } from "./form/useSingleStoneValidation";
import { QRCodeScanner } from "@/components/inventory/QRCodeScanner";
import { useToast } from "@/hooks/use-toast";

export function SingleStoneUploadForm() {
  const { user } = useTelegramAuth();
  const { addDiamond, isLoading } = useInventoryCrud();
  const { validateFormData } = useSingleStoneValidation();
  const { toast } = useToast();
  const [showScanner, setShowScanner] = useState(false);
  const [isProcessingGIA, setIsProcessingGIA] = useState(false);
  
  const [formData, setFormData] = useState({
    stockNumber: '',
    shape: '',
    carat: '',
    color: '',
    clarity: '',
    cut: 'Excellent',
    price: '',
    certificateNumber: '',
    lab: 'GIA'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleScanSuccess = async (giaData: any) => {
    console.log('GIA data received:', giaData);
    setIsProcessingGIA(true);
    
    try {
      // Update form with scanned data
      const updatedFormData = {
        ...formData,
        stockNumber: giaData.stockNumber || giaData.certificateNumber || formData.stockNumber,
        shape: giaData.shape || formData.shape,
        carat: giaData.carat?.toString() || formData.carat,
        color: giaData.color || formData.color,
        clarity: giaData.clarity || formData.clarity,
        cut: giaData.cut || formData.cut,
        certificateNumber: giaData.certificateNumber || formData.certificateNumber,
        price: giaData.price?.toString() || formData.price,
        lab: giaData.lab || 'GIA'
      };
      
      setFormData(updatedFormData);
      setShowScanner(false);
      
      // Show success message for GIA scan
      toast({
        title: "GIA Certificate Scanned Successfully",
        description: "Diamond data has been populated from the GIA certificate. You can review and modify before saving.",
      });

      // Auto-save to database if we have complete data
      if (validateFormData(updatedFormData)) {
        console.log('Auto-saving GIA scanned diamond to database...');
        
        // Convert form data to DiamondFormData format
        const diamondData: DiamondFormData = {
          stockNumber: updatedFormData.stockNumber,
          shape: updatedFormData.shape,
          carat: parseFloat(updatedFormData.carat),
          color: updatedFormData.color,
          clarity: updatedFormData.clarity,
          cut: updatedFormData.cut,
          price: parseFloat(updatedFormData.price),
          status: 'Available',
          storeVisible: true,
          certificateNumber: updatedFormData.certificateNumber || undefined,
          lab: updatedFormData.lab
        };

        const success = await addDiamond(diamondData);
        
        if (success) {
          // Reset form after successful save
          setFormData({
            stockNumber: '',
            shape: '',
            carat: '',
            color: '',
            clarity: '',
            cut: 'Excellent',
            price: '',
            certificateNumber: '',
            lab: 'GIA'
          });

          toast({
            title: "Diamond Added Successfully",
            description: "The GIA scanned diamond has been saved to your inventory.",
          });
        }
      }
      
    } catch (error) {
      console.error('Error processing GIA scan:', error);
      toast({
        title: "Error Processing GIA Data",
        description: "Failed to process the scanned GIA certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingGIA(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add diamonds to your inventory.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!validateFormData(formData)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert form data to DiamondFormData format
      const diamondData: DiamondFormData = {
        stockNumber: formData.stockNumber,
        shape: formData.shape,
        carat: parseFloat(formData.carat),
        color: formData.color,
        clarity: formData.clarity,
        cut: formData.cut,
        price: parseFloat(formData.price),
        status: 'Available',
        storeVisible: true,
        certificateNumber: formData.certificateNumber || undefined,
        lab: formData.lab
      };

      const success = await addDiamond(diamondData);
      
      if (success) {
        // Reset form on success
        setFormData({
          stockNumber: '',
          shape: '',
          carat: '',
          color: '',
          clarity: '',
          cut: 'Excellent',
          price: '',
          certificateNumber: '',
          lab: 'GIA'
        });
      }
    } catch (error) {
      console.error('Error adding diamond:', error);
      toast({
        title: "Error",
        description: "Failed to add diamond to inventory. Please try again.",
        variant: "destructive",
      });
    }
  };

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
          <CardTitle className="flex items-center justify-between">
            Add Single Diamond
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-2"
              disabled={isProcessingGIA}
            >
              <Camera className="h-4 w-4" />
              {isProcessingGIA ? "Processing..." : "Scan GIA Certificate"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <BasicInfoSection formData={formData} onInputChange={handleInputChange} />
            <CertificateInfoSection formData={formData} onInputChange={handleInputChange} />

            <Button 
              type="submit" 
              disabled={isLoading || isProcessingGIA} 
              className="w-full"
            >
              {isLoading ? "Adding Diamond..." : "Add Diamond to Inventory"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <QRCodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
      />
    </>
  );
}

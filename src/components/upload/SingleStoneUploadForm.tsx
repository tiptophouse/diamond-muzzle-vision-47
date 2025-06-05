
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, Save } from "lucide-react";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { DiamondFormData } from "@/components/inventory/form/types";
import { GIACertificateScanner } from "./GIACertificateScanner";
import { SingleStoneForm } from "./SingleStoneForm";
import { toast } from "@/components/ui/use-toast";

export function SingleStoneUploadForm() {
  const [showScanner, setShowScanner] = useState(false);
  const [formData, setFormData] = useState<Partial<DiamondFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useTelegramAuth();
  const { addDiamond, isLoading } = useInventoryCrud();

  const handleScanSuccess = (giaData: any) => {
    console.log('GIA data received:', giaData);
    
    // Map GIA data to form fields
    const mappedData: Partial<DiamondFormData> = {
      stockNumber: giaData.stockNumber || giaData.certificateNumber || '',
      shape: giaData.shape || 'Round',
      carat: giaData.carat || 1,
      color: giaData.color || 'G',
      clarity: giaData.clarity || 'VS1',
      cut: giaData.cut || 'Excellent',
      status: 'Available',
    };

    setFormData(mappedData);
    setShowScanner(false);
    
    toast({
      title: "Certificate Scanned",
      description: "Diamond details have been auto-filled from the GIA certificate",
    });
  };

  const handleFormSubmit = async (data: DiamondFormData) => {
    if (!isAuthenticated || !user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please make sure you're logged in to add diamonds.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await addDiamond(data);
      if (success) {
        // Reset form
        setFormData({});
        toast({
          title: "Success",
          description: "Diamond added to your inventory successfully",
        });
      }
    } catch (error) {
      console.error('Error adding diamond:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="diamond-card">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Please log in to add diamonds to your inventory.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="diamond-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Add New Diamond</span>
            <Button 
              variant="outline" 
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Scan GIA Certificate
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SingleStoneForm
            initialData={formData}
            onSubmit={handleFormSubmit}
            isLoading={isSubmitting || isLoading}
          />
        </CardContent>
      </Card>

      <GIACertificateScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}

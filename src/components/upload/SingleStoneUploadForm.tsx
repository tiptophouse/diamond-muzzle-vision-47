
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, Save, CheckCircle } from "lucide-react";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { DiamondFormData } from "@/components/inventory/form/types";
import { GIACertificateScanner } from "./GIACertificateScanner";
import { SingleStoneForm } from "./SingleStoneForm";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function SingleStoneUploadForm() {
  const [showScanner, setShowScanner] = useState(false);
  const [formData, setFormData] = useState<Partial<DiamondFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSavedDiamond, setLastSavedDiamond] = useState<string | null>(null);
  const { user, isAuthenticated } = useTelegramAuth();
  const { addDiamond, isLoading } = useInventoryCrud();

  const handleScanSuccess = (giaData: any) => {
    console.log('GIA data received:', giaData);
    
    // Map GIA data to form fields
    const mappedData: Partial<DiamondFormData> = {
      stockNumber: giaData.stockNumber || giaData.certificateNumber || `GIA-${Date.now()}`,
      shape: giaData.shape || 'Round',
      carat: giaData.carat || 1,
      color: giaData.color || 'G',
      clarity: giaData.clarity || 'VS1',
      cut: giaData.cut || 'Excellent',
      status: 'Available',
      price: giaData.price || 5000,
    };

    setFormData(mappedData);
    setShowScanner(false);
    
    toast({
      title: "Certificate Scanned Successfully! 📄",
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

    // Validate required fields
    if (!data.stockNumber || !data.carat || !data.price) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please fill in Stock Number, Carat, and Price fields.",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Submitting diamond data:', data);
      
      toast({
        title: "Saving diamond...",
        description: "Adding diamond to your inventory.",
      });

      const success = await addDiamond(data);
      
      if (success) {
        // Reset form
        setFormData({});
        setLastSavedDiamond(data.stockNumber);
        
        toast({
          title: "Diamond Added Successfully! 💎",
          description: `${data.stockNumber} has been added to your inventory and is visible in the store.`,
        });
      } else {
        throw new Error('Failed to add diamond to inventory');
      }
    } catch (error) {
      console.error('Error adding diamond:', error);
      
      toast({
        variant: "destructive",
        title: "Failed to save diamond",
        description: error instanceof Error ? error.message : "There was an error saving your diamond. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({});
    setLastSavedDiamond(null);
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
    <div className="max-w-2xl mx-auto space-y-6">
      {lastSavedDiamond && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Diamond Saved Successfully!</p>
                <p className="text-sm">
                  {lastSavedDiamond} has been added to your inventory and is now visible in the store.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetForm}
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                Add Another
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className="diamond-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Add New Diamond</span>
            <Button 
              variant="outline" 
              onClick={() => setShowScanner(true)}
              className="flex items-center gap-2"
              disabled={isSubmitting}
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

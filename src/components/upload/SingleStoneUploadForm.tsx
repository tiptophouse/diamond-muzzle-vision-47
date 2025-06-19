
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

export function SingleStoneUploadForm() {
  const { user } = useTelegramAuth();
  const { addDiamond, isLoading } = useInventoryCrud();
  const { validateFormData } = useSingleStoneValidation();
  const [showScanner, setShowScanner] = useState(false);
  
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

  const handleScanSuccess = (giaData: any) => {
    console.log('GIA data received:', giaData);
    // Update form with scanned data
    setFormData(prev => ({
      ...prev,
      stockNumber: giaData.stockNumber || prev.stockNumber,
      shape: giaData.shape || prev.shape,
      carat: giaData.carat?.toString() || prev.carat,
      color: giaData.color || prev.color,
      clarity: giaData.clarity || prev.clarity,
      cut: giaData.cut || prev.cut,
      certificateNumber: giaData.certificateNumber || prev.certificateNumber,
      price: giaData.price?.toString() || prev.price
    }));
    setShowScanner(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      return;
    }

    // Validate required fields
    if (!validateFormData(formData)) {
      return;
    }

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
            >
              <Camera className="h-4 w-4" />
              Scan GIA Certificate
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <BasicInfoSection formData={formData} onInputChange={handleInputChange} />
            <CertificateInfoSection formData={formData} onInputChange={handleInputChange} />

            <Button type="submit" disabled={isLoading} className="w-full">
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

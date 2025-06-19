
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { DiamondFormData } from "@/components/inventory/form/types";
import { BasicInfoSection } from "./form/BasicInfoSection";
import { CertificateInfoSection } from "./form/CertificateInfoSection";
import { useSingleStoneValidation } from "./form/useSingleStoneValidation";

export function SingleStoneUploadForm() {
  const { user } = useTelegramAuth();
  const { addDiamond, isLoading } = useInventoryCrud();
  const { validateFormData } = useSingleStoneValidation();
  
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
    <Card>
      <CardHeader>
        <CardTitle>Add Single Diamond</CardTitle>
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
  );
}


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { QRCodeScanner } from "@/components/inventory/QRCodeScanner";
import { Camera } from "lucide-react";
import { UploadSuccessCard } from "./UploadSuccessCard";

const shapes = ["Round", "Princess", "Emerald", "Asscher", "Oval", "Radiant", "Pear", "Heart", "Marquise", "Cushion"];
const colors = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
const clarities = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "SI3", "I1", "I2", "I3"];

export function SingleStoneUploadForm() {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { addDiamond, isLoading } = useInventoryCrud({
    onSuccess: () => {
      console.log('✅ Diamond added successfully, showing success card');
      setUploadSuccess(true);
    }
  });
  
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

  const handleGiaScanSuccess = (giaData: any) => {
    console.log('GIA data received:', giaData);
    
    // Map GIA data to form fields
    setFormData(prev => ({
      ...prev,
      stockNumber: giaData.stock || prev.stockNumber,
      shape: giaData.shape || prev.shape,
      carat: giaData.weight?.toString() || prev.carat,
      color: giaData.color || prev.color,
      clarity: giaData.clarity || prev.clarity,
      cut: giaData.cut || prev.cut,
      certificateNumber: giaData.certificate_number?.toString() || prev.certificateNumber,
      lab: giaData.lab || prev.lab
    }));
    
    setIsScanning(false);
    
    toast({
      title: "Certificate Scanned! 📋",
      description: "Diamond information auto-filled from certificate",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 UPLOAD: Form submitted', { user: user?.id, formData });
    
    if (!user?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in to add diamonds",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    console.log('🔍 UPLOAD: Validating form data', formData);
    if (!formData.stockNumber || !formData.shape || !formData.carat || !formData.color || !formData.clarity || !formData.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const diamondData = {
      stockNumber: formData.stockNumber,
      shape: formData.shape,
      carat: parseFloat(formData.carat),
      color: formData.color,
      clarity: formData.clarity,
      cut: formData.cut,
      price: parseFloat(formData.price),
      status: 'Available',
      storeVisible: true,
      certificateNumber: formData.certificateNumber,
      lab: formData.lab
    };

    console.log('🔍 UPLOAD: Calling addDiamond with:', diamondData);
    const success = await addDiamond(diamondData);
    console.log('🔍 UPLOAD: addDiamond result:', success);
    
    if (success) {
      console.log('✅ Stone uploaded and added to inventory');
      // Success is now handled by the onSuccess callback which shows the success card
    }
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
            // Reset form
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
          <div className="flex items-center justify-between">
            <CardTitle>Add Single Diamond</CardTitle>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsScanning(true)}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Scan GIA Certificate
            </Button>
          </div>
        </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stockNumber">Stock Number *</Label>
              <Input
                id="stockNumber"
                value={formData.stockNumber}
                onChange={(e) => handleInputChange('stockNumber', e.target.value)}
                placeholder="e.g., STK-001"
                required
              />
            </div>

            <div>
              <Label htmlFor="shape">Shape *</Label>
              <Select value={formData.shape} onValueChange={(value) => handleInputChange('shape', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shape" />
                </SelectTrigger>
                <SelectContent>
                  {shapes.map(shape => (
                    <SelectItem key={shape} value={shape}>{shape}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="carat">Carat Weight *</Label>
              <Input
                id="carat"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.carat}
                onChange={(e) => handleInputChange('carat', e.target.value)}
                placeholder="e.g., 1.25"
                required
              />
            </div>

            <div>
              <Label htmlFor="color">Color *</Label>
              <Select value={formData.color} onValueChange={(value) => handleInputChange('color', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {colors.map(color => (
                    <SelectItem key={color} value={color}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="clarity">Clarity *</Label>
              <Select value={formData.clarity} onValueChange={(value) => handleInputChange('clarity', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select clarity" />
                </SelectTrigger>
                <SelectContent>
                  {clarities.map(clarity => (
                    <SelectItem key={clarity} value={clarity}>{clarity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                type="number"
                min="1"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="e.g., 5000"
                required
              />
            </div>

            <div>
              <Label htmlFor="certificateNumber">Certificate Number</Label>
              <Input
                id="certificateNumber"
                value={formData.certificateNumber}
                onChange={(e) => handleInputChange('certificateNumber', e.target.value)}
                placeholder="e.g., 1234567890"
              />
            </div>

            <div>
              <Label htmlFor="lab">Lab</Label>
              <Select value={formData.lab} onValueChange={(value) => handleInputChange('lab', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GIA">GIA</SelectItem>
                  <SelectItem value="AGS">AGS</SelectItem>
                  <SelectItem value="SSEF">SSEF</SelectItem>
                  <SelectItem value="Gübelin">Gübelin</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Adding Diamond..." : "Add Diamond to Inventory"}
          </Button>
        </form>
      </CardContent>
    </Card>

    <QRCodeScanner
      isOpen={isScanning}
      onClose={() => setIsScanning(false)}
      onScanSuccess={handleGiaScanSuccess}
    />
    </>
  );
}

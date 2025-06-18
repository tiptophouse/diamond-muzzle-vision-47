
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useInventoryCrud } from "@/hooks/useInventoryCrud";
import { DiamondFormData } from "@/components/inventory/form/types";

const shapes = ["Round", "Princess", "Emerald", "Asscher", "Oval", "Radiant", "Pear", "Heart", "Marquise", "Cushion"];
const colors = ["D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
const clarities = ["FL", "IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2", "SI3", "I1", "I2", "I3"];

export function SingleStoneUploadForm() {
  const { user } = useTelegramAuth();
  const { addDiamond, isLoading } = useInventoryCrud();
  
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
    if (!formData.stockNumber || !formData.shape || !formData.carat || !formData.color || !formData.clarity || !formData.price) {
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
  );
}

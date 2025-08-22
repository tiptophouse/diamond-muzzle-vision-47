import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DiamondFormData } from '@/components/inventory/form/types';
import { useAddDiamond } from '@/hooks/inventory/useAddDiamond';

const SHAPES = ['Round', 'Princess', 'Emerald', 'Asscher', 'Marquise', 'Oval', 'Radiant', 'Pear', 'Heart', 'Cushion'];
const COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
const CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'SI3', 'I1', 'I2', 'I3'];
const CUTS = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];

export function SingleStoneUploadForm() {
  const [formData, setFormData] = useState<DiamondFormData>({
    stockNumber: '',
    shape: '',
    carat: 0,
    color: '',
    clarity: '',
    cut: '',
    price: 0,
    status: 'Available',
  });

  const { addDiamond, isLoading } = useAddDiamond();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.shape || !formData.color || !formData.clarity || formData.carat <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await addDiamond(formData);
      
      // Reset form
      setFormData({
        stockNumber: '',
        shape: '',
        carat: 0,
        color: '',
        clarity: '',
        cut: '',
        price: 0,
        status: 'Available',
      });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleInputChange = (field: keyof DiamondFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Single Diamond</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stockNumber">Stock Number</Label>
              <Input
                id="stockNumber"
                value={formData.stockNumber}
                onChange={(e) => handleInputChange('stockNumber', e.target.value)}
                placeholder="Enter stock number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shape">Shape *</Label>
              <Select value={formData.shape} onValueChange={(value) => handleInputChange('shape', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shape" />
                </SelectTrigger>
                <SelectContent>
                  {SHAPES.map(shape => (
                    <SelectItem key={shape} value={shape}>{shape}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="carat">Carat *</Label>
              <Input
                id="carat"
                type="number"
                step="0.01"
                min="0"
                value={formData.carat || ''}
                onChange={(e) => handleInputChange('carat', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color *</Label>
              <Select value={formData.color} onValueChange={(value) => handleInputChange('color', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {COLORS.map(color => (
                    <SelectItem key={color} value={color}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clarity">Clarity *</Label>
              <Select value={formData.clarity} onValueChange={(value) => handleInputChange('clarity', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select clarity" />
                </SelectTrigger>
                <SelectContent>
                  {CLARITIES.map(clarity => (
                    <SelectItem key={clarity} value={clarity}>{clarity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cut">Cut</Label>
              <Select value={formData.cut} onValueChange={(value) => handleInputChange('cut', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cut" />
                </SelectTrigger>
                <SelectContent>
                  {CUTS.map(cut => (
                    <SelectItem key={cut} value={cut}>{cut}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min="0"
                value={formData.price || ''}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificateNumber">Certificate Number</Label>
              <Input
                id="certificateNumber"
                value={formData.certificateNumber || ''}
                onChange={(e) => handleInputChange('certificateNumber', e.target.value)}
                placeholder="Enter certificate number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lab">Lab</Label>
              <Input
                id="lab"
                value={formData.lab || ''}
                onChange={(e) => handleInputChange('lab', e.target.value)}
                placeholder="GIA, AGS, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fluorescence">Fluorescence</Label>
              <Input
                id="fluorescence"
                value={formData.fluorescence || ''}
                onChange={(e) => handleInputChange('fluorescence', e.target.value)}
                placeholder="None, Faint, Medium, Strong"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="polish">Polish</Label>
              <Select value={formData.polish || ''} onValueChange={(value) => handleInputChange('polish', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select polish" />
                </SelectTrigger>
                <SelectContent>
                  {CUTS.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symmetry">Symmetry</Label>
              <Select value={formData.symmetry || ''} onValueChange={(value) => handleInputChange('symmetry', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select symmetry" />
                </SelectTrigger>
                <SelectContent>
                  {CUTS.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setFormData({
              stockNumber: '',
              shape: '',
              carat: 0,
              color: '',
              clarity: '',
              cut: '',
              price: 0,
              status: 'Available',
            })}>
              Clear
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Diamond'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

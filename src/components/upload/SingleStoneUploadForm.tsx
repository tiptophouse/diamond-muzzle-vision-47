
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Diamond, Gem } from 'lucide-react';

export interface SingleStoneUploadFormProps {
  onSuccess?: () => void;
  initialData?: any;
  showScanButton?: boolean;
}

export function SingleStoneUploadForm({ onSuccess, initialData, showScanButton }: SingleStoneUploadFormProps) {
  const [formData, setFormData] = useState({
    stock: initialData?.stock || '',
    shape: initialData?.shape || '',
    weight: initialData?.weight || '',
    color: initialData?.color || '',
    clarity: initialData?.clarity || '',
    cut: initialData?.cut || '',
    price_per_carat: initialData?.price_per_carat || '',
    ...initialData
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast({
        title: "❌ Authentication Error",
        description: "Please log in to add diamonds",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`https://api.mazalbot.com/api/v1/diamonds/?user_id=${user.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "✅ Success",
          description: "Diamond added successfully!",
        });
        
        // Reset form
        setFormData({
          stock: '',
          shape: '',
          weight: '',
          color: '',
          clarity: '',
          cut: '',
          price_per_carat: '',
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to add diamond');
      }
    } catch (error) {
      console.error('❌ Add diamond error:', error);
      toast({
        title: "❌ Failed",
        description: error instanceof Error ? error.message : "Failed to add diamond",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Diamond className="h-5 w-5" />
          Add Individual Diamond
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock">Stock Number *</Label>
              <Input
                id="stock"
                value={formData.stock}
                onChange={(e) => updateField('stock', e.target.value)}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="shape">Shape *</Label>
              <Select value={formData.shape} onValueChange={(value) => updateField('shape', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shape" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Round">Round</SelectItem>
                  <SelectItem value="Princess">Princess</SelectItem>
                  <SelectItem value="Emerald">Emerald</SelectItem>
                  <SelectItem value="Oval">Oval</SelectItem>
                  <SelectItem value="Cushion">Cushion</SelectItem>
                  <SelectItem value="Pear">Pear</SelectItem>
                  <SelectItem value="Marquise">Marquise</SelectItem>
                  <SelectItem value="Heart">Heart</SelectItem>
                  <SelectItem value="Radiant">Radiant</SelectItem>
                  <SelectItem value="Asscher">Asscher</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="weight">Carat Weight *</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => updateField('weight', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="color">Color *</Label>
              <Select value={formData.color} onValueChange={(value) => updateField('color', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'].map(color => (
                    <SelectItem key={color} value={color}>{color}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="clarity">Clarity *</Label>
              <Select value={formData.clarity} onValueChange={(value) => updateField('clarity', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select clarity" />
                </SelectTrigger>
                <SelectContent>
                  {['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'].map(clarity => (
                    <SelectItem key={clarity} value={clarity}>{clarity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cut">Cut *</Label>
              <Select value={formData.cut} onValueChange={(value) => updateField('cut', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select cut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Very Good">Very Good</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price_per_carat">Price per Carat ($)</Label>
              <Input
                id="price_per_carat"
                type="number"
                value={formData.price_per_carat}
                onChange={(e) => updateField('price_per_carat', e.target.value)}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Gem className="h-4 w-4 mr-2 animate-spin" />
                Adding Diamond...
              </>
            ) : (
              <>
                <Diamond className="h-4 w-4 mr-2" />
                Add Diamond
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

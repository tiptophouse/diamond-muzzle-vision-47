
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStones } from '@/hooks/useStones';

const shapes = ['Round', 'Princess', 'Cushion', 'Emerald', 'Oval', 'Radiant', 'Asscher', 'Marquise', 'Heart', 'Pear'];
const colors = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
const clarities = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'SI3', 'I1', 'I2', 'I3'];

export function AddStoneForm() {
  const { addStone, isAddingStone } = useStones();
  const [formData, setFormData] = useState({
    stock_number: '',
    shape: '',
    weight: '',
    color: '',
    clarity: '',
    price_per_carat: '',
    status: 'available',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addStone({
      stock_number: formData.stock_number,
      shape: formData.shape,
      weight: parseFloat(formData.weight),
      color: formData.color,
      clarity: formData.clarity,
      price_per_carat: parseFloat(formData.price_per_carat),
      status: formData.status,
    });

    // Reset form
    setFormData({
      stock_number: '',
      shape: '',
      weight: '',
      color: '',
      clarity: '',
      price_per_carat: '',
      status: 'available',
    });
  };

  const isFormValid = formData.stock_number && formData.shape && formData.weight && 
                     formData.color && formData.clarity && formData.price_per_carat;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Stone</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock_number">Stock Number *</Label>
              <Input
                id="stock_number"
                value={formData.stock_number}
                onChange={(e) => setFormData(prev => ({ ...prev, stock_number: e.target.value }))}
                placeholder="Enter stock number"
                required
              />
            </div>

            <div>
              <Label htmlFor="shape">Shape *</Label>
              <Select value={formData.shape} onValueChange={(value) => setFormData(prev => ({ ...prev, shape: value }))}>
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
              <Label htmlFor="weight">Weight (ct) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <Label htmlFor="color">Color *</Label>
              <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
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
              <Select value={formData.clarity} onValueChange={(value) => setFormData(prev => ({ ...prev, clarity: value }))}>
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
              <Label htmlFor="price_per_carat">Price per Carat *</Label>
              <Input
                id="price_per_carat"
                type="number"
                step="0.01"
                value={formData.price_per_carat}
                onChange={(e) => setFormData(prev => ({ ...prev, price_per_carat: e.target.value }))}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={!isFormValid || isAddingStone}
            className="w-full"
          >
            {isAddingStone ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Adding Stone...
              </>
            ) : (
              'Add Stone'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

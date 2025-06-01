
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Diamond } from './InventoryTable';

interface DiamondFormData {
  stockNumber: string;
  shape: string;
  carat: number;
  color: string;
  clarity: string;
  cut: string;
  price: number;
  status: string;
  imageUrl?: string;
}

interface DiamondFormProps {
  diamond?: Diamond;
  onSubmit: (data: DiamondFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const shapes = ['Round', 'Princess', 'Cushion', 'Emerald', 'Oval', 'Radiant', 'Asscher', 'Marquise', 'Heart', 'Pear'];
const colors = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
const clarities = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'I2', 'I3'];
const cuts = ['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'];
const statuses = ['Available', 'Reserved', 'Sold'];

export function DiamondForm({ diamond, onSubmit, onCancel, isLoading = false }: DiamondFormProps) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<DiamondFormData>({
    defaultValues: diamond ? {
      stockNumber: diamond.stockNumber,
      shape: diamond.shape,
      carat: diamond.carat,
      color: diamond.color,
      clarity: diamond.clarity,
      cut: diamond.cut,
      price: diamond.price,
      status: diamond.status,
      imageUrl: diamond.imageUrl || '',
    } : {
      status: 'Available',
      imageUrl: '',
      shape: 'Round',
      color: 'G',
      clarity: 'VS1',
      cut: 'Excellent'
    }
  });

  React.useEffect(() => {
    if (diamond) {
      console.log('Resetting form with diamond data:', diamond);
      reset({
        stockNumber: diamond.stockNumber,
        shape: diamond.shape,
        carat: diamond.carat,
        color: diamond.color,
        clarity: diamond.clarity,
        cut: diamond.cut,
        price: diamond.price,
        status: diamond.status,
        imageUrl: diamond.imageUrl || '',
      });
    }
  }, [diamond, reset]);

  const handleFormSubmit = (data: DiamondFormData) => {
    console.log('Form submitted with data:', data);
    
    // Ensure all required fields are present
    const formattedData = {
      ...data,
      carat: Number(data.carat),
      price: Number(data.price),
    };
    
    console.log('Formatted form data:', formattedData);
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input
            id="imageUrl"
            {...register('imageUrl')}
            placeholder="Enter image URL (optional)"
          />
        </div>

        <div>
          <Label htmlFor="stockNumber">Stock Number</Label>
          <Input
            id="stockNumber"
            {...register('stockNumber', { required: 'Stock number is required' })}
            placeholder="Enter stock number"
          />
          {errors.stockNumber && (
            <p className="text-sm text-red-600 mt-1">{errors.stockNumber.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="shape">Shape</Label>
          <Select onValueChange={(value) => setValue('shape', value)} value={watch('shape')}>
            <SelectTrigger>
              <SelectValue placeholder="Select shape" />
            </SelectTrigger>
            <SelectContent>
              {shapes.map((shape) => (
                <SelectItem key={shape} value={shape}>{shape}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="carat">Carat</Label>
          <Input
            id="carat"
            type="number"
            step="0.01"
            {...register('carat', { 
              required: 'Carat is required',
              min: { value: 0.01, message: 'Carat must be greater than 0' }
            })}
            placeholder="Enter carat weight"
          />
          {errors.carat && (
            <p className="text-sm text-red-600 mt-1">{errors.carat.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="color">Color</Label>
          <Select onValueChange={(value) => setValue('color', value)} value={watch('color')}>
            <SelectTrigger>
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent>
              {colors.map((color) => (
                <SelectItem key={color} value={color}>{color}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="clarity">Clarity</Label>
          <Select onValueChange={(value) => setValue('clarity', value)} value={watch('clarity')}>
            <SelectTrigger>
              <SelectValue placeholder="Select clarity" />
            </SelectTrigger>
            <SelectContent>
              {clarities.map((clarity) => (
                <SelectItem key={clarity} value={clarity}>{clarity}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="cut">Cut</Label>
          <Select onValueChange={(value) => setValue('cut', value)} value={watch('cut')}>
            <SelectTrigger>
              <SelectValue placeholder="Select cut" />
            </SelectTrigger>
            <SelectContent>
              {cuts.map((cut) => (
                <SelectItem key={cut} value={cut}>{cut}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="number"
            {...register('price', { 
              required: 'Price is required',
              min: { value: 1, message: 'Price must be greater than 0' }
            })}
            placeholder="Enter price"
          />
          {errors.price && (
            <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select onValueChange={(value) => setValue('status', value)} value={watch('status')}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : diamond ? 'Update Diamond' : 'Add Diamond'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

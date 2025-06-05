
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Save, RefreshCw } from 'lucide-react';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { DiamondSelectField } from '@/components/inventory/form/DiamondSelectField';
import { DiamondFormData } from '@/components/inventory/form/types';
import { shapes, colors, clarities, cuts, statuses } from '@/components/inventory/form/diamondFormConstants';

interface SingleStoneFormProps {
  initialData?: Partial<DiamondFormData>;
  onSubmit: (data: DiamondFormData) => void;
  isLoading?: boolean;
}

export function SingleStoneForm({ initialData, onSubmit, isLoading = false }: SingleStoneFormProps) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<DiamondFormData>({
    defaultValues: {
      stockNumber: '',
      carat: 1,
      price: 0,
      status: 'Available',
      imageUrl: '',
      shape: 'Round',
      color: 'G',
      clarity: 'VS1',
      cut: 'Excellent'
    }
  });

  // Update form when initialData changes (from OCR scan)
  useEffect(() => {
    if (initialData) {
      console.log('Updating form with initial data:', initialData);
      Object.entries(initialData).forEach(([key, value]) => {
        if (value !== undefined) {
          setValue(key as keyof DiamondFormData, value);
        }
      });
    }
  }, [initialData, setValue]);

  const currentShape = watch('shape');
  const showCutField = currentShape === 'Round';

  const handleFormSubmit = (data: DiamondFormData) => {
    console.log('Form submitted with data:', data);
    
    // Validate required fields
    if (!data.stockNumber || data.stockNumber.trim() === '') {
      console.error('Stock number is required');
      return;
    }
    
    if (!data.carat || data.carat <= 0) {
      console.error('Valid carat weight is required');
      return;
    }
    
    if (!data.price || data.price <= 0) {
      console.error('Valid price is required');
      return;
    }
    
    const formattedData = {
      ...data,
      stockNumber: data.stockNumber.trim(),
      carat: Number(data.carat),
      price: Number(data.price),
      shape: data.shape || 'Round',
      color: data.color || 'G',
      clarity: data.clarity || 'VS1',
      cut: showCutField ? (data.cut || 'Excellent') : 'N/A',
      status: data.status || 'Available',
      imageUrl: data.imageUrl?.trim() || '',
    };
    
    console.log('Formatted form data:', formattedData);
    onSubmit(formattedData);
  };

  const resetForm = () => {
    reset({
      stockNumber: '',
      carat: 1,
      price: 0,
      status: 'Available',
      imageUrl: '',
      shape: 'Round',
      color: 'G',
      clarity: 'VS1',
      cut: 'Excellent'
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Auto-populated fields from GIA scan */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Diamond Details</h3>
        <p className="text-sm text-gray-600">These fields can be auto-filled by scanning a GIA certificate</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DiamondInputField
            id="stockNumber"
            label="Stock Number / Certificate Number"
            placeholder="Enter stock or certificate number"
            register={register}
            validation={{ required: 'Stock number is required' }}
            errors={errors}
          />

          <DiamondSelectField
            id="shape"
            label="Shape"
            value={watch('shape') || 'Round'}
            onValueChange={(value) => setValue('shape', value)}
            options={shapes}
          />

          <DiamondInputField
            id="carat"
            label="Carat Weight"
            type="number"
            step="0.01"
            placeholder="Enter carat weight"
            register={register}
            validation={{ 
              required: 'Carat is required',
              min: { value: 0.01, message: 'Carat must be greater than 0' }
            }}
            errors={errors}
          />

          <DiamondSelectField
            id="color"
            label="Color Grade"
            value={watch('color') || 'G'}
            onValueChange={(value) => setValue('color', value)}
            options={colors}
          />

          <DiamondSelectField
            id="clarity"
            label="Clarity Grade"
            value={watch('clarity') || 'VS1'}
            onValueChange={(value) => setValue('clarity', value)}
            options={clarities}
          />

          {showCutField && (
            <DiamondSelectField
              id="cut"
              label="Cut Grade"
              value={watch('cut') || 'Excellent'}
              onValueChange={(value) => setValue('cut', value)}
              options={cuts}
            />
          )}
        </div>
      </div>

      {/* Manual input fields */}
      <div className="space-y-4 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900">Manual Input Required</h3>
        <p className="text-sm text-gray-600">These fields must be filled manually</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DiamondInputField
            id="price"
            label="Price (USD) *"
            type="number"
            placeholder="Enter price in USD"
            register={register}
            validation={{ 
              required: 'Price is required',
              min: { value: 1, message: 'Price must be greater than 0' }
            }}
            errors={errors}
          />

          <DiamondSelectField
            id="status"
            label="Status"
            value={watch('status') || 'Available'}
            onValueChange={(value) => setValue('status', value)}
            options={statuses}
          />

          <div className="md:col-span-2">
            <DiamondInputField
              id="imageUrl"
              label="Stone Image URL (Optional)"
              placeholder="Enter image URL or upload separately"
              register={register}
              errors={errors}
            />
          </div>
        </div>
      </div>

      {/* Form actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button 
          type="button"
          variant="outline" 
          onClick={resetForm}
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reset Form
        </Button>
        <Button 
          type="submit"
          disabled={isLoading}
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Adding Diamond..." : "Add to Inventory"}
        </Button>
      </div>
    </form>
  );
}

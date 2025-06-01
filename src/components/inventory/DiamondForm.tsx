
import React from 'react';
import { useForm } from 'react-hook-form';
import { DiamondInputField } from './form/DiamondInputField';
import { DiamondSelectField } from './form/DiamondSelectField';
import { DiamondFormActions } from './form/DiamondFormActions';
import { DiamondFormData } from './form/types';
import { shapes, colors, clarities, cuts, statuses } from './form/diamondFormConstants';
import { Diamond } from './InventoryTable';

interface DiamondFormProps {
  diamond?: Diamond;
  onSubmit: (data: DiamondFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

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
          <DiamondInputField
            id="imageUrl"
            label="Image URL"
            placeholder="Enter image URL (optional)"
            register={register}
            errors={errors}
          />
        </div>

        <DiamondInputField
          id="stockNumber"
          label="Stock Number"
          placeholder="Enter stock number"
          register={register}
          validation={{ required: 'Stock number is required' }}
          errors={errors}
        />

        <DiamondSelectField
          id="shape"
          label="Shape"
          value={watch('shape')}
          onValueChange={(value) => setValue('shape', value)}
          options={shapes}
        />

        <DiamondInputField
          id="carat"
          label="Carat"
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
          label="Color"
          value={watch('color')}
          onValueChange={(value) => setValue('color', value)}
          options={colors}
        />

        <DiamondSelectField
          id="clarity"
          label="Clarity"
          value={watch('clarity')}
          onValueChange={(value) => setValue('clarity', value)}
          options={clarities}
        />

        <DiamondSelectField
          id="cut"
          label="Cut"
          value={watch('cut')}
          onValueChange={(value) => setValue('cut', value)}
          options={cuts}
        />

        <DiamondInputField
          id="price"
          label="Price ($)"
          type="number"
          placeholder="Enter price"
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
          value={watch('status')}
          onValueChange={(value) => setValue('status', value)}
          options={statuses}
        />
      </div>

      <DiamondFormActions
        diamond={diamond}
        isLoading={isLoading}
        onCancel={onCancel}
      />
    </form>
  );
}

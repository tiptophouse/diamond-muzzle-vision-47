
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DiamondInputField } from './form/DiamondInputField';
import { DiamondSelectField } from './form/DiamondSelectField';
import { DiamondFormData } from './form/types';
import { shapes, colors, clarities, cuts, statuses } from './form/diamondFormConstants';
import { Diamond } from './InventoryTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageUploadManager } from '../upload/ImageUploadManager';
import { Camera, Save, X, Sparkles } from 'lucide-react';

interface EnhancedDiamondFormProps {
  diamond?: Diamond;
  onSubmit: (data: DiamondFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EnhancedDiamondForm({ 
  diamond, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: EnhancedDiamondFormProps) {
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    diamond?.additional_images || []
  );

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<DiamondFormData>({
    defaultValues: diamond ? {
      stockNumber: diamond.stockNumber || '',
      shape: diamond.shape || 'Round',
      carat: diamond.carat || 1,
      color: diamond.color || 'G',
      clarity: diamond.clarity || 'VS1',
      cut: diamond.cut || 'Excellent',
      price: diamond.price || 0,
      status: diamond.status || 'Available',
      imageUrl: diamond.imageUrl || '',
      additional_images: uploadedImages,
      store_visible: diamond.store_visible ?? true,
      fluorescence: diamond.fluorescence || 'None',
      lab: diamond.lab || 'GIA',
      polish: diamond.polish || 'Excellent',
      symmetry: diamond.symmetry || 'Excellent',
      certificate_number: diamond.certificate_number || '',
    } : {
      stockNumber: '',
      carat: 1,
      price: 0,
      status: 'Available',
      imageUrl: '',
      shape: 'Round',
      color: 'G',
      clarity: 'VS1',
      cut: 'Excellent',
      additional_images: [],
      store_visible: true,
      fluorescence: 'None',
      lab: 'GIA',
      polish: 'Excellent',
      symmetry: 'Excellent',
      certificate_number: '',
    }
  });

  React.useEffect(() => {
    if (diamond && diamond.id) {
      console.log('Resetting form with diamond data:', diamond);
      const imageList = diamond.additional_images || [];
      setUploadedImages(imageList);
      
      reset({
        stockNumber: diamond.stockNumber || '',
        shape: diamond.shape || 'Round',
        carat: diamond.carat || 1,
        color: diamond.color || 'G',
        clarity: diamond.clarity || 'VS1',
        cut: diamond.cut || 'Excellent',
        price: diamond.price || 0,
        status: diamond.status || 'Available',
        imageUrl: diamond.imageUrl || '',
        additional_images: imageList,
        store_visible: diamond.store_visible ?? true,
        fluorescence: diamond.fluorescence || 'None',
        lab: diamond.lab || 'GIA',
        polish: diamond.polish || 'Excellent',
        symmetry: diamond.symmetry || 'Excellent',
        certificate_number: diamond.certificate_number || '',
      });
    }
  }, [diamond?.id, reset]);

  const handleImagesUpdate = (images: string[]) => {
    setUploadedImages(images);
    setValue('additional_images', images);
    if (images.length > 0 && !watch('imageUrl')) {
      setValue('imageUrl', images[0]);
    }
  };

  const handleFormSubmit = (data: DiamondFormData) => {
    console.log('Form submitted with data:', data);
    
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
      cut: data.cut || 'Excellent',
      status: data.status || 'Available',
      imageUrl: uploadedImages[0] || data.imageUrl?.trim() || '',
      additional_images: uploadedImages,
      store_visible: data.store_visible ?? true,
      fluorescence: data.fluorescence || 'None',
      lab: data.lab || 'GIA',
      polish: data.polish || 'Excellent',
      symmetry: data.symmetry || 'Excellent',
      certificate_number: data.certificate_number || '',
    };
    
    console.log('Formatted form data:', formattedData);
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Image Upload Section */}
      <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/50 to-purple-50/50 hover:border-blue-300 transition-all duration-300">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-30"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Diamond Gallery
            </CardTitle>
          </div>
          <p className="text-slate-600">
            Upload high-quality images to showcase your diamond's brilliance
          </p>
        </CardHeader>
        <CardContent>
          <ImageUploadManager
            stockNumber={watch('stockNumber') || 'NEW'}
            existingImages={uploadedImages}
            onImagesUpdate={handleImagesUpdate}
            maxImages={8}
          />
        </CardContent>
      </Card>

      {/* Diamond Details */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-xl text-slate-900">Diamond Specifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              value={watch('shape') || 'Round'}
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
              value={watch('color') || 'G'}
              onValueChange={(value) => setValue('color', value)}
              options={colors}
            />

            <DiamondSelectField
              id="clarity"
              label="Clarity"
              value={watch('clarity') || 'VS1'}
              onValueChange={(value) => setValue('clarity', value)}
              options={clarities}
            />

            <DiamondSelectField
              id="cut"
              label="Cut"
              value={watch('cut') || 'Excellent'}
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
              value={watch('status') || 'Available'}
              onValueChange={(value) => setValue('status', value)}
              options={statuses}
            />

            <DiamondInputField
              id="fluorescence"
              label="Fluorescence"
              placeholder="Enter fluorescence"
              register={register}
              errors={errors}
            />

            <DiamondInputField
              id="lab"
              label="Lab"
              placeholder="Enter lab (e.g., GIA)"
              register={register}
              errors={errors}
            />

            <DiamondInputField
              id="certificate_number"
              label="Certificate Number"
              placeholder="Enter certificate number"
              register={register}
              errors={errors}
            />

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="store_visible"
                {...register('store_visible')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="store_visible" className="text-sm font-medium text-gray-700">
                Visible in store
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button 
          type="button"
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4" />
          {isLoading ? "Saving..." : diamond ? "Update Diamond" : "Save Diamond"}
        </Button>
      </div>
    </form>
  );
}


import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Plus, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DiamondFormData } from '@/components/inventory/form/types';
import { useAddDiamond } from '@/hooks/inventory/useAddDiamond';
import { MobileInputField } from './form/MobileInputField';
import { MobileSelectField } from './form/MobileSelectField';
import { MobileFormSection } from './form/MobileFormSection';
import { 
  DIAMOND_SHAPES, 
  DIAMOND_COLORS, 
  DIAMOND_CLARITIES, 
  DIAMOND_CUTS,
  DIAMOND_POLISH_GRADES,
  DIAMOND_SYMMETRY_GRADES,
  DIAMOND_FLUORESCENCE_INTENSITIES,
  DIAMOND_CULET_SIZES,
  DIAMOND_GIRDLE_DESCRIPTIONS
} from '@/components/inventory/form/diamondFormConstants';

const diamondSchema = z.object({
  stock: z.string().min(1, 'Stock number is required'),
  shape: z.string().min(1, 'Shape is required'),
  weight: z.number().min(0.01, 'Weight must be greater than 0'),
  color: z.string().min(1, 'Color is required'),
  clarity: z.string().min(1, 'Clarity is required'),
  lab: z.string().min(1, 'Lab is required'),
  certificate_number: z.number().min(0, 'Certificate number must be positive'),
  certificate_comment: z.string().optional(),
  picture: z.string().optional(),
  length: z.number().min(0, 'Length must be positive'),
  width: z.number().min(0, 'Width must be positive'),
  depth: z.number().min(0, 'Depth must be positive'),
  ratio: z.number().min(0, 'Ratio must be positive'),
  table: z.number().min(0, 'Table must be positive'),
  depth_percentage: z.number().min(0, 'Depth percentage must be positive'),
  cut: z.string().min(1, 'Cut is required'),
  polish: z.string().min(1, 'Polish is required'),
  symmetry: z.string().min(1, 'Symmetry is required'),
  fluorescence: z.string().min(1, 'Fluorescence is required'),
  gridle: z.string().min(1, 'Girdle is required'),
  culet: z.string().min(1, 'Culet is required'),
  rapnet: z.number().min(0, 'Rapnet must be positive'),
  price_per_carat: z.number().min(0, 'Price per carat must be positive'),
});

export function MobileDiamondForm() {
  const { addDiamond, isLoading } = useAddDiamond();
  const [draftSaved, setDraftSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    getValues
  } = useForm<DiamondFormData>({
    resolver: zodResolver(diamondSchema),
    defaultValues: {
      stock: '',
      shape: '',
      weight: 0,
      color: '',
      clarity: '',
      lab: '',
      certificate_number: 0,
      certificate_comment: '',
      picture: '',
      length: 0,
      width: 0,
      depth: 0,
      ratio: 0,
      table: 0,
      depth_percentage: 0,
      cut: '',
      polish: '',
      symmetry: '',
      fluorescence: '',
      gridle: '',
      culet: '',
      rapnet: 0,
      price_per_carat: 0,
    }
  });

  const watchedValues = watch();

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      const values = getValues();
      if (values.stock || values.shape || values.weight > 0) {
        localStorage.setItem('diamond-draft', JSON.stringify(values));
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [watchedValues, getValues]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('diamond-draft');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        Object.keys(parsedDraft).forEach((key) => {
          setValue(key as keyof DiamondFormData, parsedDraft[key]);
        });
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, [setValue]);

  const onSubmit = async (data: DiamondFormData) => {
    console.log('📱 MOBILE FORM: Submitting diamond data:', data);
    
    const success = await addDiamond(data);
    
    if (success) {
      // Clear form and draft
      reset();
      localStorage.removeItem('diamond-draft');
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('diamond-draft');
    reset();
  };

  // Calculate completion for each section
  const basicFields = ['stock', 'shape', 'weight', 'color', 'clarity', 'lab'];
  const basicCompleted = basicFields.filter(field => {
    const value = watchedValues[field as keyof DiamondFormData];
    return value && value !== 0 && value !== '';
  }).length;

  const certificateFields = ['certificate_number'];
  const certificateCompleted = certificateFields.filter(field => {
    const value = watchedValues[field as keyof DiamondFormData];
    return value && value !== 0;
  }).length;

  const measurementFields = ['length', 'width', 'depth', 'ratio', 'table', 'depth_percentage'];
  const measurementCompleted = measurementFields.filter(field => {
    const value = watchedValues[field as keyof DiamondFormData];
    return value && value !== 0;
  }).length;

  const gradingFields = ['cut', 'polish', 'symmetry', 'fluorescence', 'gridle', 'culet'];
  const gradingCompleted = gradingFields.filter(field => {
    const value = watchedValues[field as keyof DiamondFormData];
    return value && value !== '';
  }).length;

  const businessFields = ['rapnet', 'price_per_carat'];
  const businessCompleted = businessFields.filter(field => {
    const value = watchedValues[field as keyof DiamondFormData];
    return value && value !== 0;
  }).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Diamond</h1>
          <p className="text-lg text-gray-600">
            Enter diamond details to add to your inventory
          </p>
          {draftSaved && (
            <p className="text-sm text-green-600 mt-2 font-medium">
              ✓ Draft saved automatically
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <MobileFormSection 
            title="Basic Information"
            defaultOpen={true}
            completedFields={basicCompleted}
            totalFields={basicFields.length}
          >
            <MobileInputField
              id="stock"
              label="Stock Number"
              register={register}
              errors={errors}
              validation={{ required: 'Stock number is required' }}
              required
            />
            
            <MobileSelectField
              id="shape"
              label="Shape"
              value={watchedValues.shape}
              options={DIAMOND_SHAPES}
              onValueChange={(value) => setValue('shape', value)}
              placeholder="Select shape"
              required
              error={errors.shape?.message}
            />

            <MobileInputField
              id="weight"
              label="Weight (Carats)"
              type="number"
              step="0.01"
              register={register}
              errors={errors}
              validation={{ 
                required: 'Weight is required',
                min: { value: 0.01, message: 'Weight must be greater than 0' }
              }}
              required
            />

            <MobileSelectField
              id="color"
              label="Color"
              value={watchedValues.color}
              options={DIAMOND_COLORS}
              onValueChange={(value) => setValue('color', value)}
              placeholder="Select color"
              required
              error={errors.color?.message}
            />

            <MobileSelectField
              id="clarity"
              label="Clarity"
              value={watchedValues.clarity}
              options={DIAMOND_CLARITIES}
              onValueChange={(value) => setValue('clarity', value)}
              placeholder="Select clarity"
              required
              error={errors.clarity?.message}
            />

            <MobileInputField
              id="lab"
              label="Lab"
              register={register}
              errors={errors}
              validation={{ required: 'Lab is required' }}
              required
            />
          </MobileFormSection>

          <MobileFormSection 
            title="Certificate & Media"
            completedFields={certificateCompleted}
            totalFields={certificateFields.length}
          >
            <MobileInputField
              id="certificate_number"
              label="Certificate Number"
              type="number"
              register={register}
              errors={errors}
              validation={{ 
                required: 'Certificate number is required',
                min: { value: 0, message: 'Certificate number must be positive' }
              }}
              required
            />

            <MobileInputField
              id="certificate_comment"
              label="Certificate Comment"
              register={register}
              errors={errors}
            />

            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Picture
              </label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-14 text-lg"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Take Photo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-14 text-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
          </MobileFormSection>

          <MobileFormSection 
            title="Measurements"
            completedFields={measurementCompleted}
            totalFields={measurementFields.length}
          >
            <MobileInputField
              id="length"
              label="Length (mm)"
              type="number"
              step="0.01"
              register={register}
              errors={errors}
              validation={{ min: { value: 0, message: 'Length must be positive' } }}
              required
            />

            <MobileInputField
              id="width"
              label="Width (mm)"
              type="number"
              step="0.01"
              register={register}
              errors={errors}
              validation={{ min: { value: 0, message: 'Width must be positive' } }}
              required
            />

            <MobileInputField
              id="depth"
              label="Depth (mm)"
              type="number"
              step="0.01"
              register={register}
              errors={errors}
              validation={{ min: { value: 0, message: 'Depth must be positive' } }}
              required
            />

            <MobileInputField
              id="ratio"
              label="Ratio"
              type="number"
              step="0.01"
              register={register}
              errors={errors}
              validation={{ min: { value: 0, message: 'Ratio must be positive' } }}
              required
            />

            <MobileInputField
              id="table"
              label="Table (%)"
              type="number"
              step="0.1"
              register={register}
              errors={errors}
              validation={{ min: { value: 0, message: 'Table must be positive' } }}
              required
            />

            <MobileInputField
              id="depth_percentage"
              label="Depth Percentage (%)"
              type="number"
              step="0.1"
              register={register}
              errors={errors}
              validation={{ min: { value: 0, message: 'Depth percentage must be positive' } }}
              required
            />
          </MobileFormSection>

          <MobileFormSection 
            title="Grading"
            completedFields={gradingCompleted}
            totalFields={gradingFields.length}
          >
            <MobileSelectField
              id="cut"
              label="Cut"
              value={watchedValues.cut}
              options={DIAMOND_CUTS}
              onValueChange={(value) => setValue('cut', value)}
              placeholder="Select cut"
              required
              error={errors.cut?.message}
            />

            <MobileSelectField
              id="polish"
              label="Polish"
              value={watchedValues.polish}
              options={DIAMOND_POLISH_GRADES}
              onValueChange={(value) => setValue('polish', value)}
              placeholder="Select polish"
              required
              error={errors.polish?.message}
            />

            <MobileSelectField
              id="symmetry"
              label="Symmetry"
              value={watchedValues.symmetry}
              options={DIAMOND_SYMMETRY_GRADES}
              onValueChange={(value) => setValue('symmetry', value)}
              placeholder="Select symmetry"
              required
              error={errors.symmetry?.message}
            />

            <MobileSelectField
              id="fluorescence"
              label="Fluorescence"
              value={watchedValues.fluorescence}
              options={DIAMOND_FLUORESCENCE_INTENSITIES}
              onValueChange={(value) => setValue('fluorescence', value)}
              placeholder="Select fluorescence"
              required
              error={errors.fluorescence?.message}
            />

            <MobileSelectField
              id="gridle"
              label="Girdle"
              value={watchedValues.gridle}
              options={DIAMOND_GIRDLE_DESCRIPTIONS}
              onValueChange={(value) => setValue('gridle', value)}
              placeholder="Select girdle"
              required
              error={errors.gridle?.message}
            />

            <MobileSelectField
              id="culet"
              label="Culet"
              value={watchedValues.culet}
              options={DIAMOND_CULET_SIZES}
              onValueChange={(value) => setValue('culet', value)}
              placeholder="Select culet"
              required
              error={errors.culet?.message}
            />
          </MobileFormSection>

          <MobileFormSection 
            title="Business Information"
            completedFields={businessCompleted}
            totalFields={businessFields.length}
          >
            <MobileInputField
              id="rapnet"
              label="Rapnet"
              type="number"
              register={register}
              errors={errors}
              validation={{ min: { value: 0, message: 'Rapnet must be positive' } }}
              required
            />

            <MobileInputField
              id="price_per_carat"
              label="Price per Carat ($)"
              type="number"
              register={register}
              errors={errors}
              validation={{ min: { value: 0, message: 'Price per carat must be positive' } }}
              required
            />
          </MobileFormSection>
        </form>
      </div>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={clearDraft}
            className="flex-1 h-14 text-lg"
            disabled={isLoading}
          >
            Clear
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="flex-1 h-14 text-lg bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Adding...
              </div>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Add Diamond
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

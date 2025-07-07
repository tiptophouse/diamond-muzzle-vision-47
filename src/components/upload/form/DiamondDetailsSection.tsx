
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { DiamondFormData } from '@/components/inventory/form/types';
import { shapes, colors, clarities, cuts, fluorescences, polishGrades, symmetryGrades } from '@/components/inventory/form/diamondFormConstants';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DiamondDetailsSectionProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function DiamondDetailsSection({ register, setValue, watch, errors }: DiamondDetailsSectionProps) {
  const currentShape = watch('shape');
  const showCutField = currentShape === 'Round';

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Diamond Details</h3>
        <p className="text-sm text-muted-foreground">These fields can be auto-filled by scanning a GIA certificate</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DiamondInputField
          id="stockNumber"
          label="Stock Number / Certificate Number"
          placeholder="Enter stock or certificate number"
          register={register}
          validation={{ required: 'Stock number is required' }}
          errors={errors}
        />

        <div className="space-y-2">
          <Label htmlFor="shape" className="text-sm font-medium text-foreground">
            Shape
          </Label>
          <Select value={watch('shape') || 'Round'} onValueChange={(value) => setValue('shape', value)}>
            <SelectTrigger className="w-full" type="button">
              <SelectValue placeholder="Select shape" />
            </SelectTrigger>
            <SelectContent>
              {shapes.map((shape) => (
                <SelectItem key={shape} value={shape}>
                  {shape}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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

        <div className="space-y-2">
          <Label htmlFor="color" className="text-sm font-medium text-foreground">
            Color Grade
          </Label>
          <Select value={watch('color') || 'G'} onValueChange={(value) => setValue('color', value)}>
            <SelectTrigger className="w-full" type="button">
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent>
              {colors.map((color) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clarity" className="text-sm font-medium text-foreground">
            Clarity Grade
          </Label>
          <Select value={watch('clarity') || 'VS1'} onValueChange={(value) => setValue('clarity', value)}>
            <SelectTrigger className="w-full" type="button">
              <SelectValue placeholder="Select clarity" />
            </SelectTrigger>
            <SelectContent>
              {clarities.map((clarity) => (
                <SelectItem key={clarity} value={clarity}>
                  {clarity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showCutField && (
          <div className="space-y-2">
            <Label htmlFor="cut" className="text-sm font-medium text-foreground">
              Cut Grade
            </Label>
            <Select value={watch('cut') || 'Excellent'} onValueChange={(value) => setValue('cut', value)}>
              <SelectTrigger className="w-full" type="button">
                <SelectValue placeholder="Select cut" />
              </SelectTrigger>
              <SelectContent>
                {cuts.map((cut) => (
                  <SelectItem key={cut} value={cut}>
                    {cut}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="fluorescence" className="text-sm font-medium text-foreground">
            Fluorescence
          </Label>
          <Select value={watch('fluorescence') || 'None'} onValueChange={(value) => setValue('fluorescence', value)}>
            <SelectTrigger className="w-full" type="button">
              <SelectValue placeholder="Select fluorescence" />
            </SelectTrigger>
            <SelectContent>
              {fluorescences.map((fluorescence) => (
                <SelectItem key={fluorescence} value={fluorescence}>
                  {fluorescence}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="polish" className="text-sm font-medium text-foreground">
            Polish
          </Label>
          <Select value={watch('polish') || 'Excellent'} onValueChange={(value) => setValue('polish', value)}>
            <SelectTrigger className="w-full" type="button">
              <SelectValue placeholder="Select polish" />
            </SelectTrigger>
            <SelectContent>
              {polishGrades.map((polish) => (
                <SelectItem key={polish} value={polish}>
                  {polish}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="symmetry" className="text-sm font-medium text-foreground">
            Symmetry
          </Label>
          <Select value={watch('symmetry') || 'Excellent'} onValueChange={(value) => setValue('symmetry', value)}>
            <SelectTrigger className="w-full" type="button">
              <SelectValue placeholder="Select symmetry" />
            </SelectTrigger>
            <SelectContent>
              {symmetryGrades.map((symmetry) => (
                <SelectItem key={symmetry} value={symmetry}>
                  {symmetry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

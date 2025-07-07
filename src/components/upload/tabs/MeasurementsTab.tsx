import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondFormData } from '@/components/inventory/form/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface MeasurementsTabProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function MeasurementsTab({ register, setValue, watch, errors }: MeasurementsTabProps) {
  const length = watch('length');
  const width = watch('width');

  // Auto-calculate ratio if both length and width are provided
  React.useEffect(() => {
    if (length && width && length > 0 && width > 0) {
      const calculatedRatio = (length / width).toFixed(2);
      setValue('ratio', Number(calculatedRatio));
    }
  }, [length, width, setValue]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Physical Measurements</h3>
        <p className="text-sm text-muted-foreground">Precise measurements and proportions of the diamond</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Length */}
        <div className="space-y-2">
          <Label htmlFor="length" className="text-sm font-medium">Length (mm)</Label>
          <Input
            id="length"
            type="number"
            step="0.01"
            {...register('length', { 
              min: { value: 0.01, message: 'Length must be greater than 0' }
            })}
            placeholder="e.g., 6.52"
            className="h-10"
          />
          {errors.length && (
            <p className="text-sm text-destructive">{errors.length.message}</p>
          )}
        </div>

        {/* Width */}
        <div className="space-y-2">
          <Label htmlFor="width" className="text-sm font-medium">Width (mm)</Label>
          <Input
            id="width"
            type="number"
            step="0.01"
            {...register('width', { 
              min: { value: 0.01, message: 'Width must be greater than 0' }
            })}
            placeholder="e.g., 6.48"
            className="h-10"
          />
          {errors.width && (
            <p className="text-sm text-destructive">{errors.width.message}</p>
          )}
        </div>

        {/* Depth */}
        <div className="space-y-2">
          <Label htmlFor="depth" className="text-sm font-medium">Depth (mm)</Label>
          <Input
            id="depth"
            type="number"
            step="0.01"
            {...register('depth', { 
              min: { value: 0.01, message: 'Depth must be greater than 0' }
            })}
            placeholder="e.g., 4.07"
            className="h-10"
          />
          {errors.depth && (
            <p className="text-sm text-destructive">{errors.depth.message}</p>
          )}
        </div>

        {/* Ratio */}
        <div className="space-y-2">
          <Label htmlFor="ratio" className="text-sm font-medium">Length/Width Ratio</Label>
          <Input
            id="ratio"
            type="number"
            step="0.01"
            {...register('ratio')}
            placeholder="Auto-calculated or manual"
            className="h-10"
          />
          {errors.ratio && (
            <p className="text-sm text-destructive">{errors.ratio.message}</p>
          )}
        </div>

        {/* Table Percentage */}
        <div className="space-y-2">
          <Label htmlFor="tablePercentage" className="text-sm font-medium">Table %</Label>
          <Input
            id="tablePercentage"
            type="number"
            step="0.1"
            {...register('tablePercentage', { 
              min: { value: 1, message: 'Table % must be between 1-100' },
              max: { value: 100, message: 'Table % must be between 1-100' }
            })}
            placeholder="e.g., 57.0"
            className="h-10"
          />
          {errors.tablePercentage && (
            <p className="text-sm text-destructive">{errors.tablePercentage.message}</p>
          )}
        </div>

        {/* Depth Percentage */}
        <div className="space-y-2">
          <Label htmlFor="depthPercentage" className="text-sm font-medium">Depth %</Label>
          <Input
            id="depthPercentage"
            type="number"
            step="0.1"
            {...register('depthPercentage', { 
              min: { value: 1, message: 'Depth % must be between 1-100' },
              max: { value: 100, message: 'Depth % must be between 1-100' }
            })}
            placeholder="e.g., 62.8"
            className="h-10"
          />
          {errors.depthPercentage && (
            <p className="text-sm text-destructive">{errors.depthPercentage.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { DiamondFormData } from '@/components/inventory/form/types';
import { NativeMobileSelector } from '@/components/ui/NativeMobileSelector';
import { NativeWheelPicker } from '@/components/ui/NativeWheelPicker';
import { cuts, fluorescences, polishGrades, symmetryGrades, girdleTypes, culetGrades } from '@/components/inventory/form/diamondFormConstants';

interface GradingSectionProps {
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
}

/**
 * Diamond grading details section
 * Cut, polish, symmetry, fluorescence, girdle, culet
 */
export function GradingSection({ setValue, watch }: GradingSectionProps) {
  const currentShape = watch('shape');
  const showCutField = currentShape === 'Round';

  return (
    <div className="space-y-4 px-3">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">דירוג ואיכות</h3>
        <p className="text-xs text-muted-foreground">פרטי דירוג מקצועיים</p>
      </div>
      
      <div className="space-y-3">
        {showCutField && (
          <NativeMobileSelector
            id="cut"
            label="חיתוך"
            value={watch('cut') || 'Excellent'}
            onValueChange={(value) => setValue('cut', value)}
            options={cuts}
            columns={2}
          />
        )}

        <NativeWheelPicker
          id="polish"
          label="ליטוש"
          value={watch('polish') || 'Excellent'}
          onValueChange={(value) => setValue('polish', value)}
          options={polishGrades}
        />

        <NativeWheelPicker
          id="symmetry"
          label="סימטריה"
          value={watch('symmetry') || 'Excellent'}
          onValueChange={(value) => setValue('symmetry', value)}
          options={symmetryGrades}
        />

        <NativeWheelPicker
          id="fluorescence"
          label="פלואורסנציה"
          value={watch('fluorescence') || 'None'}
          onValueChange={(value) => setValue('fluorescence', value)}
          options={fluorescences}
        />

        <NativeMobileSelector
          id="gridle"
          label="Girdle"
          value={watch('gridle') || 'Medium'}
          onValueChange={(value) => setValue('gridle', value)}
          options={girdleTypes}
          columns={2}
        />

        <NativeMobileSelector
          id="culet"
          label="Culet"
          value={watch('culet') || 'None'}
          onValueChange={(value) => setValue('culet', value)}
          options={culetGrades}
          columns={2}
        />
      </div>
    </div>
  );
}

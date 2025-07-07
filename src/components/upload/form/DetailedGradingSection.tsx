
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondFormData } from '@/components/inventory/form/types';
import { 
  fluorescences, 
  polishGrades, 
  symmetryGrades, 
  girdleTypes, 
  culetGrades 
} from '@/components/inventory/form/diamondFormConstants';
import { Label } from '@/components/ui/label';

interface DetailedGradingSectionProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function DetailedGradingSection({ register, setValue, watch, errors }: DetailedGradingSectionProps) {
  return (
    <div className="space-y-4 border-t pt-6">
      <h3 className="text-lg font-semibold text-gray-900">Detailed Grading</h3>
      <p className="text-sm text-gray-600">Professional grading details from certificate</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="fluorescence">Fluorescence</Label>
          <select
            id="fluorescence"
            {...register('fluorescence')}
            className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            {fluorescences.map((fluorescence) => (
              <option key={fluorescence} value={fluorescence}>
                {fluorescence}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="polish">Polish</Label>
          <select
            id="polish"
            {...register('polish')}
            className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            {polishGrades.map((polish) => (
              <option key={polish} value={polish}>
                {polish}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="symmetry">Symmetry</Label>
          <select
            id="symmetry"
            {...register('symmetry')}
            className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            {symmetryGrades.map((symmetry) => (
              <option key={symmetry} value={symmetry}>
                {symmetry}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="gridle">Girdle</Label>
          <select
            id="gridle"
            {...register('gridle')}
            className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            {girdleTypes.map((girdle) => (
              <option key={girdle} value={girdle}>
                {girdle}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="culet">Culet</Label>
          <select
            id="culet"
            {...register('culet')}
            className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          >
            {culetGrades.map((culet) => (
              <option key={culet} value={culet}>
                {culet}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}


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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DetailedGradingSectionProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function DetailedGradingSection({ register, setValue, watch, errors }: DetailedGradingSectionProps) {
  return (
    <div className="space-y-6 border-t pt-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Detailed Grading</h3>
        <p className="text-sm text-muted-foreground">Professional grading details from certificate</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

        <div className="space-y-2">
          <Label htmlFor="gridle" className="text-sm font-medium text-foreground">
            Girdle
          </Label>
          <Select value={watch('gridle') || 'Medium'} onValueChange={(value) => setValue('gridle', value)}>
            <SelectTrigger className="w-full" type="button">
              <SelectValue placeholder="Select girdle" />
            </SelectTrigger>
            <SelectContent>
              {girdleTypes.map((girdle) => (
                <SelectItem key={girdle} value={girdle}>
                  {girdle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="culet" className="text-sm font-medium text-foreground">
            Culet
          </Label>
          <Select value={watch('culet') || 'None'} onValueChange={(value) => setValue('culet', value)}>
            <SelectTrigger className="w-full" type="button">
              <SelectValue placeholder="Select culet" />
            </SelectTrigger>
            <SelectContent>
              {culetGrades.map((culet) => (
                <SelectItem key={culet} value={culet}>
                  {culet}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

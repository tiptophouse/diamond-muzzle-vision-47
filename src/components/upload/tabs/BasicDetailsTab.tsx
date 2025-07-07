import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondFormData } from '@/components/inventory/form/types';
import { shapes, colors, clarities, cuts, fluorescences, polishGrades, symmetryGrades } from '@/components/inventory/form/diamondFormConstants';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface BasicDetailsTabProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
  showCutField: boolean;
}

export function BasicDetailsTab({ register, setValue, watch, errors, showCutField }: BasicDetailsTabProps) {
  // Grade mapping functions
  const getClarityValue = (clarity: string) => {
    const index = clarities.indexOf(clarity);
    return index >= 0 ? index : 4; // Default to VS1
  };
  
  const getClarityFromValue = (value: number) => {
    return clarities[value] || 'VS1';
  };
  
  const getCutValue = (cut: string) => {
    const index = cuts.indexOf(cut);
    return index >= 0 ? index : 0; // Default to Excellent
  };
  
  const getCutFromValue = (value: number) => {
    return cuts[value] || 'Excellent';
  };
  
  const getPolishValue = (polish: string) => {
    const index = polishGrades.indexOf(polish);
    return index >= 0 ? index : 0; // Default to Excellent
  };
  
  const getPolishFromValue = (value: number) => {
    return polishGrades[value] || 'Excellent';
  };
  
  const getSymmetryValue = (symmetry: string) => {
    const index = symmetryGrades.indexOf(symmetry);
    return index >= 0 ? index : 0; // Default to Excellent
  };
  
  const getSymmetryFromValue = (value: number) => {
    return symmetryGrades[value] || 'Excellent';
  };
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Diamond Details</h3>
        <p className="text-sm text-muted-foreground">Essential diamond characteristics and identification</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stock Number */}
        <div className="space-y-2">
          <Label htmlFor="stockNumber" className="text-sm font-medium">
            Stock Number / Certificate Number *
          </Label>
          <Input
            id="stockNumber"
            {...register('stockNumber', { required: 'Stock number is required' })}
            placeholder="Enter stock or certificate number"
            className="h-10"
          />
          {errors.stockNumber && (
            <p className="text-sm text-destructive">{errors.stockNumber.message}</p>
          )}
        </div>

        {/* Shape */}
        <div className="space-y-2">
          <Label htmlFor="shape" className="text-sm font-medium">Shape</Label>
          <Select value={watch('shape') || 'Round'} onValueChange={(value) => setValue('shape', value)}>
            <SelectTrigger type="button">
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

        {/* Carat */}
        <div className="space-y-2">
          <Label htmlFor="carat" className="text-sm font-medium">
            Carat Weight *
          </Label>
          <Input
            id="carat"
            type="number"
            step="0.01"
            {...register('carat', { 
              required: 'Carat is required',
              min: { value: 0.01, message: 'Carat must be greater than 0' }
            })}
            placeholder="e.g., 1.25"
            className="h-10"
          />
          {errors.carat && (
            <p className="text-sm text-destructive">{errors.carat.message}</p>
          )}
        </div>

        {/* Color */}
        <div className="space-y-2">
          <Label htmlFor="color" className="text-sm font-medium">Color Grade</Label>
          <Select value={watch('color') || 'G'} onValueChange={(value) => setValue('color', value)}>
            <SelectTrigger type="button">
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

        {/* Clarity */}
        <div className="space-y-3">
          <Label htmlFor="clarity" className="text-sm font-medium">
            Clarity Grade: {watch('clarity') || 'VS1'}
          </Label>
          <Slider
            value={[getClarityValue(watch('clarity') || 'VS1')]}
            onValueChange={(value) => setValue('clarity', getClarityFromValue(value[0]))}
            max={clarities.length - 1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>FL (Best)</span>
            <span>I3 (Lowest)</span>
          </div>
        </div>

        {/* Cut - Only for Round diamonds */}
        {showCutField && (
          <div className="space-y-3">
            <Label htmlFor="cut" className="text-sm font-medium">
              Cut Grade: {watch('cut') || 'Excellent'}
            </Label>
            <Slider
              value={[getCutValue(watch('cut') || 'Excellent')]}
              onValueChange={(value) => setValue('cut', getCutFromValue(value[0]))}
              max={cuts.length - 1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Excellent</span>
              <span>Poor</span>
            </div>
          </div>
        )}

        {/* Fluorescence */}
        <div className="space-y-2">
          <Label htmlFor="fluorescence" className="text-sm font-medium">Fluorescence</Label>
          <Select value={watch('fluorescence') || 'No'} onValueChange={(value) => setValue('fluorescence', value)}>
            <SelectTrigger type="button">
              <SelectValue placeholder="Select fluorescence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="No">No</SelectItem>
              <SelectItem value="Yes">Yes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Polish */}
        <div className="space-y-3">
          <Label htmlFor="polish" className="text-sm font-medium">
            Polish: {watch('polish') || 'Excellent'}
          </Label>
          <Slider
            value={[getPolishValue(watch('polish') || 'Excellent')]}
            onValueChange={(value) => setValue('polish', getPolishFromValue(value[0]))}
            max={polishGrades.length - 1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Excellent</span>
            <span>Poor</span>
          </div>
        </div>

        {/* Symmetry */}
        <div className="space-y-3">
          <Label htmlFor="symmetry" className="text-sm font-medium">
            Symmetry: {watch('symmetry') || 'Excellent'}
          </Label>
          <Slider
            value={[getSymmetryValue(watch('symmetry') || 'Excellent')]}
            onValueChange={(value) => setValue('symmetry', getSymmetryFromValue(value[0]))}
            max={symmetryGrades.length - 1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Excellent</span>
            <span>Poor</span>
          </div>
        </div>
      </div>
    </div>
  );
}
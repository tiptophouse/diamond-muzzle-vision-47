import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondFormData } from '@/components/inventory/form/types';
import { shapes, colors, clarities, cuts, fluorescences, polishGrades, symmetryGrades } from '@/components/inventory/form/diamondFormConstants';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicDetailsTabProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
  showCutField: boolean;
}

export function BasicDetailsTab({ register, setValue, watch, errors, showCutField }: BasicDetailsTabProps) {
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
            <SelectTrigger>
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
            <SelectTrigger>
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
        <div className="space-y-2">
          <Label htmlFor="clarity" className="text-sm font-medium">Clarity Grade</Label>
          <Select value={watch('clarity') || 'VS1'} onValueChange={(value) => setValue('clarity', value)}>
            <SelectTrigger>
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

        {/* Cut - Only for Round diamonds */}
        {showCutField && (
          <div className="space-y-2">
            <Label htmlFor="cut" className="text-sm font-medium">Cut Grade</Label>
            <Select value={watch('cut') || 'Excellent'} onValueChange={(value) => setValue('cut', value)}>
              <SelectTrigger>
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

        {/* Fluorescence */}
        <div className="space-y-2">
          <Label htmlFor="fluorescence" className="text-sm font-medium">Fluorescence</Label>
          <Select value={watch('fluorescence') || 'None'} onValueChange={(value) => setValue('fluorescence', value)}>
            <SelectTrigger>
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

        {/* Polish */}
        <div className="space-y-2">
          <Label htmlFor="polish" className="text-sm font-medium">Polish</Label>
          <Select value={watch('polish') || 'Excellent'} onValueChange={(value) => setValue('polish', value)}>
            <SelectTrigger>
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

        {/* Symmetry */}
        <div className="space-y-2">
          <Label htmlFor="symmetry" className="text-sm font-medium">Symmetry</Label>
          <Select value={watch('symmetry') || 'Excellent'} onValueChange={(value) => setValue('symmetry', value)}>
            <SelectTrigger>
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
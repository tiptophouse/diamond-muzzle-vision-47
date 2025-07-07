import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondFormData } from '@/components/inventory/form/types';
import { labOptions, girdleTypes, culetGrades } from '@/components/inventory/form/diamondFormConstants';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface CertificateTabProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function CertificateTab({ register, setValue, watch, errors }: CertificateTabProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Certificate Information</h3>
        <p className="text-sm text-muted-foreground">GIA or other grading laboratory certificate details</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Certificate Number */}
        <div className="space-y-2">
          <Label htmlFor="certificateNumber" className="text-sm font-medium">
            Certificate Number
          </Label>
          <Input
            id="certificateNumber"
            {...register('certificateNumber')}
            placeholder="e.g., 2141438171"
            className="h-10"
          />
          {errors.certificateNumber && (
            <p className="text-sm text-destructive">{errors.certificateNumber.message}</p>
          )}
        </div>

        {/* Grading Laboratory */}
        <div className="space-y-2">
          <Label htmlFor="lab" className="text-sm font-medium">Grading Laboratory</Label>
          <Select value={watch('lab') || 'GIA'} onValueChange={(value) => setValue('lab', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select laboratory" />
            </SelectTrigger>
            <SelectContent>
              {labOptions.map((lab) => (
                <SelectItem key={lab} value={lab}>
                  {lab}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Girdle */}
        <div className="space-y-2">
          <Label htmlFor="gridle" className="text-sm font-medium">Girdle</Label>
          <Select value={watch('gridle') || 'Medium'} onValueChange={(value) => setValue('gridle', value)}>
            <SelectTrigger>
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

        {/* Culet */}
        <div className="space-y-2">
          <Label htmlFor="culet" className="text-sm font-medium">Culet</Label>
          <Select value={watch('culet') || 'None'} onValueChange={(value) => setValue('culet', value)}>
            <SelectTrigger>
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

        {/* Certificate URL */}
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="certificateUrl" className="text-sm font-medium">
            Certificate URL
          </Label>
          <Input
            id="certificateUrl"
            {...register('certificateUrl')}
            placeholder="Link to online certificate verification"
            className="h-10"
          />
          {errors.certificateUrl && (
            <p className="text-sm text-destructive">{errors.certificateUrl.message}</p>
          )}
        </div>

        {/* Certificate Comments */}
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="certificateComment" className="text-sm font-medium">
            Certificate Comments
          </Label>
          <Textarea
            id="certificateComment"
            {...register('certificateComment')}
            placeholder="Additional comments or inscriptions"
            className="min-h-[80px]"
          />
          {errors.certificateComment && (
            <p className="text-sm text-destructive">{errors.certificateComment.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
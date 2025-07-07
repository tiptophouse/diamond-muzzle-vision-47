
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { ModernSelectField } from '@/components/inventory/form/ModernSelectField';
import { DiamondFormData } from '@/components/inventory/form/types';
import { labOptions } from '@/components/inventory/form/diamondFormConstants';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MobileCertificateSectionProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function MobileCertificateSection({ register, setValue, watch, errors }: MobileCertificateSectionProps) {
  const [certificateDate, setCertificateDate] = React.useState<Date>();

  return (
    <div className="space-y-4 border-t pt-6">
      <div className="border-l-4 border-blue-400 pl-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Certificate Information</h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">GIA or other grading laboratory details</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DiamondInputField
            id="certificateNumber"
            label="Certificate Number"
            placeholder="e.g., 2141438171"
            register={register}
            errors={errors}
            className="text-base"
          />

          <ModernSelectField
            id="lab"
            label="Grading Laboratory"
            value={watch('lab') || 'GIA'}
            onValueChange={(value) => setValue('lab', value)}
            options={labOptions}
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Certificate Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12",
                  !certificateDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {certificateDate ? format(certificateDate, "PPP") : <span>Pick certificate date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={certificateDate}
                onSelect={setCertificateDate}
                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <DiamondInputField
          id="certificateUrl"
          label="Certificate URL"
          placeholder="Link to online certificate verification"
          register={register}
          errors={errors}
          className="text-base"
        />

        <DiamondInputField
          id="certificateComment"
          label="Certificate Comments"
          placeholder="Additional comments or inscriptions"
          register={register}
          errors={errors}
          className="text-base"
        />
      </div>
    </div>
  );
}


import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { DiamondSelectField } from '@/components/inventory/form/DiamondSelectField';
import { DiamondFormData } from '@/components/inventory/form/types';
import { statuses } from '@/components/inventory/form/diamondFormConstants';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MobileBusinessInfoSectionProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function MobileBusinessInfoSection({ register, setValue, watch, errors }: MobileBusinessInfoSectionProps) {
  const carat = watch('carat');
  const price = watch('price');
  const [purchaseDate, setPurchaseDate] = React.useState<Date>();
  const [saleDate, setSaleDate] = React.useState<Date>();

  // Auto-calculate price per carat
  React.useEffect(() => {
    if (carat && price && carat > 0) {
      const pricePerCarat = Math.round(price / carat);
      setValue('pricePerCarat', pricePerCarat);
    }
  }, [carat, price, setValue]);

  return (
    <div className="space-y-4 border-t pt-6">
      <div className="border-l-4 border-orange-400 pl-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Business Information</h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">Pricing and inventory management details</p>
      </div>
      
      <div className="space-y-4">
        <DiamondInputField
          id="price"
          label="Total Price (USD) *"
          type="number"
          placeholder="Enter total price"
          register={register}
          validation={{ 
            required: 'Price is required',
            min: { value: 1, message: 'Price must be greater than 0' }
          }}
          errors={errors}
          className="text-base"
        />

        <div className="grid grid-cols-2 gap-3">
          <DiamondInputField
            id="pricePerCarat"
            label="Price Per Carat"
            type="number"
            placeholder="Auto-calculated"
            register={register}
            errors={errors}
            className="text-base"
          />

          <DiamondInputField
            id="rapnet"
            label="RapNet %"
            type="number"
            placeholder="-15"
            register={register}
            errors={errors}
            className="text-base"
          />
        </div>

        <DiamondSelectField
          id="status"
          label="Inventory Status"
          value={watch('status') || 'Available'}
          onValueChange={(value) => setValue('status', value)}
          options={statuses}
        />

        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Purchase Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12",
                  !purchaseDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {purchaseDate ? format(purchaseDate, "PPP") : <span>Select purchase date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={purchaseDate}
                onSelect={setPurchaseDate}
                disabled={(date) => date > new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Expected Sale Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12",
                  !saleDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {saleDate ? format(saleDate, "PPP") : <span>Select expected sale date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={saleDate}
                onSelect={setSaleDate}
                disabled={(date) => date < new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
          <Switch
            id="storeVisible"
            checked={watch('storeVisible') || false}
            onCheckedChange={(checked) => setValue('storeVisible', checked)}
          />
          <Label htmlFor="storeVisible" className="text-sm font-medium">Make visible in public store</Label>
        </div>
      </div>
    </div>
  );
}

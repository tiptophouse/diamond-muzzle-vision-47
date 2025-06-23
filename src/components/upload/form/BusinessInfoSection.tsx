
import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { DiamondSelectField } from '@/components/inventory/form/DiamondSelectField';
import { DiamondFormData } from '@/components/inventory/form/types';
import { statuses } from '@/components/inventory/form/diamondFormConstants';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface BusinessInfoSectionProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function BusinessInfoSection({ register, setValue, watch, errors }: BusinessInfoSectionProps) {
  const carat = watch('carat');
  const price = watch('price');

  // Auto-calculate price per carat
  React.useEffect(() => {
    if (carat && price && carat > 0) {
      const pricePerCarat = Math.round(price / carat);
      setValue('pricePerCarat', pricePerCarat);
    }
  }, [carat, price, setValue]);

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          💼 Business Information
        </CardTitle>
        <CardDescription>
          Pricing and inventory management details for your diamond
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pricing Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
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
          />

          <DiamondInputField
            id="pricePerCarat"
            label="Price Per Carat (USD)"
            type="number"
            placeholder="Auto-calculated from total price"
            register={register}
            errors={errors}
            readOnly
          />
        </div>

        {/* Market Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DiamondInputField
            id="rapnet"
            label="RapNet Percentage"
            type="number"
            placeholder="e.g., -15 (for 15% below RapNet)"
            register={register}
            errors={errors}
          />

          <DiamondSelectField
            id="status"
            label="Inventory Status"
            value={watch('status') || 'Available'}
            onValueChange={(value) => setValue('status', value)}
            options={statuses}
          />
        </div>

        {/* Store Visibility */}
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="space-y-1">
            <Label htmlFor="storeVisible" className="text-green-700 font-medium">
              🏪 Store Visibility
            </Label>
            <p className="text-sm text-green-600">
              Make this diamond visible in your public store for customers to view
            </p>
          </div>
          <Switch
            id="storeVisible"
            checked={watch('storeVisible') || false}
            onCheckedChange={(checked) => setValue('storeVisible', checked)}
          />
        </div>

        {/* Summary Card */}
        {carat && price && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">💎 Diamond Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Weight:</span>
                <span className="ml-2 font-medium">{carat} ct</span>
              </div>
              <div>
                <span className="text-gray-600">Total Value:</span>
                <span className="ml-2 font-medium text-green-600">
                  ${price.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Price/Carat:</span>
                <span className="ml-2 font-medium">
                  ${Math.round(price / carat).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                  watch('status') === 'Available' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {watch('status') || 'Available'}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

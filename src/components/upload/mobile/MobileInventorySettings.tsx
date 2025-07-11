import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { DiamondFormData } from '@/components/inventory/form/types';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Store, Eye, EyeOff } from 'lucide-react';

interface MobileInventorySettingsProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function MobileInventorySettings({ register, setValue, watch, errors }: MobileInventorySettingsProps) {
  const storeVisible = watch('storeVisible');

  return (
    <div className="space-y-6">
      <DiamondInputField
        id="picture"
        label="Diamond Image URL"
        placeholder="Enter image URL (optional)"
        register={register}
        errors={errors}
      />

      <Card className={`transition-all duration-200 ${storeVisible ? 'border-primary/50 bg-primary/5' : 'border-border'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${storeVisible ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {storeVisible ? (
                  <Store className="h-4 w-4" />
                ) : (
                  <EyeOff className="h-4 w-4" />
                )}
              </div>
              <div>
                <Label htmlFor="storeVisible" className="text-sm font-medium cursor-pointer">
                  Store Visibility
                </Label>
                <p className="text-xs text-muted-foreground">
                  {storeVisible ? 'Visible in public store' : 'Hidden from public store'}
                </p>
              </div>
            </div>
            <Switch
              id="storeVisible"
              checked={storeVisible}
              onCheckedChange={(checked) => setValue('storeVisible', checked)}
            />
          </div>
          
          {storeVisible && (
            <div className="mt-3 p-2 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-2 text-xs text-primary">
                <Eye className="h-3 w-3" />
                <span>This diamond will be visible to customers in your store</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
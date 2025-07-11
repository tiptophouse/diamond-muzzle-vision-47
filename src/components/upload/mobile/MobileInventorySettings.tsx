import React from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondFormData } from '@/components/inventory/form/types';
import { DiamondInputField } from '@/components/inventory/form/DiamondInputField';
import { MobilePicker } from '@/components/ui/MobilePicker';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

interface MobileInventorySettingsProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

const statusOptions = ['Available', 'Reserved', 'Sold', 'On Hold'];

export function MobileInventorySettings({ register, setValue, watch, errors }: MobileInventorySettingsProps) {
  const storeVisible = watch('storeVisible') ?? true; // Default to visible

  return (
    <div className="space-y-4">
      <MobilePicker
        id="status"
        label="Inventory Status"
        value={watch('status') || 'Available'}
        onValueChange={(value) => setValue('status', value)}
        options={statusOptions}
      />

      <div className="space-y-3">
        <Label htmlFor="storeVisible" className="text-sm font-medium">
          Store Visibility
        </Label>
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-3">
            {storeVisible ? (
              <Eye className="h-4 w-4 text-success" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
            <div>
              <p className="text-sm font-medium">
                {storeVisible ? 'Visible in Store' : 'Hidden from Store'}
              </p>
              <p className="text-xs text-muted-foreground">
                {storeVisible 
                  ? 'Customers can see this diamond' 
                  : 'Only visible in your inventory'
                }
              </p>
            </div>
          </div>
          <Switch
            id="storeVisible"
            checked={storeVisible}
            onCheckedChange={(checked) => setValue('storeVisible', checked)}
          />
        </div>
      </div>

      <DiamondInputField
        id="picture"
        label="Image URL"
        placeholder="Link to diamond image"
        register={register}
        errors={errors}
      />

      <div className="bg-success/5 p-3 rounded-lg border border-success/20">
        <p className="text-xs text-success/80">
          ✨ <strong>Auto-Published:</strong> Your diamond will be visible in your store immediately after upload
        </p>
      </div>
    </div>
  );
}
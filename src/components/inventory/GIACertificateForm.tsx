
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useInventoryCrud } from '@/hooks/useInventoryCrud';
import { DiamondFormData } from '@/components/inventory/form/types';
import { CheckCircle2, Edit3, Save, X } from 'lucide-react';

interface GIACertificateFormProps {
  extractedData: any;
  onConfirm: () => void;
  onCancel: () => void;
}

export function GIACertificateForm({ extractedData, onConfirm, onCancel }: GIACertificateFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { addDiamond } = useInventoryCrud();

  const { register, handleSubmit, watch, setValue } = useForm<DiamondFormData>({
    defaultValues: {
      stockNumber: extractedData.stockNumber || '',
      certificateNumber: extractedData.certificateNumber || '',
      shape: extractedData.shape || 'Round',
      carat: extractedData.carat || 0,
      color: extractedData.color || 'G',
      clarity: extractedData.clarity || 'VS1',
      cut: extractedData.cut || 'Excellent',
      polish: extractedData.polish || 'Excellent',
      symmetry: extractedData.symmetry || 'Excellent',
      fluorescence: extractedData.fluorescence || 'None',
      lab: 'GIA',
      length: extractedData.length || 0,
      width: extractedData.width || 0,
      depth: extractedData.depth || 0,
      tablePercentage: extractedData.tablePercentage || 0,
      depthPercentage: extractedData.depthPercentage || 0,
      gridle: extractedData.girdle || '',
      culet: extractedData.culet || '',
      certificateUrl: extractedData.certificateUrl || '',
      certificateComment: extractedData.certificateComment || '',
      status: 'Available',
      storeVisible: true,
      price: 0, // User must enter price manually
    }
  });

  const watchedPrice = watch('price');

  const onSubmit = async (data: DiamondFormData) => {
    if (!data.price || data.price <= 0) {
      toast({
        title: "Price Required ⚠️",
        description: "Please enter a valid price for this diamond",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await addDiamond(data);
      if (success) {
        toast({
          title: "Diamond Added Successfully ✅",
          description: `GIA ${data.certificateNumber} has been added to your inventory`,
        });
        onConfirm();
      }
    } catch (error) {
      console.error('Error adding diamond:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              GIA Certificate Data Extracted
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 className="h-4 w-4 mr-1" />
                {isEditing ? 'Cancel Edit' : 'Edit Data'}
              </Button>
              <Button variant="ghost" size="sm" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Review the extracted data and add a price to save this diamond to your inventory.
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="certificateNumber">Certificate Number</Label>
                <Input
                  id="certificateNumber"
                  {...register('certificateNumber')}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>
              
              <div>
                <Label htmlFor="shape">Shape</Label>
                <Input
                  id="shape"
                  {...register('shape')}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>
              
              <div>
                <Label htmlFor="carat">Carat Weight</Label>
                <Input
                  id="carat"
                  type="number"
                  step="0.01"
                  {...register('carat', { valueAsNumber: true })}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>
              
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  {...register('color')}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>
              
              <div>
                <Label htmlFor="clarity">Clarity</Label>
                <Input
                  id="clarity"
                  {...register('clarity')}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>
              
              <div>
                <Label htmlFor="cut">Cut</Label>
                <Input
                  id="cut"
                  {...register('cut')}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>
              
              <div>
                <Label htmlFor="polish">Polish</Label>
                <Input
                  id="polish"
                  {...register('polish')}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>
              
              <div>
                <Label htmlFor="symmetry">Symmetry</Label>
                <Input
                  id="symmetry"
                  {...register('symmetry')}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>
              
              <div>
                <Label htmlFor="fluorescence">Fluorescence</Label>
                <Input
                  id="fluorescence"
                  {...register('fluorescence')}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-gray-50' : ''}
                />
              </div>
              
              <div className="md:col-span-2 border-t pt-4">
                <Label htmlFor="price" className="text-lg font-semibold text-red-600">
                  Price (Required) *
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="Enter diamond price"
                  {...register('price', { 
                    valueAsNumber: true,
                    required: 'Price is required',
                    min: { value: 0.01, message: 'Price must be greater than 0' }
                  })}
                  className="text-lg border-red-200 focus:border-red-500"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Price is not included in GIA certificates and must be entered manually.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                disabled={!watchedPrice || watchedPrice <= 0 || isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Adding...' : 'Add to Inventory'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

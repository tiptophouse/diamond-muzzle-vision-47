import React, { useState } from 'react';
import { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from 'react-hook-form';
import { DiamondFormData } from '@/components/inventory/form/types';
import { statuses } from '@/components/inventory/form/diamondFormConstants';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Upload, X, Image } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BusinessTabProps {
  register: UseFormRegister<DiamondFormData>;
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  errors: FieldErrors<DiamondFormData>;
}

export function BusinessTab({ register, setValue, watch, errors }: BusinessTabProps) {
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  
  const carat = watch('carat');
  const price = watch('price');
  const currentImage = watch('picture');

  // Auto-calculate price per carat
  React.useEffect(() => {
    if (carat && price && carat > 0) {
      const pricePerCarat = Math.round(price / carat);
      setValue('pricePerCarat', pricePerCarat);
    }
  }, [carat, price, setValue]);

  React.useEffect(() => {
    if (currentImage) {
      setImagePreview(currentImage);
    }
  }, [currentImage]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select an image smaller than 5MB",
      });
      return;
    }

    setUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = fileName;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('diamond-images')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('diamond-images')
        .getPublicUrl(filePath);

      setValue('picture', publicUrl);
      setImagePreview(publicUrl);

      toast({
        title: "Image uploaded",
        description: "Diamond image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: `Image upload failed: ${errorMessage}`,
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setValue('picture', '');
    setImagePreview(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">Business Information</h3>
        <p className="text-sm text-muted-foreground">Pricing, inventory status, and diamond image</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price" className="text-sm font-medium">
            Total Price (USD) *
          </Label>
          <Input
            id="price"
            type="number"
            {...register('price', { 
              required: 'Price is required',
              min: { value: 1, message: 'Price must be greater than 0' }
            })}
            placeholder="Enter total price"
            className="h-10"
          />
          {errors.price && (
            <p className="text-sm text-destructive">{errors.price.message}</p>
          )}
        </div>

        {/* Price Per Carat */}
        <div className="space-y-2">
          <Label htmlFor="pricePerCarat" className="text-sm font-medium">
            Price Per Carat (USD)
          </Label>
          <Input
            id="pricePerCarat"
            type="number"
            {...register('pricePerCarat')}
            placeholder="Auto-calculated from total price"
            className="h-10"
            readOnly
          />
          {errors.pricePerCarat && (
            <p className="text-sm text-destructive">{errors.pricePerCarat.message}</p>
          )}
        </div>

        {/* RapNet Percentage */}
        <div className="space-y-2">
          <Label htmlFor="rapnet" className="text-sm font-medium">RapNet Percentage</Label>
          <Input
            id="rapnet"
            type="number"
            {...register('rapnet')}
            placeholder="e.g., -15 (for 15% below RapNet)"
            className="h-10"
          />
          {errors.rapnet && (
            <p className="text-sm text-destructive">{errors.rapnet.message}</p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium">Inventory Status</Label>
          <Select value={watch('status') || 'Available'} onValueChange={(value) => setValue('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Store Visibility */}
        <div className="md:col-span-2 flex items-center space-x-3 p-4 border rounded-lg bg-muted/30">
          <Switch
            id="storeVisible"
            checked={watch('storeVisible') || false}
            onCheckedChange={(checked) => setValue('storeVisible', checked)}
          />
          <div className="flex-1">
            <Label htmlFor="storeVisible" className="text-sm font-medium">Make visible in public store</Label>
            <p className="text-xs text-muted-foreground">Enable this to show the diamond in your public store</p>
          </div>
        </div>
      </div>

      {/* Image Upload Section */}
      <div className="space-y-4 pt-6 border-t">
        <div className="space-y-2">
          <h4 className="text-base font-medium text-foreground">Diamond Image</h4>
          <p className="text-sm text-muted-foreground">Upload a high-quality image of the diamond</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Diamond preview"
                className="w-32 h-32 object-cover rounded-lg border border-border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={removeImage}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-lg bg-muted/30">
              <Image className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => document.getElementById('image-upload')?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload Image'}
            </Button>
            
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            
            <p className="text-xs text-muted-foreground">
              Supports JPG, PNG, WebP (max 5MB)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
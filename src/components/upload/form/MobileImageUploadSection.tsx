
import React, { useState } from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { DiamondFormData } from '@/components/inventory/form/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Image, Camera } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MobileImageUploadSectionProps {
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
}

export function MobileImageUploadSection({ setValue, watch }: MobileImageUploadSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const currentImage = watch('picture');

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
        title: "✅ Image uploaded",
        description: "Diamond image uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        variant: "destructive",
        title: "❌ Upload failed",
        description: `Image upload failed: ${errorMessage}`,
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setValue('picture', '');
    setImagePreview(null);
    
    toast({
      title: "Image removed",
      description: "Diamond image removed from form",
    });
  };

  return (
    <div className="space-y-4 border-t pt-6">
      <div className="border-l-4 border-indigo-400 pl-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Diamond Image</h3>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">Upload a high-quality image of the diamond</p>
      </div>
      
      <div className="space-y-4">
        {imagePreview ? (
          <div className="relative">
            <div className="aspect-square w-full max-w-xs mx-auto relative rounded-lg overflow-hidden border-2 border-gray-200">
              <img
                src={imagePreview}
                alt="Diamond preview"
                className="w-full h-full object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 rounded-full p-0"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="aspect-square w-full max-w-xs mx-auto flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="text-center p-6">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No image selected</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => document.getElementById('image-upload')?.click()}
            className="h-12 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Photo'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            disabled={uploading}
            onClick={() => document.getElementById('camera-upload')?.click()}
            className="h-12 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
          >
            <Camera className="h-4 w-4 mr-2" />
            Take Photo
          </Button>
        </div>
        
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
        
        <Input
          id="camera-upload"
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
}

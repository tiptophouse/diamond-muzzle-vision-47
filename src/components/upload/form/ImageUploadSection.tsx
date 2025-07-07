
import React, { useState } from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { DiamondFormData } from '@/components/inventory/form/types';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Image } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImageUploadSectionProps {
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
}

export function ImageUploadSection({ setValue, watch }: ImageUploadSectionProps) {
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
      const filePath = fileName; // The path within the bucket should not contain the bucket name.

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
        description: `Image upload failed: ${errorMessage}. Please ensure storage policies are correctly configured.`,
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
      <div className="space-y-4">
        {imagePreview ? (
          <div className="relative w-full max-w-sm mx-auto">
            <img
              src={imagePreview}
              alt="Diamond preview"
              className="w-full h-48 object-cover rounded-xl border border-border"
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
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-muted-foreground/25 rounded-xl bg-muted/30">
            <Image className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No image selected</p>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => document.getElementById('image-upload')?.click()}
          className="w-full h-12 text-base"
        >
          <Upload className="h-5 w-5 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Diamond Photo'}
        </Button>
        
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
}

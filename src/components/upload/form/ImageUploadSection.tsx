
import React, { useState } from 'react';
import { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { DiamondFormData } from '@/components/inventory/form/types';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Image, FileText } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ImageUploadSectionProps {
  setValue: UseFormSetValue<DiamondFormData>;
  watch: UseFormWatch<DiamondFormData>;
  onGiaDataExtracted?: (giaData: any) => void;
}

export function ImageUploadSection({ setValue, watch, onGiaDataExtracted }: ImageUploadSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [extractingData, setExtractingData] = useState(false);
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

  const handleCertificateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file of the GIA certificate",
      });
      return;
    }

    setExtractingData(true);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          
          // Call the extract-gia-data edge function
          const { data, error } = await supabase.functions.invoke('extract-gia-data', {
            body: { imageData: base64Data }
          });

          if (error) throw error;

          if (data.success) {
            const giaData = data.data;
            console.log('✅ GIA data extracted:', giaData);
            
            // Auto-populate all form fields with extracted data
            if (giaData.stock) setValue('stockNumber', giaData.stock);
            if (giaData.shape) setValue('shape', giaData.shape.toLowerCase().replace('_', ' '));
            if (giaData.weight) setValue('carat', Number(giaData.weight));
            if (giaData.color) setValue('color', giaData.color);
            if (giaData.clarity) setValue('clarity', giaData.clarity);
            if (giaData.cut) setValue('cut', giaData.cut?.replace('_', ' ') || 'Excellent');
            if (giaData.certificate_number) setValue('certificateNumber', giaData.certificate_number.toString());
            if (giaData.lab) setValue('lab', giaData.lab);
            if (giaData.fluorescence) setValue('fluorescence', giaData.fluorescence?.replace('_', ' ') || 'None');
            if (giaData.polish) setValue('polish', giaData.polish?.replace('_', ' ') || 'Excellent');
            if (giaData.symmetry) setValue('symmetry', giaData.symmetry?.replace('_', ' ') || 'Excellent');
            if (giaData.gridle) setValue('gridle', giaData.gridle);
            if (giaData.culet) setValue('culet', giaData.culet);
            if (giaData.length) setValue('length', Number(giaData.length));
            if (giaData.width) setValue('width', Number(giaData.width));
            if (giaData.depth) setValue('depth', Number(giaData.depth));
            if (giaData.ratio) setValue('ratio', Number(giaData.ratio));
            if (giaData.table) setValue('tablePercentage', Number(giaData.table));
            if (giaData.depth_percentage) setValue('depthPercentage', Number(giaData.depth_percentage));
            if (giaData.price_per_carat) setValue('pricePerCarat', Number(giaData.price_per_carat));
            if (giaData.rapnet) setValue('rapnet', Number(giaData.rapnet));
            if (giaData.certificate_comment) setValue('certificateComment', giaData.certificate_comment);
            
            // Set certificate URL if uploaded
            if (giaData.certificate_url) {
              setValue('certificateUrl', giaData.certificate_url);
            }

            // Call callback if provided
            onGiaDataExtracted?.(giaData);

            toast({
              title: "✅ Certificate Data Extracted",
              description: "All diamond information has been automatically filled from your GIA certificate",
            });
          } else {
            throw new Error(data.error || 'Failed to extract data from certificate');
          }
        } catch (extractError) {
          console.error('Error extracting GIA data:', extractError);
          toast({
            variant: "destructive",
            title: "Extraction Failed",
            description: "Could not extract data from certificate image. Please try again or fill manually.",
          });
        } finally {
          setExtractingData(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing certificate:', error);
      toast({
        variant: "destructive",
        title: "Processing Failed",
        description: "Could not process certificate image",
      });
      setExtractingData(false);
    }
  };

  const removeImage = () => {
    setValue('picture', '');
    setImagePreview(null);
  };

  return (
    <div className="space-y-6">
      {/* GIA Certificate Upload Section */}
      <div className="space-y-4 p-4 border border-primary/20 rounded-lg bg-primary/5">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5" />
            GIA Certificate
          </h3>
          <p className="text-sm text-muted-foreground">Upload your GIA certificate to auto-fill all diamond information</p>
        </div>
        
        <Button
          type="button"
          variant="outline"
          disabled={extractingData}
          onClick={() => document.getElementById('certificate-upload')?.click()}
          className="w-full"
        >
          <FileText className="h-4 w-4 mr-2" />
          {extractingData ? 'Extracting Data...' : 'Upload GIA Certificate'}
        </Button>
        
        <Input
          id="certificate-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCertificateUpload}
        />
      </div>

      {/* Regular Diamond Image Upload */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Diamond Image</h3>
          <p className="text-sm text-muted-foreground">Upload a high-quality image of the diamond</p>
        </div>
        
        <div className="space-y-4">
          {imagePreview ? (
            <div className="relative inline-block">
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
            <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-lg">
              <Image className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          <div className="flex items-center space-x-4">
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Image'}
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
      </div>
    </div>
  );
}

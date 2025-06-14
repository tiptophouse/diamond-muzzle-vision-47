
import { useState, useRef } from "react";
import { Upload, Image, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  onImageUploaded?: (imageUrl: string) => void;
}

export function ImageUpload({ onImageUploaded }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `store-images/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('diamond-images')
        .upload(filePath, file);

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('diamond-images')
        .getPublicUrl(filePath);

      setUploadedImage(publicUrl);
      
      toast({
        title: "Image uploaded successfully",
        description: "Your image has been uploaded to the store",
      });

      if (onImageUploaded) {
        onImageUploaded(publicUrl);
      }

    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 sm:p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!uploadedImage ? (
          <div className="text-center">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 hover:border-gray-400 transition-colors">
              <Image className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">Upload a photo to the store</p>
              <Button
                onClick={handleUploadClick}
                disabled={isUploading}
                className="w-full sm:w-auto flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Choose Image'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Supports JPG, PNG, WebP up to 5MB
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="relative inline-block">
              <img
                src={uploadedImage}
                alt="Uploaded"
                className="w-full max-w-xs rounded-lg shadow-md"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-green-600 mt-2">Image uploaded successfully!</p>
            <Button
              variant="outline"
              onClick={handleUploadClick}
              disabled={isUploading}
              className="mt-2 w-full sm:w-auto"
            >
              Upload Another
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

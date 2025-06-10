
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const { user } = useTelegramAuth();

  const uploadImage = async (file: File, stockNumber: string): Promise<string | null> => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to upload images.",
      });
      return null;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Maximum file size is 10MB.",
      });
      return null;
    }

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const allowedTypes = ['jpg', 'jpeg', 'png', 'webp'];
      
      if (!fileExt || !allowedTypes.includes(fileExt)) {
        throw new Error('Invalid file type. Please use JPG, PNG, or WebP.');
      }

      const fileName = `${stockNumber}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `diamonds/${user.id}/${fileName}`;

      console.log('Uploading file:', fileName, 'Size:', file.size, 'Type:', file.type);

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('diamond-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }

      console.log('Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('diamond-images')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image. Please try again.",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadMultipleImages = async (files: File[], stockNumber: string): Promise<string[]> => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to upload images.",
      });
      return [];
    }

    setUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (const file of files) {
        const url = await uploadImage(file, stockNumber);
        if (url) {
          uploadedUrls.push(url);
        }
      }

      if (uploadedUrls.length > 0) {
        toast({
          title: `${uploadedUrls.length} images uploaded! 🎉`,
          description: "All images have been added to your diamond gallery.",
        });
      }
    } catch (error) {
      console.error('Multiple upload error:', error);
    } finally {
      setUploading(false);
    }

    return uploadedUrls;
  };

  const deleteImage = async (imageUrl: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `diamonds/${user.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('diamond-images')
        .remove([filePath]);

      if (error) throw error;

      toast({
        title: "Image deleted",
        description: "Image has been removed from your gallery.",
      });

      return true;
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "Failed to delete image. Please try again.",
      });
      return false;
    }
  };

  return {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    uploading
  };
}

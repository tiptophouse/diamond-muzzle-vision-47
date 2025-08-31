
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api, apiEndpoints, getCurrentUserId } from '@/lib/api';
import { useToast } from "@/hooks/use-toast";

interface AdminImageUploadProps {
  stockNumber: string;
  currentImageUrl?: string;
  onImageUpdate: (newImageUrl: string) => void;
}

export function AdminImageUpload({ 
  stockNumber, 
  currentImageUrl, 
  onImageUpdate 
}: AdminImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !stockNumber) return;

    const userId = getCurrentUserId();
    if (!userId) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload to Supabase storage first
      const { supabase } = await import('@/integrations/supabase/client');
      const fileExt = file.name.split('.').pop();
      const fileName = `${stockNumber}-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('diamond-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('diamond-images')
        .getPublicUrl(fileName);

      // Update diamond with new image URL
      const numericStockNumber = parseInt(stockNumber);
      await api.put(
        apiEndpoints.updateDiamond(numericStockNumber, userId),
        { picture: publicUrl }
      );

      toast({
        title: "✅ Image Uploaded",
        description: "Image uploaded successfully!",
      });
      
      onImageUpdate(publicUrl);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "❌ Upload Error",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Image</CardTitle>
        <CardDescription>Upload a new image for this stone.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="picture">Upload picture</Label>
          <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} />
        </div>
        {currentImageUrl && (
          <div>
            <Label>Current Image:</Label>
            <img src={currentImageUrl} alt="Current" className="mt-2 rounded-md" style={{ maxWidth: '100%', maxHeight: '200px' }} />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={isUploading || !file}>
          {isUploading && <Upload className="mr-2 h-4 w-4 animate-spin" />}
          {isUploading ? "Uploading..." : "Upload Image"}
        </Button>
      </CardFooter>
    </Card>
  );
}

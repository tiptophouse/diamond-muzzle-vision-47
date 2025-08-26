import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { API_BASE_URL, getAuthHeaders } from '@/lib/api/config';
import { toast } from '@/components/ui/use-toast';
import { ReloadIcon } from '@radix-ui/react-icons';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !stockNumber) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/api/v1/upload_image/${parseInt(stockNumber)}`, {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.image_url) {
        toast({
          title: "Image Uploaded",
          description: "Image uploaded successfully!",
        });
        onImageUpdate(result.image_url);
      } else {
        toast({
          title: "Upload Error",
          description: "Image upload failed. Please try again.",
          variant: "destructive",
        });
      }

      const updateResponse = await fetch(`${API_BASE_URL}/api/v1/update_stone/${parseInt(stockNumber)}`, {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify({ picture: result.image_url }),
      });

      if (!updateResponse.ok) {
        console.error('Failed to update stone with new image URL');
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Error",
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
          <Input id="picture" type="file" onChange={handleFileChange} />
        </div>
        {currentImageUrl && (
          <div>
            <Label>Current Image:</Label>
            <img src={currentImageUrl} alt="Current" className="mt-2 rounded-md" style={{ maxWidth: '100%', maxHeight: '200px' }} />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={isUploading}>
          {isUploading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
          {isUploading ? "Uploading..." : "Upload Image"}
        </Button>
      </CardFooter>
    </Card>
  );
}

import React, { useState } from 'react';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Diamond } from '@/types/diamond';

interface UserImageUploadProps {
  diamond: Diamond;
  onImageUpload: (imageUrl: string) => void;
  onCancel: () => void;
}

export function UserImageUpload({ diamond, onImageUpload, onCancel }: UserImageUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      toast({
        title: "Error",
        description: "Please select an image to upload.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Simulate image upload
      await new Promise(resolve => setTimeout(resolve, 1500));

      onImageUpload(selectedImage);
      toast({
        title: "Success",
        description: "Image uploaded successfully.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description: "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedImage(null);
    onCancel();
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-center p-4 border-dashed border-2 border-gray-400 rounded-md">
          {selectedImage ? (
            <div className="relative">
              <img
                src={selectedImage}
                alt="Uploaded"
                className="max-h-48 max-w-full rounded-md"
              />
              <Badge
                variant="destructive"
                className="absolute top-2 right-2 cursor-pointer"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-4 w-4" />
                Remove
              </Badge>
            </div>
          ) : (
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex flex-col items-center justify-center space-y-2">
                <ImageIcon className="h-8 w-8 text-gray-500" />
                <p className="text-sm text-gray-500">Click to upload image</p>
              </div>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>

        {diamond.picture && !selectedImage && (
          <Alert>
            <AlertDescription>
              Current image: <a href={diamond.picture} target="_blank" rel="noopener noreferrer" className="underline">View</a>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={uploading}>
            {uploading ? (
              <>
                Uploading...
                {/*<Loader2 className="ml-2 h-4 w-4 animate-spin" />*/}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

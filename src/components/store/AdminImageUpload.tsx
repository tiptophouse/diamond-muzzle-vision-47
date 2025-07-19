import { useState } from "react";
import { Upload, Link, Image, Check, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Diamond } from "@/components/inventory/InventoryTable";
import { api, apiEndpoints } from "@/lib/api";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

interface AdminImageUploadProps {
  diamond: Diamond;
  onUpdate: () => void;
}

export function AdminImageUpload({ diamond, onUpdate }: AdminImageUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(diamond.imageUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(diamond.imageUrl || '');
  const [isValidImage, setIsValidImage] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const validateImage = async (url: string) => {
    if (!url) {
      setIsValidImage(false);
      return;
    }

    try {
      const img = document.createElement('img');
      img.onload = () => {
        setIsValidImage(true);
        setPreviewUrl(url);
      };
      img.onerror = () => {
        setIsValidImage(false);
        setPreviewUrl('');
      };
      img.src = url;
    } catch (error) {
      setIsValidImage(false);
      setPreviewUrl('');
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    validateImage(url);
  };

  const handleUpload = async () => {
    if (!imageUrl || !isValidImage) {
      toast({
        title: "Invalid Image",
        description: "Please enter a valid image URL",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const updateData = {
        picture: imageUrl
      };

      const endpoint = apiEndpoints.updateDiamond(diamond.id, user!.id);
      const result = await api.put(endpoint, updateData);

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Image Updated",
        description: `Image successfully uploaded for diamond #${diamond.stockNumber}`,
      });
      
      setIsOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    setIsUploading(true);
    try {
      const updateData = {
        picture: null
      };

      const endpoint = apiEndpoints.updateDiamond(diamond.id, user!.id);
      const result = await api.put(endpoint, updateData);

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Image Removed",
        description: `Image removed from diamond #${diamond.stockNumber}`,
      });
      
      setImageUrl('');
      setPreviewUrl('');
      setIsValidImage(false);
      setIsOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error removing image:', error);
      toast({
        title: "Remove Failed",
        description: error instanceof Error ? error.message : "Failed to remove image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm"
        >
          <Upload className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Upload Image for Diamond #{diamond.stockNumber}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Current Image */}
          {diamond.imageUrl && (
            <div className="space-y-2">
              <Label>Current Image</Label>
              <div className="relative">
                <img
                  src={diamond.imageUrl}
                  alt={`Diamond ${diamond.stockNumber}`}
                  className="w-full h-48 object-cover rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                  className="absolute top-2 right-2"
                >
                  <X className="h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          )}

          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Image URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/diamond-image.jpg"
                className="flex-1"
              />
              <div className="flex items-center">
                {imageUrl && (
                  isValidImage ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-5 w-5 text-red-500" />
                  )
                )}
              </div>
            </div>
          </div>

          {/* Image Preview */}
          {previewUrl && isValidImage && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-green-200"
                />
                <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                  ✓ Valid Image
                </div>
              </div>
            </div>
          )}

          {/* Common Image Hosting Tips */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-blue-900">💡 Image Upload Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Use high-quality images (recommended: 800x600px or larger)</li>
              <li>• Supported formats: JPG, PNG, WebP</li>
              <li>• Use reliable hosting services like Imgur, Cloudinary, or AWS S3</li>
              <li>• Ensure the URL ends with the image extension (.jpg, .png, etc.)</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={isUploading || !imageUrl || !isValidImage}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
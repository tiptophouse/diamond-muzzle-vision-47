import { useState } from "react";
import { Upload, Check, X, RefreshCw, Camera, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Diamond } from "@/components/inventory/InventoryTable";
import { api, apiEndpoints } from "@/lib/api";
import { useTelegramAuth } from "@/context/TelegramAuthContext";
import { useTelegramHapticFeedback } from "@/hooks/useTelegramHapticFeedback";

interface AdminImageUploadProps {
  diamond: Diamond;
  onUpdate: () => void;
}

export function AdminImageUpload({ diamond, onUpdate }: AdminImageUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(diamond.imageUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isValidImage, setIsValidImage] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const { impactOccurred, selectionChanged, notificationOccurred } = useTelegramHapticFeedback();

  const validateImage = async (url: string) => {
    if (!url) {
      setIsValidImage(false);
      return;
    }

    try {
      const img = document.createElement('img');
      img.onload = () => {
        setIsValidImage(true);
        selectionChanged(); // Haptic feedback for validation success
      };
      img.onerror = () => {
        setIsValidImage(false);
        impactOccurred('light'); // Haptic feedback for validation failure
      };
      img.src = url;
    } catch (error) {
      setIsValidImage(false);
      impactOccurred('light');
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    validateImage(url);
  };

  const handleUpload = async () => {
    if (!imageUrl || !isValidImage) {
      impactOccurred('heavy');
      notificationOccurred('error');
      toast({
        title: "❌ Invalid Image",
        description: "Please enter a valid image URL",
        variant: "destructive",
      });
      return;
    }

    impactOccurred('medium');
    setIsUploading(true);
    
    try {
      const updateData = {
        picture: imageUrl
      };

      const numericId = parseInt(diamond.id);
      if (isNaN(numericId)) {
        throw new Error('Invalid diamond ID');
      }

      const endpoint = apiEndpoints.updateDiamond(numericId, user.id);
      const result = await api.put(endpoint, updateData);

      if (result.error) {
        throw new Error(result.error);
      }

      notificationOccurred('success');
      toast({
        title: "✅ Image Updated",
        description: `Successfully uploaded image for #${diamond.stockNumber}`,
      });
      
      setIsOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error uploading image:', error);
      notificationOccurred('error');
      toast({
        title: "❌ Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    impactOccurred('medium');
    setIsUploading(true);
    
    try {
      const updateData = {
        picture: null
      };

      const numericId = parseInt(diamond.id);
      if (isNaN(numericId)) {
        throw new Error('Invalid diamond ID');
      }

      const endpoint = apiEndpoints.updateDiamond(numericId, user.id);
      const result = await api.put(endpoint, updateData);

      if (result.error) {
        throw new Error(result.error);
      }

      notificationOccurred('success');
      toast({
        title: "🗑️ Image Removed",
        description: `Removed image from #${diamond.stockNumber}`,
      });
      
      setImageUrl('');
      setIsValidImage(false);
      setIsOpen(false);
      onUpdate();
    } catch (error) {
      console.error('Error removing image:', error);
      notificationOccurred('error');
      toast({
        title: "❌ Remove Failed",
        description: error instanceof Error ? error.message : "Failed to remove image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenSheet = () => {
    impactOccurred('light');
    setIsOpen(true);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenSheet}
          className="h-10 w-10 p-0 bg-white/95 hover:bg-white shadow-md border-2 border-blue-200 hover:border-blue-400 transition-all duration-200"
        >
          <Camera className="h-5 w-5 text-blue-600" />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
        <SheetHeader className="pb-6">
          <SheetTitle className="flex items-center gap-3 text-lg">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Camera className="h-5 w-5 text-white" />
            </div>
            Upload Image
            <span className="text-sm text-slate-500 font-mono">#{diamond.stockNumber}</span>
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 pb-6">
          {/* Current Image Section */}
          {diamond.imageUrl && (
            <div className="space-y-3">
              <Label className="text-base font-medium text-slate-700">Current Image</Label>
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={diamond.imageUrl}
                  alt={`Diamond ${diamond.stockNumber}`}
                  className="w-full h-40 object-cover"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={isUploading}
                  className="absolute top-3 right-3 h-10 w-10 p-0 rounded-full shadow-lg"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* URL Input Section - Telegram-friendly */}
          <div className="space-y-3">
            <Label htmlFor="imageUrl" className="text-base font-medium text-slate-700">
              📸 Paste Image URL
            </Label>
            <div className="relative">
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="h-14 text-base px-4 pr-12 rounded-xl border-2 border-slate-200 focus:border-blue-400"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {imageUrl && (
                  isValidImage ? (
                    <Check className="h-6 w-6 text-green-500" />
                  ) : (
                    <X className="h-6 w-6 text-red-500" />
                  )
                )}
              </div>
            </div>
          </div>

          {/* Preview Section - Mobile optimized */}
          {imageUrl && isValidImage && (
            <div className="space-y-3">
              <Label className="text-base font-medium text-slate-700">Preview</Label>
              <div className="relative rounded-2xl overflow-hidden border-2 border-green-300">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-40 object-cover"
                />
                <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  ✓ Valid
                </div>
              </div>
            </div>
          )}

          {/* Mobile-optimized tips */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              💡 Quick Tips
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• Use Imgur.com for free image hosting</p>
              <p>• Make sure URL ends with .jpg, .png, or .webp</p>
              <p>• High quality images look better</p>
            </div>
          </div>

          {/* Telegram-style action buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)} 
              disabled={isUploading}
              className="flex-1 h-12 text-base rounded-xl border-2"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={isUploading || !imageUrl || !isValidImage}
              className="flex-1 h-12 text-base rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
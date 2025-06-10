
import { useState, useCallback } from "react";
import { Upload, X, ImageIcon, Plus, Camera, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useImageUpload } from "@/hooks/useImageUpload";
import { toast } from "@/components/ui/use-toast";
import { useTelegramAuth } from "@/context/TelegramAuthContext";

interface ImageUploadManagerProps {
  stockNumber: string;
  existingImages?: string[];
  onImagesUpdate: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploadManager({ 
  stockNumber, 
  existingImages = [], 
  onImagesUpdate,
  maxImages = 15 
}: ImageUploadManagerProps) {
  const [dragActive, setDragActive] = useState(false);
  const { user } = useTelegramAuth();
  const { uploadMultipleImages, deleteImage, uploading } = useImageUpload();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      await uploadImages(imageFiles);
    }
  }, [existingImages, maxImages, stockNumber]);

  const uploadImages = async (files: File[]) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to upload images.",
      });
      return;
    }

    if (existingImages.length + files.length > maxImages) {
      toast({
        variant: "destructive",
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed per diamond. You can upload ${maxImages - existingImages.length} more.`,
      });
      return;
    }

    try {
      console.log('Starting upload for', files.length, 'files');
      const newImageUrls = await uploadMultipleImages(files, stockNumber);
      
      if (newImageUrls.length > 0) {
        const updatedImages = [...existingImages, ...newImageUrls];
        onImagesUpdate(updatedImages);
        console.log('Upload successful, updated images:', updatedImages);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      await uploadImages(files);
    }
    // Reset input value to allow selecting same files again
    e.target.value = '';
  };

  const removeImage = async (imageUrl: string, index: number) => {
    try {
      const success = await deleteImage(imageUrl);
      
      if (success) {
        const updatedImages = existingImages.filter((_, i) => i !== index);
        onImagesUpdate(updatedImages);
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const remainingSlots = maxImages - existingImages.length;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="relative overflow-hidden border-2 border-dashed border-slate-300 hover:border-blue-400 transition-all duration-300 group">
        <CardContent className="p-8">
          <div
            className={`
              relative text-center transition-all duration-300
              ${dragActive ? 'scale-105 bg-blue-50' : ''}
              ${uploading ? 'opacity-50' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                {uploading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                ) : (
                  <Camera className="h-8 w-8 text-white" />
                )}
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Upload Diamond Images
            </h3>
            <p className="text-slate-600 mb-2">
              Drag and drop images here, or click to browse
            </p>
            <p className="text-sm text-slate-500 mb-2">
              Supports JPG, PNG, WebP • Max 10MB per file
            </p>
            <p className="text-sm font-medium text-blue-600 mb-6">
              {remainingSlots > 0 ? `${remainingSlots} more images can be added (${existingImages.length}/${maxImages})` : 'Maximum images reached'}
            </p>
            
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading || remainingSlots <= 0}
            />
            
            <Button 
              variant="outline" 
              className="relative pointer-events-none bg-white hover:bg-slate-50"
              disabled={uploading || remainingSlots <= 0}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : remainingSlots > 0 ? 'Choose Files' : 'Maximum Reached'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Image Gallery */}
      {existingImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <h4 className="text-lg font-semibold text-slate-900">
              Image Gallery ({existingImages.length}/{maxImages})
            </h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {existingImages.map((imageUrl, index) => (
              <Card key={index} className="relative group overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="aspect-square relative">
                  <img
                    src={imageUrl}
                    alt={`Diamond ${stockNumber} - Image ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      console.error('Image failed to load:', imageUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                  
                  {/* Remove Button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    onClick={() => removeImage(imageUrl, index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  
                  {/* Primary Image Badge */}
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        Primary
                      </span>
                    </div>
                  )}

                  {/* Image Number */}
                  <div className="absolute bottom-2 right-2">
                    <span className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                      {index + 1}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
            
            {/* Add More Button */}
            {remainingSlots > 0 && (
              <Card className="relative group cursor-pointer border-2 border-dashed border-slate-300 hover:border-blue-400 transition-all duration-300">
                <div className="aspect-square flex flex-col items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
                  <Plus className="h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">Add More</span>
                  <span className="text-xs text-slate-400 mt-1">{remainingSlots} left</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

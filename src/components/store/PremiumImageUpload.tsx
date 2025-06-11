
import { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Plus, Edit, Trash2 } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { toast } from "@/components/ui/use-toast";

interface PremiumImageUploadProps {
  stockNumber: string;
  existingImages?: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export function PremiumImageUpload({ 
  stockNumber, 
  existingImages = [], 
  onImagesChange,
  maxImages = 10 
}: PremiumImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploadMultipleImages } = useImageUpload();

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

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      await handleFileUpload(files);
    }
  }, []);

  const handleFileUpload = async (files: File[]) => {
    if (images.length + files.length > maxImages) {
      toast({
        variant: "destructive",
        title: "Too many images",
        description: `Maximum ${maxImages} images allowed.`,
      });
      return;
    }

    setUploading(true);
    try {
      const uploadedUrls = await uploadMultipleImages(files, stockNumber);
      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);
      onImagesChange(newImages);
      
      toast({
        title: "Images uploaded successfully! ✨",
        description: `${uploadedUrls.length} images added to gallery.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      await handleFileUpload(files);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
    
    toast({
      title: "Image removed",
      description: "Image has been removed from gallery.",
    });
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card 
        className={`border-2 border-dashed transition-all duration-300 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-white" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Upload Diamond Images
              </h3>
              <p className="text-slate-600 mb-4">
                Drag and drop images here, or click to browse
              </p>
              <p className="text-sm text-slate-500">
                Supports JPG, PNG, WebP • Max {maxImages} images • Up to 10MB each
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || images.length >= maxImages}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Uploading..." : "Choose Files"}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading || images.length >= maxImages}
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-slate-900">
              Image Gallery ({images.length}/{maxImages})
            </h4>
            {images.length > 1 && (
              <p className="text-sm text-slate-500">
                Drag to reorder • First image is the primary photo
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <Card 
                key={`${imageUrl}-${index}`}
                className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-move"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", index.toString());
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
                  reorderImages(fromIndex, index);
                }}
              >
                <CardContent className="p-0">
                  <div className="aspect-square relative">
                    <img
                      src={imageUrl}
                      alt={`Diamond ${stockNumber} - Image ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    
                    {/* Primary badge */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Primary
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => removeImage(index)}
                          className="bg-red-500 hover:bg-red-600 text-white border-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Image number */}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add more button */}
            {images.length < maxImages && (
              <Card 
                className="border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-slate-50 transition-all duration-300 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <CardContent className="p-0">
                  <div className="aspect-square flex items-center justify-center">
                    <div className="text-center">
                      <Plus className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 font-medium">Add More</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

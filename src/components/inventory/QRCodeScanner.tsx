
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, X, Loader2, Upload, Link, Image } from 'lucide-react';
import { useGiaScanner } from '@/hooks/useGiaScanner';
import { useToast } from '@/components/ui/use-toast';

interface QRCodeScannerProps {
  onScanSuccess: (giaData: any) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function QRCodeScanner({ onScanSuccess, onClose, isOpen }: QRCodeScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    videoRef,
    canvasRef,
    isScanning,
    isLoading,
    isFetchingGIA,
    error,
    startScanning,
    stopScanning,
    handleFileUpload,
  } = useGiaScanner({ 
    onScanSuccess: (giaData) => {
      // Include the image URL in the GIA data if provided
      if (imagePreview) {
        giaData.picture = imagePreview;
      }
      onScanSuccess(giaData);
    }, 
    isOpen 
  });

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleImageUrlSubmit = () => {
    if (!imageUrl.trim()) {
      toast({
        title: "Please enter an image URL",
        variant: "destructive",
      });
      return;
    }

    // Validate image URL by creating an image element
    const img = new globalThis.Image();
    img.onload = () => {
      setImagePreview(imageUrl);
      toast({
        title: "✅ Image URL Added",
        description: "Diamond image will be included when certificate is scanned",
      });
    };
    img.onerror = () => {
      toast({
        title: "❌ Invalid Image URL",
        description: "Please check the URL and try again",
        variant: "destructive",
      });
    };
    img.src = imageUrl;
  };

  const removeImagePreview = () => {
    setImagePreview(null);
    setImageUrl('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/90 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Scan Diamond Certificate
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-10"
              style={{ minHeight: '40px' }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image Preview Section */}
          {imagePreview && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Diamond Image Added</Label>
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Diamond preview"
                  className="w-20 h-20 object-cover rounded-lg border border-border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={removeImagePreview}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Camera Section */}
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full aspect-square rounded-lg bg-gray-100"
              autoPlay
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            {(isLoading || isFetchingGIA) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-white mb-2" />
                <p className="text-white text-sm text-center">
                  {isFetchingGIA ? 'Processing certificate data...' : 'Starting camera...'}
                </p>
              </div>
            )}
          </div>
          
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          
          {/* Camera Controls */}
          <div className="flex gap-2">
            {!isScanning ? (
              <>
                <Button 
                  onClick={startScanning} 
                  className="flex-1 h-12" 
                  disabled={isFetchingGIA}
                  style={{ minHeight: '48px' }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Start Scanning
                </Button>
                <Button 
                  onClick={triggerFileUpload} 
                  variant="outline" 
                  className="flex-1 h-12" 
                  disabled={isFetchingGIA}
                  style={{ minHeight: '48px' }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
              </>
            ) : (
              <Button 
                onClick={stopScanning} 
                variant="outline" 
                className="flex-1 h-12" 
                disabled={isFetchingGIA}
                style={{ minHeight: '48px' }}
              >
                Stop Scanning
              </Button>
            )}
          </div>

          {/* Diamond Image Upload Section */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium mb-3 block">Add Diamond Image (Optional)</Label>
            <Tabs defaultValue="url" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  File
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="url" className="space-y-3">
                <Input
                  placeholder="https://example.com/diamond-image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full"
                />
                <Button
                  onClick={handleImageUrlSubmit}
                  disabled={!imageUrl.trim()}
                  className="w-full"
                  variant="outline"
                >
                  <Link className="h-4 w-4 mr-2" />
                  Add Image URL
                </Button>
              </TabsContent>
              
              <TabsContent value="file" className="space-y-3">
                <Button
                  onClick={() => document.getElementById('diamond-image-upload')?.click()}
                  className="w-full"
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Diamond Image
                </Button>
                <Input
                  id="diamond-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const dataUrl = reader.result as string;
                        setImagePreview(dataUrl);
                        toast({
                          title: "✅ Image Added",
                          description: "Diamond image will be included with the certificate data",
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <p className="text-sm text-gray-600 text-center">
            Scan a GIA QR code or upload an image of a GIA certificate. Optionally add a diamond image to be included in your listing.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

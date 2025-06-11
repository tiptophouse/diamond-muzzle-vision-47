
import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, X, Upload } from "lucide-react";
import { useImageUpload } from "@/hooks/useImageUpload";
import { toast } from "@/components/ui/use-toast";

interface MobileCameraCaptureProps {
  stockNumber: string;
  onImageCaptured: (imageUrl: string) => void;
  onClose: () => void;
}

export function MobileCameraCapture({ 
  stockNumber, 
  onImageCaptured, 
  onClose 
}: MobileCameraCaptureProps) {
  const [capturing, setCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading } = useImageUpload();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCapturing(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        variant: "destructive",
        title: "Camera Access Failed",
        description: "Could not access camera. Please check permissions or use file upload instead.",
      });
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    context.drawImage(video, 0, 0);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageDataUrl);
    
    // Stop camera stream
    const stream = video.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setCapturing(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await uploadImage(file, stockNumber);
      if (imageUrl) {
        onImageCaptured(imageUrl);
        onClose();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const uploadCapturedImage = async () => {
    if (!capturedImage) return;

    try {
      // Convert data URL to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      // Create file from blob
      const file = new File([blob], `${stockNumber}_${Date.now()}.jpg`, { 
        type: 'image/jpeg' 
      });

      const imageUrl = await uploadImage(file, stockNumber);
      if (imageUrl) {
        onImageCaptured(imageUrl);
        onClose();
      }
    } catch (error) {
      console.error('Error uploading captured image:', error);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const stopCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
    setCapturing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Capture Diamond Photo</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                stopCamera();
                onClose();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {!capturing && !capturedImage && (
              <div className="text-center space-y-4">
                <div className="bg-slate-100 rounded-lg p-8">
                  <Camera className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">
                    Take a photo of your diamond or upload from device
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Button 
                    onClick={startCamera}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Open Camera
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Choose from Device"}
                  </Button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            )}

            {capturing && (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full rounded-lg"
                  />
                  <div className="absolute inset-0 border-2 border-white border-dashed rounded-lg pointer-events-none"></div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={stopCamera}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={capturePhoto}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Capture
                  </Button>
                </div>
              </div>
            )}

            {capturedImage && (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={capturedImage}
                    alt="Captured diamond"
                    className="w-full rounded-lg"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={retakePhoto}
                    className="flex-1"
                  >
                    Retake
                  </Button>
                  <Button 
                    onClick={uploadCapturedImage}
                    disabled={uploading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {uploading ? "Uploading..." : "Use Photo"}
                  </Button>
                </div>
              </div>
            )}

            {/* Hidden canvas for image capture */}
            <canvas
              ref={canvasRef}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

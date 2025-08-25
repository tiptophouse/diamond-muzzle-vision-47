import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Trash2, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { uploadUserImage, getUserImage, deleteUserImage } from '@/lib/api';

interface AdminImageUploadProps {
  stockNumber: string;
  onImageUploaded?: (stockNumber: string, imageUrl: string | null) => void;
}

export function AdminImageUpload({ stockNumber, onImageUploaded }: AdminImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const { toast } = useToast();
  const { webApp } = useTelegramWebApp();

  useEffect(() => {
    const loadImage = async () => {
      try {
        const imageUrl = await getUserImage(stockNumber);
        setCurrentImageUrl(imageUrl);
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    if (stockNumber) {
      loadImage();
    }
  }, [stockNumber]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !webApp) return;

    setIsUploading(true);
    webApp.HapticFeedback?.impactOccurred('medium');

    try {
      const response = await uploadUserImage(stockNumber, selectedFile);
      const newImageUrl = response.url;

      setCurrentImageUrl(newImageUrl);
      onImageUploaded?.(stockNumber, newImageUrl);

      webApp.HapticFeedback?.notificationOccurred('success');
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      webApp.HapticFeedback?.notificationOccurred('error');
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  const handleDelete = async () => {
    if (!webApp) return;
    
    setIsDeleting(true);
    webApp.HapticFeedback?.impactOccurred('medium');
    
    try {
      await deleteUserImage(stockNumber);
      setCurrentImageUrl(null);
      onImageUploaded?.(stockNumber, null);
      
      webApp.HapticFeedback?.notificationOccurred('success');
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      webApp.HapticFeedback?.notificationOccurred('error');
      toast.error('Failed to delete image');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReplace = async () => {
    if (!webApp) return;
    
    setIsReplacing(true);
    webApp.HapticFeedback?.impactOccurred('medium');
    
    try {
      const response = await uploadUserImage(stockNumber, selectedFile);
      const newImageUrl = response.url;
      
      setCurrentImageUrl(newImageUrl);
      onImageUploaded?.(stockNumber, newImageUrl);
      
      webApp.HapticFeedback?.notificationOccurred('success');
      toast.success('Image replaced successfully');
    } catch (error) {
      console.error('Error replacing image:', error);
      webApp.HapticFeedback?.notificationOccurred('error');
      toast.error('Failed to replace image');
    } finally {
      setIsReplacing(false);
      setSelectedFile(null);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="image">
            {currentImageUrl ? 'Replace Image' : 'Upload Image'}
          </Label>
          <Input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading || isDeleting || isReplacing}
          />
          {selectedFile && (
            <p className="text-sm text-muted-foreground">
              Selected: {selectedFile.name}
            </p>
          )}
        </div>

        {currentImageUrl ? (
          <div className="relative">
            <img
              src={currentImageUrl}
              alt="Diamond"
              className="rounded-md aspect-square object-cover w-full"
            />
            <div className="absolute top-2 right-2 space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReplace}
                disabled={!selectedFile || isUploading || isDeleting || isReplacing}
                className={isReplacing ? 'animate-pulse' : ''}
              >
                {isReplacing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Replacing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Replace
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isUploading || isDeleting || isReplacing}
                className={isDeleting ? 'animate-pulse' : ''}
              >
                {isDeleting ? (
                  <>
                    <Trash2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading || isDeleting || isReplacing}
            className={isUploading ? 'animate-pulse' : ''}
          >
            {isUploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

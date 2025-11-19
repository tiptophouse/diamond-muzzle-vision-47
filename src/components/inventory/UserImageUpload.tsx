import { useState } from 'react';
import { Upload, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ImageUpload } from '@/components/store/ImageUpload';
import { Diamond } from './InventoryTable';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useToast } from '@/hooks/use-toast';

interface UserImageUploadProps {
  diamond: Diamond;
  onUpdate: () => void;
}

export function UserImageUpload({ diamond, onUpdate }: UserImageUploadProps) {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(diamond.imageUrl || '');
  const [gem360Url, setGem360Url] = useState(diamond.gem360Url || '');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const handleImageUploaded = (url: string) => {
    setImageUrl(url);
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const updateData = {
        picture: imageUrl,
        gem_360_url: gem360Url
      };

      // Use stockNumber for FastAPI endpoint
      const endpoint = apiEndpoints.updateDiamond(diamond.stockNumber, user.id);
      console.log('💎 Updating diamond images:', { stockNumber: diamond.stockNumber, updateData });
      
      const response = await api.put(endpoint, updateData);

      if (response.data) {
        console.log('✅ Diamond images updated successfully');
        toast({
          title: "✅ Success",
          description: "Diamond images updated successfully"
        });
        setOpen(false);
        onUpdate(); // Trigger refresh
      } else {
        throw new Error(response.error || "Failed to update diamond");
      }
    } catch (error) {
      console.error('❌ Error updating diamond:', error);
      toast({
        title: "❌ Error",
        description: "Failed to update diamond images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-700"
          title="Upload Images"
        >
          {diamond.imageUrl ? <ImageIcon className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Diamond Images</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">Diamond Image</Label>
            <p className="text-sm text-muted-foreground mb-3">
              Upload or provide a URL for the main diamond image
            </p>
            <ImageUpload onImageUploaded={handleImageUploaded} />
            
            {imageUrl && (
              <div className="mt-4">
                <Label htmlFor="imageUrl">Current Image URL</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/diamond.jpg"
                />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="gem360Url">3D 360° Viewer URL</Label>
            <Input
              id="gem360Url"
              value={gem360Url}
              onChange={(e) => setGem360Url(e.target.value)}
              placeholder="https://v360.in/diamondview.aspx?cid=YBDB&d=C1-0K732361"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Format: https://v360.in/diamondview.aspx?cid=YBDB&d=CERTIFICATE_ID
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isUploading}
            >
              {isUploading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import React, { useState } from 'react';
import { Camera, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAdvancedTelegramSDK } from '@/hooks/useAdvancedTelegramSDK';
import { useToast } from '@/hooks/use-toast';

interface Diamond {
  stockNumber: string;
  carat: number;
  shape: string;
  color: string;
  clarity: string;
  price: number;
  image_url?: string;
}

interface StoryShareButtonProps {
  diamond: Diamond;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function StoryShareButton({ 
  diamond, 
  className = "", 
  variant = "outline", 
  size = "default" 
}: StoryShareButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const { shareToStory, isInitialized, haptics } = useAdvancedTelegramSDK();
  const { toast } = useToast();

  const generateStoryImage = async (): Promise<string> => {
    // If diamond has an image, use it directly
    if (diamond.image_url) {
      return diamond.image_url;
    }

    // Generate a beautiful gradient background with diamond details
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    canvas.width = 1080;
    canvas.height = 1920;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(0.5, '#764ba2');
    gradient.addColorStop(1, '#f093fb');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add diamond emoji/icon
    ctx.font = '200px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('💎', canvas.width / 2, 400);

    // Add diamond details
    ctx.font = 'bold 80px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${diamond.carat}ct ${diamond.shape}`, canvas.width / 2, 600);
    
    ctx.font = '60px Arial';
    ctx.fillText(`${diamond.color} • ${diamond.clarity}`, canvas.width / 2, 700);
    
    ctx.font = 'bold 100px Arial';
    ctx.fillStyle = '#ffd700';
    ctx.fillText(`$${diamond.price.toLocaleString()}`, canvas.width / 2, 850);

    // Add branding
    ctx.font = '40px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Premium Diamond Collection', canvas.width / 2, 1600);

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleStoryShare = async () => {
    try {
      haptics.impact('light');
      
      const mediaUrl = await generateStoryImage();
      const storyText = `✨ ${diamond.carat}ct ${diamond.shape} Diamond\n${diamond.color} • ${diamond.clarity}\n💰 $${diamond.price.toLocaleString()}`;
      const widgetUrl = `${window.location.origin}/diamond/${diamond.stockNumber}`;

      const success = shareToStory(mediaUrl, storyText, widgetUrl);
      
      if (success) {
        toast({
          title: "השיתוף הצליח! 📖",
          description: "היהלום שותף לסטורי בטלגרם",
        });
        haptics.notification('success');
      } else {
        toast({
          title: "שיתוף פותח בדפדפן 🌐",
          description: "השיתוף נפתח בחלון חדש",
        });
      }
      
      setShowDialog(false);
    } catch (error) {
      console.error('Story sharing failed:', error);
      toast({
        title: "שגיאה בשיתוף ❌",
        description: "נסה שוב מאוחר יותר",
        variant: "destructive"
      });
      haptics.notification('error');
    }
  };

  const storyPreviewData = {
    title: `${diamond.carat}ct ${diamond.shape} Diamond`,
    subtitle: `${diamond.color} • ${diamond.clarity}`,
    price: `$${diamond.price.toLocaleString()}`,
    image: diamond.image_url
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`flex items-center gap-2 ${className}`}
        >
          <Camera className="h-4 w-4" />
          {size !== "icon" && <span>סטורי</span>}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="w-[95vw] max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Camera className="h-5 w-5 text-blue-600" />
            שיתוף לסטורי טלגרם
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Story Preview */}
          <div className="relative bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-xl p-6 text-white text-center">
            <div className="absolute top-2 right-2">
              <Sparkles className="h-5 w-5 text-yellow-300" />
            </div>
            
            {storyPreviewData.image ? (
              <img 
                src={storyPreviewData.image} 
                alt="Diamond" 
                className="w-20 h-20 mx-auto rounded-full object-cover mb-3 border-2 border-white"
              />
            ) : (
              <div className="text-6xl mb-3">💎</div>
            )}
            
            <h3 className="font-bold text-lg">{storyPreviewData.title}</h3>
            <p className="text-sm opacity-90 mb-2">{storyPreviewData.subtitle}</p>
            <p className="text-xl font-bold text-yellow-300">{storyPreviewData.price}</p>
            
            <div className="mt-4 text-xs opacity-75">
              תצוגה מקדימה של הסטורי
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleStoryShare}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12"
          >
            <Share2 className="h-5 w-5 mr-2" />
            שתף לסטורי טלגרם
          </Button>

          <div className="text-xs text-muted-foreground text-center">
            השיתוף יכלול קישור חזרה לפרטי היהלום
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
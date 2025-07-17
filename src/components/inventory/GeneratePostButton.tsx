import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Diamond } from "./InventoryTable";
import { Loader2, Share, Copy } from "lucide-react";

interface GeneratePostButtonProps {
  diamond: Diamond;
}

export function GeneratePostButton({ diamond }: GeneratePostButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedPost, setGeneratedPost] = useState("");
  const { toast } = useToast();

  const generatePost = async () => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-diamond-post', {
        body: {
          diamond: {
            stock_number: diamond.stockNumber,
            shape: diamond.shape,
            carat: diamond.carat,
            color: diamond.color,
            clarity: diamond.clarity,
            cut: diamond.cut,
            price: diamond.price,
            certificate_number: diamond.certificateNumber,
            lab: diamond.lab
          },
          platform: 'social'
        }
      });

      if (error) {
        console.error('❌ Error generating post:', error);
        toast({
          title: "שגיאה ביצירת הפוסט",
          description: "נסה שוב מאוחר יותר",
          variant: "destructive"
        });
        return;
      }

      setGeneratedPost(data.content);
      setShowPreview(true);
      
      toast({
        title: "הפוסט נוצר בהצלחה! 🎉",
        description: "ניתן לערוך ולהתאים את התוכן לפי הצורך"
      });

    } catch (error) {
      console.error('❌ Error generating post:', error);
      toast({
        title: "שגיאה ביצירת הפוסט",
        description: "נסה שוב מאוחר יותר",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPost);
      toast({
        title: "הועתק ללוח!",
        description: "הפוסט הועתק ללוח בהצלחה"
      });
    } catch (error) {
      console.error('❌ Error copying to clipboard:', error);
      toast({
        title: "שגיאה בהעתקה",
        description: "נסה להעתיק באופן ידני",
        variant: "destructive"
      });
    }
  };

  const shareToTelegram = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-telegram-message', {
        body: {
          message: generatedPost,
          type: 'diamond_post'
        }
      });

      if (error) {
        console.error('❌ Error sending to Telegram:', error);
        toast({
          title: "שגיאה בשליחה לטלגרם",
          description: "נסה שוב מאוחר יותר",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "נשלח בהצלחה! 📤",
        description: "הפוסט נשלח לקבוצת הטלגרם"
      });
      
      setShowPreview(false);
    } catch (error) {
      console.error('❌ Error sharing to Telegram:', error);
      toast({
        title: "שגיאה בשליחה לטלגרם",
        description: "נסה שוב מאוחר יותר",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={generatePost}
        disabled={isGenerating}
        className="h-8 px-2 text-xs"
      >
        {isGenerating ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Share className="h-3 w-3" />
        )}
        <span className="ml-1">יצירת פוסט</span>
      </Button>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>פוסט שנוצר - יהלום #{diamond.stockNumber}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              value={generatedPost}
              onChange={(e) => setGeneratedPost(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
              placeholder="הפוסט יופיע כאן..."
            />
            
            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                <Copy className="h-4 w-4 mr-2" />
                העתק
              </Button>
              
              <Button onClick={shareToTelegram} className="flex-1">
                <Share className="h-4 w-4 mr-2" />
                שלח לטלגרם
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
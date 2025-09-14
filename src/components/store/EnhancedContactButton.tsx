import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Diamond } from '@/components/inventory/InventoryTable';
import { MessageSquare, Send, Phone } from 'lucide-react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { toast } from 'sonner';

interface EnhancedContactButtonProps {
  diamond: Diamond;
  className?: string;
}

export function EnhancedContactButton({ diamond, className }: EnhancedContactButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(`היי, אני מעוניין באבן יהלום:
מספר מלאי: ${diamond.stockNumber}
צורה: ${diamond.shape}
משקל: ${diamond.carat} קראט
צבע: ${diamond.color}
ניקיון: ${diamond.clarity}

אשמח לקבל פרטים נוספים ומחיר.`);
  const [contactInfo, setContactInfo] = useState('');
  
  const { webApp } = useTelegramWebApp();

  const handleSendMessage = () => {
    try {
      // Create the message for Telegram
      const telegramMessage = encodeURIComponent(`${message}

פרטי התקשרות: ${contactInfo}

#יהלום #${diamond.shape} #${diamond.stockNumber}`);
      
      if (webApp?.openTelegramLink) {
        // Use Telegram WebApp API to send message to specific group
        webApp.openTelegramLink(`https://t.me/share/url?url=&text=${telegramMessage}`);
      } else {
        // Fallback to regular Telegram link
        window.open(`https://t.me/share/url?url=&text=${telegramMessage}`, '_blank');
      }
      
      toast.success('הודעה נשלחה בהצלחה!');
      setIsOpen(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('שגיאה בשליחת ההודעה');
    }
  };

  const handleDirectCall = () => {
    // You can replace this with actual business phone number
    const phoneNumber = '+972123456789'; // Replace with actual number
    window.open(`tel:${phoneNumber}`, '_self');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={className} size="sm">
          <MessageSquare className="h-4 w-4 mr-1" />
          צור קשר
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>צור קשר בנוגע ליהלום</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm font-medium">פרטי היהלום:</p>
            <p className="text-xs text-muted-foreground">
              {diamond.stockNumber} • {diamond.shape} • {diamond.carat}ct • {diamond.color}/{diamond.clarity}
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">הודעה</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact">פרטי התקשרות שלך</Label>
            <Input
              id="contact"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="טלפון / אימייל"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSendMessage} 
              disabled={!message.trim() || !contactInfo.trim()}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-1" />
              שלח הודעה
            </Button>
            <Button 
              onClick={handleDirectCall}
              variant="outline"
              className="flex-1"
            >
              <Phone className="h-4 w-4 mr-1" />
              התקשר
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
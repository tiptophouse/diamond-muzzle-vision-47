
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Diamond } from "@/components/inventory/InventoryTable";
import { MessageCircle, Send, Phone, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactBuyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  diamond: Diamond;
  storeOwnerTelegramId?: number;
}

export function ContactBuyerModal({ isOpen, onClose, diamond, storeOwnerTelegramId }: ContactBuyerModalProps) {
  const [formData, setFormData] = useState({
    buyerName: '',
    buyerPhone: '',
    buyerEmail: '',
    message: `Hi! I'm interested in your diamond:\n\nStock #: ${diamond.stockNumber}\nShape: ${diamond.shape}\nCarat: ${diamond.carat}\nColor: ${diamond.color}\nClarity: ${diamond.clarity}\nPrice: $${diamond.price.toLocaleString()}\n\nCould you please provide more details?`
  });
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendInquiry = async () => {
    if (!formData.buyerName || !formData.message) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in your name and message",
      });
      return;
    }

    setIsSending(true);
    
    try {
      // Create Telegram message with buyer inquiry
      const telegramMessage = `🔔 NEW DIAMOND INQUIRY\n\n` +
        `💎 DIAMOND DETAILS:\n` +
        `Stock #: ${diamond.stockNumber}\n` +
        `Shape: ${diamond.shape}\n` +
        `Carat: ${diamond.carat}\n` +
        `Color: ${diamond.color}\n` +
        `Clarity: ${diamond.clarity}\n` +
        `Cut: ${diamond.cut}\n` +
        `Price: $${diamond.price.toLocaleString()}\n\n` +
        `👤 BUYER INFORMATION:\n` +
        `Name: ${formData.buyerName}\n` +
        `Phone: ${formData.buyerPhone || 'Not provided'}\n` +
        `Email: ${formData.buyerEmail || 'Not provided'}\n\n` +
        `💬 MESSAGE:\n${formData.message}\n\n` +
        `📅 Inquiry Time: ${new Date().toLocaleString()}`;

      // Send via Telegram API
      const encodedMessage = encodeURIComponent(telegramMessage);
      const telegramUrl = `https://t.me/share/url?url=${encodedMessage}`;
      
      // Open Telegram
      window.open(telegramUrl, '_blank');
      
      toast({
        title: "Inquiry Sent!",
        description: "Your inquiry has been prepared for Telegram. Please send the message to contact the store owner.",
      });
      
      onClose();
      
    } catch (error) {
      console.error('Error sending inquiry:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to prepare inquiry. Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleWhatsAppContact = () => {
    const message = formData.message.replace(/\n/g, '%0A');
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Contact Store Owner
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Diamond Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border">
            <h3 className="font-semibold text-lg mb-3">Diamond Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <Badge variant="outline" className="mb-1">Stock #</Badge>
                <p className="font-medium">{diamond.stockNumber}</p>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="mb-1">Shape</Badge>
                <p className="font-medium">{diamond.shape}</p>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="mb-1">Carat</Badge>
                <p className="font-medium">{diamond.carat}</p>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="mb-1">Price</Badge>
                <p className="font-medium text-green-600">${diamond.price.toLocaleString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <div className="text-center">
                <Badge variant="secondary" className="mb-1">Color</Badge>
                <p className="font-medium">{diamond.color}</p>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="mb-1">Clarity</Badge>
                <p className="font-medium">{diamond.clarity}</p>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="mb-1">Cut</Badge>
                <p className="font-medium">{diamond.cut}</p>
              </div>
            </div>
          </div>

          {/* Buyer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buyerName">Name *</Label>
                <Input
                  id="buyerName"
                  value={formData.buyerName}
                  onChange={(e) => handleInputChange('buyerName', e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="buyerPhone">Phone Number</Label>
                <Input
                  id="buyerPhone"
                  value={formData.buyerPhone}
                  onChange={(e) => handleInputChange('buyerPhone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="buyerEmail">Email (Optional)</Label>
              <Input
                id="buyerEmail"
                type="email"
                value={formData.buyerEmail}
                onChange={(e) => handleInputChange('buyerEmail', e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Tell the store owner what you're interested in..."
              rows={6}
              className="mt-1"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleSendInquiry}
              disabled={isSending}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSending ? "Preparing..." : "Send via Telegram"}
            </Button>
            <Button 
              onClick={handleWhatsAppContact}
              variant="outline"
              className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
            >
              <Phone className="h-4 w-4 mr-2" />
              Send via WhatsApp
            </Button>
          </div>
          
          <p className="text-sm text-gray-600 text-center">
            Your inquiry will be sent directly to the store owner with all diamond details included.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

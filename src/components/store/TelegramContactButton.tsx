
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useTelegramContact } from '@/hooks/useTelegramContact';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { Diamond } from '@/components/inventory/InventoryTable';
import { toast } from 'sonner';

interface TelegramContactButtonProps {
  diamond: Diamond;
  ownerTelegramId: number;
  className?: string;
}

export function TelegramContactButton({ diamond, ownerTelegramId, className = '' }: TelegramContactButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { sendContactMessage, isAvailable } = useTelegramContact();
  const { impactOccurred, notification } = useTelegramHapticFeedback();

  const handleContact = async () => {
    if (!isAvailable) {
      toast.error('Telegram contact not available');
      return;
    }

    setIsLoading(true);
    impactOccurred('light');

    try {
      const success = await sendContactMessage(diamond, ownerTelegramId);
      
      if (success) {
        notification('success');
        toast.success('Contact message sent successfully!', {
          description: 'The diamond owner has been notified of your interest.'
        });
      } else {
        notification('error');
        toast.error('Failed to send contact message', {
          description: 'Please try again later.'
        });
      }
    } catch (error) {
      console.error('Contact error:', error);
      notification('error');
      toast.error('Failed to send contact message', {
        description: 'Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleContact}
      disabled={isLoading || !isAvailable}
      className={`bg-blue-600 hover:bg-blue-700 text-white ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
      ) : (
        <MessageCircle className="w-4 h-4 mr-1" />
      )}
      {isLoading ? 'Sending...' : 'Contact'}
    </Button>
  );
}

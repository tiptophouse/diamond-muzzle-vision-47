
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled, placeholder = "Message Diamond Assistant..." }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 items-end w-full">
      <div className="flex-1 relative min-w-0">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-[44px] max-h-[100px] sm:max-h-[120px] resize-none pr-12 rounded-2xl border-muted-foreground/20 focus:border-primary bg-background text-sm sm:text-base w-full"
          rows={1}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!message.trim() || disabled}
          className="absolute right-2 bottom-2 h-8 w-8 p-0 rounded-full bg-primary hover:bg-primary/90 shrink-0"
        >
          <Send size={14} />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </form>
  );
};

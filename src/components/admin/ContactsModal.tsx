import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Phone, Mail, Search, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { cn } from '@/lib/utils';

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: any[];
}

export function ContactsModal({ isOpen, onClose, users }: ContactsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { webApp, isReady } = useTelegramWebApp();
  const { impactOccurred, notificationOccurred } = useTelegramHapticFeedback();

  // Filter real users only (not mock data)
  const realUsers = users.filter(user => {
    const isReal = user.first_name && 
      !['Test', 'Telegram', 'Emergency', 'Unknown'].includes(user.first_name) &&
      user.telegram_id > 1000000;
    return isReal;
  });

  const filteredContacts = realUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const firstName = (user.first_name || '').toLowerCase();
    const lastName = (user.last_name || '').toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();
    const username = (user.username || '').toLowerCase();
    const telegramId = String(user.telegram_id || '');
    
    return (
      firstName.includes(searchLower) ||
      lastName.includes(searchLower) ||
      fullName.includes(searchLower) ||
      username.includes(searchLower) ||
      telegramId.includes(searchTerm)
    );
  });

  const handleSendMessage = (user: any) => {
    impactOccurred('medium');
    
    if (isReady && webApp) {
      // Use Telegram native method to open user profile
      const telegramUrl = `https://t.me/${user.username || `user${user.telegram_id}`}`;
      webApp.openTelegramLink(telegramUrl);
    } else {
      // Fallback for non-Telegram environment
      const telegramUrl = `https://t.me/${user.username || `user${user.telegram_id}`}`;
      window.open(telegramUrl, '_blank');
    }
    
    notificationOccurred('success');
    toast({
      title: "Opening Telegram",
      description: `Opening chat with ${user.first_name || 'User'}`,
    });
  };

  const handleCall = (user: any) => {
    impactOccurred('medium');
    
    if (user.phone_number) {
      if (isReady && webApp) {
        webApp.openLink(`tel:${user.phone_number}`);
      } else {
        window.open(`tel:${user.phone_number}`, '_self');
      }
      notificationOccurred('success');
    } else {
      notificationOccurred('error');
      toast({
        title: "No Phone Number",
        description: "This user hasn't shared their phone number",
        variant: "destructive"
      });
    }
  };

  const handleEmail = (user: any) => {
    impactOccurred('medium');
    
    if (user.email) {
      if (isReady && webApp) {
        webApp.openLink(`mailto:${user.email}`);
      } else {
        window.open(`mailto:${user.email}`, '_self');
      }
      notificationOccurred('success');
    } else {
      notificationOccurred('error');
      toast({
        title: "No Email",
        description: "This user hasn't shared their email",
        variant: "destructive"
      });
    }
  };

  const getInitials = (user: any) => {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "flex flex-col",
        "w-full max-w-full sm:max-w-4xl",
        "h-[100dvh] sm:h-auto sm:max-h-[85vh]",
        "p-0 gap-0 m-0",
        "sm:rounded-lg rounded-none"
      )}>
        <DialogHeader className="px-4 sm:px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            User Contacts ({filteredContacts.length})
          </DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative px-4 sm:px-6 py-3 border-b flex-shrink-0 bg-background">
          <Search className="absolute left-7 sm:left-9 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, username, or ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              impactOccurred('light');
            }}
            className="pl-10 sm:pl-12 h-12 text-base touch-target"
          />
        </div>

        {/* Contacts List */}
        <ScrollArea className="flex-1 px-4 sm:px-6">
          <div className="space-y-3 py-4">
            {filteredContacts.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <User className="h-16 w-16 mx-auto mb-3 opacity-50" />
                <p className="text-base">No contacts found</p>
              </div>
            ) : (
              filteredContacts.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border bg-card hover:bg-accent active:bg-accent/80 transition-colors min-h-[88px] touch-target"
                >
                  <Avatar className="h-14 w-14 sm:h-12 sm:w-12 flex-shrink-0">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-base">
                      {getInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground truncate text-base sm:text-sm">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-sm sm:text-xs text-muted-foreground truncate">
                      {user.username ? `@${user.username}` : `ID: ${user.telegram_id}`}
                    </div>
                    {user.phone_number && (
                      <div className="text-xs text-muted-foreground mt-1 truncate">{user.phone_number}</div>
                    )}
                  </div>
                  
                  <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSendMessage(user)}
                      className="h-12 w-12 min-w-[48px] min-h-[48px] sm:h-11 sm:w-11 touch-target"
                      title="Send Telegram message"
                    >
                      <MessageSquare className="h-5 w-5" />
                    </Button>
                    
                    {user.phone_number && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCall(user)}
                        className="h-12 w-12 min-w-[48px] min-h-[48px] sm:h-11 sm:w-11 touch-target"
                        title="Call"
                      >
                        <Phone className="h-5 w-5" />
                      </Button>
                    )}
                    
                    {user.email && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEmail(user)}
                        className="h-12 w-12 min-w-[48px] min-h-[48px] sm:h-11 sm:w-11 touch-target"
                        title="Send email"
                      >
                        <Mail className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Phone, Mail, Search, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: any[];
}

export function ContactsModal({ isOpen, onClose, users }: ContactsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Filter real users only (not mock data)
  const realUsers = users.filter(user => {
    const isReal = user.first_name && 
      !['Test', 'Telegram', 'Emergency', 'Unknown'].includes(user.first_name) &&
      user.telegram_id > 1000000; // Valid telegram IDs are typically > 1M
    return isReal;
  });

  const filteredContacts = realUsers.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const firstName = (user.first_name || '').toLowerCase();
    const lastName = (user.last_name || '').toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();
    const username = (user.username || '').toLowerCase();
    const phone = user.phone_number || '';
    
    return (
      firstName.includes(searchLower) ||
      lastName.includes(searchLower) ||
      fullName.includes(searchLower) ||
      username.includes(searchLower) ||
      phone.includes(searchTerm)
    );
  });

  const handleSendMessage = (user: any) => {
    if (user.telegram_id) {
      const telegramUrl = `https://t.me/${user.username || user.telegram_id}`;
      window.open(telegramUrl, '_blank');
      toast({
        title: "Opening Telegram",
        description: `Opening chat with ${user.first_name}`,
      });
    }
  };

  const handleCall = (user: any) => {
    if (user.phone_number) {
      window.open(`tel:${user.phone_number}`);
      toast({
        title: "Calling",
        description: `Calling ${user.first_name}`,
      });
    } else {
      toast({
        title: "No phone number",
        description: "This user has no phone number on file",
        variant: "destructive",
      });
    }
  };

  const handleEmail = (user: any) => {
    if (user.email) {
      window.open(`mailto:${user.email}`);
    } else {
      toast({
        title: "No email",
        description: "This user has no email on file",
        variant: "destructive",
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
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Users className="h-6 w-6 text-primary" />
            All Contacts ({realUsers.length} users)
          </DialogTitle>
          <DialogDescription>
            View and contact all registered users
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, username, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats */}
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span>Showing {filteredContacts.length} of {realUsers.length} contacts</span>
          </div>

          {/* Contacts List */}
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-2">
              {filteredContacts.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {getInitials(user)}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {user.first_name} {user.last_name}
                      </h3>
                      {user.is_premium && (
                        <Badge variant="secondary" className="text-xs">Premium</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {user.username && (
                        <p className="truncate">@{user.username}</p>
                      )}
                      {user.phone_number && (
                        <p className="truncate">{user.phone_number}</p>
                      )}
                      {user.email && (
                        <p className="truncate">{user.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSendMessage(user)}
                      title="Send Telegram message"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    {user.phone_number && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCall(user)}
                        title="Call user"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    )}
                    {user.email && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEmail(user)}
                        title="Send email"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {filteredContacts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No contacts found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

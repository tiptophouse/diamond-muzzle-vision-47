import React, { useState } from 'react';
import { Share2, Copy, MessageCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Diamond } from '@/types/diamond';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
  diamond: Diamond;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function ShareButton({ diamond, variant = 'outline', size = 'sm' }: ShareButtonProps) {
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { toast } = useToast();

  const getCurrentUrl = () => {
    // Construct the diamond-specific URL
    const baseUrl = window.location.origin;
    const diamondId = diamond.diamondId || diamond.id;
    return `${baseUrl}/diamond/${diamondId}`;
  };

  const shareOptions = [
    {
      name: "Copy Link",
      icon: Copy,
      action: () => {
        navigator.clipboard.writeText(getCurrentUrl());
        toast({
          title: "Link Copied!",
          description: "Diamond link has been copied to clipboard"
        });
      },
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      action: () => {
        const text = `Check out this diamond! ${getCurrentUrl()}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      },
    },
    {
      name: "Email",
      icon: Mail,
      action: () => {
        const subject = "Check out this diamond";
        const body = `I'd like to share this diamond with you: ${getCurrentUrl()}`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
      },
    },
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Diamond ${diamond.carat}ct`,
          text: `Check out this ${diamond.shape} diamond`,
          url: getCurrentUrl()
        });
      } catch (error) {
        // User cancelled sharing or error occurred
        console.log('Share cancelled');
      }
    } else {
      setShowShareDialog(true);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} onClick={handleNativeShare}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {shareOptions.map((option) => (
          <DropdownMenuItem key={option.name} onClick={option.action}>
            <option.icon className="w-4 h-4 mr-2" />
            <span>{option.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

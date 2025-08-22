import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { api, apiEndpoints } from '@/lib/api';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Diamond } from '@/types/diamond';

interface ShareResponse {
  short_url: string;
  expires_at: string;
}

export function useSecureDiamondSharing() {
  const [sharing, setSharing] = useState(false);
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const generateShareableLink = async (diamond: Diamond): Promise<ShareResponse | null> => {
    if (!user?.id) {
      toast({
        title: "Not Authenticated",
        description: "You must be logged in to share diamonds.",
        variant: "destructive",
      });
      return null;
    }

    setSharing(true);
    try {
      const diamondId = diamond.diamondId || diamond.id;
      const response = await api.post(apiEndpoints.generateShareLink, {
        user_id: user.id,
        diamond_id: diamondId,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Shareable Link Created",
        description: "Link copied to clipboard!",
      });
      navigator.clipboard.writeText(response.data.short_url);
      return response.data as ShareResponse;
    } catch (error: any) {
      console.error('Error creating shareable link:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create shareable link",
        variant: "destructive",
      });
      return null;
    } finally {
      setSharing(false);
    }
  };

  return {
    generateShareableLink,
    sharing,
  };
}

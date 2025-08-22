
import { useState } from 'react';
import { api, apiEndpoints } from '@/lib/api';
import { Diamond } from '@/types/diamond';

export interface ShareResponse {
  short_url: string;
  full_url: string;
  expires_at?: string;
}

export function useSecureDiamondSharing() {
  const [sharing, setSharing] = useState(false);

  const generateShareableLink = async (diamond: Diamond): Promise<ShareResponse> => {
    setSharing(true);
    try {
      const response = await api.post(apiEndpoints.generateShareLink(diamond.id), {
        diamond_id: diamond.id,
        expires_in_hours: 24
      });

      if (response.error) {
        throw new Error(response.error);
      }

      const data = response.data as any;
      return {
        short_url: data.short_url || `https://share.example.com/${diamond.id}`,
        full_url: data.full_url || `https://example.com/diamond/${diamond.id}`,
        expires_at: data.expires_at
      };
    } catch (error) {
      console.error('Error generating share link:', error);
      throw error;
    } finally {
      setSharing(false);
    }
  };

  return {
    generateShareableLink,
    sharing
  };
}


import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { API_BASE_URL, getCurrentUserId, getBackendAccessToken } from '@/lib/api';

interface DeleteDiamondResult {
  success: boolean;
  error?: string;
}

export function useDeleteDiamondFixed() {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const deleteDiamond = async (stockNumber: string, onSuccess?: () => void): Promise<DeleteDiamondResult> => {
    const currentUserId = getCurrentUserId();
    
    if (!currentUserId) {
      const error = 'User ID not available';
      console.error('❌ Delete failed:', error);
      toast({
        title: "Delete Failed",
        description: "User authentication required. Please refresh and try again.",
        variant: "destructive",
      });
      return { success: false, error };
    }

    setIsDeleting(stockNumber);
    console.log('🗑️ Starting diamond deletion:', { stockNumber, userId: currentUserId });

    try {
      // Get backend access token
      const accessToken = await getBackendAccessToken();
      if (!accessToken) {
        throw new Error('Backend access token not available');
      }

      // Call FastAPI backend to delete diamond
      const deleteUrl = `${API_BASE_URL}/api/v1/delete_stone/${stockNumber}`;
      console.log('🔗 Calling delete endpoint:', deleteUrl);

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          user_id: currentUserId
        })
      });

      console.log('📡 Delete response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend delete failed:', response.status, errorText);
        throw new Error(`Backend deletion failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Backend delete successful:', result);

      // Show success message
      toast({
        title: "Diamond Deleted",
        description: `Diamond ${stockNumber} has been successfully deleted.`,
      });

      // Call success callback to refresh inventory
      if (onSuccess) {
        onSuccess();
      }

      return { success: true };

    } catch (error) {
      console.error('❌ Diamond deletion failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      toast({
        title: "Delete Failed",
        description: `Failed to delete diamond ${stockNumber}: ${errorMessage}`,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    } finally {
      setIsDeleting(null);
    }
  };

  return {
    deleteDiamond,
    isDeleting
  };
}

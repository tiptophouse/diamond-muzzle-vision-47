
import { useState } from 'react';
import { api, apiEndpoints } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export function useAdminActions() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const blockUser = async (userId: number, reason: string) => {
    setIsLoading(true);
    try {
      console.log('🚫 Blocking user:', userId);
      const response = await api.post(apiEndpoints.blockUser(), {
        user_id: userId,
        reason: reason
      });
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "User Blocked",
        description: `Successfully blocked user ${userId}`,
      });
      return true;
    } catch (error) {
      console.error('❌ Error blocking user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to block user",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unblockUser = async (userId: number) => {
    setIsLoading(true);
    try {
      console.log('✅ Unblocking user:', userId);
      const response = await api.delete(apiEndpoints.unblockUser(userId));
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "User Unblocked",
        description: `Successfully unblocked user ${userId}`,
      });
      return true;
    } catch (error) {
      console.error('❌ Error unblocking user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to unblock user",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessageToUser = async (userId: number, message: string) => {
    setIsLoading(true);
    try {
      console.log('💬 Sending message to user:', userId);
      const response = await api.post(apiEndpoints.sendMessageToUser(), {
        user_id: userId,
        message: message
      });
      
      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Message Sent",
        description: `Successfully sent message to user ${userId}`,
      });
      return true;
    } catch (error) {
      console.error('❌ Error sending message:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    blockUser,
    unblockUser,
    sendMessageToUser,
  };
}

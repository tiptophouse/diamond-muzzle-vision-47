
import { useState, useEffect } from 'react';
import { Diamond } from '@/components/inventory/InventoryTable';
import { api, apiEndpoints } from '@/lib/api';
import { useSecureUser } from '@/contexts/SecureUserContext';
import { toast } from '@/components/ui/use-toast';

export function useSecureInventory() {
  const [diamonds, setDiamonds] = useState<Diamond[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUserId, isUserVerified } = useSecureUser();

  const fetchUserInventory = async () => {
    if (!currentUserId || !isUserVerified) {
      console.warn('🔒 Access denied: User not verified');
      setDiamonds([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔒 Fetching inventory for user:', currentUserId);
      
      const endpoint = apiEndpoints.getUserInventory(currentUserId);
      const response = await api.get(endpoint);

      if (response.data && Array.isArray(response.data)) {
        // Additional security check: ensure all diamonds belong to current user
        const userDiamonds = response.data.filter((diamond: any) => 
          diamond.user_id === currentUserId
        );
        
        if (userDiamonds.length !== response.data.length) {
          console.error('🚨 Security violation: Mixed user data detected');
          toast({
            title: "Security Error",
            description: "Data isolation violation detected",
            variant: "destructive"
          });
          setDiamonds([]);
          return;
        }
        
        setDiamonds(userDiamonds);
        console.log('✅ Secure inventory loaded:', userDiamonds.length, 'diamonds');
      } else {
        setDiamonds([]);
      }
    } catch (error) {
      console.error('❌ Error fetching secure inventory:', error);
      setDiamonds([]);
      toast({
        title: "Error",
        description: "Failed to load your inventory securely",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addDiamond = async (diamondData: any): Promise<boolean> => {
    if (!currentUserId || !isUserVerified) {
      toast({
        title: "Access Denied",
        description: "User verification required",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Ensure user_id is set correctly
      const secureData = {
        ...diamondData,
        user_id: currentUserId
      };

      const endpoint = apiEndpoints.addDiamond(currentUserId);
      const response = await api.post(endpoint, secureData);

      if (response.data) {
        await fetchUserInventory(); // Refresh inventory
        toast({
          title: "✅ Success",
          description: "Diamond added successfully"
        });
        return true;
      }
      
      throw new Error(response.error || 'Failed to add diamond');
    } catch (error) {
      console.error('❌ Error adding diamond:', error);
      toast({
        title: "Error", 
        description: "Failed to add diamond",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteDiamond = async (diamondId: string): Promise<boolean> => {
    if (!currentUserId || !isUserVerified) {
      toast({
        title: "Access Denied",
        description: "User verification required", 
        variant: "destructive"
      });
      return false;
    }

    try {
      const endpoint = apiEndpoints.deleteDiamond(diamondId, currentUserId);
      const response = await api.delete(endpoint);

      if (response.data) {
        // Remove from local state immediately
        setDiamonds(prev => prev.filter(d => d.id !== diamondId));
        
        toast({
          title: "✅ Success",
          description: "Diamond deleted successfully"
        });
        return true;
      }
      
      throw new Error(response.error || 'Failed to delete diamond');
    } catch (error) {
      console.error('❌ Error deleting diamond:', error);
      toast({
        title: "❌ Error",
        description: "Failed to delete diamond",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchUserInventory();
  }, [currentUserId, isUserVerified]);

  return {
    diamonds,
    isLoading,
    addDiamond,
    deleteDiamond,
    refreshInventory: fetchUserInventory
  };
}

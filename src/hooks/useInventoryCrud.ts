import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { DiamondFormData } from '@/components/inventory/form/types';
import { Diamond } from '@/components/inventory/InventoryTable';
import { useAddDiamond } from './inventory/useAddDiamond';
import { useUpdateDiamond } from './inventory/useUpdateDiamond';
import { useDeleteDiamond } from './inventory/useDeleteDiamond';
import { useInventoryDataSync } from './inventory/useInventoryDataSync';

interface UseInventoryCrudProps {
  onSuccess?: () => void;
  removeDiamondFromState?: (diamondId: string) => void;
  restoreDiamondToState?: (diamond: Diamond) => void;
}

export function useInventoryCrud({ onSuccess, removeDiamondFromState, restoreDiamondToState }: UseInventoryCrudProps = {}) {
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { triggerInventoryChange } = useInventoryDataSync();

  const successHandler = () => {
    console.log('🔄 CRUD: Operation successful, triggering inventory change...');
    triggerInventoryChange();
    if (onSuccess) onSuccess();
  };

  const { addDiamond: addDiamondFn } = useAddDiamond(successHandler);
  const { updateDiamond: updateDiamondFn } = useUpdateDiamond(successHandler);
  const { deleteDiamond: deleteDiamondFn } = useDeleteDiamond({ 
    onSuccess: successHandler, 
    removeDiamondFromState, 
    restoreDiamondToState 
  });

  const sendTelegramNotification = async (stoneData: DiamondFormData) => {
    if (!user?.id) {
      console.log('❌ No user ID for Telegram notification');
      return;
    }
    
    try {
      console.log('📱 Sending Telegram notification for stone:', stoneData.stockNumber);
      
      // Use production URL - miniapp.mazalbot.com
      let baseUrl = window.location.origin;
      
      // If it's a development/preview URL, replace with the production URL
      if (baseUrl.includes('lovable.dev') || baseUrl.includes('lovableproject.com')) {
        baseUrl = 'https://miniapp.mazalbot.com';
      }
      
      // Build URL with diamond parameters (like the share function)
      const params = new URLSearchParams({
        carat: stoneData.carat.toString(),
        color: stoneData.color,
        clarity: stoneData.clarity,
        cut: stoneData.cut,
        shape: stoneData.shape,
        stock: stoneData.stockNumber,
        price: (stoneData.pricePerCarat * stoneData.carat).toString(),
      });

      // Add optional parameters if they exist
      if (stoneData.fluorescence) params.set('fluorescence', stoneData.fluorescence);
      if (stoneData.picture) params.set('imageUrl', stoneData.picture);
      if (stoneData.certificateUrl) params.set('certificateUrl', stoneData.certificateUrl);
      if (stoneData.lab) params.set('lab', stoneData.lab);
      if (stoneData.certificateNumber) params.set('certificateNumber', stoneData.certificateNumber);
      if (stoneData.polish) params.set('polish', stoneData.polish);
      if (stoneData.symmetry) params.set('symmetry', stoneData.symmetry);
      
      const storeUrl = `${baseUrl}/store?${params.toString()}`;
      console.log('🔗 Generated store URL with parameters:', storeUrl);
      
      const response = await fetch('https://uhhljqgxhdhbbhpohxll.supabase.co/functions/v1/send-telegram-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoaGxqcWd4aGRoYmJocG9oeGxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODY1NTMsImV4cCI6MjA2MzA2MjU1M30._CGnKnTyltp1lIUmmOVI1nC4jRew2WkAU-bSf22HCDE`,
        },
        body: JSON.stringify({
          telegramId: user.id,
          stoneData: {
            stockNumber: stoneData.stockNumber,
            shape: stoneData.shape,
            carat: stoneData.carat,
            color: stoneData.color,
            clarity: stoneData.clarity,
            cut: stoneData.cut,
            polish: stoneData.polish,
            symmetry: stoneData.symmetry,
            fluorescence: stoneData.fluorescence,
            pricePerCarat: stoneData.pricePerCarat,
            lab: stoneData.lab,
            certificateNumber: stoneData.certificateNumber
          },
          storeUrl
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Telegram notification sent successfully:', result);
        toast({
          title: "📱 Telegram Sent",
          description: "Stone summary sent to your Telegram!",
        });
      } else {
        const error = await response.text();
        console.error('❌ Failed to send Telegram notification:', error);
      }
    } catch (error) {
      console.error('❌ Error sending Telegram notification:', error);
    }
  };

  const addDiamond = async (data: DiamondFormData) => {
    console.log('➕ CRUD: Starting add diamond operation');
    setIsLoading(true);
    try {
      const result = await addDiamondFn(data);
      if (result) {
        // Send Telegram notification on successful upload
        await sendTelegramNotification(data);
        
        // Check for wishlist matches after successful upload
        await checkWishlistMatches(data);
      }
      return result;
    } catch (error) {
      console.error('❌ CRUD: Add diamond failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const checkWishlistMatches = async (uploadedDiamond: DiamondFormData) => {
    try {
      console.log('🔍 Checking for wishlist matches...');
      
      // Get all wishlist items to check for matches (excluding uploader's own wishlist)
      const { data: wishlistItems, error } = await supabase
        .from('wishlist')
        .select('*')
        .neq('visitor_telegram_id', user?.id);

      if (error) {
        console.error('Error fetching wishlist items:', error);
        return;
      }

      console.log(`📋 Found ${wishlistItems?.length || 0} wishlist items to check`);

      // Check each wishlist item for matches
      for (const item of wishlistItems || []) {
        const wishlistDiamond = item.diamond_data;
        const isMatch = checkDiamondMatch(uploadedDiamond, wishlistDiamond);

        if (isMatch) {
          console.log('✨ Match found! Sending notification...');
          await sendWishlistNotification(item, uploadedDiamond);
        }
      }
    } catch (error) {
      console.error('Error checking wishlist matches:', error);
    }
  };

  const checkDiamondMatch = (uploaded: DiamondFormData, wishlist: any) => {
    // Shape matching
    const shapeMatch = !wishlist.shape || uploaded.shape === wishlist.shape;
    
    // Color matching
    const colorMatch = !wishlist.color || uploaded.color === wishlist.color;
    
    // Clarity matching
    const clarityMatch = !wishlist.clarity || uploaded.clarity === wishlist.clarity;
    
    // Cut matching
    const cutMatch = !wishlist.cut || uploaded.cut === wishlist.cut;
    
    // Carat range matching
    let caratMatch = true;
    if (wishlist.caratMin && uploaded.carat < parseFloat(wishlist.caratMin)) {
      caratMatch = false;
    }
    if (wishlist.caratMax && uploaded.carat > parseFloat(wishlist.caratMax)) {
      caratMatch = false;
    }

    // Price range matching
    let priceMatch = true;
    const uploadedPrice = uploaded.pricePerCarat * uploaded.carat;
    if (wishlist.priceMin && uploadedPrice < parseFloat(wishlist.priceMin)) {
      priceMatch = false;
    }
    if (wishlist.priceMax && uploadedPrice > parseFloat(wishlist.priceMax)) {
      priceMatch = false;
    }

    const matches = shapeMatch && colorMatch && clarityMatch && cutMatch && caratMatch && priceMatch;
    
    console.log('🔍 Match check:', {
      shape: shapeMatch,
      color: colorMatch,
      clarity: clarityMatch,
      cut: cutMatch,
      carat: caratMatch,
      price: priceMatch,
      overall: matches
    });

    return matches;
  };

  const sendWishlistNotification = async (wishlistItem: any, uploadedDiamond: DiamondFormData) => {
    try {
      console.log('📤 Sending wishlist notification...');
      
      const { error } = await supabase.functions.invoke('send-wishlist-notification', {
        body: {
          wishlistOwnerTelegramId: wishlistItem.visitor_telegram_id,
          uploaderInfo: {
            telegramId: user?.id,
            firstName: user?.first_name || 'Diamond Seller',
            username: user?.username
          },
          matchedDiamond: {
            stockNumber: uploadedDiamond.stockNumber,
            shape: uploadedDiamond.shape,
            carat: uploadedDiamond.carat,
            color: uploadedDiamond.color,
            clarity: uploadedDiamond.clarity,
            cut: uploadedDiamond.cut,
            price: uploadedDiamond.pricePerCarat * uploadedDiamond.carat,
            imageUrl: uploadedDiamond.picture
          }
        }
      });

      if (error) {
        console.error('❌ Error sending wishlist notification:', error);
      } else {
        console.log('✅ Wishlist notification sent successfully');
        toast({
          title: "🎉 Wishlist Match!",
          description: "Your diamond matched someone's wishlist - they've been notified!",
        });
      }
    } catch (error) {
      console.error('❌ Error in sendWishlistNotification:', error);
    }
  };

  const updateDiamond = async (diamondId: string, data: DiamondFormData) => {
    console.log('📝 CRUD: Starting update diamond operation for:', diamondId);
    setIsLoading(true);
    try {
      const result = await updateDiamondFn(diamondId, data);
      if (result) {
        console.log('✅ CRUD: Diamond updated successfully');
        toast({
          title: "✅ Diamond Updated",
          description: "Changes saved and synced across dashboard, store, and inventory",
        });
      }
      return result;
    } catch (error) {
      console.error('❌ CRUD: Update diamond failed:', error);
      toast({
        title: "❌ Update Failed",
        description: "Failed to update diamond. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDiamond = async (diamondId: string, diamondData?: Diamond) => {
    console.log('🗑️ CRUD: Starting delete diamond operation for:', diamondId);
    setIsLoading(true);
    try {
      const result = await deleteDiamondFn(diamondId, diamondData);
      if (result) {
        console.log('✅ CRUD: Diamond deleted successfully');
        toast({
          title: "✅ Diamond Deleted",
          description: "Diamond removed from inventory, dashboard, and store",
        });
      }
      return result;
    } catch (error) {
      console.error('❌ CRUD: Delete diamond failed:', error);
      toast({
        title: "❌ Delete Failed",
        description: "Failed to delete diamond. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addDiamond,
    updateDiamond,
    deleteDiamond,
    isLoading,
  };
}

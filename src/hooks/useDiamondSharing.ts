
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramWebApp } from './useTelegramWebApp';
import { Diamond } from '@/components/inventory/InventoryTable';
import { toast } from 'sonner';

interface ShareMetrics {
  totalShares: number;
  totalViews: number;
  avgViewDuration: number;
  reshares: number;
  uniqueViewers: number;
}

interface ViewerAnalytics {
  viewerId: number;
  viewerName?: string;
  viewDuration: number;
  deviceType: string;
  viewedAt: string;
  reshared: boolean;
}

interface ShareAnalytics {
  shareId: string;
  diamondStockNumber: string;
  shareUrl: string;
  createdAt: string;
  isActive: boolean;
  metrics: ShareMetrics;
  viewers: ViewerAnalytics[];
}

export function useDiamondSharing() {
  const { user } = useTelegramWebApp();
  const [loading, setLoading] = useState(false);
  const [shareAnalytics, setShareAnalytics] = useState<ShareAnalytics[]>([]);

  const createShare = useCallback(async (
    diamond: Diamond, 
    shareType: 'individual_item' | 'entire_store',
    sharedWithTelegramId?: number
  ) => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return null;
    }

    setLoading(true);
    try {
      const shareUrl = `${window.location.origin}/shared/${shareType}/${diamond.stockNumber}?from=${user.id}`;
      
      const { data, error } = await supabase
        .from('store_item_shares')
        .insert({
          owner_telegram_id: user.id,
          shared_with_telegram_id: sharedWithTelegramId,
          diamond_stock_number: diamond.stockNumber,
          share_type: shareType,
          share_url: shareUrl,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`✅ ${shareType === 'individual_item' ? 'Diamond' : 'Store'} shared successfully!`);
      
      // Track the share creation
      await trackShare(data.id, 'created');
      
      return data;
    } catch (error) {
      console.error('❌ Error creating share:', error);
      toast.error('Failed to create share');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const trackView = useCallback(async (
    shareId: string,
    diamondStockNumber: string,
    viewerTelegramId?: number
  ) => {
    try {
      const sessionId = crypto.randomUUID();
      const startTime = new Date().toISOString();
      
      const { error } = await supabase
        .from('store_item_views')
        .insert({
          share_id: shareId,
          viewer_telegram_id: viewerTelegramId,
          diamond_stock_number: diamondStockNumber,
          view_started_at: startTime,
          device_info: {
            userAgent: navigator.userAgent,
            deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
            screen: `${screen.width}x${screen.height}`,
            language: navigator.language
          },
          session_id: sessionId
        });

      if (error) throw error;

      // Return session ID to track view end
      return sessionId;
    } catch (error) {
      console.error('❌ Error tracking view:', error);
      return null;
    }
  }, []);

  const endViewTracking = useCallback(async (sessionId: string, viewDurationMs: number) => {
    try {
      const viewDurationSeconds = Math.floor(viewDurationMs / 1000);
      
      const { error } = await supabase
        .from('store_item_views')
        .update({
          view_ended_at: new Date().toISOString(),
          total_view_duration_seconds: viewDurationSeconds
        })
        .eq('session_id', sessionId);

      if (error) throw error;
    } catch (error) {
      console.error('❌ Error ending view tracking:', error);
    }
  }, []);

  const trackReshare = useCallback(async (
    originalShareId: string,
    resharedByTelegramId: number,
    reshareType: 'forward' | 'copy_link' | 'screenshot'
  ) => {
    try {
      const { error } = await supabase
        .from('store_item_reshares')
        .insert({
          original_share_id: originalShareId,
          reshared_by_telegram_id: resharedByTelegramId,
          reshare_type: reshareType
        });

      if (error) throw error;

      toast.success('📤 Reshare tracked successfully!');
    } catch (error) {
      console.error('❌ Error tracking reshare:', error);
    }
  }, []);

  const getShareAnalytics = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Get all shares by the user
      const { data: shares, error: sharesError } = await supabase
        .from('store_item_shares')
        .select('*')
        .eq('owner_telegram_id', user.id)
        .order('created_at', { ascending: false });

      if (sharesError) throw sharesError;

      // Get analytics for each share
      const analyticsPromises = shares?.map(async (share) => {
        // Get views for this share
        const { data: views, error: viewsError } = await supabase
          .from('store_item_views')
          .select('*')
          .eq('share_id', share.id);

        if (viewsError) throw viewsError;

        // Get reshares for this share
        const { data: reshares, error: resharesError } = await supabase
          .from('store_item_reshares')
          .select('*')
          .eq('original_share_id', share.id);

        if (resharesError) throw resharesError;

        // Calculate metrics
        const totalViews = views?.length || 0;
        const avgViewDuration = views?.length > 0 
          ? views.reduce((sum, view) => sum + (view.total_view_duration_seconds || 0), 0) / views.length
          : 0;
        const uniqueViewers = new Set(views?.map(v => v.viewer_telegram_id).filter(Boolean)).size;

        const analytics: ShareAnalytics = {
          shareId: share.id,
          diamondStockNumber: share.diamond_stock_number,
          shareUrl: share.share_url,
          createdAt: share.created_at,
          isActive: share.is_active,
          metrics: {
            totalShares: 1,
            totalViews,
            avgViewDuration,
            reshares: reshares?.length || 0,
            uniqueViewers
          },
          viewers: views?.map(view => ({
            viewerId: view.viewer_telegram_id || 0,
            viewDuration: view.total_view_duration_seconds || 0,
            deviceType: view.device_info?.deviceType || 'unknown',
            viewedAt: view.view_started_at,
            reshared: reshares?.some(r => r.reshared_by_telegram_id === view.viewer_telegram_id) || false
          })) || []
        };

        return analytics;
      }) || [];

      const analyticsResults = await Promise.all(analyticsPromises);
      setShareAnalytics(analyticsResults);
      
      return analyticsResults;
    } catch (error) {
      console.error('❌ Error fetching share analytics:', error);
      toast.error('Failed to fetch analytics');
      return [];
    }
  }, [user]);

  const trackShare = useCallback(async (shareId: string, action: string) => {
    try {
      console.log(`📊 Tracking share action: ${action} for share ${shareId}`);
      // Additional tracking logic can be added here
    } catch (error) {
      console.error('❌ Error tracking share action:', error);
    }
  }, []);

  const deactivateShare = useCallback(async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('store_item_shares')
        .update({ is_active: false })
        .eq('id', shareId)
        .eq('owner_telegram_id', user?.id);

      if (error) throw error;

      toast.success('✅ Share deactivated successfully');
      await getShareAnalytics(); // Refresh analytics
    } catch (error) {
      console.error('❌ Error deactivating share:', error);
      toast.error('Failed to deactivate share');
    }
  }, [user, getShareAnalytics]);

  return {
    createShare,
    trackView,
    endViewTracking,
    trackReshare,
    getShareAnalytics,
    deactivateShare,
    shareAnalytics,
    loading
  };
}

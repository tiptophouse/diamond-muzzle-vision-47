import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

export interface CampaignSegment {
  id: string;
  type: 'paid_no_stock' | 'tutorial_no_upload' | 'paid_has_stock' | 'has_stock_not_paying';
  priority: number;
  daysSinceLastSeen: number;
  currentCardIndex: number;
  totalCards: number;
}

export interface Campaign {
  segment: CampaignSegment;
  title: { he: string; en: string };
  description: { he: string; en: string };
  buttons: Array<{
    label: { he: string; en: string };
    action: string;
    variant?: 'default' | 'outline' | 'secondary';
  }>;
  icon?: string;
}

export function useCampaignEngine() {
  const { user } = useTelegramAuth();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissedCampaigns, setDismissedCampaigns] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    determineCampaign();
  }, [user?.id]);

  const determineCampaign = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Fetch user profile data
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id, payment_status, last_active')
        .eq('telegram_id', user.id)
        .single();

      if (!profile) {
        setLoading(false);
        return;
      }

      // Fetch tutorial completion status
      const { data: tutorialData } = await supabase
        .from('tutorial_analytics')
        .select('tutorial_completed_at')
        .eq('telegram_id', user.id)
        .single();

      // Fetch user inventory count using the profile UUID
      const { count: inventoryCount } = await supabase
        .from('diamonds')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id);

      // Determine segment
      const isPaying = profile?.payment_status === 'paid';
      const hasStock = (inventoryCount || 0) > 0;
      const inTutorial = !tutorialData?.tutorial_completed_at;

      let selectedCampaign: Campaign | null = null;

      // Priority 1: Paid but No Stock Uploaded
      if (isPaying && !hasStock) {
        selectedCampaign = getPaidNoStockCampaign();
      }
      // Priority 2: In Tutorial but Didn't Upload
      else if (inTutorial && !hasStock) {
        selectedCampaign = getTutorialNoUploadCampaign();
      }
      // Priority 3: Paid and Has Stock
      else if (isPaying && hasStock) {
        selectedCampaign = getPaidHasStockCampaign();
      }
      // Priority 4: Has Stock but Not Paying
      else if (hasStock && !isPaying) {
        selectedCampaign = getHasStockNotPayingCampaign();
      }

      // Check if campaign was dismissed
      if (selectedCampaign && dismissedCampaigns.has(selectedCampaign.segment.id)) {
        selectedCampaign = null;
      }

      setCampaign(selectedCampaign);
    } catch (error) {
      console.error('Error determining campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaidNoStockCampaign = (): Campaign => {
    return {
      segment: {
        id: 'paid_no_stock_1',
        type: 'paid_no_stock',
        priority: 1,
        daysSinceLastSeen: 0,
        currentCardIndex: 1,
        totalCards: 3
      },
      title: {
        he: '💎 הגיע הזמן להעלות מלאי!',
        en: '💎 Time to Upload Your Inventory!'
      },
      description: {
        he: 'המנוי שלך פעיל, אבל עדיין לא העלית יהלומים. העלה את המלאי הראשון שלך והתחל למכור!',
        en: 'Your subscription is active, but you haven\'t uploaded any diamonds yet. Upload your first inventory and start selling!'
      },
      buttons: [
        {
          label: {
            he: '💎 העלה מלאי ראשון',
            en: '💎 Upload Your First Inventory'
          },
          action: 'upload',
          variant: 'default'
        }
      ]
    };
  };

  const getTutorialNoUploadCampaign = (): Campaign => {
    return {
      segment: {
        id: 'tutorial_no_upload',
        type: 'tutorial_no_upload',
        priority: 2,
        daysSinceLastSeen: 0,
        currentCardIndex: 1,
        totalCards: 1
      },
      title: {
        he: '📘 המשך את ההדרכה',
        en: '📘 Continue Your Tutorial'
      },
      description: {
        he: 'נראה שהתחלת את ההדרכה אבל עוד לא העלית יהלומים. בוא נמשיך ביחד!',
        en: 'Looks like you started the tutorial but haven\'t uploaded any diamonds yet. Let\'s continue together!'
      },
      buttons: [
        {
          label: {
            he: '📘 המשך הדרכה',
            en: '📘 Continue Tutorial'
          },
          action: 'tutorial',
          variant: 'default'
        }
      ]
    };
  };

  const getPaidHasStockCampaign = (): Campaign => {
    return {
      segment: {
        id: 'paid_has_stock',
        type: 'paid_has_stock',
        priority: 3,
        daysSinceLastSeen: 0,
        currentCardIndex: 1,
        totalCards: 2
      },
      title: {
        he: '🔍 גלה התאמות חדשות',
        en: '🔍 Discover New Matches'
      },
      description: {
        he: 'המלאי שלך פעיל! בדוק התאמות חדשות ונתח את הביצועים שלך.',
        en: 'Your inventory is active! Check new matches and analyze your performance.'
      },
      buttons: [
        {
          label: {
            he: '🔍 צפה בהתאמות',
            en: '🔍 View Matches'
          },
          action: 'matches',
          variant: 'default'
        },
        {
          label: {
            he: '📊 בדוק נתונים',
            en: '📊 Check Analytics'
          },
          action: 'analytics',
          variant: 'outline'
        }
      ]
    };
  };

  const getHasStockNotPayingCampaign = (): Campaign => {
    return {
      segment: {
        id: 'has_stock_not_paying',
        type: 'has_stock_not_paying',
        priority: 4,
        daysSinceLastSeen: 0,
        currentCardIndex: 1,
        totalCards: 3
      },
      title: {
        he: '🔄 חדש את המנוי שלך',
        en: '🔄 Renew Your Subscription'
      },
      description: {
        he: 'המלאי שלך מוכן, אבל המנוי לא פעיל. חדש עכשיו וקבל גישה מלאה לכל התכונות!',
        en: 'Your inventory is ready, but your subscription isn\'t active. Renew now and get full access to all features!'
      },
      buttons: [
        {
          label: {
            he: '🔄 חידוש מנוי',
            en: '🔄 Renew Plan'
          },
          action: 'paywall',
          variant: 'default'
        }
      ]
    };
  };

  const dismissCampaign = (campaignId: string) => {
    setDismissedCampaigns(prev => new Set(prev).add(campaignId));
    setCampaign(null);
  };

  return {
    campaign,
    loading,
    dismissCampaign
  };
}

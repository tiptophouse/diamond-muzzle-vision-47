import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { api } from '@/lib/api';
import { supabase } from '@/integrations/supabase/client';

interface SearchResultNotification {
  id: string;
  user_id: number;
  search_query: string;
  result_type: string;
  diamonds_data?: any[];
  message_sent?: string;
  created_at: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  data?: any;
}

export function useFastApiNotifications() {
  const [notifications, setNotifications] = useState<SearchResultNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const { user } = useTelegramAuth();
  const PAGE_SIZE = 20;

  const saveNotificationsToDatabase = async (notifications: SearchResultNotification[]) => {
    try {
      console.log('💾 Saving notifications to database:', notifications.length);
      
      for (const notification of notifications) {
        // Check if notification already exists to avoid duplicates
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('telegram_id', user!.id)
          .contains('metadata', { fastapi_id: notification.id })
          .maybeSingle();

        if (!existing) {
          const { error } = await supabase
            .from('notifications')
            .insert({
              telegram_id: user!.id,
              message_type: notification.type,
              message_content: notification.message,
              status: 'delivered',
              metadata: {
                fastapi_id: notification.id,
                search_query: notification.search_query,
                result_type: notification.result_type,
                diamonds_data: notification.diamonds_data,
                title: notification.title,
                searcher_info: notification.data?.searcher_info,
                user_id: notification.user_id,
                matches: notification.data?.matches
              }
            });

          if (error) {
            console.error('💾 Failed to save notification:', error);
          } else {
            console.log('💾 Notification saved successfully:', notification.id);
          }
        } else {
          console.log('💾 Notification already exists:', notification.id);
        }
      }
    } catch (error) {
      console.error('💾 Error saving notifications to database:', error);
    }
  };

  const fetchNotifications = async (pageNum: number = 1, append: boolean = false) => {
    if (!user?.id) {
      console.log('🔔 No user ID available, skipping notification fetch');
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const offset = (pageNum - 1) * PAGE_SIZE;
      console.log('🔔 Fetching seller notifications from FastAPI for user:', user.id, 'page:', pageNum);
      
      // Try seller notifications endpoint first (preferred for seller-centric view)
      let response: any;
      let searchResults: any[];
      let isSchemaSeller = true;
      
      try {
        console.log('🔔 Trying seller notifications endpoint:', `/api/v1/seller/notifications?user_id=${user.id}&limit=${PAGE_SIZE}&offset=${offset}`);
        response = await api.get<any[]>(`/api/v1/seller/notifications?user_id=${user.id}&limit=${PAGE_SIZE}&offset=${offset}`);
        searchResults = response?.data || response;
        console.log('✅ Seller notifications endpoint success:', searchResults?.length, 'results');
      } catch (sellerError) {
        console.log('⚠️ Seller notifications endpoint failed, falling back to get_search_results:', sellerError);
        isSchemaSeller = false;
        
        // Fallback to get_search_results endpoint
        response = await api.get<any[]>(`/api/v1/get_search_results?user_id=${user.id}&limit=${PAGE_SIZE}&offset=${offset}`);
        searchResults = response?.data || response;
        console.log('✅ Fallback get_search_results success:', searchResults?.length, 'results');
      }
      
      console.log('🔔 Schema type:', isSchemaSeller ? 'SellerNotificationSchema' : 'SearchResultSchema');
      
      if (searchResults && Array.isArray(searchResults)) {
        console.log('🔔 Processing results:', searchResults.length, 'items');
        
        // Transform results into notification format with proper buyer ID extraction
        const transformedNotifications = searchResults
          .filter((result: any) => {
            // Extract buyer/searcher ID based on schema type
            const buyerTelegramId = isSchemaSeller 
              ? result.searcher_user_id  // SellerNotificationSchema
              : result.buyer_id;          // SearchResultSchema
            
            console.log('🔍 Result:', result.id, 'Buyer ID:', buyerTelegramId, 'Current user:', user.id);
            
            // Filter out self-notifications (where buyer is current user)
            if (buyerTelegramId && buyerTelegramId === user.id) {
              console.log(`🚫 FILTERED: Self-notification (buyer ${buyerTelegramId} = current user ${user.id})`);
              return false;
            }
            
            console.log(`✅ KEEPING notification ${result.id}`);
            return true;
          })
          .map((result: any) => {
            // Extract buyer/searcher information based on schema
            const buyerTelegramId = isSchemaSeller 
              ? result.searcher_user_id 
              : result.buyer_id;
            
            const sellerId = isSchemaSeller
              ? result.user_id
              : result.seller_id;
            
            // Map diamond data with proper field normalization
            const mappedDiamonds = (result.diamonds_data || []).map((d: any) => ({
              stock_number: d.stock || d.stock_number,
              shape: d.shape,
              weight: d.weight ?? d.carat,
              color: d.color,
              clarity: d.clarity,
              cut: d.cut,
              polish: d.polish,
              symmetry: d.symmetry,
              fluorescence: d.fluorescence,
              lab: d.lab,
              certificate_number: d.certificate_number,
              price_per_carat: d.price_per_carat ?? d.price,
              status: d.status || 'Available',
              confidence: d.confidence || 0.9,
              total_price: (d.price_per_carat ?? d.price) * (d.weight ?? d.carat)
            }));
            
            return {
              id: result.id.toString(),
              user_id: sellerId,
              search_query: result.search_query,
              result_type: result.result_type,
              diamonds_data: result.diamonds_data,
              message_sent: result.message_sent,
              created_at: result.created_at,
              title: getNotificationTitle(result.result_type, result),
              message: getNotificationMessage(result),
              type: result.result_type === 'match' ? 'diamond_match' : 'search_result',
              read: false,
              data: {
                search_query: result.search_query,
                diamonds_count: mappedDiamonds.length,
                diamonds_data: result.diamonds_data,
                searcher_info: {
                  telegram_id: buyerTelegramId,
                  name: result.searcher_name || 'Buyer',
                  first_name: result.searcher_first_name,
                  telegram_username: result.searcher_username
                },
                customer_info: {
                  telegram_id: buyerTelegramId,
                  name: result.searcher_name || 'Buyer'
                },
                user_id: sellerId,
                matches: mappedDiamonds
              }
            };
          });

        // Save notifications to database
        await saveNotificationsToDatabase(transformedNotifications);
        
        // Update state - append or replace based on pagination
        if (append) {
          setNotifications(prev => [...prev, ...transformedNotifications]);
        } else {
          setNotifications(transformedNotifications);
        }
        
        // Update pagination state
        setHasMore(transformedNotifications.length === PAGE_SIZE);
        setPage(pageNum);
        
        console.log('🔔 Notifications set:', transformedNotifications.length, 'notifications (after filtering own searches)');

        // Show toast for new notifications only on initial load
        if (transformedNotifications.length > 0 && pageNum === 1 && !append) {
          toast({
            title: "🔔 התראות התאמה!",
            description: `נמצאו ${transformedNotifications.length} התאמות חיפוש עבור היהלומים שלך`,
          });
        }
      } else {
        console.log('🔔 No search results or invalid format received');
        setNotifications([]);
      }

    } catch (error) {
      console.error('🔔 Failed to fetch notifications from FastAPI:', error);
      
      // Check if it's a network error
      if (error instanceof Error && error.message.includes('not reachable')) {
        console.log('🔔 FastAPI backend not reachable - this is expected in some environments');
        toast({
          title: "שגיאת חיבור",
          description: "לא ניתן להתחבר לשרת הזמן-אמת. התראות לא זמינות כרגע.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "שגיאה בטעינת התראות",
          description: "לא ניתן לטעון את ההתראות כרגע. נסה שוב מאוחר יותר.",
          variant: "destructive"
        });
      }
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationTitle = (resultType: string, result: any): string => {
    if (resultType === 'match') {
      const matchCount = result.diamonds_data?.length || 1;
      return `💎 נמצאו ${matchCount} יהלומים תואמים`;
    } else {
      return '🔍 חיפוש חדש במערכת';
    }
  };

  const getNotificationMessage = (result: any): string => {
    if (result.result_type === 'match') {
      const searchCriteria = parseSearchQuery(result.search_query);
      const matchCount = result.diamonds_data?.length || 0;
      
      return `לקוח חיפש יהלומים עם הקריטריונים: ${searchCriteria} ונמצאו ${matchCount} התאמות מהמלאי שלך.`;
    } else {
      return `חיפוש חדש במערכת: ${result.search_query}`;
    }
  };

  const parseSearchQuery = (query: string): string => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(query);
      const criteria = [];
      
      if (parsed.shape) criteria.push(`צורה: ${parsed.shape}`);
      if (parsed.color) criteria.push(`צבע: ${parsed.color}`);
      if (parsed.clarity) criteria.push(`זכות: ${parsed.clarity}`);
      if (parsed.weight_min || parsed.weight_max) {
        criteria.push(`משקל: ${parsed.weight_min || 0}-${parsed.weight_max || '∞'} קראט`);
      }
      if (parsed.price_min || parsed.price_max) {
        criteria.push(`מחיר: $${parsed.price_min || 0}-${parsed.price_max || '∞'}`);
      }
      
      return criteria.join(', ') || query;
    } catch {
      // If not JSON, return as is
      return query;
    }
  };

  const extractSearcherInfo = (query: string) => {
    // Try to extract searcher information from the query
    // This is a placeholder - in real implementation, you'd get this from the API
    return {
      telegram_id: null,
      telegram_username: null,
      name: "לקוח מעוניין",
      phone: null
    };
  };

  const markAsRead = async (notificationId: string) => {
    // Update local state immediately for better UX
    setNotifications(prev => 
      prev.map(notification => 
        notification.id.toString() === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );

    toast({
      title: "הודעה נקראה",
      description: "ההתראה סומנה כנקראה",
    });
  };

  const contactCustomer = async (customerInfo: any) => {
    const telegramId = customerInfo?.user_id || customerInfo?.telegram_id;
    
    console.log('📱 Attempting to contact customer:', { customerInfo, telegramId });
    
    if (!telegramId) {
      toast({
        title: "אין פרטי קשר",
        description: "לא נמצא מזהה טלגרם עבור לקוח זה",
        variant: "destructive"
      });
      return;
    }

    // Try to send a direct message using Supabase function
    try {
      const defaultMessage = `שלום ${customerInfo?.customerName || 'לקוח יקר'},

ראיתי שחיפשת יהלומים ונמצאו התאמות במלאי שלי! 💎

${customerInfo?.search_query ? `החיפוש שלך: ${customerInfo.search_query}` : ''}
${customerInfo?.diamonds_count ? `נמצאו ${customerInfo.diamonds_count} יהלומים מתאימים` : ''}

אשמח לעזור לך למצוא את היהלום המושלם ולתת לך מחירים מיוחדים.

בואו נדבר! 😊`;

      const { data, error } = await supabase.functions.invoke('send-individual-message', {
        body: {
          telegramId: telegramId,
          message: defaultMessage,
          buttons: [
            {
              text: '💎 צפה במלאי היהלומים',
              url: 'https://t.me/diamondmazalbot?startapp=store'
            },
            {
              text: '📱 התחל שיחה',
              url: `tg://user?id=${telegramId}`
            }
          ]
        }
      });

      if (error) {
        console.error('❌ Error sending message to customer:', error);
        
        // Fallback to opening Telegram chat
        if (window.Telegram?.WebApp) {
          window.open(`tg://user?id=${telegramId}`, '_blank');
        } else {
          window.open(`https://t.me/user?id=${telegramId}`, '_blank');
        }
        
        toast({
          title: "נפתח צ'אט ישיר",
          description: `פתחתי שיחה ישירה עם הלקוח. שלח הודעה אישית!`,
        });
      } else {
        console.log('✅ Message sent successfully to customer:', data);
        toast({
          title: "הודעה נשלחה בהצלחה! ✅",
          description: `ההודעה נשלחה ללקוח. הוא יוכל לראות את המלאי שלך ולהתחיל שיחה`,
        });
      }
    } catch (error) {
      console.error('❌ Failed to contact customer:', error);
      
      // Fallback to opening Telegram chat
      if (customerInfo?.telegram_username) {
        window.open(`https://t.me/${customerInfo.telegram_username}`, '_blank');
        toast({
          title: "פותח צ'אט",
          description: `פותח שיחה עם @${customerInfo.telegram_username}`,
        });
      } else if (customerInfo?.phone) {
        window.open(`tel:${customerInfo.phone}`, '_blank');
        toast({
          title: "מתקשר",
          description: `מתקשר ל-${customerInfo.phone}`,
        });
      } else {
        toast({
          title: "שגיאה ביצירת קשר",
          description: "נכשל ביצירת קשר עם הלקוח. נסה שוב מאוחר יותר.",
          variant: "destructive"
        });
      }
    }
  };

  // Fetch notifications on component mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchNotifications(page + 1, true);
    }
  };

  return {
    notifications,
    isLoading,
    hasMore,
    page,
    markAsRead,
    contactCustomer,
    refetch: () => fetchNotifications(1, false),
    loadMore,
  };
}
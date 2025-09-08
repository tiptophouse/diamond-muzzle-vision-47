import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { api } from '@/lib/api';

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
  const { toast } = useToast();
  const { user } = useTelegramAuth();

  const fetchNotifications = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('🔔 Fetching notifications from FastAPI for user:', user.id);
      
      // Fetch search results from FastAPI
      const response = await api.get<any[]>(`/api/v1/get_search_results?user_id=${user.id}&limit=50&offset=0`);
      
      if (response && Array.isArray(response)) {
        console.log('🔔 FastAPI search results:', response);
        
        // Transform search results into notification format
        const transformedNotifications = response.map((result: any) => ({
          id: result.id.toString(),
          user_id: result.user_id,
          search_query: result.search_query,
          result_type: result.result_type,
          diamonds_data: result.diamonds_data,
          message_sent: result.message_sent,
          created_at: result.created_at,
          title: getNotificationTitle(result.result_type, result),
          message: getNotificationMessage(result),
          type: result.result_type === 'match' ? 'diamond_match' : 'search_result',
          read: false, // FastAPI doesn't track read status yet
          data: {
            search_query: result.search_query,
            diamonds_count: result.diamonds_data?.length || 0,
            diamonds_data: result.diamonds_data,
            searcher_info: extractSearcherInfo(result.search_query)
          }
        }));

        setNotifications(transformedNotifications);

        // Show toast for new notifications if this is not the initial load
        if (transformedNotifications.length > 0) {
          toast({
            title: "🔔 התראות התאמה!",
            description: `נמצאו ${transformedNotifications.length} התאמות חיפוש עבור היהלומים שלך`,
          });
        }
      }

    } catch (error) {
      console.error('Failed to fetch notifications from FastAPI:', error);
      toast({
        title: "שגיאה בטעינת התראות",
        description: "לא ניתן לטעון את ההתראות כרגע. נסה שוב מאוחר יותר.",
        variant: "destructive"
      });
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

  const contactCustomer = (customerInfo: any) => {
    if (customerInfo.telegram_username) {
      window.open(`https://t.me/${customerInfo.telegram_username}`, '_blank');
    } else if (customerInfo.telegram_id) {
      window.open(`tg://user?id=${customerInfo.telegram_id}`, '_blank');
    } else if (customerInfo.phone) {
      window.open(`tel:${customerInfo.phone}`, '_blank');
    } else {
      toast({
        title: "אין פרטי קשר",
        description: "לא נמצאו פרטי קשר עבור לקוח זה",
        variant: "destructive"
      });
    }
  };

  // Fetch notifications on component mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  return {
    notifications,
    isLoading,
    markAsRead,
    contactCustomer,
    refetch: fetchNotifications,
  };
}
import { useState, useEffect, useCallback } from 'react';
import { useFastApiNotifications } from './useFastApiNotifications';
import { useInventoryData } from './useInventoryData';

interface DiamondHeatData {
  id: string;
  shape: string;
  carat: number;
  price: number;
  notificationCount: number;
  lastInteraction: Date;
  interestLevel: 'low' | 'medium' | 'high';
}

export function useNotificationHeatMap() {
  const [heatMapData, setHeatMapData] = useState<DiamondHeatData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { notifications } = useFastApiNotifications();
  const { diamonds } = useInventoryData();

  const calculateInterestLevel = useCallback((notificationCount: number): 'low' | 'medium' | 'high' => {
    if (notificationCount >= 5) return 'high';
    if (notificationCount >= 2) return 'medium';
    return 'low';
  }, []);

  const processHeatMapData = useCallback(() => {
    if (!diamonds || !notifications) return;

    setIsLoading(true);

    try {
      // Group notifications by diamond
      const notificationCounts = new Map<string, { count: number; lastInteraction: Date }>();
      
      notifications.forEach(notification => {
        if (notification.diamonds_data && Array.isArray(notification.diamonds_data)) {
          notification.diamonds_data.forEach((diamond: any) => {
            const diamondId = diamond.id?.toString();
            if (diamondId) {
              const existing = notificationCounts.get(diamondId) || { count: 0, lastInteraction: new Date(0) };
              const interactionDate = new Date(notification.created_at || Date.now());
              
              notificationCounts.set(diamondId, {
                count: existing.count + 1,
                lastInteraction: interactionDate > existing.lastInteraction ? interactionDate : existing.lastInteraction
              });
            }
          });
        }
      });

      // Create heat map data
      const heatData: DiamondHeatData[] = diamonds.map(diamond => {
        const notificationData = notificationCounts.get(diamond.id) || { count: 0, lastInteraction: new Date() };
        
        return {
          id: diamond.id.toString(),
          shape: diamond.shape || 'Round',
          carat: parseFloat(diamond.carat?.toString() || '0') || 0,
          price: parseFloat(diamond.price?.toString() || '0') || 0,
          notificationCount: notificationData.count,
          lastInteraction: notificationData.lastInteraction,
          interestLevel: calculateInterestLevel(notificationData.count)
        };
      });

      // Sort by interest level and notification count
      heatData.sort((a, b) => {
        const levelPriority = { high: 3, medium: 2, low: 1 };
        if (levelPriority[a.interestLevel] !== levelPriority[b.interestLevel]) {
          return levelPriority[b.interestLevel] - levelPriority[a.interestLevel];
        }
        return b.notificationCount - a.notificationCount;
      });

      setHeatMapData(heatData);
    } catch (error) {
      console.error('Error processing heat map data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [diamonds, notifications, calculateInterestLevel]);

  useEffect(() => {
    processHeatMapData();
  }, [processHeatMapData]);

  const getHotDiamonds = useCallback(() => {
    return heatMapData.filter(diamond => diamond.interestLevel === 'high');
  }, [heatMapData]);

  const getTrendingDiamonds = useCallback((limit: number = 5) => {
    return heatMapData
      .filter(diamond => diamond.notificationCount > 0)
      .slice(0, limit);
  }, [heatMapData]);

  const getHeatMapStats = useCallback(() => {
    const total = heatMapData.length;
    const hot = heatMapData.filter(d => d.interestLevel === 'high').length;
    const medium = heatMapData.filter(d => d.interestLevel === 'medium').length;
    const totalNotifications = heatMapData.reduce((sum, d) => sum + d.notificationCount, 0);

    return {
      totalDiamonds: total,
      hotDiamonds: hot,
      mediumInterest: medium,
      totalNotifications,
      averageNotificationsPerDiamond: total > 0 ? (totalNotifications / total).toFixed(1) : '0'
    };
  }, [heatMapData]);

  return {
    heatMapData,
    isLoading,
    getHotDiamonds,
    getTrendingDiamonds,
    getHeatMapStats,
    refreshData: processHeatMapData
  };
}
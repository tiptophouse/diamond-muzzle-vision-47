import { useCallback } from 'react';
import { useTelegramHapticFeedback } from './useTelegramHapticFeedback';
import { useTelegramMainButton } from './useTelegramMainButton';
import { useTelegramSendData } from './useTelegramSendData';

interface HeatMapData {
  id: string;
  interestLevel: 'low' | 'medium' | 'high';
  notificationCount: number;
  lastInteraction: Date;
}

export function useTelegramHeatMapIntegration() {
  const { impactOccurred, notificationOccurred, selectionChanged } = useTelegramHapticFeedback();
  const { sendData, reportDiamondInteraction } = useTelegramSendData();

  // Haptic feedback for heat map interactions (following SDK best practices)
  const onHeatMapCellTap = useCallback((diamond: HeatMapData) => {
    // Light feedback for low interest, medium for medium, heavy for high
    const feedbackIntensity = diamond.interestLevel === 'high' ? 'heavy' : 
                              diamond.interestLevel === 'medium' ? 'medium' : 'light';
    impactOccurred(feedbackIntensity);
    
    // Report interaction via sendData (following SDK patterns)
    reportDiamondInteraction('view', {
      diamondId: diamond.id,
      interestLevel: diamond.interestLevel,
      source: 'heat_map'
    });
  }, [impactOccurred, reportDiamondInteraction]);

  const onHeatMapCellHover = useCallback(() => {
    // Selection feedback for hover (as per SDK docs)
    selectionChanged();
  }, [selectionChanged]);

  const onHotDiamondFound = useCallback((diamond: HeatMapData) => {
    // Success notification for discovering hot diamonds
    notificationOccurred('success');
  }, [notificationOccurred]);

  // Main button integration for heat map actions  
  const configureHeatMapNavigation = useCallback((selectedDiamond?: HeatMapData) => {
    // This would be implemented with useTelegramMainButton when needed
    console.log('Heat map navigation configured for:', selectedDiamond?.id);
  }, []);

  // Send heat map insights to bot (using web_app_data_send method)
  const sendHeatMapReport = useCallback((heatMapData: HeatMapData[]) => {
    const hotDiamonds = heatMapData.filter(d => d.interestLevel === 'high');
    const reportData = {
      total_diamonds: heatMapData.length,
      hot_diamonds: hotDiamonds.length,
      top_diamond: hotDiamonds[0] || null,
      timestamp: new Date().toISOString()
    };

    return sendData({
      action: 'heat_map_report',
      data: reportData,
      timestamp: Date.now()
    });
  }, [sendData]);

  return {
    onHeatMapCellTap,
    onHeatMapCellHover,
    onHotDiamondFound,
    configureHeatMapNavigation,
    sendHeatMapReport
  };
}
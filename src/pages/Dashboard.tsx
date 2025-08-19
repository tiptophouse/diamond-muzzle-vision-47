
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';
import { DataDrivenDashboard } from '@/components/dashboard/DataDrivenDashboard';

export default function Dashboard() {
  const navigate = useNavigate();
  const { navigation, haptics, isInitialized } = useEnhancedTelegramWebApp();

  useEffect(() => {
    if (!isInitialized) return;

    // Configure navigation for dashboard - no back button, show main action
    navigation.hideBackButton();
    navigation.showMainButton('Add Diamond', () => {
      haptics.medium();
      navigate('/upload-single-stone');
    }, '#059669');

    return () => {
      navigation.hideMainButton();
    };
  }, [isInitialized, navigation, haptics, navigate]);

  return <DataDrivenDashboard />;
}

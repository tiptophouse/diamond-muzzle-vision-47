
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';
import { CSVStandardizer } from '@/components/inventory/CSVStandardizer';

export default function StandardizeCSV() {
  const navigate = useNavigate();
  const { navigation, haptics, isInitialized } = useEnhancedTelegramWebApp();

  useEffect(() => {
    if (!isInitialized) return;

    // Configure navigation for CSV standardization
    navigation.showBackButton(() => {
      haptics.light();
      navigate(-1);
    });
    navigation.hideMainButton(); // Component will handle actions

    return () => {
      navigation.hideBackButton();
    };
  }, [isInitialized, navigation, haptics, navigate]);

  return (
    <div className="container mx-auto px-4 py-6">
      <CSVStandardizer />
    </div>
  );
}

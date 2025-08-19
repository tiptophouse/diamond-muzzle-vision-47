
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';
import { CSVUpload } from '@/components/inventory/CSVUpload';

export default function Upload() {
  const navigate = useNavigate();
  const { navigation, haptics, isInitialized } = useEnhancedTelegramWebApp();

  useEffect(() => {
    if (!isInitialized) return;

    // Configure navigation for CSV upload
    navigation.showBackButton(() => {
      haptics.light();
      navigate(-1);
    });
    navigation.hideMainButton(); // Upload component will handle actions

    return () => {
      navigation.hideBackButton();
    };
  }, [isInitialized, navigation, haptics, navigate]);

  return (
    <div className="container mx-auto px-4 py-6">
      <CSVUpload />
    </div>
  );
}

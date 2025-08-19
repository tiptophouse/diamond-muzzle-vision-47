
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';
import { SettingsForm } from '@/components/settings/SettingsForm';

export default function Settings() {
  const navigate = useNavigate();
  const { navigation, haptics, isInitialized } = useEnhancedTelegramWebApp();

  useEffect(() => {
    if (!isInitialized) return;

    // Configure navigation for settings
    navigation.showBackButton(() => {
      haptics.light();
      navigate(-1);
    });
    navigation.hideMainButton();

    return () => {
      navigation.hideBackButton();
    };
  }, [isInitialized, navigation, haptics, navigate]);

  return (
    <div className="container mx-auto px-4 py-6">
      <SettingsForm />
    </div>
  );
}

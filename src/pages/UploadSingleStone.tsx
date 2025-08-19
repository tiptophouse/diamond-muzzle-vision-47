
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';
import { DiamondForm } from '@/components/inventory/DiamondForm';

export default function UploadSingleStone() {
  const navigate = useNavigate();
  const { navigation, haptics, isInitialized } = useEnhancedTelegramWebApp();

  useEffect(() => {
    if (!isInitialized) return;

    // Configure navigation for upload
    navigation.showBackButton(() => {
      haptics.light();
      navigate(-1);
    });
    navigation.hideMainButton(); // Form will handle save action internally

    return () => {
      navigation.hideBackButton();
    };
  }, [isInitialized, navigation, haptics, navigate]);

  return (
    <div className="container mx-auto px-4 py-6">
      <DiamondForm />
    </div>
  );
}

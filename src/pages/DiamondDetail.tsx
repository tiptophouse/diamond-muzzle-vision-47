
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';
import { useDiamond } from '@/hooks/useDiamond';
import { DiamondDetailView } from '@/components/store/DiamondDetailView';
import { DiamondDetailLoading } from '@/components/store/DiamondDetailLoading';

export default function DiamondDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { navigation, haptics, isInitialized } = useEnhancedTelegramWebApp();
  const { data: diamond, isLoading } = useDiamond(id);

  useEffect(() => {
    if (!isInitialized) return;

    // Configure navigation for diamond detail
    navigation.showBackButton(() => {
      haptics.light();
      navigate(-1);
    });
    navigation.hideMainButton();

    return () => {
      navigation.hideBackButton();
    };
  }, [isInitialized, navigation, haptics, navigate]);

  if (isLoading) {
    return <DiamondDetailLoading />;
  }

  if (!diamond) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">
        <h1 className="text-2xl font-bold text-muted-foreground">Diamond not found</h1>
      </div>
    );
  }

  return <DiamondDetailView diamond={diamond} />;
}

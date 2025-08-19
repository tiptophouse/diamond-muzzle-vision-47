
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnhancedTelegramWebApp } from '@/hooks/useEnhancedTelegramWebApp';
import { DiamondForm } from '@/components/inventory/DiamondForm';
import { Diamond } from '@/components/inventory/InventoryTable';
import { toast } from 'sonner';

export default function UploadSingleStone() {
  const navigate = useNavigate();
  const { navigation, haptics, isInitialized } = useEnhancedTelegramWebApp();

  useEffect(() => {
    if (!isInitialized) return;

    // Configure navigation for single stone upload
    navigation.showBackButton(() => {
      haptics.light();
      navigate(-1);
    });
    navigation.hideMainButton();

    return () => {
      navigation.hideBackButton();
    };
  }, [isInitialized, navigation, haptics, navigate]);

  const handleSubmit = async (diamondData: Partial<Diamond>) => {
    try {
      // Add diamond logic here
      console.log('Adding diamond:', diamondData);
      
      // Dispatch success event for notifications
      window.dispatchEvent(new CustomEvent('diamondAdded', {
        detail: { success: true, message: 'Diamond added successfully!' }
      }));
      
      toast.success('Diamond added successfully!');
      navigate('/inventory');
    } catch (error) {
      console.error('Failed to add diamond:', error);
      
      // Dispatch failure event for notifications
      window.dispatchEvent(new CustomEvent('diamondAdded', {
        detail: { success: false, message: 'Failed to add diamond' }
      }));
      
      toast.error('Failed to add diamond');
    }
  };

  const handleCancel = () => {
    navigate('/inventory');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Add New Diamond</h1>
      <DiamondForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}

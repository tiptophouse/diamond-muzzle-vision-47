
import { Layout } from '@/components/layout/Layout';
import { WelcomeBanner } from '@/components/tutorial/WelcomeBanner';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { TutorialTrigger } from '@/components/tutorial/TutorialTrigger';
import { getVerificationResult } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useInventoryData } from '@/hooks/useInventoryData';
import { DataDrivenDashboard } from '@/components/dashboard/DataDrivenDashboard';

export default function Dashboard() {
  const { user, isAuthenticated } = useTelegramAuth();
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Get inventory data for the dashboard
  const { 
    diamonds, 
    loading: inventoryLoading, 
    error, 
    handleRefresh 
  } = useInventoryData();

  useEffect(() => {
    const checkVerification = async () => {
      if (user?.id) {
        try {
          const result = await getVerificationResult(user.id);
          setVerificationStatus(result.data);
        } catch (error) {
          console.error('Failed to get verification result:', error);
        }
      }
      setLoading(false);
    };

    checkVerification();
  }, [user?.id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold mb-4">Please log in to access your dashboard</h2>
        </div>
      </Layout>
    );
  }

  // Convert diamonds to the format expected by DataDrivenDashboard
  const allDiamonds = diamonds.map(diamond => ({
    id: diamond.id,
    stockNumber: diamond.stockNumber,
    shape: diamond.shape,
    carat: diamond.carat,
    color: diamond.color,
    clarity: diamond.clarity,
    cut: diamond.cut,
    price: diamond.price,
    status: diamond.status || 'Available',
    store_visible: diamond.store_visible || false
  }));

  return (
    <Layout>
      <div className="space-y-6">
        <WelcomeBanner />
        <DataDrivenDashboard 
          allDiamonds={allDiamonds}
          loading={inventoryLoading}
          fetchData={handleRefresh}
        />
        <TutorialTrigger />
      </div>
    </Layout>
  );
}

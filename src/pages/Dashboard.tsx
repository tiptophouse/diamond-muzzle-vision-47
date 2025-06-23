
import { DataDrivenDashboard } from '@/components/dashboard/DataDrivenDashboard';
import { Layout } from '@/components/layout/Layout';
import { WelcomeBanner } from '@/components/tutorial/WelcomeBanner';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { TutorialTrigger } from '@/components/tutorial/TutorialTrigger';
import { getVerificationResult } from '@/lib/api';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { user, isAuthenticated } = useTelegramAuth();
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <Layout>
      <div className="space-y-6">
        <WelcomeBanner />
        <DataDrivenDashboard />
        <TutorialTrigger />
      </div>
    </Layout>
  );
}

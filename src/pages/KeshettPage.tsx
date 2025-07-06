import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { KeshettAgreementCard } from '@/components/keshett/KeshettAgreementCard';
import { useKeshettManagement, KeshettAgreement } from '@/hooks/useKeshettManagement';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Handshake, RefreshCw, Users, UserCheck } from 'lucide-react';

export default function KeshettPage() {
  const { user } = useTelegramAuth();
  const { getKeshettAgreements, isLoading } = useKeshettManagement();
  const [agreements, setAgreements] = useState<KeshettAgreement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAgreements = async () => {
    setLoading(true);
    const data = await getKeshettAgreements();
    setAgreements(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) {
      loadAgreements();
    }
  }, [user?.id]);

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Please log in to view Keshett agreements.</p>
        </div>
      </Layout>
    );
  }

  const sellerAgreements = agreements.filter(a => a.seller_telegram_id === user.id);
  const buyerAgreements = agreements.filter(a => a.buyer_telegram_id === user.id);

  const activeCount = agreements.filter(a => a.status === 'active').length;
  const pendingCount = agreements.filter(a => a.status === 'pending').length;
  const completedCount = agreements.filter(a => a.status === 'completed').length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Handshake className="h-8 w-8 text-primary" />
              Keshett Agreements
            </h1>
            <p className="text-muted-foreground">
              Manage your diamond trading agreements
            </p>
          </div>
          
          <Button
            onClick={loadAgreements}
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{activeCount}</div>
            <div className="text-sm text-blue-600 dark:text-blue-400">Active</div>
          </div>
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{pendingCount}</div>
            <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending</div>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{completedCount}</div>
            <div className="text-sm text-green-600 dark:text-green-400">Completed</div>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">{agreements.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
        </div>

        {/* Agreements Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Handshake className="h-4 w-4" />
              All ({agreements.length})
            </TabsTrigger>
            <TabsTrigger value="selling" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Selling ({sellerAgreements.length})
            </TabsTrigger>
            <TabsTrigger value="buying" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Buying ({buyerAgreements.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading agreements...</p>
              </div>
            ) : agreements.length === 0 ? (
              <div className="text-center py-8">
                <Handshake className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No Keshett agreements found.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Create a Keshett agreement from your inventory to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {agreements.map((agreement) => (
                  <KeshettAgreementCard
                    key={agreement.id}
                    agreement={agreement}
                    onUpdate={loadAgreements}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="selling" className="space-y-4 mt-6">
            {sellerAgreements.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No selling agreements found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sellerAgreements.map((agreement) => (
                  <KeshettAgreementCard
                    key={agreement.id}
                    agreement={agreement}
                    onUpdate={loadAgreements}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="buying" className="space-y-4 mt-6">
            {buyerAgreements.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No buying agreements found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {buyerAgreements.map((agreement) => (
                  <KeshettAgreementCard
                    key={agreement.id}
                    agreement={agreement}
                    onUpdate={loadAgreements}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
import { useState } from 'react';
import { KeshettAgreement } from '@/hooks/useKeshettManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useKeshettManagement } from '@/hooks/useKeshettManagement';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { Handshake, Clock, DollarSign, User, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface KeshettAgreementCardProps {
  agreement: KeshettAgreement;
  onUpdate?: () => void;
}

export function KeshettAgreementCard({ agreement, onUpdate }: KeshettAgreementCardProps) {
  const { user } = useTelegramAuth();
  const { acceptKeshett, completeMazal, cancelKeshett, isLoading } = useKeshettManagement();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isSellerView = user?.id === agreement.seller_telegram_id;
  const isBuyerView = user?.id === agreement.buyer_telegram_id;
  const isExpired = new Date(agreement.expiry_at) < new Date();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'expired': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleAccept = async () => {
    setActionLoading('accept');
    const success = await acceptKeshett(agreement.id);
    if (success) onUpdate?.();
    setActionLoading(null);
  };

  const handleMazal = async () => {
    setActionLoading('mazal');
    const success = await completeMazal(agreement.id);
    if (success) onUpdate?.();
    setActionLoading(null);
  };

  const handleCancel = async () => {
    setActionLoading('cancel');
    const success = await cancelKeshett(agreement.id);
    if (success) onUpdate?.();
    setActionLoading(null);
  };

  const diamond = agreement.diamond_data;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Handshake className="h-5 w-5 text-primary" />
            Keshett Agreement
          </CardTitle>
          <Badge className={getStatusColor(agreement.status)}>
            {agreement.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Diamond Info */}
        <div className="p-3 bg-muted rounded-lg">
          <p className="font-medium">#{diamond.stockNumber}</p>
          <p className="text-sm text-muted-foreground">
            {diamond.carat}ct {diamond.color} {diamond.clarity} {diamond.shape}
          </p>
        </div>

        {/* Agreement Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>${agreement.agreed_price.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{isSellerView ? 'You → Buyer' : 'Seller → You'}</span>
          </div>
        </div>

        {/* Timing Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Created: {formatDistanceToNow(new Date(agreement.created_at))} ago</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className={isExpired ? 'text-red-600' : 'text-muted-foreground'}>
              {isExpired ? 'Expired' : `Expires in ${formatDistanceToNow(new Date(agreement.expiry_at))}`}
            </span>
          </div>
        </div>

        {/* Notes */}
        {agreement.notes && (
          <div className="p-2 bg-muted/50 rounded text-sm">
            <strong>Notes:</strong> {agreement.notes}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {/* Buyer Actions */}
          {isBuyerView && agreement.status === 'pending' && !isExpired && (
            <Button
              onClick={handleAccept}
              disabled={isLoading || actionLoading === 'accept'}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {actionLoading === 'accept' ? 'Accepting...' : 'Accept Keshett'}
            </Button>
          )}

          {/* Mazal Button (both parties when active) */}
          {agreement.status === 'active' && !isExpired && (
            <Button
              onClick={handleMazal}
              disabled={isLoading || actionLoading === 'mazal'}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Handshake className="h-4 w-4 mr-2" />
              {actionLoading === 'mazal' ? 'Completing...' : 'Mazal!'}
            </Button>
          )}

          {/* Seller Cancel Action */}
          {isSellerView && agreement.status === 'pending' && (
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading || actionLoading === 'cancel'}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              {actionLoading === 'cancel' ? 'Cancelling...' : 'Cancel'}
            </Button>
          )}
        </div>

        {/* Status Messages */}
        {agreement.status === 'completed' && (
          <div className="text-center text-green-600 font-medium">
            🎉 Mazal! Agreement completed successfully
          </div>
        )}
        
        {isExpired && agreement.status === 'pending' && (
          <div className="text-center text-red-600 font-medium">
            ⏰ Agreement has expired
          </div>
        )}
      </CardContent>
    </Card>
  );
}
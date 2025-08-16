
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  Server,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SFTPStatusIndicatorProps {
  account: {
    id: string;
    status: string;
    created_at: string;
    expires_at?: string;
    last_used_at?: string;
  };
}

export function SFTPStatusIndicator({ account }: SFTPStatusIndicatorProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'suspended':
        return <AlertTriangle className="h-4 w-4" />;
      case 'revoked':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default' as const;
      case 'suspended':
        return 'secondary' as const;
      case 'revoked':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  const isExpiringSoon = account.expires_at && 
    new Date(account.expires_at).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000; // 7 days

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">SFTP Account</span>
            </div>
            
            <Badge variant={getStatusVariant(account.status)}>
              {getStatusIcon(account.status)}
              <span className="ml-1 capitalize">{account.status}</span>
            </Badge>
          </div>

          <div className="text-sm text-muted-foreground text-right">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Created {formatDistanceToNow(new Date(account.created_at), { addSuffix: true })}
            </div>
            
            {account.last_used_at && (
              <div className="mt-1">
                Last used {formatDistanceToNow(new Date(account.last_used_at), { addSuffix: true })}
              </div>
            )}
            
            {account.expires_at && (
              <div className={`mt-1 ${isExpiringSoon ? 'text-destructive font-medium' : ''}`}>
                {isExpiringSoon && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                Expires {formatDistanceToNow(new Date(account.expires_at), { addSuffix: true })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

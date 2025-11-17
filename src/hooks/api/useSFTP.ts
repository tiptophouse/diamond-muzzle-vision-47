/**
 * React Query hooks for SFTP provisioning
 */

import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { SFTPResponseScheme } from '@/types/backend-api';
import * as sftpApi from '@/lib/api/sftp';

/**
 * Provision SFTP access mutation
 */
export function useProvisionSFTP() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: sftpApi.provisionSFTP,
    onSuccess: (data: SFTPResponseScheme) => {
      if (data.test_result) {
        toast({
          title: 'הגישה ל-SFTP הוקמה בהצלחה',
          description: `שם משתמש: ${data.username}`,
        });
      } else {
        toast({
          title: 'בעיה בהקמת גישת SFTP',
          description: 'הפרטים נוצרו אך בדיקת החיבור נכשלה',
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'שגיאה בהקמת גישת SFTP',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

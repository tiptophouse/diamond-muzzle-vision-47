
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { SFTPUploadJob, SFTPUploadJobResponse } from '@/types/sftp';

// Type guard to validate status
const isValidUploadStatus = (status: string): status is 'received' | 'processing' | 'completed' | 'failed' | 'invalid' => {
  return ['received', 'processing', 'completed', 'failed', 'invalid'].includes(status);
};

// Convert database response to typed upload job
const convertToSFTPUploadJob = (response: SFTPUploadJobResponse): SFTPUploadJob => {
  return {
    ...response,
    status: isValidUploadStatus(response.status) ? response.status : 'failed'
  };
};

export function useSFTPUploadHistory() {
  const [uploads, setUploads] = useState<SFTPUploadJob[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useTelegramAuth();

  const fetchUploads = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Set the current user context for RLS
      await supabase.rpc('set_session_context', {
        key: 'app.current_user_id',
        value: user.id.toString()
      });

      const { data, error } = await supabase
        .from('upload_jobs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      const typedData = (data || []).map((item: SFTPUploadJobResponse) => 
        convertToSFTPUploadJob(item)
      );
      
      setUploads(typedData);
    } catch (error) {
      console.error('Error fetching upload history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUploads();

      // Subscribe to real-time updates for upload jobs
      const channel = supabase
        .channel('upload-jobs-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'upload_jobs',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchUploads(); // Refetch when changes occur
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  return {
    uploads,
    loading,
    refetch: fetchUploads,
  };
}

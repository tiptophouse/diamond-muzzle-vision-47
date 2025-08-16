
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

interface SFTPUploadJob {
  id: string;
  ftp_account_id: string;
  user_id: number;
  filename: string;
  file_size_bytes?: number;
  status: 'received' | 'processing' | 'completed' | 'failed' | 'invalid';
  diamonds_processed: number;
  diamonds_failed: number;
  error_message?: string;
  processing_started_at?: string;
  processing_completed_at?: string;
  created_at: string;
  updated_at: string;
}

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

      setUploads(data || []);
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

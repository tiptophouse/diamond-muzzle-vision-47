
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { SFTPAccount, SFTPAccountResponse } from '@/types/sftp';

interface TestConnectionResult {
  success: boolean;
  message: string;
}

// Type guard to validate status
const isValidSFTPStatus = (status: string): status is 'active' | 'suspended' | 'revoked' => {
  return ['active', 'suspended', 'revoked'].includes(status);
};

// Convert database response to typed account
const convertToSFTPAccount = (response: SFTPAccountResponse): SFTPAccount => {
  return {
    ...response,
    status: isValidSFTPStatus(response.status) ? response.status : 'suspended'
  };
};

export function useSFTPAccount() {
  const [account, setAccount] = useState<SFTPAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useTelegramAuth();
  const { toast } = useToast();

  const fetchAccount = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Set the current user context for RLS
      await supabase.rpc('set_session_context', {
        key: 'app.current_user_id',
        value: user.id.toString()
      });

      const { data, error } = await supabase
        .from('ftp_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('telegram_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }

      if (data) {
        setAccount(convertToSFTPAccount(data as SFTPAccountResponse));
      } else {
        setAccount(null);
      }
    } catch (error) {
      console.error('Error fetching SFTP account:', error);
      toast({
        title: "Error loading SFTP account",
        description: "Please refresh the page and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAccount = async () => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      setLoading(true);
      
      // This would call your FastAPI endpoint
      const response = await fetch('/api/v1/ftp/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          telegram_id: user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate SFTP account');
      }

      const data = await response.json();
      setAccount(data);
      
      return data;
    } catch (error) {
      console.error('Error generating SFTP account:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const rotatePassword = async () => {
    if (!account) throw new Error('No SFTP account found');

    try {
      setLoading(true);
      
      const response = await fetch('/api/v1/ftp/rotate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify({
          account_id: account.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to rotate password');
      }

      const data = await response.json();
      setAccount(data);
      
      return data;
    } catch (error) {
      console.error('Error rotating password:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const revokeAccount = async () => {
    if (!account) throw new Error('No SFTP account found');

    try {
      setLoading(true);
      
      const response = await fetch(`/api/v1/ftp/revoke/${account.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to revoke account');
      }

      setAccount(null);
    } catch (error) {
      console.error('Error revoking account:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (): Promise<TestConnectionResult> => {
    if (!account) throw new Error('No SFTP account found');

    try {
      const response = await fetch('/api/v1/ftp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`,
        },
        body: JSON.stringify({
          account_id: account.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to test connection');
      }

      return await response.json();
    } catch (error) {
      console.error('Error testing connection:', error);
      return {
        success: false,
        message: 'Connection test failed. Please check your server configuration.',
      };
    }
  };

  const getAuthToken = async () => {
    // This would get the authentication token for your FastAPI backend
    // You might need to implement this based on your auth setup
    return 'your-auth-token';
  };

  useEffect(() => {
    if (user?.id) {
      fetchAccount();
    }
  }, [user?.id]);

  return {
    account,
    loading,
    generateAccount,
    rotatePassword,
    revokeAccount,
    testConnection,
    refetch: fetchAccount,
  };
}

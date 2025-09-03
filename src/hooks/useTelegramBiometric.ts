import { useCallback, useEffect, useState } from 'react';
import { useAdvancedTelegramSDK } from './useAdvancedTelegramSDK';
import { toast } from 'sonner';

interface BiometricHook {
  isSupported: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Authentication
  authenticate: (reason?: string) => Promise<boolean>;
  
  // Settings
  requestSetup: () => Promise<boolean>;
  openSettings: () => void;
  
  // Token management
  updateSecurityToken: (token: string) => Promise<boolean>;
  
  // Quick actions with biometric protection
  authenticatedAction: <T>(action: () => Promise<T>, reason?: string) => Promise<T | null>;
  
  // SFTP credentials protection
  protectSFTPCredentials: (credentials: any) => Promise<boolean>;
  getSFTPCredentials: () => Promise<any | null>;
}

export function useTelegramBiometric(): BiometricHook {
  const { biometric, isInitialized } = useAdvancedTelegramSDK();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isInitialized && biometric.isSupported) {
      // Check if biometric is already set up
      checkBiometricStatus();
    }
  }, [isInitialized, biometric.isSupported]);

  const checkBiometricStatus = useCallback(async () => {
    try {
      // Try a quick authentication to check if it's set up
      const result = await biometric.authenticate('Check biometric status');
      setIsEnabled(result);
    } catch (error) {
      // If it fails, biometric might not be set up
      setIsEnabled(false);
    }
  }, [biometric]);

  const authenticate = useCallback(async (reason = 'Authenticate to continue'): Promise<boolean> => {
    if (!biometric.isSupported) {
      toast.error('Biometric authentication is not supported on this device');
      return false;
    }

    try {
      setError(null);
      setIsLoading(true);

      const result = await biometric.authenticate(reason);
      
      if (result) {
        console.log('🔐 Biometric authentication successful');
        toast.success('Authentication successful');
      } else {
        console.log('❌ Biometric authentication failed');
        toast.error('Authentication failed');
      }
      
      return result;
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      setError(error.message || 'Authentication failed');
      toast.error('Authentication error: ' + (error.message || 'Unknown error'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [biometric]);

  const requestSetup = useCallback(async (): Promise<boolean> => {
    if (!biometric.isSupported) {
      toast.error('Biometric authentication is not supported on this device');
      return false;
    }

    try {
      setError(null);
      setIsLoading(true);
      
      // Try to authenticate to trigger setup
      const result = await biometric.authenticate('Set up biometric authentication for secure access');
      
      if (result) {
        setIsEnabled(true);
        toast.success('Biometric authentication set up successfully!');
        return true;
      } else {
        toast.error('Failed to set up biometric authentication');
        return false;
      }
    } catch (error: any) {
      console.error('Biometric setup error:', error);
      setError(error.message || 'Setup failed');
      toast.error('Setup failed: ' + (error.message || 'Unknown error'));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [biometric]);

  const openSettings = useCallback(() => {
    if (biometric.isSupported) {
      biometric.openSettings();
    } else {
      toast.error('Biometric settings are not available');
    }
  }, [biometric]);

  const updateSecurityToken = useCallback(async (token: string): Promise<boolean> => {
    if (!biometric.isSupported || !isEnabled) {
      return false;
    }

    try {
      await biometric.updateToken(token, 'Update security credentials');
      toast.success('Security token updated');
      return true;
    } catch (error: any) {
      console.error('Token update error:', error);
      toast.error('Failed to update security token');
      return false;
    }
  }, [biometric, isEnabled]);

  const authenticatedAction = useCallback(async <T>(
    action: () => Promise<T>,
    reason = 'Authenticate to perform this action'
  ): Promise<T | null> => {
    if (!isEnabled) {
      // If biometric is not enabled, just run the action
      return await action();
    }

    const authenticated = await authenticate(reason);
    
    if (authenticated) {
      try {
        return await action();
      } catch (error) {
        console.error('Authenticated action failed:', error);
        throw error;
      }
    }
    
    return null;
  }, [isEnabled, authenticate]);

  // SFTP credentials protection
  const protectSFTPCredentials = useCallback(async (credentials: any): Promise<boolean> => {
    if (!biometric.isSupported) {
      // Store normally if biometric is not supported
      localStorage.setItem('sftp_credentials', JSON.stringify(credentials));
      return true;
    }

    try {
      // Authenticate before storing
      const authenticated = await authenticate('Secure your SFTP credentials with biometric authentication');
      
      if (authenticated) {
        // Store in a secured way with biometric protection flag
        const securedData = {
          ...credentials,
          biometricProtected: true,
          timestamp: Date.now()
        };
        
        localStorage.setItem('sftp_credentials', JSON.stringify(securedData));
        await updateSecurityToken(JSON.stringify(credentials));
        
        toast.success('SFTP credentials secured with biometric protection');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to protect SFTP credentials:', error);
      return false;
    }
  }, [biometric, authenticate, updateSecurityToken]);

  const getSFTPCredentials = useCallback(async (): Promise<any | null> => {
    try {
      const stored = localStorage.getItem('sftp_credentials');
      
      if (!stored) {
        return null;
      }
      
      const credentials = JSON.parse(stored);
      
      // If protected by biometric, require authentication
      if (credentials.biometricProtected && biometric.isSupported) {
        const authenticated = await authenticate('Access your SFTP credentials');
        
        if (!authenticated) {
          return null;
        }
      }
      
      // Remove protection flag before returning
      const { biometricProtected, timestamp, ...cleanCredentials } = credentials;
      return cleanCredentials;
    } catch (error) {
      console.error('Failed to get SFTP credentials:', error);
      return null;
    }
  }, [biometric, authenticate]);

  return {
    isSupported: biometric.isSupported,
    isEnabled,
    isLoading,
    error,
    
    authenticate,
    requestSetup,
    openSettings,
    updateSecurityToken,
    authenticatedAction,
    
    // SFTP integration
    protectSFTPCredentials,
    getSFTPCredentials
  };
}
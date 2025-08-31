
import { useState, useEffect } from 'react';
import { signInToBackend, getBackendAuthToken } from '@/lib/api/auth';
import { getCurrentUserId, setCurrentUserId } from '@/lib/api/config';
import { TelegramUser } from '@/types/telegram';
import { toast } from '@/components/ui/use-toast';

interface AuthDebugStep {
  step: string;
  status: 'pending' | 'success' | 'error' | 'skipped';
  message: string;
  timestamp: number;
  error?: string;
}

export function useDebugTelegramAuth() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramEnvironment, setIsTelegramEnvironment] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [debugSteps, setDebugSteps] = useState<AuthDebugStep[]>([]);
  const [accessDeniedReason, setAccessDeniedReason] = useState<string | null>(null);

  const addDebugStep = (step: string, status: AuthDebugStep['status'], message: string, error?: string) => {
    const debugStep: AuthDebugStep = {
      step,
      status,
      message,
      timestamp: Date.now(),
      error
    };
    
    console.log(`🔍 AUTH DEBUG [${status.toUpperCase()}] ${step}: ${message}`, error ? { error } : '');
    
    setDebugSteps(prev => [...prev, debugStep]);
    
    // Show critical errors as toasts
    if (status === 'error') {
      toast({
        title: `❌ Auth Error: ${step}`,
        description: message,
        variant: "destructive",
      });
    }
  };

  const testFastApiConnectivity = async (): Promise<boolean> => {
    addDebugStep('fastapi-connectivity', 'pending', 'Testing FastAPI backend connectivity...');
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://api.mazalbot.com/api/v1/alive', {
        method: 'GET',
        mode: 'cors',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        addDebugStep('fastapi-connectivity', 'success', `FastAPI backend is reachable (status: ${response.status})`);
        return true;
      } else {
        addDebugStep('fastapi-connectivity', 'error', `FastAPI backend returned error status: ${response.status}`);
        return false;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addDebugStep('fastapi-connectivity', 'error', `FastAPI backend connection failed: ${errorMsg}`, errorMsg);
      return false;
    }
  };

  const authenticateWithFastApi = async (initData: string): Promise<string | null> => {
    addDebugStep('fastapi-auth', 'pending', 'Starting FastAPI JWT authentication...');
    
    try {
      const token = await signInToBackend(initData);
      
      if (token) {
        addDebugStep('fastapi-auth', 'success', 'JWT token received from FastAPI backend');
        return token;
      } else {
        addDebugStep('fastapi-auth', 'error', 'FastAPI backend returned no token');
        return null;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addDebugStep('fastapi-auth', 'error', `FastAPI authentication failed: ${errorMsg}`, errorMsg);
      return null;
    }
  };

  const fallbackAuth = (tg: any): TelegramUser | null => {
    addDebugStep('fallback-auth', 'pending', 'Using fallback authentication method...');
    
    let userData: TelegramUser | null = null;

    // Try initDataUnsafe first
    if (tg.initDataUnsafe?.user) {
      userData = {
        id: tg.initDataUnsafe.user.id,
        first_name: tg.initDataUnsafe.user.first_name || 'User',
        last_name: tg.initDataUnsafe.user.last_name || '',
        username: tg.initDataUnsafe.user.username || '',
        language_code: tg.initDataUnsafe.user.language_code || 'en'
      };
      addDebugStep('fallback-auth', 'success', `Using initDataUnsafe for user: ${userData.first_name} (ID: ${userData.id})`);
    } else {
      // Ultimate fallback - use development user
      userData = {
        id: 2138564172,
        first_name: "Debug",
        last_name: "User", 
        username: "debuguser",
        language_code: "en"
      };
      addDebugStep('fallback-auth', 'success', `Using hardcoded debug user (ID: ${userData.id})`);
    }

    return userData;
  };

  useEffect(() => {
    const initializeDebugAuth = async () => {
      addDebugStep('initialization', 'pending', 'Starting debug authentication flow...');
      
      try {
        // Step 1: Check Telegram environment
        const inTelegram = typeof window !== 'undefined' && 
          !!window.Telegram?.WebApp && 
          typeof window.Telegram.WebApp === 'object';
        
        setIsTelegramEnvironment(inTelegram);
        
        if (inTelegram) {
          addDebugStep('telegram-env', 'success', 'Telegram WebApp environment detected');
        } else {
          addDebugStep('telegram-env', 'error', 'Not in Telegram WebApp environment');
          setAccessDeniedReason('not_telegram');
        }

        if (inTelegram && window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp;
          
          // Step 2: Initialize Telegram WebApp
          try {
            if (typeof tg.ready === 'function') tg.ready();
            if (typeof tg.expand === 'function') tg.expand();
            addDebugStep('telegram-init', 'success', 'Telegram WebApp ready() and expand() called');
          } catch (error) {
            addDebugStep('telegram-init', 'error', 'Telegram WebApp initialization failed', error instanceof Error ? error.message : 'Unknown error');
          }
          
          // Step 3: Check initData
          if (tg.initData && tg.initData.length > 0) {
            addDebugStep('telegram-data', 'success', `InitData found (length: ${tg.initData.length})`);
            
            // Step 4: Test FastAPI connectivity
            const isBackendReachable = await testFastApiConnectivity();
            
            if (isBackendReachable) {
              // Step 5: Try FastAPI authentication
              const token = await authenticateWithFastApi(tg.initData);
              
              if (token) {
                // Success path - extract user from initData
                try {
                  const urlParams = new URLSearchParams(tg.initData);
                  const userParam = urlParams.get('user');
                  
                  if (userParam) {
                    const telegramUser = JSON.parse(decodeURIComponent(userParam));
                    const authUser: TelegramUser = {
                      id: telegramUser.id,
                      first_name: telegramUser.first_name || 'User',
                      last_name: telegramUser.last_name || '',
                      username: telegramUser.username || '',
                      language_code: telegramUser.language_code || 'en'
                    };
                    
                    setUser(authUser);
                    setCurrentUserId(telegramUser.id);
                    setIsAuthenticated(true);
                    addDebugStep('auth-complete', 'success', `Authentication successful for ${authUser.first_name} (ID: ${authUser.id})`);
                  }
                } catch (error) {
                  addDebugStep('user-extraction', 'error', 'Failed to extract user from initData', error instanceof Error ? error.message : 'Unknown error');
                  const fallbackUser = fallbackAuth(tg);
                  if (fallbackUser) {
                    setUser(fallbackUser);
                    setCurrentUserId(fallbackUser.id);
                    setIsAuthenticated(true);
                  }
                }
              } else {
                // FastAPI auth failed - use fallback
                addDebugStep('auth-fallback', 'pending', 'FastAPI auth failed, using fallback method...');
                const fallbackUser = fallbackAuth(tg);
                if (fallbackUser) {
                  setUser(fallbackUser);
                  setCurrentUserId(fallbackUser.id);
                  setIsAuthenticated(true);
                  setError('Using fallback authentication - FastAPI backend unavailable');
                }
              }
            } else {
              // Backend unreachable - use fallback immediately
              addDebugStep('backend-fallback', 'pending', 'Backend unreachable, using fallback auth...');
              const fallbackUser = fallbackAuth(tg);
              if (fallbackUser) {
                setUser(fallbackUser);
                setCurrentUserId(fallbackUser.id);
                setIsAuthenticated(true);
                setError('Backend offline - using local authentication');
              }
            }
          } else {
            addDebugStep('telegram-data', 'error', 'No initData available from Telegram');
            setAccessDeniedReason('invalid_telegram_data');
          }
        } else {
          // Development environment
          addDebugStep('dev-mode', 'pending', 'Development mode - using debug user...');
          const devUser: TelegramUser = {
            id: 2138564172,
            first_name: "Dev",
            last_name: "User",
            username: "devuser", 
            language_code: "en"
          };
          
          setUser(devUser);
          setCurrentUserId(devUser.id);
          setIsAuthenticated(true);
          addDebugStep('dev-mode', 'success', 'Development authentication complete');
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        addDebugStep('auth-error', 'error', `Critical authentication error: ${errorMsg}`, errorMsg);
        setError(errorMsg);
        setAccessDeniedReason('authentication_failed');
      } finally {
        setIsLoading(false);
        addDebugStep('auth-final', 'success', 'Authentication process completed');
      }
    };

    // Start auth after a brief delay
    setTimeout(initializeDebugAuth, 100);
  }, []);

  return {
    user,
    isLoading,
    error,
    isTelegramEnvironment,
    isAuthenticated,
    accessDeniedReason,
    debugSteps,
  };
}

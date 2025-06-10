
import { ReactNode, createContext, useContext } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { Shield, UserX, Clock, Crown, AlertTriangle } from 'lucide-react';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isAuthorized: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_TELEGRAM_ID = 2138564172;

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, isAuthenticated, isLoading: authLoading, error, isTelegramEnvironment } = useTelegramAuth();
  const { isUserBlocked, isLoading: blockedLoading } = useBlockedUsers();
  const { settings, isLoading: settingsLoading } = useAppSettings();
  
  const isAdmin = user?.id === ADMIN_TELEGRAM_ID;
  const isLoading = authLoading || blockedLoading || settingsLoading;
  
  // Determine authorization status
  let isAuthorized = false;
  if (isAuthenticated && user) {
    if (isAdmin) {
      // Admin always gets access
      isAuthorized = true;
    } else if (!isLoading) {
      // Check environment for non-admin in production
      if (process.env.NODE_ENV === 'production' && !isTelegramEnvironment) {
        isAuthorized = false;
      } else if (isUserBlocked(user.id)) {
        isAuthorized = false;
      } else if (settings.manual_authorization_enabled) {
        isAuthorized = false;
      } else {
        isAuthorized = true;
      }
    }
  }

  const authState: AuthContextType = {
    user,
    isAuthenticated,
    isAuthorized,
    isLoading,
    isAdmin,
    error
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8 max-w-md mx-4">
          <div className="relative mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <Shield className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-blue-700 mb-2">מאמת זהות...</h3>
          <p className="text-blue-600 text-sm">מתחבר לטלגרם...</p>
          <div className="mt-6 w-full bg-blue-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="text-center p-8 max-w-md mx-4 bg-white rounded-xl shadow-lg border">
          <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-blue-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">כניסה למערכת</h2>
          
          <div className="space-y-4 text-right">
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">מידע נוסף:</h4>
                <p className="text-yellow-700 text-sm">{error}</p>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">כיצד להיכנס:</h4>
              <ul className="text-blue-700 text-sm space-y-1 text-right">
                <li>• וודא שאתה ניגש לאפליקציה דרך טלגרם</li>
                <li>• בדוק את החיבור לאינטרנט</li>
                <li>• נסה לרענן את האפליקציה</li>
                <li>• פנה לתמיכה אם הבעיה נמשכת</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              רענן אפליקציה
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!isAuthorized) {
    const isBlocked = isUserBlocked(user.id);
    const invalidEnvironment = process.env.NODE_ENV === 'production' && !isTelegramEnvironment;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md mx-4 border">
          <div className={`rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 ${
            isAdmin ? 'bg-yellow-50' : isBlocked ? 'bg-red-50' : 'bg-orange-50'
          }`}>
            {isAdmin ? (
              <Crown className="h-10 w-10 text-yellow-600" />
            ) : isBlocked ? (
              <UserX className="h-10 w-10 text-red-600" />
            ) : (
              <Clock className="h-10 w-10 text-orange-600" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {invalidEnvironment 
              ? 'Invalid Access Method'
              : isBlocked 
                ? 'Access Denied' 
                : 'Authorization Required'
            }
          </h2>
          
          <p className="text-gray-600 mb-6">
            {invalidEnvironment
              ? 'This application must be accessed through the official Telegram application for security reasons.'
              : isBlocked 
                ? 'Your access to this application has been restricted by the administrator.'
                : 'This application now requires manual authorization. Please contact the administrator to request access.'
            }
          </p>
          
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors w-full"
          >
            Refresh & Retry
          </button>
        </div>
      </div>
    );
  }

  // Authorized - provide auth context
  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

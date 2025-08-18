
import { ReactNode } from 'react';
import { useSecureUser } from '@/contexts/SecureUserContext';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

interface UserIsolationGuardProps {
  children: ReactNode;
  requireVerification?: boolean;
}

export function UserIsolationGuard({ children, requireVerification = true }: UserIsolationGuardProps) {
  const { currentUserId, isUserVerified, userIsolationKey } = useSecureUser();

  if (requireVerification && (!currentUserId || !isUserVerified || !userIsolationKey)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full border border-red-200">
          <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Security Isolation Required</h2>
          
          <div className="space-y-3 text-gray-600 mb-6">
            <p className="flex items-center justify-center gap-2">
              <Lock className="h-4 w-4 text-red-500" />
              User verification failed
            </p>
            <p className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Data isolation not established
            </p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-red-800 mb-2">Diamond Industry Security</h4>
            <p className="text-red-700 text-sm">
              Access requires verified Telegram authentication and complete user isolation for data protection.
            </p>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Retry Secure Authentication
          </button>
          
          <p className="text-xs text-gray-500 mt-4">
            Your data privacy and security are our top priority
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-user-isolation={userIsolationKey}>
      {children}
    </div>
  );
}

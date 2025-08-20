
import { ReactNode } from 'react';
import { useSecureNavigation } from '@/hooks/useSecureNavigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Shield } from 'lucide-react';

interface SecureNavigationWrapperProps {
  children: ReactNode;
}

export function SecureNavigationWrapper({ children }: SecureNavigationWrapperProps) {
  const { isLocked, restrictedMessage } = useSecureNavigation();

  return (
    <div className="min-h-screen bg-background">
      {isLocked && (
        <div className="sticky top-0 z-50 bg-blue-50 border-b border-blue-200">
          <Alert className="rounded-none border-0">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800 text-sm">
              🔒 <strong>Secure Mode:</strong> You're viewing shared content. Navigation is restricted for security.
            </AlertDescription>
          </Alert>
        </div>
      )}
      
      <div className={isLocked ? 'pb-4' : ''}>
        {children}
      </div>

      {isLocked && (
        <div className="fixed bottom-4 left-4 right-4 z-40">
          <div className="bg-white rounded-lg shadow-lg border p-3 flex items-center gap-3">
            <Lock className="h-4 w-4 text-blue-600 flex-shrink-0" />
            <p className="text-xs text-gray-600">
              Content shared securely. Register in our Mini App for full access.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

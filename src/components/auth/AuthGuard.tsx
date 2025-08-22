
import { ReactNode } from 'react';
import { TelegramOnlyGuard } from './TelegramOnlyGuard';
import { AuthorizationGuard } from './AuthorizationGuard';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  return (
    <TelegramOnlyGuard>
      <AuthorizationGuard>
        {children}
      </AuthorizationGuard>
    </TelegramOnlyGuard>
  );
}

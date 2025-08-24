
import { ReactNode } from 'react';
import { StrictTelegramGuard } from './StrictTelegramGuard';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  return (
    <StrictTelegramGuard>
      {children}
    </StrictTelegramGuard>
  );
}

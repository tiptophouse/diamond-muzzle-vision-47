
import { ReactNode } from 'react';
import { TelegramOnlyGuard } from './TelegramOnlyGuard';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  return (
    <TelegramOnlyGuard>
      {children}
    </TelegramOnlyGuard>
  );
}

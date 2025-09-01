
import React from 'react';
import { EnhancedTelegramLayout } from './EnhancedTelegramLayout';

interface TelegramLayoutProps {
  children: React.ReactNode;
}

export function TelegramLayout({ children }: TelegramLayoutProps) {
  return <EnhancedTelegramLayout>{children}</EnhancedTelegramLayout>;
}

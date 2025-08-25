
import React from 'react';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { useUnifiedTelegramNavigation } from '@/hooks/useUnifiedTelegramNavigation';

export default function SettingsPage() {
  // Set up back button for settings
  useUnifiedTelegramNavigation({
    showBackButton: true
  });

  return (
    <UnifiedLayout>
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          <SettingsForm />
        </div>
      </div>
    </UnifiedLayout>
  );
}

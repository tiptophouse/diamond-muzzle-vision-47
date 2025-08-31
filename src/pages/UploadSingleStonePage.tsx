
import React from 'react';
import { SingleStoneUploadForm } from '@/components/upload/SingleStoneUploadForm';
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';
import { useUnifiedTelegramNavigation } from '@/hooks/useUnifiedTelegramNavigation';

export default function UploadSingleStonePage() {
  // Set up navigation for upload page
  useUnifiedTelegramNavigation({
    showBackButton: true,
    showMainButton: true,
    mainButtonText: 'Save Diamond',
    mainButtonColor: '#3b82f6'
  });

  return (
    <UnifiedLayout>
      <div className="p-4">
        <SingleStoneUploadForm />
      </div>
    </UnifiedLayout>
  );
}

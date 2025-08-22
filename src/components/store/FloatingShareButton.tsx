
import React from 'react';
import { ShareButton } from './ShareButton';
import { Diamond } from '@/types/diamond';

interface FloatingShareButtonProps {
  diamond: Diamond;
}

export function FloatingShareButton({ diamond }: FloatingShareButtonProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <ShareButton
        diamond={diamond}
        className="shadow-lg hover:shadow-xl transition-shadow"
      />
    </div>
  );
}

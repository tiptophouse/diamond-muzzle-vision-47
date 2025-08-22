
import React from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShareButton } from './ShareButton';
import { Diamond } from '@/types/diamond';

interface FloatingShareButtonProps {
  diamond: Diamond;
  className?: string;
}

export function FloatingShareButton({ diamond, className }: FloatingShareButtonProps) {
  return (
    <div className={cn("fixed bottom-20 right-4 z-50", className)}>
      <ShareButton diamond={diamond} />
    </div>
  );
}

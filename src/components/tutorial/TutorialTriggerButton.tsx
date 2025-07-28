
import React from 'react';
import { useTutorial } from '@/contexts/TutorialContext';
import { Button } from '@/components/ui/button';
import { Sparkles, RotateCcw } from 'lucide-react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface TutorialTriggerButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function TutorialTriggerButton({ 
  variant = 'outline', 
  size = 'sm', 
  className = '' 
}: TutorialTriggerButtonProps) {
  const tutorial = useTutorial();
  const { hapticFeedback } = useTelegramWebApp();

  if (!tutorial) return null;

  const { startTutorial, restartTutorial, hasSeenTutorial, currentLanguage } = tutorial;

  const handleClick = () => {
    hapticFeedback.impact('medium');
    if (hasSeenTutorial) {
      restartTutorial();
    } else {
      startTutorial();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={`flex items-center gap-2 ${className}`}
    >
      {hasSeenTutorial ? (
        <>
          <RotateCcw className="h-4 w-4" />
          {currentLanguage === 'he' ? 'חזור על הסיור' : 'Restart Tour'}
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          {currentLanguage === 'he' ? 'סיור מודרך' : 'Guided Tour'}
        </>
      )}
    </Button>
  );
}

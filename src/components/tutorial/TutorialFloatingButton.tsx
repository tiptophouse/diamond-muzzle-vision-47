import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, HelpCircle } from 'lucide-react';
import { useLiveTutorial } from '@/contexts/LiveTutorialContext';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

export function TutorialFloatingButton() {
  const { 
    isActive, 
    startTutorial, 
    language 
  } = useLiveTutorial();
  
  const { hapticFeedback } = useTelegramWebApp();

  const handleStartTutorial = () => {
    hapticFeedback.impact('medium');
    startTutorial();
  };

  if (isActive) return null;

  return (
    <Button
      onClick={handleStartTutorial}
      size="lg"
      className="fixed bottom-24 right-4 z-40 rounded-full w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      style={{
        bottom: `calc(96px + var(--tg-safe-area-inset-bottom, 0px))`
      }}
    >
      <div className="flex flex-col items-center">
        <HelpCircle className="h-6 w-6" />
        <span className="text-[10px] font-medium mt-1">
          {language === 'he' ? 'סיור' : 'Tour'}
        </span>
      </div>
    </Button>
  );
}
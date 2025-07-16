
import React from 'react';
import { Button } from '@/components/ui/button';
import { useTutorial } from '@/contexts/TutorialContext';
import { HelpCircle, RotateCcw } from 'lucide-react';

export function TutorialTrigger() {
  const { startTutorial, restartTutorial, hasSeenTutorial } = useTutorial();

  const handleClick = () => {
    if (hasSeenTutorial) {
      restartTutorial();
    } else {
      startTutorial();
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
    >
      {hasSeenTutorial ? (
        <>
          <RotateCcw className="h-4 w-4" />
          Restart Tutorial
        </>
      ) : (
        <>
          <HelpCircle className="h-4 w-4" />
          Tutorial
        </>
      )}
    </Button>
  );
}

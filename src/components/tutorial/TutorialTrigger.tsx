
import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';
import { useSimpleTutorial } from '@/contexts/SimpleTutorialContext';

export function TutorialTrigger() {
  const tutorial = useSimpleTutorial();
  
  if (!tutorial) return null;
  
  const { startTutorial } = tutorial;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={startTutorial}
      className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
    >
      <HelpCircle className="h-4 w-4" />
      <span className="hidden sm:inline text-sm">Help</span>
    </Button>
  );
}

import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, Globe } from 'lucide-react';
import { useLiveTutorial } from '@/contexts/LiveTutorialContext';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

export function LiveTutorialTrigger() {
  const { 
    isActive, 
    startTutorial, 
    language, 
    setLanguage 
  } = useLiveTutorial();
  
  const { hapticFeedback } = useTelegramWebApp();

  const handleStartTutorial = () => {
    hapticFeedback.impact('medium');
    startTutorial();
  };

  const handleLanguageToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    hapticFeedback.selection();
    setLanguage(language === 'en' ? 'he' : 'en');
  };

  if (isActive) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Language Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleLanguageToggle}
        className="flex items-center gap-2 text-muted-foreground border-border hover:bg-muted"
        title={language === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
      >
        <Globe className="h-4 w-4" />
        {language === 'en' ? 'עב' : 'EN'}
      </Button>
      
      {/* Tutorial Button */}
      <Button
        variant="default"
        size="sm"
        onClick={handleStartTutorial}
        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
      >
        <Play className="h-4 w-4" />
        {language === 'he' ? 'סיור מערכת' : 'System Tour'}
      </Button>
    </div>
  );
}

import React from 'react';
import { Button } from '@/components/ui/button';
import { useTutorial } from '@/contexts/TutorialContext';
import { HelpCircle, RotateCcw, Globe } from 'lucide-react';

export function TutorialTrigger() {
  const tutorial = useTutorial();
  
  if (!tutorial) return null;
  
  const { startTutorial, restartTutorial, hasSeenTutorial, currentLanguage, setLanguage } = tutorial;

  const handleClick = () => {
    if (hasSeenTutorial) {
      restartTutorial();
    } else {
      startTutorial();
    }
  };

  const toggleLanguage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setLanguage(currentLanguage === 'en' ? 'he' : 'en');
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={toggleLanguage}
        className="flex items-center gap-2 text-gray-600 border-gray-200 hover:bg-gray-50"
        title={currentLanguage === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
      >
        <Globe className="h-4 w-4" />
        {currentLanguage === 'en' ? 'עב' : 'EN'}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
      >
        {hasSeenTutorial ? (
          <>
            <RotateCcw className="h-4 w-4" />
            {currentLanguage === 'he' ? 'התחל מדריך מחדש' : 'Restart Tutorial'}
          </>
        ) : (
          <>
            <HelpCircle className="h-4 w-4" />
            {currentLanguage === 'he' ? 'מדריך' : 'Tutorial'}
          </>
        )}
      </Button>
    </div>
  );
}

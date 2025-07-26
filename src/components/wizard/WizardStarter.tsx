
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Trophy, Target } from 'lucide-react';
import { useInteractiveWizard } from '@/contexts/InteractiveWizardContext';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

interface WizardStarterProps {
  onClose?: () => void;
}

export function WizardStarter({ onClose }: WizardStarterProps) {
  const { startWizard, language, setLanguage } = useInteractiveWizard();
  const { impactOccurred } = useTelegramHapticFeedback();

  const handleStart = () => {
    impactOccurred('medium');
    startWizard();
    onClose?.();
  };

  const handleSkip = () => {
    impactOccurred('light');
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-2xl">
        <CardContent className="p-6 text-center space-y-6" dir={language === 'he' ? 'rtl' : 'ltr'}>
          {/* Hero Icon */}
          <div className="text-6xl">💎</div>
          
          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {language === 'he' ? 'ברוך הבא למסע היהלומים!' : 'Welcome to Your Diamond Journey!'}
            </h2>
            <p className="text-gray-600">
              {language === 'he' 
                ? 'תלמד לנהל יהלומים כמו מקצוען תוך 5 דקות!'
                : 'Learn to manage diamonds like a pro in 5 minutes!'}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-left">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="text-sm">
                {language === 'he' ? 'משימות אינטרקטיביות' : 'Interactive Quests'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <span className="text-sm">
                {language === 'he' ? 'אוסף תגים ופרסים' : 'Earn Badges & Rewards'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-left">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span className="text-sm">
                {language === 'he' ? 'למידה מהנה וגיימיפיקציה' : 'Fun Gamified Learning'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleStart}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {language === 'he' ? '🚀 התחל את המסע!' : '🚀 Start the Journey!'}
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  impactOccurred('light');
                  setLanguage(language === 'en' ? 'he' : 'en');
                }}
                className="flex-1"
              >
                {language === 'en' ? 'עברית' : 'English'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="flex-1 text-gray-600"
              >
                {language === 'he' ? 'אולי מאוחר יותר' : 'Maybe Later'}
              </Button>
            </div>
          </div>

          {/* Trust Badge */}
          <p className="text-xs text-gray-500">
            {language === 'he' 
              ? '⚡ תוכל לצאת בכל שלב - אנחנו לא נציק לך'
              : '⚡ Exit anytime - we won\'t bother you'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

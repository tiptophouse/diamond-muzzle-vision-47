import React, { useEffect } from 'react';
import { useTutorial } from '@/contexts/TutorialContext';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramMainButton } from '@/hooks/useTelegramMainButton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, ChevronRight, Upload, Package, Store, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SimpleTutorialModal() {
  const tutorial = useTutorial();
  if (!tutorial) return null;
  
  const { 
    isActive, 
    currentStep, 
    totalSteps, 
    currentStepData, 
    currentLanguage,
    nextStep, 
    skipTutorial 
  } = tutorial;
  
  const { hapticFeedback } = useTelegramWebApp();
  const navigate = useNavigate();

  const handleNext = () => {
    hapticFeedback.impact('medium');
    nextStep();
  };

  const handleSkip = () => {
    hapticFeedback.impact('light');
    skipTutorial();
  };

  const handleNavigateToPage = (path: string) => {
    hapticFeedback.impact('medium');
    navigate(path);
    nextStep();
  };

  // Use Telegram MainButton for primary actions
  useTelegramMainButton({
    text: currentStep === totalSteps - 1 
      ? (currentLanguage === 'he' ? 'סיום' : 'Finish')
      : (currentLanguage === 'he' ? 'הבא' : 'Next'),
    isVisible: isActive,
    isEnabled: true,
    onClick: handleNext
  });

  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isActive]);

  if (!isActive || !currentStepData) return null;

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ height: 'var(--tg-viewport-height, 100vh)' }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleSkip} />
      
      {/* Modal */}
      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-md mx-auto overflow-hidden animate-scale-in border border-border/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-5 text-white relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6" />
              <span className="font-bold text-lg">
                {currentLanguage === 'he' ? 'שלב' : 'Step'} {currentStep + 1} {currentLanguage === 'he' ? 'מתוך' : 'of'} {totalSteps}
              </span>
            </div>
            <button
              onClick={handleSkip}
              className="text-white/80 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-white/20"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4 text-center" dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}>
            {currentStepData.title[currentLanguage]}
          </h2>
          
          <div className="text-muted-foreground mb-6 leading-relaxed text-center" dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}>
            {currentStepData.content[currentLanguage]}
          </div>

          {/* Step-specific visuals */}
          {currentStepData.id === 'welcome' && (
            <div className="text-center mb-6">
              <div className="text-8xl mb-4">💎</div>
              <div className="text-sm text-muted-foreground">
                {currentLanguage === 'he' ? 'מערכת ניהול מלאי יהלומים מקצועית' : 'Professional Diamond Inventory Management'}
              </div>
            </div>
          )}

          {currentStepData.id === 'lets-upload' && (
            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl mb-4">
                <Upload className="h-16 w-16 mx-auto mb-3 text-blue-600" />
                <p className="text-sm text-gray-600">
                  {currentLanguage === 'he' ? 'לחץ על הכפתור למטה כדי להתחיל' : 'Tap the button below to get started'}
                </p>
              </div>
              <Button
                onClick={() => handleNavigateToPage('/upload')}
                size="lg"
                className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-3 rounded-xl"
              >
                <Upload className="h-6 w-6" />
                <span>
                  {currentLanguage === 'he' ? 'עבור להעלאה' : 'Go to Upload'}
                </span>
              </Button>
            </div>
          )}

          {currentStepData.id === 'see-inventory' && (
            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl mb-4">
                <Package className="h-16 w-16 mx-auto mb-3 text-gray-600" />
                <div className="text-sm text-gray-600 space-y-2">
                  <div>✨ {currentLanguage === 'he' ? 'הוסף יהלומים' : 'Add Diamonds'}</div>
                  <div>🔍 {currentLanguage === 'he' ? 'חפש וסנן' : 'Search & Filter'}</div>
                  <div>✏️ {currentLanguage === 'he' ? 'ערוך פרטים' : 'Edit Details'}</div>
                  <div>👁️ {currentLanguage === 'he' ? 'נראות חנות' : 'Store Visibility'}</div>
                </div>
              </div>
              <Button
                onClick={() => handleNavigateToPage('/inventory')}
                size="lg"
                className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-3 rounded-xl"
              >
                <Package className="h-6 w-6" />
                <span>
                  {currentLanguage === 'he' ? 'עבור למלאי' : 'Go to Inventory'}
                </span>
              </Button>
            </div>
          )}

          {currentStepData.id === 'visit-store' && (
            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl mb-4">
                <Store className="h-16 w-16 mx-auto mb-3 text-blue-600" />
                <div className="text-sm text-gray-600">
                  {currentLanguage === 'he' ? 'חזית חנות יפה עבור הלקוחות שלכם' : 'Beautiful public storefront for your customers'}
                </div>
              </div>
              <Button
                onClick={() => handleNavigateToPage('/store')}
                size="lg"
                className="w-full h-14 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-3 rounded-xl"
              >
                <Store className="h-6 w-6" />
                <span>
                  {currentLanguage === 'he' ? 'עבור לחנות' : 'Go to Store'}
                </span>
              </Button>
            </div>
          )}

          {currentStepData.id === 'tutorial-complete' && (
            <div className="text-center mb-6">
              <div className="text-8xl mb-4">🎉</div>
              <div className="text-lg font-semibold text-green-600 mb-2">
                {currentLanguage === 'he' ? 'כל הכבוד!' : 'Well Done!'}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/30 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            {currentLanguage === 'he' ? 'דלג על הסיור' : 'Skip Tour'}
          </Button>

          <Button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <span>{currentStep === totalSteps - 1 ? (currentLanguage === 'he' ? 'סיום' : 'Finish') : (currentLanguage === 'he' ? 'הבא' : 'Next')}</span>
            {currentStep < totalSteps - 1 && <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
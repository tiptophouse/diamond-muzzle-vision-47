
import React, { useEffect } from 'react';
import { useTutorial } from '@/contexts/TutorialContext';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramMainButton } from '@/hooks/useTelegramMainButton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, Sparkles, Globe, Camera, Package, Store, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tutorialStepsHebrew } from './tutorialStepsHebrew';

export function TutorialModal() {
  const tutorial = useTutorial();
  if (!tutorial) return null;
  
  const { 
    isActive, 
    currentStep, 
    totalSteps, 
    currentStepData, 
    currentLanguage,
    setLanguage,
    nextStep, 
    prevStep, 
    skipTutorial 
  } = tutorial;
  
  const { hapticFeedback } = useTelegramWebApp();
  const navigate = useNavigate();

  const handleNext = () => {
    hapticFeedback.impact('medium');
    nextStep();
  };

  const handlePrev = () => {
    hapticFeedback.impact('light');
    prevStep();
  };

  const handleSkip = () => {
    hapticFeedback.impact('light');
    skipTutorial();
  };

  const handleNavigateToPage = (path: string) => {
    hapticFeedback.impact('medium');
    navigate(path);
    skipTutorial(); // Complete tutorial when navigating
  };

  const handleFinishTutorial = () => {
    hapticFeedback.impact('medium');
    skipTutorial();
  };

  // Use Telegram MainButton for primary actions
  const mainButtonText = currentStepData?.requireClick 
    ? (currentLanguage === 'he' ? 'מחכה ללחיצה...' : 'Waiting for click...')
    : (currentStep === totalSteps - 1 
      ? (currentLanguage === 'he' ? 'סיום' : 'Finish')
      : (currentLanguage === 'he' ? 'הבא' : 'Next'));

  useTelegramMainButton({
    text: mainButtonText,
    isVisible: isActive && !currentStepData?.requireClick,
    isEnabled: !currentStepData?.requireClick,
    onClick: handleNext
  });

  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
      
      if (currentStepData?.requireClick) {
        hapticFeedback.impact('light');
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isActive, currentStepData]);

  if (!isActive || !currentStepData) return null;

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" style={{ height: 'var(--tg-viewport-height, 100vh)' }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleSkip} />
      
      {/* Modal - Mobile First Design */}
      <div className="relative bg-background rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md mx-auto overflow-hidden animate-scale-in border border-border max-h-[90vh] flex flex-col">
        {/* Header - Compact on mobile */}
        <div className="bg-gradient-to-r from-primary via-primary-glow to-primary-dark px-4 sm:px-6 py-3 sm:py-5 text-primary-foreground relative flex-shrink-0">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Sparkles className="h-4 w-4 sm:h-6 sm:w-6" />
              <span className="font-bold text-sm sm:text-base">
                {currentLanguage === 'he' ? 'שלב' : 'Step'} {currentStep + 1} {currentLanguage === 'he' ? 'מתוך' : 'of'} {totalSteps}
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => {
                  hapticFeedback.selection();
                  setLanguage(currentLanguage === 'en' ? 'he' : 'en');
                }}
                className="text-white/80 hover:text-white transition-colors p-1.5 sm:p-2 rounded-full hover:bg-white/10 active:scale-95"
                title={currentLanguage === 'en' ? 'עברית' : 'English'}
              >
                <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={handleSkip}
                className="text-white/80 hover:text-white transition-colors p-1.5 sm:p-2 rounded-full hover:bg-white/10 active:scale-95"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-1.5 sm:h-2 bg-white/20"
          />
          <div className="absolute -bottom-2 sm:-bottom-3 left-1/2 transform -translate-x-1/2 w-4 h-4 sm:w-6 sm:h-6 bg-gradient-to-r from-primary via-primary-glow to-primary-dark rotate-45 border-r border-b border-background"></div>
        </div>

        {/* Content - Scrollable on mobile */}
        <div className="p-4 sm:p-6 pt-6 sm:pt-8 flex-1 overflow-y-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4 text-center leading-tight" dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}>
            {currentStepData.title[currentLanguage]}
          </h2>
          
          <div className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed text-center" dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}>
            {currentStepData.content[currentLanguage]}
          </div>

          {/* Step-specific action buttons and visuals */}
          {currentStepData.id === 'lets-upload' && (
            <div className="mb-4 sm:mb-6 text-center">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📄</div>
              <Button
                onClick={() => handleNavigateToPage('/upload')}
                size="lg"
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-primary hover:bg-primary-dark text-primary-foreground flex items-center justify-center gap-2 sm:gap-3 rounded-xl active:scale-95 transition-all shadow-lg hover:shadow-xl"
              >
                <Camera className="h-5 w-5 sm:h-6 sm:w-6" />
                <span>
                  {currentLanguage === 'he' ? 'סרק תעודה עכשיו' : 'Scan Certificate Now'}
                </span>
              </Button>
            </div>
          )}

          {currentStepData.id === 'see-inventory' && (
            <div className="mb-4 sm:mb-6 text-center">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 rounded-xl mb-3 sm:mb-4">
                <div className="text-xs sm:text-sm text-gray-600 space-y-1.5 sm:space-y-2">
                  <div className="flex justify-between items-center gap-2">
                    <span className="flex items-center gap-1.5 sm:gap-2"><Sparkles className="h-3 w-3 sm:h-4 sm:w-4" /> Add Diamond</span>
                    <span className="flex items-center gap-1.5 sm:gap-2"><Package className="h-3 w-3 sm:h-4 sm:w-4" /> Search & Filter</span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <span className="flex items-center gap-1.5 sm:gap-2">✏️ Edit Details</span>
                    <span className="flex items-center gap-1.5 sm:gap-2">👁️ Store Visibility</span>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => handleNavigateToPage('/inventory')}
                size="lg"
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-primary hover:bg-primary-dark text-primary-foreground flex items-center justify-center gap-2 sm:gap-3 rounded-xl active:scale-95 transition-all shadow-lg hover:shadow-xl"
              >
                <Package className="h-5 w-5 sm:h-6 sm:w-6" />
                <span>
                  {currentLanguage === 'he' ? 'עבור למלאי' : 'Go to Inventory'}
                </span>
              </Button>
            </div>
          )}

          {currentStepData.id === 'visit-store' && (
            <div className="mb-4 sm:mb-6 text-center">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-6 rounded-xl mb-3 sm:mb-4">
                <div className="text-3xl sm:text-4xl mb-2">🏪</div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {currentLanguage === 'he' ? 'חזית חנות יפה עבור הלקוחות שלכם' : 'Beautiful public storefront for your customers'}
                </div>
              </div>
              <Button
                onClick={() => handleNavigateToPage('/store')}
                size="lg"
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-primary hover:bg-primary-dark text-primary-foreground flex items-center justify-center gap-2 sm:gap-3 rounded-xl active:scale-95 transition-all shadow-lg hover:shadow-xl"
              >
                <Store className="h-5 w-5 sm:h-6 sm:w-6" />
                <span>
                  {currentLanguage === 'he' ? 'עבור לחנות' : 'Go to Store'}
                </span>
              </Button>
            </div>
          )}

          {currentStepData.id === 'welcome' && (
            <div className="text-center mb-4 sm:mb-6">
              <div className="text-6xl sm:text-8xl mb-3 sm:mb-4">💎</div>
              <div className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                {currentLanguage === 'he' ? 'מערכת ניהול מלאי יהלומים מקצועית' : 'Professional Diamond Inventory Management'}
              </div>
            </div>
          )}

          {currentStepData.id === 'tutorial-complete' && (
            <div className="text-center mb-4 sm:mb-6">
              <div className="text-6xl sm:text-8xl mb-3 sm:mb-4">🎉</div>
            </div>
          )}
        </div>

        {/* Footer - Mobile optimized */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 bg-muted/30 flex flex-col gap-3 sm:gap-4 flex-shrink-0" dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}>
          {/* Main action buttons for non-navigation steps */}
          {!currentStepData.navigationTarget && !currentStepData.requireClick && (
            <Button
              onClick={isLastStep ? handleFinishTutorial : handleNext}
              size="lg"
              className={`w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-primary hover:bg-primary-dark text-primary-foreground flex items-center justify-center gap-2 sm:gap-3 rounded-xl active:scale-95 transition-all shadow-lg hover:shadow-xl ${currentLanguage === 'he' ? 'flex-row-reverse' : ''}`}
            >
              {currentLanguage === 'he' ? (
                <>
                  {isLastStep ? (
                    <span>סיום</span>
                  ) : (
                    <>
                      <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>הبא</span>
                    </>
                  )}
                </>
              ) : (
                <>
                  <span>{isLastStep ? 'Finish' : 'Next'}</span>
                  {!isLastStep && <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />}
                </>
              )}
            </Button>
          )}

          {/* Secondary navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={isFirstStep}
              className={`flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base px-3 sm:px-4 py-2 active:scale-95 transition-all ${currentLanguage === 'he' ? 'flex-row-reverse' : ''}`}
            >
              {currentLanguage === 'he' ? (
                <>
                  <span>קודם</span>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </>
              ) : (
                <>
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Previous</span>
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground text-sm sm:text-base px-3 sm:px-4 py-2 active:scale-95 transition-all"
            >
              {currentLanguage === 'he' ? 'דلג על הסיור' : 'Skip Tour'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

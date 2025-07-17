
import React, { useEffect } from 'react';
import { useTutorial } from '@/contexts/TutorialContext';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramMainButton } from '@/hooks/useTelegramMainButton';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, Sparkles, Globe, ArrowLeft, ExternalLink, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

  const handleStartCertificateScan = () => {
    hapticFeedback.impact('medium');
    navigate('/upload');
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
      
      // Simple haptic feedback for interactions
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
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ height: 'var(--tg-viewport-height, 100vh)' }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleSkip} />
      
      {/* Modal */}
      <div className="relative bg-background rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-scale-in border border-border">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4 text-primary-foreground">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold text-sm">
                {currentLanguage === 'he' ? 'שלב' : 'Step'} {currentStep + 1} {currentLanguage === 'he' ? 'מתוך' : 'of'} {totalSteps}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  hapticFeedback.selection();
                  setLanguage(currentLanguage === 'en' ? 'he' : 'en');
                }}
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors p-1 rounded"
                title={currentLanguage === 'en' ? 'עברית' : 'English'}
              >
                <Globe className="h-4 w-4" />
              </button>
              <button
                onClick={handleSkip}
                className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-primary-foreground/20"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-foreground mb-4" dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}>
            {currentStepData.title[currentLanguage]}
          </h2>
          
          <div className="text-lg text-foreground mb-6 leading-relaxed" dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}>
            {currentStepData.content[currentLanguage]}
          </div>

          {/* Large visual indicator for required clicks */}
          {currentStepData.requireClick && (
            <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg text-center">
              <div className="text-primary font-bold text-lg mb-2" dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}>
                {currentLanguage === 'he' ? '👆 לחצו כאן למעלה' : '👆 Click Above'}
              </div>
              <div className="text-sm text-muted-foreground" dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}>
                {currentLanguage === 'he' ? 'אני אחכה עד שתלחצו' : 'I will wait for you to click'}
              </div>
            </div>
          )}

          {/* Special "Start Certificate Scan" button for tutorial */}
          {currentStepData.id === 'welcome' && (
            <div className="mb-6 space-y-3">
              <Button
                onClick={handleStartCertificateScan}
                size="lg"
                className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-3"
                dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}
              >
                <Camera className="h-6 w-6" />
                <span>
                  {currentLanguage === 'he' ? 'התחל סריקת תעודה' : 'Start Certificate Scan'}
                </span>
              </Button>
              <div className="text-xs text-center text-muted-foreground" dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}>
                {currentLanguage === 'he' 
                  ? 'לחץ כאן כדי לעבור ישירות לסריקת תעודת GIA' 
                  : 'Click here to go directly to GIA certificate scanning'
                }
              </div>
            </div>
          )}

          {/* Welcome step special illustration */}
          {currentStepData.id === 'welcome' && (
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">💎</div>
              <div className="text-sm text-gray-500">
                Professional Diamond Inventory Management
              </div>
            </div>
          )}

          {/* Section-specific illustrations */}
          {currentStepData.section === 'dashboard' && (
            <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">📊</div>
                <div>Analytics</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">💰</div>
                <div>Revenue</div>
              </div>
            </div>
          )}

          {currentStepData.section === 'inventory' && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="text-sm text-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <span>✨ Add Diamond</span>
                  <span>🔍 Search & Filter</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>✏️ Edit Details</span>
                  <span>👁️ Store Visibility</span>
                </div>
              </div>
            </div>
          )}

          {currentStepData.section === 'store' && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-6 text-center">
              <div className="text-2xl mb-2">🏪</div>
              <div className="text-sm text-gray-600">
                Beautiful public storefront for your customers
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-6 bg-muted/30 flex flex-col gap-4" dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}>
          {/* Main action buttons - Much larger for mobile */}
          {!currentStepData.requireClick && (
            <Button
              onClick={handleNext}
              size="lg"
              className={`w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-3 ${currentLanguage === 'he' ? 'flex-row-reverse' : ''}`}
            >
              {currentLanguage === 'he' ? (
                <>
                  {isLastStep ? (
                    <span>סיום המדריך</span>
                  ) : (
                    <>
                      <ChevronLeft className="h-5 w-5" />
                      <span>המשך</span>
                    </>
                  )}
                </>
              ) : (
                <>
                  <span>{isLastStep ? 'Complete Tutorial' : 'Continue'}</span>
                  {!isLastStep && <ChevronRight className="h-5 w-5" />}
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
              className={`flex items-center gap-2 ${currentLanguage === 'he' ? 'flex-row-reverse' : ''}`}
            >
              {currentLanguage === 'he' ? (
                <>
                  <span>קודם</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </>
              )}
            </Button>

            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground"
            >
              {currentLanguage === 'he' ? 'דלג על המדריך' : 'Skip Tutorial'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


import React, { useEffect } from 'react';
import { useTutorial } from '@/contexts/TutorialContext';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, Sparkles, Globe, ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TutorialModal() {
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
  } = useTutorial();
  
  const { hapticFeedback, mainButton, backButton } = useTelegramWebApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
      
      // Setup Telegram main button for primary action
      if (currentStepData?.actions?.primary && currentStepData.navigationTarget) {
        const buttonText = currentStepData.actions.primary[currentLanguage];
        mainButton.show(buttonText, () => {
          hapticFeedback.impact('medium');
          handleNavigationAction();
        }, '#007AFF');
      } else {
        mainButton.hide();
      }
      
      // Setup back button
      if (currentStep > 0) {
        backButton.show(() => {
          hapticFeedback.impact('light');
          prevStep();
        });
      } else {
        backButton.hide();
      }
    } else {
      document.body.style.overflow = 'unset';
      mainButton.hide();
      backButton.hide();
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      mainButton.hide();
      backButton.hide();
    };
  }, [isActive, currentStepData, currentLanguage, currentStep]);

  const handleNavigationAction = () => {
    if (currentStepData?.navigationTarget) {
      hapticFeedback.notification('success');
      navigate(currentStepData.navigationTarget);
      // Continue tutorial after navigation
      setTimeout(() => {
        nextStep();
      }, 500);
    } else {
      nextStep();
    }
  };

  if (!isActive || !currentStepData) return null;

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ height: 'var(--tg-viewport-height, 100vh)' }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => {
        hapticFeedback.impact('light');
        skipTutorial();
      }} />
      
      {/* Modal */}
      <div className="relative bg-background dark:bg-background rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-scale-in border border-border">
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
                title={currentLanguage === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
              >
                <Globe className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  hapticFeedback.impact('light');
                  skipTutorial();
                }}
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
          <h2 className="text-xl font-bold text-foreground mb-3" dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}>
            {currentStepData.title[currentLanguage]}
          </h2>
          
          <div className="text-muted-foreground mb-6 leading-relaxed" dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}>
            {currentStepData.content[currentLanguage]}
          </div>

          {/* Navigation Button for specific steps */}
          {currentStepData.navigationTarget && (
            <div className="mb-6">
              <Button
                onClick={() => {
                  hapticFeedback.impact('medium');
                  handleNavigationAction();
                }}
                className="w-full h-12 text-lg font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm active:scale-95 transition-all"
                dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}
              >
                <ExternalLink className={`h-5 w-5 ${currentLanguage === 'he' ? 'ml-2' : 'mr-2'}`} />
                {currentStepData.actions?.primary?.[currentLanguage] || 
                 (currentLanguage === 'he' ? 'קח אותי לשם' : 'Take Me There')}
              </Button>
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
        <div className="px-6 py-4 bg-muted/50 flex items-center justify-between" dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}>
            <Button
              variant="outline"
              onClick={() => {
                hapticFeedback.impact('light');
                prevStep();
              }}
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

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  hapticFeedback.impact('light');
                  skipTutorial();
                }}
                className="text-muted-foreground"
              >
                {isLastStep 
                  ? (currentLanguage === 'he' ? 'סגור' : 'Close')
                  : (currentLanguage === 'he' ? 'דלג על הסיור' : 'Skip Tour')
                }
              </Button>
              
              {/* Only show next button if no navigation action is required */}
              {!currentStepData.navigationTarget && (
                <Button
                  onClick={() => {
                    hapticFeedback.impact('medium');
                    nextStep();
                  }}
                  className={`bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 ${currentLanguage === 'he' ? 'flex-row-reverse' : ''}`}
                >
                  {currentLanguage === 'he' ? (
                    <>
                      {isLastStep ? (
                        <span>סיום</span>
                      ) : (
                        <>
                          <ChevronLeft className="h-4 w-4" />
                          <span>הבא</span>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <span>{isLastStep ? 'Finish' : 'Next'}</span>
                      {!isLastStep && <ChevronRight className="h-4 w-4" />}
                    </>
                  )}
                </Button>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}

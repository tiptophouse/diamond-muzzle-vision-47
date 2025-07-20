import React from 'react';
import { X, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLiveTutorial } from '@/contexts/LiveTutorialContext';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

export function LiveTutorialModal() {
  const { 
    isActive, 
    currentStep, 
    steps, 
    language, 
    setLanguage,
    prevStep,
    closeTutorial,
    isStepCompleted
  } = useLiveTutorial();
  
  const { hapticFeedback } = useTelegramWebApp();

  if (!isActive) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleLanguageToggle = () => {
    hapticFeedback.selection();
    setLanguage(language === 'en' ? 'he' : 'en');
  };

  const handleClose = () => {
    hapticFeedback.impact('light');
    closeTutorial();
  };

  const handlePrevious = () => {
    hapticFeedback.impact('light');
    prevStep();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-background"
      style={{ 
        height: 'var(--tg-viewport-height, 100vh)',
        paddingTop: 'var(--tg-safe-area-inset-top, 0px)',
        paddingBottom: 'var(--tg-safe-area-inset-bottom, 0px)'
      }}
      dir={language === 'he' ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div 
        className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4"
        style={{ paddingTop: `max(16px, var(--tg-safe-area-inset-top, 0px))` }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{step.icon}</div>
            <div>
              <div className="text-sm font-medium opacity-90">
                {language === 'he' ? 'שלב' : 'Step'} {currentStep + 1} {language === 'he' ? 'מתוך' : 'of'} {steps.length}
              </div>
              <div className="text-xs opacity-75">
                {language === 'he' ? 'סיור מערכת' : 'System Tour'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLanguageToggle}
              className="text-white hover:bg-white/20 text-xs px-2 py-1 h-8 min-w-[40px]"
            >
              <Globe className="h-4 w-4 mr-1" />
              {language === 'en' ? 'עב' : 'EN'}
            </Button>
            
            {/* Close Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-white hover:bg-white/20 p-2 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <Progress 
          value={progress} 
          className="h-2 bg-white/20"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Step Content */}
        <div className="flex-1 p-6 flex flex-col justify-center items-center text-center">
          <div className="max-w-sm mx-auto space-y-6">
            {/* Step Icon */}
            <div className="text-6xl mb-4">
              {step.icon}
            </div>
            
            {/* Step Title */}
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {step.title[language]}
            </h2>
            
            {/* Step Description */}
            <p className="text-muted-foreground text-base leading-relaxed mb-8">
              {step.description[language]}
            </p>
            
            {/* Step Completion Indicator */}
            {isStepCompleted(currentStep) && (
              <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                <div className="text-2xl">✅</div>
                <span className="font-medium">
                  {language === 'he' ? 'הושלם!' : 'Completed!'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Controls (only show if not using main button) */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between max-w-sm mx-auto">
            {/* Previous Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {language === 'he' ? 'הקודם' : 'Previous'}
            </Button>
            
            {/* Step Indicators */}
            <div className="flex gap-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-primary scale-125'
                      : index < currentStep || isStepCompleted(index)
                      ? 'bg-green-500'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            
            {/* Skip Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-muted-foreground"
            >
              {language === 'he' ? 'דלג' : 'Skip'}
            </Button>
          </div>
        </div>
      </div>

      {/* iPhone safe area bottom padding */}
      <div style={{ height: 'var(--tg-safe-area-inset-bottom, 0px)' }} />
    </div>
  );
}
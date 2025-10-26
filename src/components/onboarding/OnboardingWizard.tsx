import React, { useEffect } from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Upload, 
  BarChart3, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  X,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

const stepIcons: Record<string, React.ReactNode> = {
  welcome: <Sparkles className="h-8 w-8" />,
  'upload-first': <Upload className="h-8 w-8" />,
  'view-dashboard': <BarChart3 className="h-8 w-8" />,
  complete: <CheckCircle2 className="h-8 w-8" />
};

const stepColors: Record<string, string> = {
  welcome: 'from-blue-500 to-purple-600',
  'upload-first': 'from-green-500 to-emerald-600',
  'view-dashboard': 'from-orange-500 to-red-600',
  complete: 'from-pink-500 to-rose-600'
};

export function OnboardingWizard() {
  const {
    isActive,
    currentStep,
    totalSteps,
    steps,
    language,
    nextStep,
    prevStep,
    skipOnboarding,
    setLanguage
  } = useOnboarding();

  const currentStepData = steps[currentStep];
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  // Telegram WebApp integration
  useEffect(() => {
    if (!isActive) return;

    const tg = window.Telegram?.WebApp as any;
    if (tg) {
      // Enable haptic feedback
      if (tg.HapticFeedback?.impactOccurred) {
        tg.HapticFeedback.impactOccurred('light');
      }

      // Show back button except on first step
      if (!isFirstStep) {
        tg.BackButton?.show();
        tg.BackButton?.onClick(prevStep);
      } else {
        tg.BackButton?.hide();
      }

      // Configure main button
      if (currentStepData.action && tg.MainButton) {
        tg.MainButton.setText(currentStepData.action[language]);
        tg.MainButton.show();
        tg.MainButton.onClick(nextStep);
      } else if (tg.MainButton) {
        tg.MainButton.hide();
      }
    }

    return () => {
      if (tg) {
        if (tg.BackButton?.offClick) {
          tg.BackButton.offClick(prevStep);
        }
        if (tg.MainButton?.offClick) {
          tg.MainButton.offClick(nextStep);
        }
      }
    };
  }, [isActive, currentStep, language]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border bg-card">
          <div className="container max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-semibold">
                  {language === 'he' ? 'הדרכה' : 'Onboarding'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {currentStep + 1} / {totalSteps}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Language Switcher */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLanguage(language === 'en' ? 'he' : 'en')}
                  className="h-8 px-2"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  {language === 'en' ? 'עב' : 'EN'}
                </Button>

                {/* Skip Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipOnboarding}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  {language === 'he' ? 'דלג' : 'Skip'}
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="container max-w-2xl mx-auto px-4 py-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 space-y-6">
                {/* Step Icon */}
                <div className="text-center">
                  <div
                    className={cn(
                      'w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white shadow-lg mb-4',
                      'bg-gradient-to-br',
                      stepColors[currentStepData.id]
                    )}
                  >
                    {stepIcons[currentStepData.id]}
                  </div>

                  {currentStepData.completed && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {language === 'he' ? 'הושלם' : 'Completed'}
                    </Badge>
                  )}
                </div>

                {/* Title & Description */}
                <div className="text-center space-y-3">
                  <h2 className="text-3xl font-bold text-foreground">
                    {currentStepData.title[language]}
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {currentStepData.description[language]}
                  </p>
                </div>

                {/* Action Button (for steps with actions) */}
                {currentStepData.action && (
                  <Button
                    onClick={nextStep}
                    size="lg"
                    className={cn(
                      'w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300',
                      'bg-gradient-to-r',
                      stepColors[currentStepData.id],
                      'text-white border-0'
                    )}
                  >
                    {currentStepData.action[language]}
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Button>
                )}

                {/* Navigation (for steps without actions) */}
                {!currentStepData.action && (
                  <div className="flex items-center gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={isFirstStep}
                      className="flex-1 h-12"
                    >
                      {language === 'he' ? (
                        <>
                          <span>קודם</span>
                          <ChevronRight className="h-4 w-4 mr-2" />
                        </>
                      ) : (
                        <>
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          <span>Previous</span>
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={nextStep}
                      className="flex-1 h-12"
                    >
                      {language === 'he' ? (
                        <>
                          <ChevronLeft className="h-4 w-4 ml-2" />
                          <span>{isLastStep ? 'סיום' : 'הבא'}</span>
                        </>
                      ) : (
                        <>
                          <span>{isLastStep ? 'Finish' : 'Next'}</span>
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step Indicators */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    index === currentStep ? 'w-8 bg-primary' : 'w-2 bg-muted',
                    index < currentStep && 'bg-green-500'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

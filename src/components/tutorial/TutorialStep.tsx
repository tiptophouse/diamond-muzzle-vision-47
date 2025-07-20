
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ChevronLeft, ChevronRight, Camera, Package, Store, Sparkles } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: { en: string; he: string };
  description: { en: string; he: string };
  action?: { en: string; he: string };
  icon: React.ReactNode;
  color: string;
  interactive?: boolean;
  completed?: boolean;
}

interface TutorialStepProps {
  step: TutorialStep;
  language: 'en' | 'he';
  onAction?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  isLastStep?: boolean;
}

export function TutorialStepComponent({ 
  step, 
  language, 
  onAction, 
  onNext, 
  onPrevious, 
  canGoNext = true, 
  canGoPrevious = true, 
  isLastStep = false 
}: TutorialStepProps) {
  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-0 space-y-6">
        {/* Step Icon */}
        <div className="text-center">
          <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg`}>
            {step.icon}
          </div>
          
          {/* Completion badge */}
          {step.completed && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              {language === 'he' ? 'הושלם' : 'Completed'}
            </Badge>
          )}
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            {step.title[language]}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {step.description[language]}
          </p>
        </div>

        {/* Interactive Action Button */}
        {step.interactive && step.action && onAction && (
          <div className="space-y-4">
            <Button
              onClick={onAction}
              size="lg"
              className={`w-full h-14 text-lg font-semibold bg-gradient-to-r ${step.color} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95`}
              style={{ minHeight: '56px' }}
            >
              <div className="flex items-center gap-3">
                {step.icon}
                <span>{step.action[language]}</span>
              </div>
            </Button>
          </div>
        )}

        {/* Navigation for non-interactive steps */}
        {!step.interactive && (
          <div className="flex items-center justify-between gap-4 pt-4">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={!canGoPrevious}
              className="flex-1 max-w-32 h-12"
              style={{ minHeight: '48px' }}
            >
              {language === 'he' ? (
                <>
                  <span>קודם</span>
                  <ChevronRight className="h-4 w-4 mr-1" />
                </>
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  <span>Previous</span>
                </>
              )}
            </Button>

            <Button
              onClick={onNext}
              disabled={!canGoNext}
              className="flex-1 max-w-32 h-12"
              style={{ minHeight: '48px' }}
            >
              {language === 'he' ? (
                <>
                  <ChevronLeft className="h-4 w-4 ml-1" />
                  <span>{isLastStep ? 'סיום' : 'הבא'}</span>
                </>
              ) : (
                <>
                  <span>{isLastStep ? 'Finish' : 'Next'}</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import React, { useEffect, useState } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { X, ChevronLeft, ChevronRight, Camera, Package, Store, Sparkles, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface TutorialStep {
  id: string;
  title: { en: string; he: string };
  description: { en: string; he: string };
  action?: { en: string; he: string };
  icon: React.ReactNode;
  color: string;
  route?: string;
  interactive?: boolean;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: { en: 'Welcome to Diamond Mazal', he: 'ברוכים הבאים למזל יהלומים' },
    description: { en: 'Your professional diamond inventory management system', he: 'המערכת המקצועית לניהול מלאי יהלומים' },
    icon: <Sparkles className="h-8 w-8" />,
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 'scan-certificate',
    title: { en: 'Scan Your Certificate', he: 'סרוק תעודה' },
    description: { en: 'Use your phone camera to scan GIA certificates and extract diamond details automatically', he: 'השתמש במצלמת הטלפון לסרוק תעודות GIA ולחלץ פרטי יהלומים אוטומטית' },
    action: { en: 'Try Scanning Now', he: 'נסה לסרוק עכשיו' },
    icon: <Camera className="h-8 w-8" />,
    color: 'from-green-500 to-emerald-600',
    route: '/upload?action=scan',
    interactive: true
  },
  {
    id: 'manage-inventory',
    title: { en: 'Manage Your Inventory', he: 'נהל את המלאי שלך' },
    description: { en: 'View, edit, and organize your diamond collection with powerful search and filter tools', he: 'צפה, ערוך וארגן את אוסף היהלומים שלך עם כלי חיפוש וסינון חזקים' },
    action: { en: 'Explore Inventory', he: 'עיין במלאי' },
    icon: <Package className="h-8 w-8" />,
    color: 'from-orange-500 to-red-600',
    route: '/inventory'
  },
  {
    id: 'public-store',
    title: { en: 'Share Your Store', he: 'שתף את החנות שלך' },
    description: { en: 'Create a beautiful public storefront to showcase your diamonds to customers', he: 'צור חזית חנות יפה להצגת היהלומים שלך ללקוחות' },
    action: { en: 'Visit Store', he: 'בקר בחנות' },
    icon: <Store className="h-8 w-8" />,
    color: 'from-pink-500 to-violet-600',
    route: '/store'
  }
];

interface MobileTutorialWizardProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'he';
  onLanguageChange: (lang: 'en' | 'he') => void;
}

export function MobileTutorialWizard({ isOpen, onClose, language, onLanguageChange }: MobileTutorialWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const { hapticFeedback, mainButton, backButton, showAlert } = useTelegramWebApp();
  const navigate = useNavigate();

  const currentStepData = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const progressPercentage = ((currentStep + 1) / tutorialSteps.length) * 100;

  // Handle Telegram main button
  useEffect(() => {
    if (!isOpen) return;

    if (currentStepData?.interactive) {
      mainButton.hide();
    } else {
      const buttonText = isLastStep 
        ? (language === 'he' ? 'סיום הסיור' : 'Finish Tour')
        : (language === 'he' ? 'הבא' : 'Next');
      
      mainButton.show(buttonText, handleNext, '#007AFF');
    }

    return () => {
      mainButton.hide();
    };
  }, [isOpen, currentStep, language, isLastStep]);

  // Handle Telegram back button
  useEffect(() => {
    if (!isOpen) return;

    if (currentStep > 0) {
      backButton.show(handlePrevious);
    } else {
      backButton.hide();
    }

    return () => {
      backButton.hide();
    };
  }, [isOpen, currentStep]);

  const handleNext = () => {
    hapticFeedback.impact('medium');
    
    if (isLastStep) {
      handleFinish();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    hapticFeedback.impact('light');
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStepAction = async (route?: string) => {
    if (!route) return;

    hapticFeedback.impact('medium');
    
    // Mark step as completed
    const stepId = currentStepData.id;
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
      hapticFeedback.notification('success');
    }

    // Navigate to the route
    navigate(route);
    
    // Close tutorial or move to next step
    if (isLastStep) {
      handleFinish();
    } else {
      // Small delay to show completion feedback
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 500);
    }
  };

  const handleFinish = () => {
    hapticFeedback.notification('success');
    showAlert(language === 'he' 
      ? 'סיור הסתיים! כעת תוכל להתחיל להשתמש במערכת' 
      : 'Tutorial completed! You can now start using the system');
    onClose();
  };

  const handleSkip = () => {
    hapticFeedback.impact('light');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-hidden" style={{ height: 'var(--tg-viewport-height, 100vh)' }}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${currentStepData.color} p-4 text-white relative`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-white">
              {currentStepData.icon}
            </div>
            <div>
              <div className="text-sm opacity-90">
                {language === 'he' ? 'שלב' : 'Step'} {currentStep + 1} {language === 'he' ? 'מתוך' : 'of'} {tutorialSteps.length}
              </div>
              <div className="text-xs opacity-75">
                {language === 'he' ? 'סיור במערכת' : 'System Tour'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLanguageChange(language === 'en' ? 'he' : 'en')}
              className="text-white hover:bg-white/20 text-xs px-2 py-1"
            >
              {language === 'en' ? 'עב' : 'EN'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-white hover:bg-white/20 p-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Progress 
          value={progressPercentage} 
          className="h-2 bg-white/20"
        />
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto" dir={language === 'he' ? 'rtl' : 'ltr'}>
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="p-0 space-y-6">
            {/* Step Icon */}
            <div className="text-center">
              <div className={`w-20 h-20 bg-gradient-to-br ${currentStepData.color} rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-lg`}>
                {currentStepData.icon}
              </div>
              
              {/* Completion badge */}
              {completedSteps.includes(currentStepData.id) && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {language === 'he' ? 'הושלם' : 'Completed'}
                </Badge>
              )}
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                {currentStepData.title[language]}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {currentStepData.description[language]}
              </p>
            </div>

            {/* Interactive Action Button */}
            {currentStepData.interactive && currentStepData.action && (
              <div className="space-y-4">
                <Button
                  onClick={() => handleStepAction(currentStepData.route)}
                  size="lg"
                  className={`w-full h-14 text-lg font-semibold bg-gradient-to-r ${currentStepData.color} text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 active:scale-95`}
                >
                  <div className="flex items-center gap-3">
                    {currentStepData.icon}
                    <span>{currentStepData.action[language]}</span>
                  </div>
                </Button>
                
                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={handleNext}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {language === 'he' ? 'דلג על השלב הזה' : 'Skip this step'}
                  </Button>
                </div>
              </div>
            )}

            {/* Non-interactive steps */}
            {!currentStepData.interactive && currentStepData.route && (
              <Button
                onClick={() => handleStepAction(currentStepData.route)}
                variant="outline"
                size="lg"
                className="w-full h-12 text-base"
              >
                {currentStepData.action?.[language] || (language === 'he' ? 'עיין' : 'Explore')}
              </Button>
            )}

            {/* Progress Indicators */}
            <div className="flex justify-center space-x-2 pt-4">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-primary scale-125'
                      : index < currentStep
                      ? 'bg-primary/60'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation - Only show for non-interactive steps */}
      {!currentStepData.interactive && (
        <div className="p-4 border-t bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex-1 max-w-24"
              dir={language === 'he' ? 'rtl' : 'ltr'}
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

            <div className="text-center text-sm text-muted-foreground">
              {currentStep + 1} / {tutorialSteps.length}
            </div>

            <Button
              onClick={handleNext}
              className="flex-1 max-w-24"
              dir={language === 'he' ? 'rtl' : 'ltr'}
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
        </div>
      )}
    </div>
  );
}
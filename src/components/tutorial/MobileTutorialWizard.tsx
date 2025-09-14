
import React, { useEffect, useState } from 'react';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { X, Globe, Upload, Package, Store, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TutorialStepComponent } from './TutorialStep';
import { QRCodeScanner } from '@/components/inventory/QRCodeScanner';
import { useToast } from '@/hooks/use-toast';

interface TutorialStep {
  id: string;
  title: { en: string; he: string };
  description: { en: string; he: string };
  action?: { en: string; he: string };
  icon: React.ReactNode;
  color: string;
  interactive?: boolean;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: { en: 'Welcome to Diamond Mazal', he: 'ברוכים הבאים למזל יהלומים' },
    description: { en: 'Your professional diamond inventory management system designed for mobile-first experience', he: 'המערכת המקצועית לניהול מלאי יהלומים המיועדת לחוויה ניידת' },
    icon: <Sparkles className="h-8 w-8" />,
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 'add-diamond',
    title: { en: 'Add Your First Diamond', he: 'הוסף את היהלום הראשון שלך' },
    description: { en: 'Let\'s start by adding your first diamond to the system', he: 'בואו נתחיל בהוספת היהלום הראשון שלך למערכת' },
    action: { en: 'Upload Single Diamond', he: 'העלה יהלום יחיד' },
    icon: <Upload className="h-8 w-8" />,
    color: 'from-green-500 to-emerald-600',
    interactive: true
  },
  {
    id: 'view-dashboard',
    title: { en: 'View Your Dashboard', he: 'צפה בלוח הבקרה שלך' },
    description: { en: 'See how your uploaded diamond appears in your dashboard with analytics and insights', he: 'ראה כיצד היהלום שהעלית מופיע בלוח הבקרה שלך עם אנליטיקה ותובנות' },
    action: { en: 'View Dashboard', he: 'צפה בלוח הבקרה' },
    icon: <Package className="h-8 w-8" />,
    color: 'from-orange-500 to-red-600',
    interactive: true
  },
  {
    id: 'view-store',
    title: { en: 'Check Your Store', he: 'בדוק את החנות שלך' },
    description: { en: 'See how your diamond looks in your public store that customers will see', he: 'ראה כיצד היהלום שלך נראה בחנות הציבורית שלקוחות יראו' },
    action: { en: 'View Store', he: 'צפה בחנות' },
    icon: <Store className="h-8 w-8" />,
    color: 'from-pink-500 to-violet-600',
    interactive: true
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
  const [isScanning, setIsScanning] = useState(false);
  const [scanCompleted, setScanCompleted] = useState(false);
  
  const { hapticFeedback, mainButton, backButton } = useTelegramWebApp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const currentStepData = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const progressPercentage = ((currentStep + 1) / tutorialSteps.length) * 100;

  // Handle Telegram main button
  useEffect(() => {
    if (!isOpen) return;

    if (currentStepData?.interactive) {
      mainButton.hide(); // Hide main button for interactive steps
    } else {
      const buttonText = isLastStep 
        ? (language === 'he' ? 'סיום הסיור' : 'Finish Tour')
        : (language === 'he' ? 'הבא' : 'Next');
      
      mainButton.show(buttonText, handleNext);
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

  const handleStepAction = () => {
    hapticFeedback.impact('medium');
    
    if (currentStepData.id === 'add-diamond') {
      onClose();
      navigate('/upload-single-stone');
    } else if (currentStepData.id === 'view-dashboard') {
      onClose();
      navigate('/dashboard');
    } else if (currentStepData.id === 'view-store') {
      onClose();
      navigate('/store');
    }
  };

  const handleScanSuccess = (giaData: any) => {
    hapticFeedback.notification('success');
    setIsScanning(false);
    setScanCompleted(true);
    
    // Mark step as completed
    const stepId = currentStepData.id;
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }

    toast({
      title: language === 'he' ? '✅ סריקה הצליחה!' : '✅ Scan Successful!',
      description: language === 'he' 
        ? 'תעודת GIA נסרקה בהצלחה. כעת תוכל להמשיך בסיור'
        : 'GIA certificate scanned successfully. You can now continue the tour'
    });

    // Auto advance to next step after scan success
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 1500);
  };

  const handleScanClose = () => {
    hapticFeedback.impact('light');
    setIsScanning(false);
  };

  const handleFinish = () => {
    hapticFeedback.notification('success');
    toast({
      title: language === 'he' ? 'סיור הסתיים!' : 'Tutorial Complete!',
      description: language === 'he' 
        ? 'כעת תוכל להתחיל להשתמש במערכת'
        : 'You can now start using the system'
    });
    onClose();
  };

  const handleSkip = () => {
    hapticFeedback.impact('light');
    onClose();
  };

  if (!isOpen) return null;

  // Show scanner with higher z-index when scanning
  if (isScanning) {
    return (
      <div className="fixed inset-0 z-[60]">
        <QRCodeScanner
          isOpen={true}
          onClose={handleScanClose}
          onScanSuccess={handleScanSuccess}
        />
      </div>
    );
  }

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
              onClick={() => {
                hapticFeedback.selection();
                onLanguageChange(language === 'en' ? 'he' : 'en');
              }}
              className="text-white hover:bg-white/20 text-xs px-2 py-1 h-8"
              style={{ minHeight: '32px' }}
            >
              <Globe className="h-4 w-4 mr-1" />
              {language === 'en' ? 'עב' : 'EN'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-white hover:bg-white/20 p-2 h-8"
              style={{ minHeight: '32px' }}
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
        <TutorialStepComponent
          step={{
            ...currentStepData,
            completed: completedSteps.includes(currentStepData.id) || (currentStepData.id === 'scan-certificate' && scanCompleted)
          }}
          language={language}
          onAction={handleStepAction}
          onNext={handleNext}
          onPrevious={handlePrevious}
          canGoNext={true}
          canGoPrevious={currentStep > 0}
          isLastStep={isLastStep}
        />

        {/* Progress Indicators */}
        <div className="flex justify-center space-x-2 pt-8">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'bg-primary scale-125'
                  : index < currentStep || completedSteps.includes(tutorialSteps[index].id)
                  ? 'bg-green-500'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

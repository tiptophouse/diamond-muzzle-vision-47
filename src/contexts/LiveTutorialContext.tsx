import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface TutorialStep {
  id: string;
  title: { en: string; he: string };
  description: { en: string; he: string };
  action: { en: string; he: string };
  route: string;
  buttonColor: string;
  icon: string;
  completed?: boolean;
}

interface LiveTutorialContextType {
  isActive: boolean;
  currentStep: number;
  steps: TutorialStep[];
  language: 'en' | 'he';
  startTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  closeTutorial: () => void;
  setLanguage: (lang: 'en' | 'he') => void;
  executeStepAction: () => void;
  isStepCompleted: (stepIndex: number) => boolean;
  markStepCompleted: (stepIndex: number) => void;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: { en: 'Welcome to Diamond Mazal', he: 'ברוכים הבאים למזל יהלומים' },
    description: { en: 'Let\'s take a quick tour of your diamond management system', he: 'בואו נערך סיור קצר במערכת ניהול היהלומים שלכם' },
    action: { en: 'Start Tour', he: 'התחל סיור' },
    route: '/',
    buttonColor: '#3b82f6',
    icon: '💎'
  },
  {
    id: 'upload',
    title: { en: 'Upload Your First Diamond', he: 'העלה את היהלום הראשון שלך' },
    description: { en: 'Add diamonds to your inventory by uploading certificates or entering details manually', he: 'הוסף יהלומים למלאי שלך על ידי העלאת תעודות או הזנת פרטים ידנית' },
    action: { en: 'Upload File', he: 'העלה קובץ' },
    route: '/upload',
    buttonColor: '#059669',
    icon: '📤'
  },
  {
    id: 'inventory',
    title: { en: 'Manage Your Inventory', he: 'נהל את המלאי שלך' },
    description: { en: 'View, search, and organize all your diamonds in one place', he: 'צפה, חפש וארגן את כל היהלומים שלך במקום אחד' },
    action: { en: 'View Inventory', he: 'צפה במלאי' },
    route: '/inventory',
    buttonColor: '#7c3aed',
    icon: '📦'
  },
  {
    id: 'store',
    title: { en: 'Public Store', he: 'חנות ציבורית' },
    description: { en: 'Share your diamonds with customers through your public store', he: 'שתף את היהלומים שלך עם לקוחות דרך החנות הציבורית שלך' },
    action: { en: 'Visit Store', he: 'בקר בחנות' },
    route: '/store',
    buttonColor: '#dc2626',
    icon: '🏪'
  },
  {
    id: 'chat',
    title: { en: 'AI Assistant', he: 'עוזר AI' },
    description: { en: 'Get help with diamond questions and business insights', he: 'קבל עזרה עם שאלות יהלומים ותובנות עסקיות' },
    action: { en: 'Try Chat', he: 'נסה צ\'אט' },
    route: '/chat',
    buttonColor: '#0ea5e9',
    icon: '💬'
  },
  {
    id: 'insights',
    title: { en: 'Business Insights', he: 'תובנות עסקיות' },
    description: { en: 'Track your performance and get market insights', he: 'עקוב אחר הביצועים שלך וקבל תובנות שוק' },
    action: { en: 'View Insights', he: 'צפה בתובנות' },
    route: '/insights',
    buttonColor: '#f59e0b',
    icon: '📊'
  },
  {
    id: 'complete',
    title: { en: 'Tutorial Complete!', he: 'הדרכה הושלמה!' },
    description: { en: 'You\'re ready to start managing your diamond business', he: 'אתה מוכן להתחיל לנהל את עסק היהלומים שלך' },
    action: { en: 'Finish', he: 'סיום' },
    route: '/',
    buttonColor: '#10b981',
    icon: '✅'
  }
];

const LiveTutorialContext = createContext<LiveTutorialContextType | null>(null);

export function LiveTutorialProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [language, setLanguage] = useState<'en' | 'he'>('en');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { hapticFeedback, mainButton } = useTelegramWebApp();

  const currentStepData = tutorialSteps[currentStep];

  // Configure Telegram main button
  useEffect(() => {
    if (!isActive) {
      mainButton.hide();
      return;
    }

    const step = tutorialSteps[currentStep];
    const buttonText = step.action[language];
    
    mainButton.show(buttonText, executeStepAction, step.buttonColor);

    return () => {
      mainButton.hide();
    };
  }, [isActive, currentStep, language]);

  const startTutorial = () => {
    hapticFeedback.impact('medium');
    setIsActive(true);
    setCurrentStep(0);
    setCompletedSteps([]);
  };

  const nextStep = () => {
    hapticFeedback.impact('light');
    
    // Mark current step as completed
    markStepCompleted(currentStep);
    
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      closeTutorial();
    }
  };

  const prevStep = () => {
    hapticFeedback.impact('light');
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const closeTutorial = () => {
    hapticFeedback.notification('success');
    setIsActive(false);
    setCurrentStep(0);
    mainButton.hide();
  };

  const executeStepAction = () => {
    hapticFeedback.impact('medium');
    
    const step = tutorialSteps[currentStep];
    
    if (step.id === 'complete') {
      closeTutorial();
      return;
    }

    // Navigate to the step's route
    navigate(step.route);
    
    // For upload step, trigger file input
    if (step.id === 'upload') {
      setTimeout(() => {
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.click();
        }
      }, 500);
    }
    
    // Auto advance to next step after navigation
    setTimeout(() => {
      nextStep();
    }, 1000);
  };

  const isStepCompleted = (stepIndex: number) => {
    return completedSteps.includes(stepIndex);
  };

  const markStepCompleted = (stepIndex: number) => {
    setCompletedSteps(prev => 
      prev.includes(stepIndex) ? prev : [...prev, stepIndex]
    );
  };

  const value: LiveTutorialContextType = {
    isActive,
    currentStep,
    steps: tutorialSteps,
    language,
    startTutorial,
    nextStep,
    prevStep,
    closeTutorial,
    setLanguage,
    executeStepAction,
    isStepCompleted,
    markStepCompleted
  };

  return (
    <LiveTutorialContext.Provider value={value}>
      {children}
    </LiveTutorialContext.Provider>
  );
}

export function useLiveTutorial() {
  const context = useContext(LiveTutorialContext);
  if (!context) {
    throw new Error('useLiveTutorial must be used within a LiveTutorialProvider');
  }
  return context;
}
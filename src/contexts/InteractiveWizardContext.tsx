
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';

interface WizardStep {
  id: string;
  title: { en: string; he: string };
  content: { en: string; he: string };
  targetElement?: string;
  section: string;
  order: number;
  requireClick?: boolean;
  navigationTarget?: string;
  actions?: {
    primary?: { en: string; he: string };
    secondary?: { en: string; he: string };
  };
}

interface InteractiveWizardContextType {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  currentStepData: WizardStep | null;
  currentLanguage: 'en' | 'he';
  startWizard: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipWizard: () => void;
  restartWizard: () => void;
  hasSeenWizard: boolean;
  setLanguage: (lang: 'en' | 'he') => void;
  waitingForClick: boolean;
  handleRequiredClick: () => void;
  completedSteps: string[];
}

const InteractiveWizardContext = createContext<InteractiveWizardContextType | undefined>(undefined);

const wizardSteps: WizardStep[] = [
  {
    id: 'welcome',
    title: { 
      en: 'Welcome to Diamond Management! 💎', 
      he: 'ברוכים הבאים לניהול יהלומים! 💎' 
    },
    content: { 
      en: 'Let\'s get started with uploading your first diamond!',
      he: 'בואו נתחיל בהעלאת היהלום הראשון שלכם!'
    },
    section: 'welcome',
    order: 1,
    actions: { 
      primary: { en: 'Start Now', he: 'התחל עכשיו' }, 
      secondary: { en: 'Skip', he: 'דלג' } 
    }
  },
  {
    id: 'upload',
    title: { 
      en: 'Upload Your First Diamond', 
      he: 'העלה את היהלום הראשון שלך' 
    },
    content: { 
      en: 'Navigate to the upload section to add your diamond.',
      he: 'נווט לקטע ההעלאה כדי להוסיף את היהלום שלך.'
    },
    section: 'upload',
    order: 2,
    navigationTarget: '/upload',
    actions: { 
      primary: { en: 'Go to Upload', he: 'עבור להעלאה' }, 
      secondary: { en: 'Skip', he: 'דלג' } 
    }
  },
  {
    id: 'complete',
    title: { 
      en: 'Wizard Complete! 🎉', 
      he: 'המדריך הושלם! 🎉' 
    },
    content: { 
      en: 'You\'ve completed the setup wizard!',
      he: 'השלמת את מדריך ההגדרה!'
    },
    section: 'complete',
    order: 3,
    actions: { 
      primary: { en: 'Finish', he: 'סיום' }
    }
  }
];

export function InteractiveWizardProvider({ children }: { children: React.ReactNode }) {
  const { user } = useTelegramAuth();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenWizard, setHasSeenWizard] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'he'>('he');
  const [waitingForClick, setWaitingForClick] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Check if user has seen wizard
  useEffect(() => {
    const seen = localStorage.getItem(`wizard-completed-${currentLanguage}`);
    const steps = localStorage.getItem(`wizard-completed-steps-${currentLanguage}`);
    
    setHasSeenWizard(!!seen);
    setCompletedSteps(steps ? JSON.parse(steps) : []);
    
    // Auto-start for new users
    if (!seen && !isActive && user) {
      setTimeout(() => setIsActive(true), 1000);
    }
  }, [currentLanguage, user]);

  // Detect language from Telegram user data
  useEffect(() => {
    const savedLang = localStorage.getItem('wizard-language') as 'en' | 'he' | null;
    
    if (savedLang) {
      setCurrentLanguage(savedLang);
    } else if (user?.language_code) {
      const detectedLang = user.language_code.startsWith('he') ? 'he' : 
                           user.language_code.startsWith('en') ? 'en' : 'he';
      setCurrentLanguage(detectedLang);
      localStorage.setItem('wizard-language', detectedLang);
    }
  }, [user]);

  const startWizard = () => {
    console.log('🧙‍♂️ Starting interactive wizard...');
    setCurrentStep(0);
    setIsActive(true);
    setWaitingForClick(false);
    setCompletedSteps([]);
  };

  const nextStep = () => {
    const currentStepData = wizardSteps[currentStep];
    
    // Mark current step as completed
    if (currentStepData) {
      const newCompletedSteps = [...completedSteps, currentStepData.id];
      setCompletedSteps(newCompletedSteps);
      localStorage.setItem(`wizard-completed-steps-${currentLanguage}`, JSON.stringify(newCompletedSteps));
    }

    if (currentStep < wizardSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setWaitingForClick(false);
    } else {
      skipWizard();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setWaitingForClick(false);
    }
  };

  const skipWizard = () => {
    console.log('🧙‍♂️ Wizard completed/skipped');
    setIsActive(false);
    setCurrentStep(0);
    setWaitingForClick(false);
    localStorage.setItem(`wizard-completed-${currentLanguage}`, 'true');
    setHasSeenWizard(true);
  };

  const restartWizard = () => {
    localStorage.removeItem(`wizard-completed-${currentLanguage}`);
    localStorage.removeItem(`wizard-completed-steps-${currentLanguage}`);
    setHasSeenWizard(false);
    setCompletedSteps([]);
    startWizard();
  };

  const setLanguage = (lang: 'en' | 'he') => {
    setCurrentLanguage(lang);
    localStorage.setItem('wizard-language', lang);
  };

  const handleRequiredClick = () => {
    if (waitingForClick) {
      setWaitingForClick(false);
      setTimeout(() => nextStep(), 500);
    }
  };

  // Set waiting for click when step requires it
  useEffect(() => {
    const currentStepData = wizardSteps[currentStep];
    if (currentStepData?.requireClick) {
      setWaitingForClick(true);
    }
  }, [currentStep]);

  const currentStepData = wizardSteps[currentStep] || null;

  return (
    <InteractiveWizardContext.Provider
      value={{
        isActive,
        currentStep,
        totalSteps: wizardSteps.length,
        currentStepData,
        currentLanguage,
        startWizard,
        nextStep,
        prevStep,
        skipWizard,
        restartWizard,
        hasSeenWizard,
        setLanguage,
        waitingForClick,
        handleRequiredClick,
        completedSteps,
      }}
    >
      {children}
    </InteractiveWizardContext.Provider>
  );
}

export function useInteractiveWizard() {
  const context = useContext(InteractiveWizardContext);
  if (context === undefined) {
    return null;
  }
  return context;
}

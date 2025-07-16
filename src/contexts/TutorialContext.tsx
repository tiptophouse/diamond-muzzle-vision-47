
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  targetElement?: string;
  section: string;
  order: number;
  image?: string;
  actions?: {
    primary?: string;
    secondary?: string;
  };
}

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  currentStepData: TutorialStep | null;
  startTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  restartTutorial: () => void;
  hasSeenTutorial: boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'ברוכים הבאים לדיאמונד מזל! 💎',
    content: 'פלטפורמת ניהול מלאי יהלומים המקיפה שלכם. המערכת שלנו עוזרת לכם לנהל את המלאי, לשתף יהלומים עם לקוחות ולמכור בקלות.',
    section: 'welcome',
    order: 1,
    actions: { primary: 'התחל', secondary: 'דלג' }
  },
  {
    id: 'gia-scan',
    title: 'סריקת תעודת GIA',
    content: 'התחילו בקלות! סרקו את תעודת ה-GIA של היהלום שלכם והמערכת תמלא אוטומטית את כל הפרטים. זוהי הדרך הכי מהירה להתחיל.',
    section: 'upload',
    order: 2,
    actions: { primary: 'סרוק תעודה', secondary: 'דלג' }
  },
  {
    id: 'inventory-management',
    title: 'ניהול מלאי יהלומים',
    content: 'במלאי תוכלו לראות את כל היהלומים שלכם, לערוך פרטים, לחפש ולסנן. כאן גם תוכלו להחליט אילו יהלומים יופיעו בחנות הציבורית.',
    section: 'inventory',
    order: 3,
    actions: { primary: 'עבור למלאי', secondary: 'דלג' }
  },
  {
    id: 'store-sharing',
    title: 'חנות ציבורית ושיתוף',
    content: 'החנות הציבורית מאפשרת ללקוחות לגלוש ולחפש יהלומים. תוכלו לשתף קישורים ישירים ליהלומים ספציפיים או לכל החנות.',
    section: 'store',
    order: 4,
    actions: { primary: 'עבור לחנות', secondary: 'סיום' }
  }
];

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('tutorial-completed');
    setHasSeenTutorial(!!seen);
    
    // Auto-start tutorial for new users
    if (!seen && !isActive) {
      setTimeout(() => setIsActive(true), 1000);
    }
  }, [isActive]);

  const startTutorial = () => {
    setCurrentStep(0);
    setIsActive(true);
  };

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      skipTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem('tutorial-completed', 'true');
    setHasSeenTutorial(true);
  };

  const restartTutorial = () => {
    localStorage.removeItem('tutorial-completed');
    setHasSeenTutorial(false);
    startTutorial();
  };

  const currentStepData = tutorialSteps[currentStep] || null;

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        totalSteps: tutorialSteps.length,
        currentStepData,
        startTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        restartTutorial,
        hasSeenTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}

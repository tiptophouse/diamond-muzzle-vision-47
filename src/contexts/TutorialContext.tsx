
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
    content: 'פלטפורמת ניהול מלאי יהלומים המקיפה שלכם. בואו נעשה סיור אינטראקטיבי קצר כדי להתחיל!',
    section: 'welcome',
    order: 1,
    actions: { primary: 'התחל סיור', secondary: 'דלג' }
  },
  {
    id: 'sidebar',
    title: 'תפריט ניווט',
    content: 'תפריט הצד הזה הוא הניווט הראשי שלכם. לחצו על חלקים שונים כדי לחקור לוח בקרה, מלאי, חנות, העלאה ועוד.',
    targetElement: '[data-tutorial="sidebar"]',
    section: 'navigation',
    order: 2,
    actions: { primary: 'הבא', secondary: 'דלג' }
  },
  {
    id: 'inventory-header',
    title: 'ניהול מלאי יהלומים',
    content: 'זה הכותרת של מלאי היהלומים שלכם. לחצו על "הוסף יהלום" כדי להוסיף אבנים בודדות לאוסף שלכם.',
    targetElement: '[data-tutorial="inventory-header"]',
    section: 'inventory',
    order: 3,
    actions: { primary: 'עבור למלאי', secondary: 'הבא' }
  },
  {
    id: 'add-diamond-btn',
    title: 'הוסף יהלום חדש',
    content: 'לחצו על הכפתור הזה כדי להוסיף יהלום חדש למלאי שלכם. תוכלו להזין את כל הפרטים באופן ידני או לסרוק תעודת GIA.',
    targetElement: '[data-tutorial="add-diamond"]',
    section: 'inventory',
    order: 4,
    actions: { primary: 'עבור להוספה', secondary: 'הבא' }
  },
  {
    id: 'inventory-search',
    title: 'חיפוש וסינון',
    content: 'השתמשו בשורת החיפוש הזאת כדי למצוא במהירות יהלומים לפי מספר מלאי, צורה, צבע או כל מאפיין אחר.',
    targetElement: '[data-tutorial="inventory-search"]',
    section: 'inventory',
    order: 5,
    actions: { primary: 'הבא', secondary: 'דלג' }
  },
  {
    id: 'inventory-table',
    title: 'טבלת מלאי יהלומים',
    content: 'כאן המלאי המלא של היהלומים שלכם. ערכו, מחקו או שנו נראות בחנות לכל יהלום. לחצו על כל יהלום כדי לראות מידע מפורט.',
    targetElement: '[data-tutorial="inventory-table"]',
    section: 'inventory',
    order: 6,
    actions: { primary: 'הבא', secondary: 'דלג' }
  },
  {
    id: 'upload-csv',
    title: 'העלאת CSV בכמויות',
    content: 'העלו יהלומים רבים בבת אחת באמצעות קובצי CSV. המערכת החכמה שלנו ממפה באופן אוטומטי את העמודות שלכם לתכונות יהלומים.',
    targetElement: '[data-tutorial="upload-area"]',
    section: 'upload',
    order: 7,
    actions: { primary: 'עבור להעלאה', secondary: 'הבא' }
  },
  {
    id: 'store-view',
    title: 'חנות ציבורית',
    content: 'זאת החנות הציבורית היפה שלכם שבה לקוחות יכולים לגלוש ולסנן את היהלומים שלכם. רק יהלומים המסומנים כ"נראים בחנות" מופיעים כאן.',
    targetElement: '[data-tutorial="store-grid"]',
    section: 'store',
    order: 8,
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

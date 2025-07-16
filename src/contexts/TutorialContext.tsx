import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';

export interface TutorialStep {
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

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  currentStepData: TutorialStep | null;
  currentLanguage: 'en' | 'he';
  startTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  restartTutorial: () => void;
  hasSeenTutorial: boolean;
  setLanguage: (lang: 'en' | 'he') => void;
  waitingForClick: boolean;
  handleRequiredClick: () => void;
  completedSteps: string[];
  sharedDiamondId: string | null;
  createShareableLink: (stockNumber: string) => string;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: { 
      en: 'Welcome to Diamond Mazal! 💎', 
      he: 'ברוכים הבאים לדיאמונד מזל! 💎' 
    },
    content: { 
      en: 'Your comprehensive diamond inventory management platform. Let\'s take an interactive tour to get you started with uploading your first diamond!',
      he: 'פלטפורמת ניהול מלאי היהלומים המקיפה שלכם. בואו נעשה סיור אינטראקטיבי כדי להתחיל עם העלאת היהלום הראשון שלכם!'
    },
    section: 'welcome',
    order: 1,
    actions: { 
      primary: { en: 'Start Tour', he: 'התחל סיור' }, 
      secondary: { en: 'Skip', he: 'דלג' } 
    }
  },
  {
    id: 'navigate-to-upload',
    title: { 
      en: 'Let\'s Upload Your First Diamond', 
      he: 'בואו נעלה את היהלום הראשון שלכם' 
    },
    content: { 
      en: 'Great! Now we\'ll take you directly to scan your diamond certificate. The QR scanner will open automatically.',
      he: 'מעולה! עכשיו ניקח אתכם ישירות לסריקת תעודת היהלום שלכם. סורק הQR ייפתח אוטומטית.'
    },
    section: 'upload',
    order: 2,
    navigationTarget: '/upload-single-stone?action=scan',
    actions: { 
      primary: { en: 'Scan Certificate', he: 'סרוק תעודה' }, 
      secondary: { en: 'Skip', he: 'דלג' } 
    }
  },
  {
    id: 'click-upload-button',
    title: { 
      en: 'Click "Upload Single Diamond"', 
      he: 'לחצו על "העלאת יהלום בודד"' 
    },
    content: { 
      en: 'Now click on the "Upload Single Diamond" button to start adding your first diamond. We\'ll wait for you to click it!',
      he: 'עכשיו לחצו על כפתור "העלאת יהלום בודד" כדי להתחיל להוסיף את היהלום הראשון שלכם. נחכה שתלחצו עליו!'
    },
    targetElement: '[data-tutorial="upload-single-diamond"]',
    section: 'upload',
    order: 3,
    requireClick: true,
    actions: { 
      primary: { en: 'Waiting for click...', he: 'מחכה ללחיצה...' }, 
      secondary: { en: 'Skip', he: 'דלג' } 
    }
  },
  {
    id: 'fill-diamond-form',
    title: { 
      en: 'Fill Diamond Information', 
      he: 'מלאו מידע על היהלום' 
    },
    content: { 
      en: 'Great! Now fill in your diamond details. You can scan a GIA certificate or enter details manually. Try adding a stock number, weight, and basic grading information.',
      he: 'מעולה! עכשיו מלאו את פרטי היהלום שלכם. תוכלו לסרוק תעודת GIA או להזין פרטים ידנית. נסו להוסיף מספר מלאי, משקל ומידע דירוג בסיסי.'
    },
    targetElement: '[data-tutorial="diamond-form"]',
    section: 'upload-single-stone',
    order: 4,
    actions: { 
      primary: { en: 'Continue', he: 'המשך' }, 
      secondary: { en: 'Skip', he: 'דלג' } 
    }
  },
  {
    id: 'submit-diamond',
    title: { 
      en: 'Submit Your Diamond', 
      he: 'שלחו את היהלום שלכם' 
    },
    content: { 
      en: 'Once you\'ve filled in the details, click "Add Diamond" to save it to your inventory. We\'ll then see it in your dashboard!',
      he: 'לאחר שמילאתם את הפרטים, לחצו על "הוסף יהלום" כדי לשמור אותו במלאי שלכם. אחר כך נראה אותו בלוח הבקרה!'
    },
    targetElement: '[data-tutorial="submit-diamond"]',
    section: 'upload-single-stone',
    order: 5,
    requireClick: true,
    actions: { 
      primary: { en: 'Waiting for submit...', he: 'מחכה לשליחה...' }, 
      secondary: { en: 'Skip', he: 'דלג' } 
    }
  },
  {
    id: 'view-in-inventory',
    title: { 
      en: 'See Your Diamond in Inventory', 
      he: 'ראו את היהלום שלכם במלאי' 
    },
    content: { 
      en: 'Perfect! Your diamond has been added. Let\'s go to the inventory page to see it and manage your diamonds.',
      he: 'מושלם! היהלום שלכם נוסף. בואו נעבור לעמוד המלאי כדי לראות אותו ולנהל את היהלומים שלכם.'
    },
    section: 'inventory',
    order: 6,
    navigationTarget: '/inventory',
    actions: { 
      primary: { en: 'View Inventory', he: 'צפה במלאי' }, 
      secondary: { en: 'Skip', he: 'דלג' } 
    }
  },
  {
    id: 'toggle-store-visibility',
    title: { 
      en: 'Make Diamond Visible in Store', 
      he: 'הפוך את היהלום לגלוי בחנות' 
    },
    content: { 
      en: 'Now toggle the store visibility for your diamond so customers can see it. Look for the eye icon and click it!',
      he: 'עכשיו החליפו את הנראות בחנות עבור היהלום שלכם כדי שלקוחות יוכלו לראות אותו. חפשו את סמל העין ולחצו עליו!'
    },
    targetElement: '[data-tutorial="store-visibility"]',
    section: 'inventory',
    order: 7,
    requireClick: true,
    actions: { 
      primary: { en: 'Waiting for toggle...', he: 'מחכה להחלפה...' }, 
      secondary: { en: 'Skip', he: 'דלג' } 
    }
  },
  {
    id: 'visit-store',
    title: { 
      en: 'Visit Your Public Store', 
      he: 'בקרו בחנות הציבורית שלכם' 
    },
    content: { 
      en: 'Excellent! Now let\'s visit your public store to see how customers will view your diamond.',
      he: 'מעולה! עכשיו בואו נבקר בחנות הציבורית שלכם כדי לראות איך לקוחות יראו את היהלום שלכם.'
    },
    section: 'store',
    order: 8,
    navigationTarget: '/store',
    actions: { 
      primary: { en: 'Visit Store', he: 'בקר בחנות' }, 
      secondary: { en: 'Skip', he: 'דלג' } 
    }
  },
  {
    id: 'share-with-friends',
    title: { 
      en: 'Share Diamond with Friends', 
      he: 'שתפו יהלום עם חברים' 
    },
    content: { 
      en: 'Now let\'s test the sharing feature! Click the share button on your diamond to generate a secure link that you can send to friends for testing.',
      he: 'עכשיו בואו נבדוק את תכונת השיתוף! לחצו על כפתור השיתוף ביהלום שלכם כדי ליצור קישור מאובטח שתוכלו לשלוח לחברים לבדיקה.'
    },
    targetElement: '[data-tutorial="share-diamond"]',
    section: 'store',
    order: 9,
    requireClick: true,
    actions: { 
      primary: { en: 'Waiting for share...', he: 'מחכה לשיתוף...' }, 
      secondary: { en: 'Skip', he: 'דלג' } 
    }
  },
  {
    id: 'tutorial-complete',
    title: { 
      en: 'Tutorial Complete! 🎉', 
      he: 'המדריך הושלם! 🎉' 
    },
    content: { 
      en: 'Congratulations! You\'ve successfully uploaded a diamond, made it visible in your store, and learned how to share it. Your friends can now search for similar diamonds and you\'ll get notifications when they interact with your inventory!',
      he: 'ברכות! העליתם בהצלחה יהלום, הפכתם אותו לגלוי בחנות שלכם, ולמדתם איך לשתף אותו. החברים שלכם יכולים עכשיו לחפש יהלומים דומים ותקבלו התראות כשהם מתקשרים עם המלאי שלכם!'
    },
    section: 'complete',
    order: 10,
    actions: { 
      primary: { en: 'Finish', he: 'סיום' }, 
      secondary: { en: 'Restart', he: 'התחל מחדש' } 
    }
  }
];

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const { user } = useTelegramAuth();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'he'>('he'); // Default to Hebrew
  const [waitingForClick, setWaitingForClick] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [sharedDiamondId, setSharedDiamondId] = useState<string | null>(null);

  // Set Hebrew as the only language
  useEffect(() => {
    setCurrentLanguage('he');
    localStorage.setItem('tutorial-language', 'he');
  }, []);

  useEffect(() => {
    const seen = localStorage.getItem(`tutorial-completed-${currentLanguage}`);
    const steps = localStorage.getItem(`tutorial-completed-steps-${currentLanguage}`);
    
    setHasSeenTutorial(!!seen);
    setCompletedSteps(steps ? JSON.parse(steps) : []);
    
    // Auto-start tutorial for new users
    if (!seen && !isActive && user) {
      setTimeout(() => setIsActive(true), 1000);
    }
  }, [isActive, currentLanguage, user]);

  const startTutorial = () => {
    setCurrentStep(0);
    setIsActive(true);
    setWaitingForClick(false);
    setCompletedSteps([]);
  };

  const nextStep = () => {
    const currentStepData = tutorialSteps[currentStep];
    
    // Mark current step as completed
    if (currentStepData) {
      const newCompletedSteps = [...completedSteps, currentStepData.id];
      setCompletedSteps(newCompletedSteps);
      localStorage.setItem(`tutorial-completed-steps-${currentLanguage}`, JSON.stringify(newCompletedSteps));
    }

    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setWaitingForClick(false);
    } else {
      skipTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setWaitingForClick(false);
    }
  };

  const skipTutorial = () => {
    setIsActive(false);
    setCurrentStep(0);
    setWaitingForClick(false);
    localStorage.setItem(`tutorial-completed-${currentLanguage}`, 'true');
    setHasSeenTutorial(true);
  };

  const restartTutorial = () => {
    localStorage.removeItem(`tutorial-completed-${currentLanguage}`);
    localStorage.removeItem(`tutorial-completed-steps-${currentLanguage}`);
    setHasSeenTutorial(false);
    setCompletedSteps([]);
    startTutorial();
  };

  const setLanguage = (lang: 'en' | 'he') => {
    setCurrentLanguage(lang);
    localStorage.setItem('tutorial-language', lang);
  };

  const handleRequiredClick = () => {
    if (waitingForClick) {
      setWaitingForClick(false);
      setTimeout(() => nextStep(), 500);
    }
  };

  const createShareableLink = (stockNumber: string) => {
    const baseUrl = window.location.origin;
    const shareLink = `${baseUrl}/secure-diamond/${stockNumber}?tutorial=true&step=${currentStep}`;
    setSharedDiamondId(stockNumber);
    return shareLink;
  };

  // Set waiting for click when step requires it
  useEffect(() => {
    const currentStepData = tutorialSteps[currentStep];
    if (currentStepData?.requireClick) {
      setWaitingForClick(true);
    }
  }, [currentStep]);

  const currentStepData = tutorialSteps[currentStep] || null;

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        totalSteps: tutorialSteps.length,
        currentStepData,
        currentLanguage,
        startTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        restartTutorial,
        hasSeenTutorial,
        setLanguage,
        waitingForClick,
        handleRequiredClick,
        completedSteps,
        sharedDiamondId,
        createShareableLink,
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
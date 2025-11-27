import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTelegramAuth } from '@/context/TelegramAuthContext';

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
      en: 'Welcome to Diamond Management System! 💎', 
      he: 'ברוכים הבאים למערכת ניהול יהלומים! 💎' 
    },
    content: { 
      en: 'Let\'s get started! I\'ll guide you through uploading your first diamond step by step.',
      he: 'בואו נתחיל! אני אדריך אתכם דרך העלאת היהלום הראשון שלכם שלב אחר שלב.'
    },
    section: 'welcome',
    order: 1,
    actions: { 
      primary: { en: 'Start Now', he: 'התחל עכשיו' }, 
      secondary: { en: 'Skip Tutorial', he: 'דלג על המדריך' } 
    }
  },
  {
    id: 'lets-upload',
    title: { 
      en: 'Let\'s Upload Your First Diamond', 
      he: 'בואו נעלה את היהלום הראשון שלכם' 
    },
    content: { 
      en: 'Great! Now we\'ll take you directly to scan your diamond certificate. The QR scanner will open automatically.',
      he: 'נהדר! עכשיו נקח אתכם ישירות לסרוק את תעודת היהלום שלכם. סורק ה-QR ייפתח אוטומטית.'
    },
    section: 'upload',
    order: 2,
    navigationTarget: '/upload',
    actions: { 
      primary: { en: 'Scan Certificate Now', he: 'סרק תעודה עכשיו' }, 
      secondary: { en: 'Skip Tour', he: 'דלג על הסיור' } 
    }
  },
  {
    id: 'scan-process',
    title: { 
      en: 'Scanning Your Certificate', 
      he: 'סורק את התעודה שלכם' 
    },
    content: { 
      en: 'Perfect! Point your camera at the GIA certificate. The app will automatically extract all the diamond details.',
      he: 'מושלם! כוונו את המצלמה אל תעודת GIA. האפליקציה תחלץ אוטומטית את כל פרטי היהלום.'
    },
    section: 'scanning',
    order: 3,
    actions: { 
      primary: { en: 'Continue', he: 'המשך' }, 
      secondary: { en: 'Skip Tour', he: 'דלג על הסיור' } 
    }
  },
  {
    id: 'fill-details',
    title: { 
      en: 'Fill in Additional Details', 
      he: 'מלאו פרטים נוספים' 
    },
    content: { 
      en: 'Excellent! The certificate has been scanned. Now fill in any missing details like price and stock number.',
      he: 'מצוין! התעודה נסרקה. עכשיו מלאו פרטים חסרים כמו מחיר ומספר מלאי.'
    },
    section: 'upload',
    order: 4,
    actions: { 
      primary: { en: 'Continue', he: 'המשך' }, 
      secondary: { en: 'Skip Tour', he: 'דלג על הסיור' } 
    }
  },
  {
    id: 'submit-diamond',
    title: { 
      en: 'Submit Your Diamond', 
      he: 'שלח את היהלום שלך' 
    },
    content: { 
      en: 'Once you\'ve filled in the details, click "Add Diamond" to save it to your inventory. We\'ll then see it in your dashboard!',
      he: 'לאחר שמילאתם את הפרטים, לחצו על "הוסף יהלום" כדי לשמור אותו במלאי שלכם. אז נראה אותו בלוח הבקרה שלכם!'
    },
    section: 'upload',
    order: 5,
    actions: { 
      primary: { en: 'Next', he: 'הבא' }, 
      secondary: { en: 'Skip Tour', he: 'דלג על הסיור' } 
    }
  },
  {
    id: 'see-inventory',
    title: { 
      en: 'See Your Diamond in Inventory', 
      he: 'ראה את היהלום שלך במלאי' 
    },
    content: { 
      en: 'Perfect! Your diamond has been added. Let\'s go to the inventory page to see it and manage your diamonds.',
      he: 'מושלם! היהלום שלכם נוסף. בואו נעבור לעמוד המלאי כדי לראות אותו ולנהל את היהלומים שלכם.'
    },
    section: 'inventory',
    order: 6,
    navigationTarget: '/inventory',
    actions: { 
      primary: { en: 'Go to Inventory', he: 'עבור למלאי' }, 
      secondary: { en: 'Skip Tour', he: 'דלג על הסיור' } 
    }
  },
  {
    id: 'manage-inventory',
    title: { 
      en: 'Manage Your Inventory', 
      he: 'נהל את המלאי שלך' 
    },
    content: { 
      en: 'Here you can add new diamonds, edit details, search & filter, and control store visibility for each diamond.',
      he: 'כאן תוכלו להוסיף יהלומים חדשים, לערוך פרטים, לחפש ולסנן, ולשלוט בנראות החנות של כל יהלום.'
    },
    section: 'inventory',
    order: 7,
    actions: { 
      primary: { en: 'Next', he: 'הבא' }, 
      secondary: { en: 'Skip Tour', he: 'דלג על הסיור' } 
    }
  },
  {
    id: 'visit-store',
    title: { 
      en: 'Visit Your Public Store', 
      he: 'בקר בחנות הציבורית שלך' 
    },
    content: { 
      en: 'Excellent! Now let\'s visit your public store to see how customers will view your diamond.',
      he: 'מצוין! עכשיו בואו נבקר בחנות הציבורית שלכם כדי לראות איך לקוחות יראו את היהלום שלכם.'
    },
    section: 'store',
    order: 8,
    navigationTarget: '/store',
    actions: { 
      primary: { en: 'Go to Store', he: 'עבור לחנות' }, 
      secondary: { en: 'Skip Tour', he: 'דלג על הסיור' } 
    }
  },
  {
    id: 'sharing-features',
    title: { 
      en: 'Share Your Diamonds', 
      he: 'שתף את היהלומים שלך' 
    },
    content: { 
      en: 'Great! From here you can share individual diamonds with customers. They\'ll get a beautiful link to view the diamond details.',
      he: 'נהדר! מכאן תוכלו לשתף יהלומים בודדים עם לקוחות. הם יקבלו קישור יפה לצפייה בפרטי היהלום.'
    },
    section: 'store',
    order: 9,
    actions: { 
      primary: { en: 'Next', he: 'הבא' }, 
      secondary: { en: 'Skip Tour', he: 'דלג על הסיור' } 
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
      he: 'ברכות! העליתם בהצלחה יהלום, הפכתם אותו לנראה בחנות שלכם, ולמדתם איך לשתף אותו. החברים שלכם יכולים עכשיו לחפש יהלומים דומים ותקבלו התראות כשהם יתקשרו עם המלאי שלכם!'
    },
    section: 'complete',
    order: 10,
    actions: { 
      primary: { en: 'Finish', he: 'סיום' }, 
      secondary: { en: 'Close', he: 'סגור' } 
    }
  }
];

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const { user } = useTelegramAuth();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'he'>('he');
  const [waitingForClick, setWaitingForClick] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [sharedDiamondId, setSharedDiamondId] = useState<string | null>(null);

  // Check for URL parameters to auto-start tutorial
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tutorialParam = urlParams.get('tutorial');
    const onboardingParam = urlParams.get('onboarding');
    const userIdParam = urlParams.get('user_id');
    
    if (tutorialParam === 'start' || onboardingParam === 'true') {
      console.log('🎓 Auto-starting tutorial from URL parameters');
      
      // Clear URL parameters but keep the tutorial running
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Start tutorial
      setTimeout(() => {
        startTutorial();
      }, 1000);
    }
  }, []);

  // Detect language from Telegram user data, default to Hebrew (run once only)
  useEffect(() => {
    const savedLang = localStorage.getItem('tutorial-language') as 'en' | 'he' | null;
    
    if (savedLang) {
      setCurrentLanguage(savedLang);
    } else if (user?.language_code) {
      const detectedLang = user.language_code.startsWith('he') ? 'he' : 
                           user.language_code.startsWith('en') ? 'en' : 'he';
      setCurrentLanguage(detectedLang);
      localStorage.setItem('tutorial-language', detectedLang);
    }
  }, []); // Only run on mount, not when user changes

  useEffect(() => {
    const seen = localStorage.getItem(`tutorial-completed-${currentLanguage}`);
    const steps = localStorage.getItem(`tutorial-completed-steps-${currentLanguage}`);
    
    setHasSeenTutorial(!!seen);
    setCompletedSteps(steps ? JSON.parse(steps) : []);
    
    // Only auto-start tutorial for new users if not already started by URL
    if (!seen && !isActive && user && !window.location.search.includes('tutorial')) {
      setTimeout(() => setIsActive(true), 1000);
    }
  }, [isActive, currentLanguage, user]);

  const startTutorial = () => {
    console.log('🎓 Starting tutorial...');
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
    console.log('🎓 Tutorial completed/skipped');
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
    return null;
  }
  return context;
}

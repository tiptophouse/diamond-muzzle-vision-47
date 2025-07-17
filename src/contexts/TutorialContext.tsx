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
      en: 'I will guide you step by step to upload your first diamond. Just follow my instructions exactly.',
      he: 'אני אדריך אתכם צעד אחר צעד להעלות את היהלום הראשון שלכם. פשוט עקבו אחר ההוראות שלי בדיוק.'
    },
    section: 'welcome',
    order: 1,
    actions: { 
      primary: { en: 'Start Now', he: 'התחל עכשיו' }, 
      secondary: { en: 'Skip', he: 'דלג' } 
    }
  },
  {
    id: 'click-upload-button',
    title: { 
      en: 'Step 1: Click the Blue Button', 
      he: 'שלב 1: לחצו על הכפתור הכחול' 
    },
    content: { 
      en: 'Look for the big blue button that says "Upload Single Diamond" and click on it. I will wait until you click it.',
      he: 'חפשו את הכפתור הכחול הגדול שכתוב עליו "העלאת יהלום בודד" ולחצו עליו. אני אחכה עד שתלחצו עליו.'
    },
    targetElement: '[data-tutorial="upload-single-diamond"]',
    section: 'upload',
    order: 2,
    requireClick: true,
    actions: { 
      primary: { en: 'Waiting for you to click...', he: 'מחכה שתלחצו...' }, 
      secondary: { en: 'Skip', he: 'דלג' } 
    }
  },
  {
    id: 'click-scan-certificate',
    title: { 
      en: 'Step 2: Click "Start Certificate Scan"', 
      he: 'שלב 2: לחצו על "התחל סריקת תעודה"' 
    },
    content: { 
      en: 'Perfect! Now look for the button that says "Start Certificate Scan" and click it. This will open your camera to scan the GIA certificate.',
      he: 'מושלם! עכשיו חפשו את הכפתור שכתוב עליו "התחל סריקת תעודה" ולחצו עליו. זה יפתח את המצלמה לסרוק את תעודת ה-GIA.'
    },
    targetElement: 'button:has-text("Start Certificate Scan")',
    section: 'upload-single-stone',
    order: 3,
    requireClick: true,
    actions: { 
      primary: { en: 'Waiting for you to click scan...', he: 'מחכה שתלחצו על סריקה...' }, 
      secondary: { en: 'Skip', he: 'דלג' } 
    }
  },
  {
    id: 'scan-certificate',
    title: { 
      en: 'Step 3: Scan Your GIA Certificate', 
      he: 'שלב 3: סרקו את תעודת ה-GIA שלכם' 
    },
    content: { 
      en: 'Point your camera at the GIA certificate. Make sure the barcode or QR code is clearly visible. The app will read it automatically.',
      he: 'כוונו את המצלמה אל תעודת ה-GIA. וודאו שהברקוד או קוד ה-QR נראה בבירור. האפליקציה תקרא אותו אוטומטית.'
    },
    section: 'scanning',
    order: 4,
    actions: { 
      primary: { en: 'Continue after scanning', he: 'המשיכו אחרי הסריקה' }, 
      secondary: { en: 'Skip', he: 'דלג' } 
    }
  },
  {
    id: 'fill-remaining-details',
    title: { 
      en: 'Step 4: Fill Missing Information', 
      he: 'שלב 4: מלאו את המידע החסר' 
    },
    content: { 
      en: 'Good! The scan filled in most details. Now fill in any missing information like stock number and price. Type carefully.',
      he: 'טוב! הסריקה מילאה את רוב הפרטים. עכשיו מלאו כל מידע חסר כמו מספר מלאי ומחיר. הקלידו בזהירות.'
    },
    targetElement: '[data-tutorial="diamond-form"]',
    section: 'upload-single-stone',
    order: 5,
    actions: { 
      primary: { en: 'Continue', he: 'המשך' }, 
      secondary: { en: 'Skip', he: 'דלג' } 
    }
  },
  {
    id: 'submit-diamond',
    title: { 
      en: 'Step 5: Save Your Diamond', 
      he: 'שלב 5: שמרו את היהלום שלכם' 
    },
    content: { 
      en: 'Almost done! Now click the "Add Diamond" button at the bottom to save your diamond. I will wait for you to click it.',
      he: 'כמעט סיימנו! עכשיו לחצו על כפתור "הוסף יהלום" בתחתית כדי לשמור את היהלום שלכם. אני אחכה שתלחצו עליו.'
    },
    targetElement: '[data-tutorial="submit-diamond"]',
    section: 'upload-single-stone',
    order: 6,
    requireClick: true,
    actions: { 
      primary: { en: 'Waiting for you to save...', he: 'מחכה שתשמרו...' }, 
      secondary: { en: 'Skip', he: 'דלג' } 
    }
  },
  {
    id: 'tutorial-complete',
    title: { 
      en: 'Congratulations! 🎉', 
      he: 'ברכות! 🎉' 
    },
    content: { 
      en: 'Perfect! You successfully uploaded your first diamond. You can now add more diamonds the same way. The tutorial is complete!',
      he: 'מושלם! העליתם בהצלחה את היהלום הראשון שלכם. עכשיו תוכלו להוסיף עוד יהלומים באותה דרך. המדריך הושלם!'
    },
    section: 'complete',
    order: 7,
    actions: { 
      primary: { en: 'Finish', he: 'סיום' }, 
      secondary: { en: 'Show me more features', he: 'הראה לי עוד תכונות' } 
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

  // Detect language from Telegram user data, default to Hebrew
  useEffect(() => {
    // Check saved preference first
    const savedLang = localStorage.getItem('tutorial-language') as 'en' | 'he' | null;
    
    if (savedLang) {
      setCurrentLanguage(savedLang);
    } else if (user?.language_code) {
      // Only switch to English if explicitly Hebrew is not detected and user has English
      const detectedLang = user.language_code.startsWith('he') ? 'he' : 
                           user.language_code.startsWith('en') ? 'en' : 'he'; // Default to Hebrew
      setCurrentLanguage(detectedLang);
      
      // Save language preference
      localStorage.setItem('tutorial-language', detectedLang);
    }
    // If no saved preference and no user data, stays with Hebrew default
  }, [user]);

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
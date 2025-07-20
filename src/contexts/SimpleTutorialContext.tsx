import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';

export interface TutorialStep {
  id: string;
  title: { en: string; he: string };
  content: { en: string; he: string };
}

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  currentStepData: TutorialStep | null;
  currentLanguage: 'en' | 'he';
  startTutorial: () => void;
  nextStep: () => void;
  skipTutorial: () => void;
  hasSeenTutorial: boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: { 
      en: 'Welcome to Diamond Mazal! 💎', 
      he: 'ברוכים הבאים ל Diamond Mazal! 💎' 
    },
    content: { 
      en: 'Let\'s take a quick tour to get you started with managing your diamond inventory.',
      he: 'בואו נעשה סיור קצר כדי להתחיל לנהל את מלאי היהלומים שלכם.'
    }
  },
  {
    id: 'lets-upload',
    title: { 
      en: 'Upload Your First Diamond', 
      he: 'העלו את היהלום הראשון שלכם' 
    },
    content: { 
      en: 'Start by uploading your first diamond. You can scan certificates or enter details manually.',
      he: 'התחילו בהעלאת היהלום הראשון שלכם. אתם יכולים לסרוק תעודות או להזין פרטים ידנית.'
    }
  },
  {
    id: 'see-inventory',
    title: { 
      en: 'Manage Your Inventory', 
      he: 'נהלו את המלאי שלכם' 
    },
    content: { 
      en: 'View and manage all your diamonds in one place. Edit details, search, and control store visibility.',
      he: 'צפו ונהלו את כל היהלומים שלכם במקום אחד. ערכו פרטים, חפשו, ושלטו בנראות החנות.'
    }
  },
  {
    id: 'visit-store',
    title: { 
      en: 'Your Public Store', 
      he: 'החנות הציבורית שלכם' 
    },
    content: { 
      en: 'See how customers view your diamonds in your beautiful public store.',
      he: 'ראו איך לקוחות רואים את היהלומים שלכם בחנות הציבורית היפה שלכם.'
    }
  },
  {
    id: 'tutorial-complete',
    title: { 
      en: 'You\'re All Set! 🎉', 
      he: 'אתם מוכנים! 🎉' 
    },
    content: { 
      en: 'You\'re ready to start managing your diamond business like a pro!',
      he: 'אתם מוכנים להתחיל לנהל את עסק היהלומים שלכם כמו מקצוענים!'
    }
  }
];

export function SimpleTutorialProvider({ children }: { children: React.ReactNode }) {
  const { user } = useTelegramAuth();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'he'>('he');

  // Check for tutorial start parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tutorialParam = urlParams.get('tutorial');
    const onboardingParam = urlParams.get('onboarding');
    
    if (tutorialParam === 'start' || onboardingParam === 'true') {
      // Clear URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      // Start tutorial after a short delay
      setTimeout(() => {
        startTutorial();
      }, 1000);
    }
  }, []);

  // Set language based on user preference
  useEffect(() => {
    const savedLang = localStorage.getItem('tutorial-language') as 'en' | 'he' | null;
    
    if (savedLang) {
      setCurrentLanguage(savedLang);
    } else if (user?.language_code) {
      const detectedLang = user.language_code.startsWith('he') ? 'he' : 'en';
      setCurrentLanguage(detectedLang);
      localStorage.setItem('tutorial-language', detectedLang);
    }
  }, [user]);

  // Check if tutorial was completed
  useEffect(() => {
    const seen = localStorage.getItem('tutorial-completed');
    setHasSeenTutorial(!!seen);
    
    // Auto-start tutorial for new users
    if (!seen && !isActive && user && !window.location.search.includes('tutorial')) {
      setTimeout(() => setIsActive(true), 2000);
    }
  }, [isActive, user]);

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

  const skipTutorial = () => {
    setIsActive(false);
    setCurrentStep(0);
    localStorage.setItem('tutorial-completed', 'true');
    setHasSeenTutorial(true);
  };

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
        skipTutorial,
        hasSeenTutorial,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useSimpleTutorial() {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    return null;
  }
  return context;
}
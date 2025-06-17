
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
    title: 'Welcome to Diamond Muzzle! 💎',
    content: 'Your comprehensive diamond inventory management platform. Let\'s take a quick tour to get you started!',
    section: 'welcome',
    order: 1,
    actions: { primary: 'Start Tour', secondary: 'Skip' }
  },
  {
    id: 'sidebar',
    title: 'Navigation Sidebar',
    content: 'This sidebar is your main navigation. Access Dashboard, Inventory, Store, Upload, Chat, Insights, Settings, and more from here.',
    targetElement: '[data-tutorial="sidebar"]',
    section: 'navigation',
    order: 2,
    actions: { primary: 'Next', secondary: 'Skip' }
  },
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    content: 'Your dashboard shows key metrics: Total Diamonds, Matched Pairs, Market Leads, and Premium Items. Charts below show inventory distribution by shape and color.',
    section: 'dashboard',
    order: 3,
    actions: { primary: 'Next', secondary: 'Skip' }
  },
  {
    id: 'inventory',
    title: 'Inventory Management',
    content: 'Manage your diamond collection here. Add new diamonds, edit existing ones, search and filter your inventory, and toggle store visibility for public display.',
    section: 'inventory',
    order: 4,
    actions: { primary: 'Next', secondary: 'Skip' }
  },
  {
    id: 'store',
    title: 'Public Store',
    content: 'Your public storefront where customers can browse your diamonds. Beautiful cards with images, detailed information, and powerful filtering options.',
    section: 'store',
    order: 5,
    actions: { primary: 'Next', secondary: 'Skip' }
  },
  {
    id: 'upload',
    title: 'Upload Diamonds',
    content: 'Add diamonds to your inventory one by one or upload bulk data via CSV. Include photos, certificates, and detailed specifications.',
    section: 'upload',
    order: 6,
    actions: { primary: 'Next', secondary: 'Skip' }
  },
  {
    id: 'chat',
    title: 'AI Diamond Assistant',
    content: 'Chat with our AI expert about diamonds, get market insights, pricing recommendations, and answers to technical questions.',
    section: 'chat',
    order: 7,
    actions: { primary: 'Next', secondary: 'Skip' }
  },
  {
    id: 'insights',
    title: 'Market Insights',
    content: 'Analyze your inventory with powerful charts and statistics. Understand shape distribution, color analysis, and market trends.',
    section: 'insights',
    order: 8,
    actions: { primary: 'Next', secondary: 'Skip' }
  },
  {
    id: 'settings',
    title: 'Settings & Preferences',
    content: 'Customize your account settings, notification preferences, privacy controls, and Telegram integration.',
    section: 'settings',
    order: 9,
    actions: { primary: 'Finish Tour', secondary: 'Skip' }
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

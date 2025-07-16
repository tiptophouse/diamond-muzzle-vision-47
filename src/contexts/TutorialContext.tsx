
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
    title: 'Welcome to Diamond Mazal! 💎',
    content: 'Your comprehensive diamond inventory management platform. Let\'s take a quick interactive tour to get you started!',
    section: 'welcome',
    order: 1,
    actions: { primary: 'Start Tour', secondary: 'Skip' }
  },
  {
    id: 'sidebar',
    title: 'Navigation Sidebar',
    content: 'This sidebar is your main navigation. Click on different sections to explore Dashboard, Inventory, Store, Upload, and more.',
    targetElement: '[data-tutorial="sidebar"]',
    section: 'navigation',
    order: 2,
    actions: { primary: 'Next', secondary: 'Skip' }
  },
  {
    id: 'inventory-header',
    title: 'Inventory Management',
    content: 'This is your inventory header. Click "Add Diamond" to add individual stones to your collection.',
    targetElement: '[data-tutorial="inventory-header"]',
    section: 'inventory',
    order: 3,
    actions: { primary: 'Next', secondary: 'Skip' }
  },
  {
    id: 'add-diamond-btn',
    title: 'Add New Diamond',
    content: 'Click this button to add a new diamond to your inventory. You can input all details manually or scan a GIA certificate.',
    targetElement: '[data-tutorial="add-diamond"]',
    section: 'inventory',
    order: 4,
    actions: { primary: 'Next', secondary: 'Skip' }
  },
  {
    id: 'inventory-search',
    title: 'Search & Filter',
    content: 'Use this search bar to quickly find diamonds by stock number, shape, color, or any other property.',
    targetElement: '[data-tutorial="inventory-search"]',
    section: 'inventory',
    order: 5,
    actions: { primary: 'Next', secondary: 'Skip' }
  },
  {
    id: 'inventory-table',
    title: 'Diamond Inventory Table',
    content: 'Here\'s your complete diamond inventory. Edit, delete, or toggle store visibility for each diamond. Click on any diamond to see detailed information.',
    targetElement: '[data-tutorial="inventory-table"]',
    section: 'inventory',
    order: 6,
    actions: { primary: 'Next', secondary: 'Skip' }
  },
  {
    id: 'upload-csv',
    title: 'Bulk Upload CSV',
    content: 'Upload multiple diamonds at once using CSV files. Our intelligent system automatically maps your columns to diamond properties.',
    targetElement: '[data-tutorial="upload-area"]',
    section: 'upload',
    order: 7,
    actions: { primary: 'Next', secondary: 'Skip' }
  },
  {
    id: 'store-view',
    title: 'Public Store',
    content: 'This is your beautiful public storefront where customers can browse and filter your diamonds. Only diamonds marked as "store visible" appear here.',
    targetElement: '[data-tutorial="store-grid"]',
    section: 'store',
    order: 8,
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

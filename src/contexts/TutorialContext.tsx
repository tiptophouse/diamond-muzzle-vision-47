
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useOptimizedTelegramAuthContext } from '@/context/OptimizedTelegramAuthContext';

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  currentStepData: any;
  currentLanguage: string;
  waitingForClick: boolean;
  hasSeenTutorial: boolean;
  setLanguage: (lang: string) => void;
  handleRequiredClick: (id: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  restartTutorial: () => void;
  createShareableLink: (diamond: any) => string;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export function TutorialProvider({ children }: { children: ReactNode }) {
  const { user } = useOptimizedTelegramAuthContext();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [waitingForClick, setWaitingForClick] = useState(false);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  const mockStepData = {
    title: 'Tutorial Step',
    description: 'This is a tutorial step',
    target: ''
  };

  const contextValue: TutorialContextType = {
    isActive,
    currentStep,
    totalSteps: 5,
    currentStepData: mockStepData,
    currentLanguage,
    waitingForClick,
    hasSeenTutorial,
    setLanguage: setCurrentLanguage,
    handleRequiredClick: (id: string) => {
      console.log('Required click handled:', id);
      setWaitingForClick(false);
    },
    nextStep: () => setCurrentStep(prev => prev + 1),
    prevStep: () => setCurrentStep(prev => Math.max(0, prev - 1)),
    skipTutorial: () => {
      setIsActive(false);
      setHasSeenTutorial(true);
    },
    restartTutorial: () => {
      setCurrentStep(0);
      setIsActive(true);
    },
    createShareableLink: (diamond: any) => {
      return `${window.location.origin}/diamond/${diamond?.stock_number || 'unknown'}`;
    }
  };

  return (
    <TutorialContext.Provider value={contextValue}>
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

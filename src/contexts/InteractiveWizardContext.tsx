
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useOptimizedTelegramAuthContext } from '@/context/OptimizedTelegramAuthContext';

interface InteractiveWizardContextType {
  isActive: boolean;
  currentStep: number;
  startWizard: () => void;
  nextStep: () => void;
  prevStep: () => void;
  finishWizard: () => void;
}

const InteractiveWizardContext = createContext<InteractiveWizardContextType | undefined>(undefined);

export function InteractiveWizardProvider({ children }: { children: ReactNode }) {
  const { user } = useOptimizedTelegramAuthContext();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const contextValue: InteractiveWizardContextType = {
    isActive,
    currentStep,
    startWizard: () => {
      setIsActive(true);
      setCurrentStep(0);
    },
    nextStep: () => setCurrentStep(prev => prev + 1),
    prevStep: () => setCurrentStep(prev => Math.max(0, prev - 1)),
    finishWizard: () => {
      setIsActive(false);
      setCurrentStep(0);
    }
  };

  return (
    <InteractiveWizardContext.Provider value={contextValue}>
      {children}
    </InteractiveWizardContext.Provider>
  );
}

export function useInteractiveWizard() {
  const context = useContext(InteractiveWizardContext);
  if (context === undefined) {
    throw new Error('useInteractiveWizard must be used within an InteractiveWizardProvider');
  }
  return context;
}

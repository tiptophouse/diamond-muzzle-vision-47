import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { isAdminTelegramId } from '@/lib/secureAdmin';

interface OnboardingStep {
  id: string;
  title: { en: string; he: string };
  description: { en: string; he: string };
  action?: { en: string; he: string };
  route?: string;
  completed: boolean;
}

interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  steps: OnboardingStep[];
  language: 'en' | 'he';
  hasCompletedOnboarding: boolean;
  startOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  setLanguage: (lang: 'en' | 'he') => void;
  markStepCompleted: (stepId: string) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: {
      en: '💎 Welcome to Diamond Mazal!',
      he: '💎 ברוכים הבאים ל-Diamond Mazal!'
    },
    description: {
      en: 'Your AI-powered diamond management platform. Let\'s get you set up in 3 easy steps.',
      he: 'פלטפורמת ניהול היהלומים המתקדמת שלך. בואו נתחיל ב-3 שלבים פשוטים.'
    },
    completed: false
  },
  {
    id: 'upload-first',
    title: {
      en: '📸 Add Your First Diamond',
      he: '📸 הוספת היהלום הראשון'
    },
    description: {
      en: 'Upload a certificate or enter details manually. This will be visible in your store.',
      he: 'העלה תעודה או הזן פרטים ידנית. היהלום יהיה גלוי בחנות שלך.'
    },
    action: {
      en: 'Add Diamond',
      he: 'הוסף יהלום'
    },
    route: '/upload-single-stone',
    completed: false
  },
  {
    id: 'view-dashboard',
    title: {
      en: '📊 Your Dashboard',
      he: '📊 לוח הבקרה שלך'
    },
    description: {
      en: 'Track views, messages, and manage your inventory. Everything you need in one place.',
      he: 'עקוב אחר צפיות, הודעות, ונהל את המלאי שלך. כל מה שאתה צריך במקום אחד.'
    },
    action: {
      en: 'View Dashboard',
      he: 'צפה בלוח'
    },
    route: '/dashboard',
    completed: false
  },
  {
    id: 'complete',
    title: {
      en: '🎉 You\'re All Set!',
      he: '🎉 הכל מוכן!'
    },
    description: {
      en: 'Start selling to customers worldwide. Your diamonds are now live and ready to be discovered.',
      he: 'התחל למכור ללקוחות ברחבי העולם. היהלומים שלך כעת חיים ומוכנים להתגלות.'
    },
    completed: false
  }
];

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>(ONBOARDING_STEPS);
  const [language, setLanguageState] = useState<'en' | 'he'>('he');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const navigate = useNavigate();

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // 🔒 ADMIN-ONLY TEST MODE: Only show onboarding for admin users
        const tg = window.Telegram?.WebApp;
        const telegramUserId = tg?.initDataUnsafe?.user?.id;
        
        if (!telegramUserId) {
          console.log('🚫 Onboarding: No Telegram user ID found');
          return;
        }

        // Check if user is admin
        const isAdmin = await isAdminTelegramId(telegramUserId);
        if (!isAdmin) {
          console.log('🚫 Onboarding: User is not admin, skipping onboarding wizard');
          setHasCompletedOnboarding(true);
          return;
        }

        console.log('✅ Onboarding: Admin user detected, checking onboarding status');

        // 🧪 TEST MODE: Check for force show parameter
        const urlParams = new URLSearchParams(window.location.search);
        const forceShow = urlParams.get('showOnboarding') === 'true';
        
        if (forceShow) {
          console.log('🎯 Onboarding: Force showing onboarding wizard (test mode)');
          localStorage.removeItem('onboarding-completed');
          setIsActive(true);
          setHasCompletedOnboarding(false);
          return;
        }

        const savedOnboarding = localStorage.getItem('onboarding-completed');
        const savedLang = localStorage.getItem('onboarding-language') as 'en' | 'he' | null;
        
        if (savedLang) {
          setLanguageState(savedLang);
        } else {
          // Detect language from Telegram
          const detectedLang = tg?.initDataUnsafe?.user?.language_code === 'he' ? 'he' : 'en';
          setLanguageState(detectedLang);
          localStorage.setItem('onboarding-language', detectedLang);
        }

        if (savedOnboarding === 'true') {
          setHasCompletedOnboarding(true);
          return;
        }

        // Check if user has uploaded any diamonds
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: diamonds, error } = await supabase
            .from('diamonds')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);

          if (!error && diamonds && diamonds.length > 0) {
            // User has diamonds, skip onboarding
            localStorage.setItem('onboarding-completed', 'true');
            setHasCompletedOnboarding(true);
          } else {
            // New admin user, show onboarding
            console.log('🎯 Onboarding: Activating wizard for admin user');
            setIsActive(true);
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, []);

  const startOnboarding = () => {
    setIsActive(true);
    setCurrentStep(0);
    setSteps(ONBOARDING_STEPS);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const newSteps = [...steps];
      newSteps[currentStep].completed = true;
      setSteps(newSteps);
      setCurrentStep(currentStep + 1);

      // Navigate to route if specified
      const nextStepData = steps[currentStep + 1];
      if (nextStepData.route) {
        navigate(nextStepData.route);
      }
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      const prevStepData = steps[currentStep - 1];
      if (prevStepData.route) {
        navigate(prevStepData.route);
      }
    }
  };

  const skipOnboarding = () => {
    setIsActive(false);
    localStorage.setItem('onboarding-completed', 'true');
    setHasCompletedOnboarding(true);
    navigate('/dashboard');
  };

  const completeOnboarding = () => {
    setIsActive(false);
    localStorage.setItem('onboarding-completed', 'true');
    setHasCompletedOnboarding(true);
    navigate('/dashboard');
  };

  const setLanguage = (lang: 'en' | 'he') => {
    setLanguageState(lang);
    localStorage.setItem('onboarding-language', lang);
  };

  const markStepCompleted = (stepId: string) => {
    const newSteps = steps.map(step =>
      step.id === stepId ? { ...step, completed: true } : step
    );
    setSteps(newSteps);
  };

  return (
    <OnboardingContext.Provider
      value={{
        isActive,
        currentStep,
        totalSteps: steps.length,
        steps,
        language,
        hasCompletedOnboarding,
        startOnboarding,
        nextStep,
        prevStep,
        skipOnboarding,
        completeOnboarding,
        setLanguage,
        markStepCompleted
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

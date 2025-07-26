
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

export interface WizardQuest {
  id: string;
  title: { en: string; he: string };
  description: { en: string; he: string };
  objective: { en: string; he: string };
  targetElement?: string;
  targetRoute?: string;
  actionType: 'click' | 'scan' | 'form' | 'navigate' | 'delete';
  reward: { en: string; he: string };
  order: number;
  isCompleted?: boolean;
  isActive?: boolean;
}

interface InteractiveWizardContextType {
  isActive: boolean;
  currentQuest: number;
  totalQuests: number;
  currentQuestData: WizardQuest | null;
  language: 'en' | 'he';
  completedQuests: string[];
  startWizard: () => void;
  nextQuest: () => void;
  completeQuest: (questId: string) => void;
  exitWizard: () => void;
  resumeWizard: () => void;
  setLanguage: (lang: 'en' | 'he') => void;
  waitingForAction: boolean;
  handleActionCompleted: () => void;
}

const wizardQuests: WizardQuest[] = [
  {
    id: 'welcome',
    title: { 
      en: '💎 Welcome Diamond Expert!', 
      he: '💎 ברוך הבא מומחה יהלומים!' 
    },
    description: { 
      en: 'Let\'s turn you into a diamond management master! Ready for your first quest?',
      he: 'בואו נהפוך אותך למאסטר ניהול יהלומים! מוכן למשימה הראשונה?' 
    },
    objective: { 
      en: 'Start your diamond journey', 
      he: 'התחל את מסע היהלומים שלך' 
    },
    actionType: 'click',
    reward: { 
      en: '🏆 Quest Starter Badge', 
      he: '🏆 תג מתחיל המשימות' 
    },
    order: 1
  },
  {
    id: 'upload-diamond',
    title: { 
      en: '📷 Scan Your First Diamond!', 
      he: '📷 סרוק את היהלום הראשון שלך!' 
    },
    description: { 
      en: 'Time to add your first diamond! We\'ll scan a real GIA certificate.',
      he: 'הגיע הזמן להוסיף את היהלום הראשון שלך! נסרוק תעודת GIA אמיתית.' 
    },
    objective: { 
      en: 'Upload and scan a diamond certificate', 
      he: 'העלה וסרוק תעודת יהלום' 
    },
    targetRoute: '/upload-single-stone',
    targetElement: '.scan-certificate-button',
    actionType: 'scan',
    reward: { 
      en: '📸 Diamond Scanner Badge', 
      he: '📸 תג סורק יהלומים' 
    },
    order: 2
  },
  {
    id: 'complete-form',
    title: { 
      en: '✍️ Complete Diamond Details', 
      he: '✍️ השלם פרטי יהלום' 
    },
    description: { 
      en: 'Perfect! Now let\'s fill in the final details and add your diamond to inventory.',
      he: 'מושלם! עכשיו בואו נמלא את הפרטים הסופיים ונוסיף את היהלום למלאי.' 
    },
    objective: { 
      en: 'Submit the diamond form', 
      he: 'שלח את טופס היהלום' 
    },
    targetElement: '.submit-diamond-button',
    actionType: 'form',
    reward: { 
      en: '💾 Data Master Badge', 
      he: '💾 תג מאסטר נתונים' 
    },
    order: 3
  },
  {
    id: 'view-dashboard',
    title: { 
      en: '📊 Discover Your Dashboard', 
      he: '📊 גלה את לוח הבקרה שלך' 
    },
    description: { 
      en: 'Excellent! Your diamond is now in the system. Let\'s see it in your dashboard.',
      he: 'מצוין! היהלום שלך נמצא כעת במערכת. בואו נראה אותו בלוח הבקרה שלך.' 
    },
    objective: { 
      en: 'Navigate to dashboard and view your diamond', 
      he: 'נווט للוח הבקרה וצפה ביהלום שלך' 
    },
    targetRoute: '/dashboard',
    targetElement: '.diamond-card',
    actionType: 'navigate',
    reward: { 
      en: '📈 Dashboard Pro Badge', 
      he: '📈 תג מקצוען לוח בקרה' 
    },
    order: 4
  },
  {
    id: 'visit-store',
    title: { 
      en: '🏪 Check Your Store', 
      he: '🏪 בדוק את החנות שלך' 
    },
    description: { 
      en: 'Amazing! Now let\'s see how customers will view your diamond in your public store.',
      he: 'מדהים! עכשיו בואו נראה איך לקוחות יראו את היהלום שלך בחנות הציבורית שלך.' 
    },
    objective: { 
      en: 'View your diamond in the store', 
      he: 'צפה ביהלום שלך בחנות' 
    },
    targetRoute: '/store',
    targetElement: '.store-diamond-card',
    actionType: 'navigate',
    reward: { 
      en: '🛍️ Store Manager Badge', 
      he: '🛍️ תג מנהל חנות' 
    },
    order: 5
  },
  {
    id: 'inventory-management',
    title: { 
      en: '📦 Master Your Inventory', 
      he: '📦 שלוט במלאי שלך' 
    },
    description: { 
      en: 'Great! Now let\'s learn how to manage your inventory. We\'ll explore editing options.',
      he: 'נהדר! עכשיו בואו נלמד איך לנהל את המלאי שלך. נחקור אפשרויות עריכה.' 
    },
    objective: { 
      en: 'Navigate to inventory and explore options', 
      he: 'נווט למלאי וחקור אפשרויות' 
    },
    targetRoute: '/inventory',
    targetElement: '.inventory-actions',
    actionType: 'navigate',
    reward: { 
      en: '🎯 Inventory Expert Badge', 
      he: '🎯 תג מומחה מלאי' 
    },
    order: 6
  },
  {
    id: 'quest-master',
    title: { 
      en: '🎉 Quest Complete!', 
      he: '🎉 המשימה הושלמה!' 
    },
    description: { 
      en: 'Congratulations! You\'ve mastered the diamond management system. You\'re now ready to manage your diamond business like a pro!',
      he: 'ברכות! שלטת במערכת ניהול היהלומים. אתה מוכן עכשיו לנהל את עסק היהלומים שלך כמו מקצוען!' 
    },
    objective: { 
      en: 'Celebrate your achievement!', 
      he: 'חגוג את ההישג שלך!' 
    },
    actionType: 'click',
    reward: { 
      en: '👑 Diamond Master Badge', 
      he: '👑 תג מאסטר יהלומים' 
    },
    order: 7
  }
];

const InteractiveWizardContext = createContext<InteractiveWizardContextType | null>(null);

export function InteractiveWizardProvider({ children }: { children: React.ReactNode }) {
  const { user } = useTelegramAuth();
  const { impactOccurred, notificationOccurred } = useTelegramHapticFeedback();
  const navigate = useNavigate();
  
  const [isActive, setIsActive] = useState(false);
  const [currentQuest, setCurrentQuest] = useState(0);
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);
  const [language, setLanguage] = useState<'en' | 'he'>('he');
  const [waitingForAction, setWaitingForAction] = useState(false);

  // Load saved progress
  useEffect(() => {
    if (user) {
      const savedProgress = localStorage.getItem(`wizard-progress-${user.id}`);
      const savedLanguage = localStorage.getItem(`wizard-language-${user.id}`) as 'en' | 'he';
      
      if (savedProgress) {
        const { currentQuest: saved, completedQuests: savedCompleted } = JSON.parse(savedProgress);
        setCurrentQuest(saved);
        setCompletedQuests(savedCompleted);
      }
      
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    }
  }, [user]);

  const saveProgress = () => {
    if (user) {
      localStorage.setItem(`wizard-progress-${user.id}`, JSON.stringify({
        currentQuest,
        completedQuests
      }));
      localStorage.setItem(`wizard-language-${user.id}`, language);
    }
  };

  const startWizard = () => {
    impactOccurred('medium');
    setIsActive(true);
    setCurrentQuest(0);
    setCompletedQuests([]);
    setWaitingForAction(false);
  };

  const nextQuest = () => {
    if (currentQuest < wizardQuests.length - 1) {
      impactOccurred('light');
      setCurrentQuest(prev => prev + 1);
      setWaitingForAction(false);
      
      // Navigate if quest requires it
      const nextQuestData = wizardQuests[currentQuest + 1];
      if (nextQuestData.targetRoute) {
        navigate(nextQuestData.targetRoute);
      }
    } else {
      // Wizard complete
      notificationOccurred('success');
      setIsActive(false);
      if (user) {
        localStorage.setItem(`wizard-completed-${user.id}`, 'true');
      }
    }
    saveProgress();
  };

  const completeQuest = (questId: string) => {
    if (!completedQuests.includes(questId)) {
      notificationOccurred('success');
      setCompletedQuests(prev => [...prev, questId]);
      
      // Auto-advance to next quest after celebration
      setTimeout(() => {
        nextQuest();
      }, 2000);
    }
  };

  const exitWizard = () => {
    impactOccurred('light');
    setIsActive(false);
    setWaitingForAction(false);
    saveProgress();
  };

  const resumeWizard = () => {
    impactOccurred('medium');
    setIsActive(true);
  };

  const handleActionCompleted = () => {
    const currentQuestData = wizardQuests[currentQuest];
    if (currentQuestData && waitingForAction) {
      completeQuest(currentQuestData.id);
      setWaitingForAction(false);
    }
  };

  // Set waiting for action when quest becomes active
  useEffect(() => {
    const currentQuestData = wizardQuests[currentQuest];
    if (currentQuestData && isActive) {
      setWaitingForAction(true);
    }
  }, [currentQuest, isActive]);

  const currentQuestData = wizardQuests[currentQuest] || null;

  return (
    <InteractiveWizardContext.Provider
      value={{
        isActive,
        currentQuest,
        totalQuests: wizardQuests.length,
        currentQuestData,
        language,
        completedQuests,
        startWizard,
        nextQuest,
        completeQuest,
        exitWizard,
        resumeWizard,
        setLanguage,
        waitingForAction,
        handleActionCompleted,
      }}
    >
      {children}
    </InteractiveWizardContext.Provider>
  );
}

export function useInteractiveWizard() {
  const context = useContext(InteractiveWizardContext);
  if (!context) {
    throw new Error('useInteractiveWizard must be used within InteractiveWizardProvider');
  }
  return context;
}

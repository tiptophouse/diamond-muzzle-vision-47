
import React, { useEffect } from 'react';
import { useTutorial } from '@/contexts/TutorialContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, Sparkles, Globe, Scan, Package, Store, MessageSquare, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TutorialModal() {
  const navigate = useNavigate();
  const { 
    isActive, 
    currentStep, 
    totalSteps, 
    currentStepData, 
    currentLanguage,
    setLanguage,
    nextStep, 
    prevStep, 
    skipTutorial 
  } = useTutorial();

  const handleUploadCertificate = () => {
    navigate('/upload-single-stone?action=scan');
    skipTutorial();
  };

  const handleContextualAction = () => {
    switch (currentStepData?.section) {
      case 'welcome':
        nextStep();
        break;
      case 'upload':
        handleUploadCertificate();
        break;
      case 'inventory':
        navigate('/inventory');
        skipTutorial();
        break;
      case 'store':
        navigate('/store');
        skipTutorial();
        break;
      case 'dashboard':
        navigate('/dashboard');
        skipTutorial();
        break;
      case 'chat':
        navigate('/chat');
        skipTutorial();
        break;
      default:
        nextStep();
    }
  };

  const getContextualButton = () => {
    if (!currentStepData) return null;

    const buttonConfigs = {
      welcome: {
        label: { he: 'התחל סיור', en: 'Start Tour' },
        icon: Sparkles,
        variant: 'default' as const
      },
      upload: {
        label: { he: 'סרוק תעודה עכשיו', en: 'Scan Certificate Now' },
        icon: Scan,
        variant: 'default' as const
      },
      inventory: {
        label: { he: 'עבור למלאי', en: 'Go to Inventory' },
        icon: Package,
        variant: 'default' as const
      },
      store: {
        label: { he: 'עבור לחנות', en: 'Go to Store' },
        icon: Store,
        variant: 'default' as const
      },
      dashboard: {
        label: { he: 'עבור לדשבורד', en: 'Go to Dashboard' },
        icon: BarChart3,
        variant: 'default' as const
      },
      chat: {
        label: { he: 'עבור לצ׳אט', en: 'Go to Chat' },
        icon: MessageSquare,
        variant: 'default' as const
      }
    };

    const config = buttonConfigs[currentStepData.section as keyof typeof buttonConfigs];
    if (!config) return null;

    const IconComponent = config.icon;

    return (
      <Button
        onClick={handleContextualAction}
        variant={config.variant}
        className="flex items-center gap-2 px-6"
      >
        <IconComponent className="h-4 w-4" />
        {config.label[currentLanguage]}
      </Button>
    );
  };

  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isActive]);

  if (!isActive || !currentStepData) return null;

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={skipTutorial} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold text-sm">
                {currentLanguage === 'he' ? 'שלב' : 'Step'} {currentStep + 1} {currentLanguage === 'he' ? 'מתוך' : 'of'} {totalSteps}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage(currentLanguage === 'en' ? 'he' : 'en')}
                className="text-white/80 hover:text-white transition-colors p-1 rounded"
                title={currentLanguage === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
              >
                <Globe className="h-4 w-4" />
              </button>
              <button
                onClick={skipTutorial}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-white/20"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3" dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}>
            {currentStepData.title[currentLanguage]}
          </h2>
          
          <div className="text-gray-600 mb-6 leading-relaxed" dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}>
            {currentStepData.content[currentLanguage]}
          </div>

          {/* Welcome step special illustration */}
          {currentStepData.id === 'welcome' && (
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">💎</div>
              <div className="text-sm text-gray-500">
                Professional Diamond Inventory Management
              </div>
            </div>
          )}

          {/* Section-specific illustrations */}
          {currentStepData.section === 'dashboard' && (
            <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">📊</div>
                <div>Analytics</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="text-2xl mb-1">💰</div>
                <div>Revenue</div>
              </div>
            </div>
          )}

          {currentStepData.section === 'inventory' && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="text-sm text-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <span>✨ Add Diamond</span>
                  <span>🔍 Search & Filter</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>✏️ Edit Details</span>
                  <span>👁️ Store Visibility</span>
                </div>
              </div>
            </div>
          )}

          {currentStepData.section === 'store' && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-6 text-center">
              <div className="text-2xl mb-2">🏪</div>
              <div className="text-sm text-gray-600">
                Beautiful public storefront for your customers
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex flex-col gap-3">
          {/* Contextual action button */}
          {getContextualButton() && (
            <div className="flex justify-center">
              {getContextualButton()}
            </div>
          )}
          
          {/* Navigation buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isFirstStep}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {currentLanguage === 'he' ? 'קודם' : 'Previous'}
            </Button>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={skipTutorial}
                className="text-gray-600"
              >
                {isLastStep 
                  ? (currentLanguage === 'he' ? 'סגור' : 'Close')
                  : (currentLanguage === 'he' ? 'דלג על הסיור' : 'Skip Tour')
                }
              </Button>
              
              <Button
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                {isLastStep 
                  ? (currentLanguage === 'he' ? 'סיום' : 'Finish')
                  : (currentLanguage === 'he' ? 'הבא' : 'Next')
                }
                {!isLastStep && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

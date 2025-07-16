import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTutorial } from '@/contexts/TutorialContext';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';

export function TutorialModalWithNavigation() {
  const { 
    isActive, 
    currentStepData, 
    currentStep, 
    totalSteps, 
    nextStep, 
    prevStep, 
    skipTutorial 
  } = useTutorial();
  
  const navigate = useNavigate();

  useEffect(() => {
    if (isActive && currentStepData?.targetElement) {
      const element = document.querySelector(currentStepData.targetElement);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Add highlight effect
        element.classList.add('tutorial-highlight');
        return () => element.classList.remove('tutorial-highlight');
      }
    }
  }, [isActive, currentStepData]);

  const handlePrimaryAction = () => {
    const step = currentStepData;
    if (!step) return;

    // Smart navigation based on step
    switch (step.id) {
      case 'welcome':
        nextStep();
        break;
      case 'gia-scan':
        navigate('/upload-single-stone?action=scan');
        skipTutorial(); // End tutorial when going to scan
        return;
      case 'inventory-management':
        navigate('/inventory');
        nextStep();
        break;
      case 'store-sharing':
        navigate('/store');
        skipTutorial(); // End tutorial when navigating to store
        return;
      default:
        nextStep();
    }
  };

  if (!isActive || !currentStepData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={skipTutorial} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md mx-4 overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-6">
          <button
            onClick={skipTutorial}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
              {currentStep + 1}
            </div>
            <h2 className="text-xl font-bold">{currentStepData.title}</h2>
          </div>
          
          <div className="w-full bg-white/20 rounded-full h-2 mb-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
          
          <div className="text-sm text-white/80">
            שלב {currentStep + 1} מתוך {totalSteps}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 leading-relaxed mb-6 text-right">
            {currentStepData.content}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  className="text-gray-600"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  קודם
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={skipTutorial}
                className="text-gray-600 text-sm"
              >
                {currentStepData.actions?.secondary || 'דלג'}
              </Button>
            </div>

            <Button
              onClick={handlePrimaryAction}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {currentStepData.actions?.primary || 'הבא'}
              <ArrowRight className="h-4 w-4 mr-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
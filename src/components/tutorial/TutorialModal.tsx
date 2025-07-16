
import React, { useEffect } from 'react';
import { useTutorial } from '@/contexts/TutorialContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export function TutorialModal() {
  const { 
    isActive, 
    currentStep, 
    totalSteps, 
    currentStepData, 
    nextStep, 
    prevStep, 
    skipTutorial 
  } = useTutorial();

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
                Step {currentStep + 1} of {totalSteps}
              </span>
            </div>
            <button
              onClick={skipTutorial}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-white/20"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {currentStepData.title}
          </h2>
          
          <div className="text-gray-600 mb-6 leading-relaxed">
            {currentStepData.content}
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
        <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={isFirstStep}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={skipTutorial}
              className="text-gray-600"
            >
              {isLastStep ? 'Close' : 'Skip Tour'}
            </Button>
            
            <Button
              onClick={nextStep}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {isLastStep ? 'Finish' : 'Next'}
              {!isLastStep && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

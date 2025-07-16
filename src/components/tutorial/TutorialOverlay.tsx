import React, { useEffect, useState, useRef } from 'react';
import { useTutorial } from '@/contexts/TutorialContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, ChevronLeft, ChevronRight, Sparkles, Globe } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface ElementPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TutorialOverlay() {
  const { 
    isActive, 
    currentStep, 
    totalSteps, 
    currentStepData, 
    currentLanguage,
    setLanguage,
    waitingForClick,
    handleRequiredClick,
    nextStep, 
    prevStep, 
    skipTutorial 
  } = useTutorial();
  
  const navigate = useNavigate();
  const location = useLocation();
  const [elementPosition, setElementPosition] = useState<ElementPosition | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number; placement: string }>({ top: 0, left: 0, placement: 'bottom' });
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !currentStepData) return;

    // Navigate to correct page based on step
    const targetRoute = getRouteForStep(currentStepData.section);
    if (currentStepData.navigationTarget && location.pathname !== currentStepData.navigationTarget) {
      navigate(currentStepData.navigationTarget);
      return;
    } else if (!currentStepData.navigationTarget && location.pathname !== targetRoute) {
      navigate(targetRoute);
      return;
    }

    // Wait for navigation and DOM to settle
    const timer = setTimeout(() => {
      const targetElement = currentStepData.targetElement 
        ? document.querySelector(currentStepData.targetElement) as HTMLElement
        : null;

      if (targetElement) {
        updateElementPosition(targetElement);
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // No specific target, show tooltip in center
        setElementPosition(null);
        setTooltipPosition({ top: window.innerHeight / 2, left: window.innerWidth / 2, placement: 'center' });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isActive, currentStepData, location.pathname, navigate]);

  const getRouteForStep = (section: string): string => {
    switch (section) {
      case 'dashboard': return '/dashboard';
      case 'inventory': return '/inventory';
      case 'store': return '/store';
      case 'upload': return '/upload';
      case 'chat': return '/chat';
      case 'insights': return '/insights';
      case 'settings': return '/settings';
      default: return '/';
    }
  };

  const updateElementPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    const position = {
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
      width: rect.width,
      height: rect.height
    };
    
    setElementPosition(position);
    
    // Calculate tooltip position
    const tooltipWidth = 350;
    const tooltipHeight = 200;
    const spacing = 20;
    
    let tooltipTop = position.top + position.height + spacing;
    let tooltipLeft = position.left + (position.width / 2) - (tooltipWidth / 2);
    let placement = 'bottom';
    
    // Adjust if tooltip goes off screen
    if (tooltipTop + tooltipHeight > window.innerHeight + scrollTop) {
      tooltipTop = position.top - tooltipHeight - spacing;
      placement = 'top';
    }
    
    if (tooltipLeft < 20) {
      tooltipLeft = 20;
    } else if (tooltipLeft + tooltipWidth > window.innerWidth - 20) {
      tooltipLeft = window.innerWidth - tooltipWidth - 20;
    }
    
    setTooltipPosition({ top: tooltipTop, left: tooltipLeft, placement });
  };

  useEffect(() => {
    const handleResize = () => {
      if (currentStepData?.targetElement) {
        const element = document.querySelector(currentStepData.targetElement) as HTMLElement;
        if (element) updateElementPosition(element);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentStepData]);

  if (!isActive || !currentStepData) return null;

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 pointer-events-none">
      {/* Dark overlay with spotlight */}
      <div className="absolute inset-0 bg-black/80 transition-all duration-300">
        {elementPosition && (
          <>
            {/* Main highlight with super strong emphasis */}
            <div
              className="absolute bg-transparent border-4 border-red-500 rounded-lg animate-pulse"
              style={{
                top: elementPosition.top - 12,
                left: elementPosition.left - 12,
                width: elementPosition.width + 24,
                height: elementPosition.height + 24,
                boxShadow: `0 0 0 8px rgba(239, 68, 68, 0.6), 0 0 0 9999px rgba(0, 0, 0, 0.8), 0 0 60px rgba(239, 68, 68, 0.8)`
              }}
            />
            {/* Animated arrow pointing to element */}
            <div
              className="absolute pointer-events-none animate-bounce"
              style={{
                top: elementPosition.top - 50,
                left: elementPosition.left + elementPosition.width / 2 - 15,
                fontSize: '30px',
                zIndex: 9999
              }}
            >
              👇
            </div>
            {/* "CLICK HERE" text */}
            <div
              className="absolute pointer-events-none bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-lg animate-pulse"
              style={{
                top: elementPosition.top - 80,
                left: elementPosition.left + elementPosition.width / 2 - 60,
                zIndex: 9999,
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
              }}
            >
              CLICK HERE!
            </div>
          </>
        )}
      </div>

      {/* Tooltip */}
      <div
        className="absolute pointer-events-auto animate-fade-in"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          width: tooltipPosition.placement === 'center' ? '90%' : '350px',
          maxWidth: tooltipPosition.placement === 'center' ? '500px' : '350px',
          marginLeft: tooltipPosition.placement === 'center' ? '-45%' : '0',
          marginTop: tooltipPosition.placement === 'center' ? '-150px' : '0'
        }}
      >
        {/* Arrow pointing to element */}
        {elementPosition && tooltipPosition.placement !== 'center' && (
          <div className={`absolute w-0 h-0 ${
            tooltipPosition.placement === 'bottom' 
              ? 'border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white -top-2 left-1/2 -ml-2'
              : 'border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white -bottom-2 left-1/2 -ml-2'
          }`} />
        )}

        {/* Tooltip content */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <span className="font-semibold text-sm">
                  {currentLanguage === 'he' ? 'שלב' : 'Step'} {currentStep + 1} {currentLanguage === 'he' ? 'מתוך' : 'of'} {totalSteps}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setLanguage(currentLanguage === 'en' ? 'he' : 'en')}
                  className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded"
                  title={currentLanguage === 'en' ? 'Switch to Hebrew' : 'Switch to English'}
                >
                  <Globe className="h-3 w-3" />
                </button>
                <button
                  onClick={skipTutorial}
                  className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/20 rounded"
                >
                  <X className="h-4 w-4" />
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
            <h2 className="text-lg font-bold text-gray-900 mb-3" dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}>
              {currentStepData.title[currentLanguage]}
            </h2>
            
            <div className="text-gray-600 mb-6 leading-relaxed text-sm" dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}>
              {currentStepData.content[currentLanguage]}
            </div>

            {/* Step-specific illustrations */}
            {currentStepData.section === 'welcome' && (
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">💎</div>
                <div className="text-xs text-gray-500">
                  Professional Diamond Management
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
              className="flex items-center gap-2 text-sm"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
              {currentLanguage === 'he' ? 'קודם' : 'Previous'}
            </Button>

            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={skipTutorial}
                className="text-gray-600 text-sm"
                size="sm"
              >
                {isLastStep 
                  ? (currentLanguage === 'he' ? 'סגור' : 'Close')
                  : (currentLanguage === 'he' ? 'דלג' : 'Skip')
                }
              </Button>
              
              <Button
                onClick={waitingForClick ? handleRequiredClick : nextStep}
                disabled={waitingForClick && !currentStepData?.requireClick}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-sm"
                size="sm"
              >
                {waitingForClick 
                  ? (currentLanguage === 'he' ? 'מחכה ללחיצה...' : 'Waiting for click...')
                  : isLastStep 
                    ? (currentLanguage === 'he' ? 'סיום' : 'Finish')
                    : (currentLanguage === 'he' ? 'הבא' : 'Next')
                }
                {!isLastStep && !waitingForClick && <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
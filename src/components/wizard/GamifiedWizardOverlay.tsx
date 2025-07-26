
import React, { useEffect, useState, useRef } from 'react';
import { useInteractiveWizard } from '@/contexts/InteractiveWizardContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Star, Trophy, Target, Sparkles } from 'lucide-react';
import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';
import { useNavigate, useLocation } from 'react-router-dom';

interface ElementPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function GamifiedWizardOverlay() {
  const {
    isActive,
    currentQuest,
    totalQuests,
    currentQuestData,
    language,
    completedQuests,
    waitingForAction,
    handleActionCompleted,
    nextQuest,
    exitWizard,
    setLanguage
  } = useInteractiveWizard();

  const { impactOccurred, notificationOccurred } = useTelegramHapticFeedback();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [elementPosition, setElementPosition] = useState<ElementPosition | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Track element and highlight it
  useEffect(() => {
    if (!isActive || !currentQuestData || !currentQuestData.targetElement) return;

    const findAndHighlightElement = () => {
      const element = document.querySelector(currentQuestData.targetElement!) as HTMLElement;
      if (element) {
        updateElementPosition(element);
        
        // Add click listener for forced interaction
        const handleClick = (e: Event) => {
          e.stopPropagation();
          impactOccurred('medium');
          handleActionCompleted();
          setShowCelebration(true);
          
          // Remove highlight
          element.classList.remove('wizard-highlight');
          element.removeEventListener('click', handleClick);
        };

        element.addEventListener('click', handleClick);
        element.classList.add('wizard-highlight');
        
        return () => {
          element.removeEventListener('click', handleClick);
          element.classList.remove('wizard-highlight');
        };
      }
    };

    // Delay to ensure DOM is ready
    const timer = setTimeout(findAndHighlightElement, 500);
    return () => clearTimeout(timer);
  }, [currentQuestData, isActive, handleActionCompleted, impactOccurred]);

  // Navigate to target route when needed
  useEffect(() => {
    if (isActive && currentQuestData?.targetRoute && location.pathname !== currentQuestData.targetRoute) {
      navigate(currentQuestData.targetRoute);
    }
  }, [currentQuestData, location.pathname, navigate, isActive]);

  const updateElementPosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    setElementPosition({
      top: rect.top + scrollTop,
      left: rect.left + scrollLeft,
      width: rect.width,
      height: rect.height
    });

    // Scroll element into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const progressPercentage = ((currentQuest + 1) / totalQuests) * 100;

  if (!isActive || !currentQuestData) return null;

  return (
    <>
      {/* Wizard Styles */}
      <style>{`
        .wizard-highlight {
          position: relative !important;
          z-index: 998 !important;
          border: 3px solid #ff6b6b !important;
          border-radius: 12px !important;
          box-shadow: 
            0 0 0 6px rgba(255, 107, 107, 0.3),
            0 0 30px rgba(255, 107, 107, 0.6) !important;
          animation: wizard-pulse 1.5s infinite !important;
        }
        
        .wizard-highlight::before {
          content: '👆 CLICK HERE! 👆';
          position: absolute;
          top: -45px;
          left: 50%;
          transform: translateX(-50%);
          background: #ff6b6b;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          white-space: nowrap;
          z-index: 9999;
          animation: wizard-bounce 1s infinite;
          box-shadow: 0 4px 12px rgba(255, 107, 107, 0.4);
        }
        
        @keyframes wizard-pulse {
          0%, 100% { 
            transform: scale(1);
            border-color: #ff6b6b;
          }
          50% { 
            transform: scale(1.02);
            border-color: #ff4757;
            box-shadow: 0 0 0 8px rgba(255, 107, 107, 0.4), 0 0 40px rgba(255, 107, 107, 0.8);
          }
        }
        
        @keyframes wizard-bounce {
          0%, 100% { transform: translateX(-50%) translateY(0px); }
          50% { transform: translateX(-50%) translateY(-3px); }
        }
        
        .wizard-celebration {
          animation: wizard-celebrate 0.6s ease-out;
        }
        
        @keyframes wizard-celebrate {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Dark overlay with spotlight */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        <div className="absolute inset-0 bg-black/70">
          {elementPosition && (
            <div
              className="absolute bg-transparent rounded-lg"
              style={{
                top: elementPosition.top - 8,
                left: elementPosition.left - 8,
                width: elementPosition.width + 16,
                height: elementPosition.height + 16,
                boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.7)`
              }}
            />
          )}
        </div>
      </div>

      {/* Quest UI - Bottom Sheet Style */}
      <div className="fixed bottom-0 left-0 right-0 z-[51] pointer-events-auto">
        <div className="bg-gradient-to-t from-blue-600 to-purple-600 p-4 text-white">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              <span className="text-sm font-medium">
                Quest {currentQuest + 1} of {totalQuests}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  impactOccurred('light');
                  setLanguage(language === 'en' ? 'he' : 'en');
                }}
                className="text-white/80 hover:text-white hover:bg-white/20 text-xs px-2 py-1 h-8"
              >
                {language === 'en' ? 'עב' : 'EN'}
              </Button>
              
              {/* Exit Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  impactOccurred('light');
                  exitWizard();
                }}
                className="text-white/80 hover:text-white hover:bg-white/20 p-1 h-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Progress value={progressPercentage} className="h-2 mb-4 bg-white/20" />

          {/* Quest Content */}
          <div className={`space-y-3 ${showCelebration ? 'wizard-celebration' : ''}`} dir={language === 'he' ? 'rtl' : 'ltr'}>
            <div className="flex items-center gap-2">
              <div className="text-2xl">{showCelebration ? '🎉' : '💎'}</div>
              <h3 className="text-lg font-bold">
                {currentQuestData.title[language]}
              </h3>
            </div>
            
            <p className="text-white/90 text-sm leading-relaxed">
              {currentQuestData.description[language]}
            </p>

            {/* Objective */}
            <div className="bg-white/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-300 mb-1">
                <Star className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {language === 'he' ? 'משימה:' : 'Objective:'}
                </span>
              </div>
              <p className="text-sm font-medium">
                {currentQuestData.objective[language]}
              </p>
            </div>

            {/* Reward Preview */}
            <div className="flex items-center gap-2 text-yellow-200">
              <Trophy className="h-4 w-4" />
              <span className="text-xs">
                {language === 'he' ? 'פרס:' : 'Reward:'} {currentQuestData.reward[language]}
              </span>
            </div>

            {/* Action Status */}
            {waitingForAction && !showCelebration && (
              <div className="flex items-center gap-2 text-green-300 animate-pulse">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {language === 'he' ? 'מחכה לפעולה שלך...' : 'Waiting for your action...'}
                </span>
              </div>
            )}

            {showCelebration && (
              <div className="text-center py-2">
                <div className="text-3xl mb-2">🎉✨🏆✨🎉</div>
                <p className="text-yellow-300 font-bold">
                  {currentQuestData.reward[language]}
                </p>
              </div>
            )}
          </div>

          {/* Skip Option */}
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                impactOccurred('light');
                nextQuest();
              }}
              className="text-white/70 hover:text-white hover:bg-white/20 text-xs"
            >
              {language === 'he' ? 'דלג על המשימה' : 'Skip Quest'}
            </Button>
          </div>
        </div>
      </div>

      {/* Celebration Effect */}
      {showCelebration && (
        <div className="fixed inset-0 z-[52] pointer-events-none flex items-center justify-center">
          <div className="text-8xl animate-bounce">🎉</div>
        </div>
      )}
    </>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useTutorial } from '@/contexts/TutorialContext';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Star, 
  Sparkles, 
  Trophy,
  Target,
  Zap,
  CheckCircle,
  Globe,
  ArrowDown,
  MousePointer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface GamifiedTutorialProps {
  onComplete?: () => void;
}

export function GamifiedTutorial({ onComplete }: GamifiedTutorialProps) {
  const tutorial = useTutorial();
  if (!tutorial) return null;

  const {
    isActive,
    currentStep,
    totalSteps,
    currentStepData,
    currentLanguage,
    setLanguage,
    nextStep,
    prevStep,
    skipTutorial,
    completedSteps
  } = tutorial;

  const { hapticFeedback } = useTelegramWebApp();
  const navigate = useNavigate();
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, placement: 'bottom' });
  const [showCelebration, setShowCelebration] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Calculate progress and achievements
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
  const completedCount = completedSteps.length;
  const achievements = Math.floor(completedCount / 3);

  useEffect(() => {
    if (!isActive || !currentStepData) return;

    // Navigate to target page if specified
    if (currentStepData.navigationTarget) {
      const timer = setTimeout(() => {
        navigate(currentStepData.navigationTarget);
      }, 500);
      return () => clearTimeout(timer);
    }

    // Find and highlight target element
    const timer = setTimeout(() => {
      if (currentStepData.targetElement) {
        const element = document.querySelector(currentStepData.targetElement) as HTMLElement;
        if (element) {
          highlightElement(element);
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setHighlightedElement(null);
        setTooltipPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2, placement: 'center' });
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      clearHighlight();
    };
  }, [isActive, currentStepData, navigate]);

  const highlightElement = (element: HTMLElement) => {
    setHighlightedElement(element);
    
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    
    // Calculate tooltip position
    const tooltipWidth = 350;
    const tooltipHeight = 200;
    const spacing = 20;
    
    let x = rect.left + scrollLeft + (rect.width / 2) - (tooltipWidth / 2);
    let y = rect.top + scrollTop + rect.height + spacing;
    let placement = 'bottom';
    
    // Adjust if tooltip goes off screen
    if (y + tooltipHeight > window.innerHeight + scrollTop) {
      y = rect.top + scrollTop - tooltipHeight - spacing;
      placement = 'top';
    }
    
    // Keep tooltip within screen bounds
    if (x < 20) x = 20;
    if (x + tooltipWidth > window.innerWidth - 20) x = window.innerWidth - tooltipWidth - 20;
    
    setTooltipPosition({ x, y, placement });
  };

  const clearHighlight = () => {
    if (highlightedElement) {
      setHighlightedElement(null);
    }
  };

  const handleNext = () => {
    hapticFeedback.impact('medium');
    
    // Award points for completing step
    setUserPoints(prev => prev + 10);
    
    // Show celebration for major milestones
    if ((currentStep + 1) % 3 === 0) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    }
    
    if (currentStep === totalSteps - 1) {
      onComplete?.();
      skipTutorial();
    } else {
      nextStep();
    }
  };

  const handlePrevious = () => {
    hapticFeedback.impact('light');
    prevStep();
  };

  const handleSkip = () => {
    hapticFeedback.impact('light');
    clearHighlight();
    skipTutorial();
    onComplete?.();
  };

  if (!isActive || !currentStepData) return null;

  return (
    <>
      {/* Overlay with spotlight effect */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 z-[60] pointer-events-none"
        style={{ height: '100vh' }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/70 transition-all duration-500" />
        
        {/* Spotlight effect */}
        {highlightedElement && (
          <div
            className="absolute pointer-events-none"
            style={{
              top: highlightedElement.offsetTop - 12,
              left: highlightedElement.offsetLeft - 12,
              width: highlightedElement.offsetWidth + 24,
              height: highlightedElement.offsetHeight + 24,
              boxShadow: `
                0 0 0 4px rgba(59, 130, 246, 0.8),
                0 0 0 8px rgba(59, 130, 246, 0.4),
                0 0 0 9999px rgba(0, 0, 0, 0.7),
                0 0 40px rgba(59, 130, 246, 0.8)
              `,
              borderRadius: '12px',
              zIndex: 61
            }}
          />
        )}

        {/* Animated pointer */}
        {highlightedElement && (
          <motion.div
            className="absolute pointer-events-none text-blue-400 z-[62]"
            style={{
              top: highlightedElement.offsetTop - 50,
              left: highlightedElement.offsetLeft + highlightedElement.offsetWidth / 2 - 15,
            }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowDown className="h-8 w-8" />
          </motion.div>
        )}

        {/* Click indicator */}
        {highlightedElement && currentStepData.requireClick && (
          <motion.div
            className="absolute pointer-events-none bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm z-[63]"
            style={{
              top: highlightedElement.offsetTop - 70,
              left: highlightedElement.offsetLeft + highlightedElement.offsetWidth / 2 - 50,
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <MousePointer className="h-4 w-4 inline mr-1" />
            {currentLanguage === 'he' ? 'לחץ כאן!' : 'CLICK HERE!'}
          </motion.div>
        )}
      </div>

      {/* Floating Tutorial Card */}
      <motion.div
        className="fixed z-[70] pointer-events-auto"
        style={{
          top: tooltipPosition.y,
          left: tooltipPosition.x,
          width: tooltipPosition.placement === 'center' ? '90%' : '350px',
          maxWidth: '400px',
          marginLeft: tooltipPosition.placement === 'center' ? '-45%' : '0',
          marginTop: tooltipPosition.placement === 'center' ? '-150px' : '0'
        }}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {/* Arrow pointing to element */}
        {highlightedElement && tooltipPosition.placement !== 'center' && (
          <div className={`absolute w-0 h-0 ${
            tooltipPosition.placement === 'bottom' 
              ? 'border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-background -top-2 left-1/2 -ml-2'
              : 'border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-background -bottom-2 left-1/2 -ml-2'
          }`} />
        )}

        <Card className="shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-background to-background/95 backdrop-blur-sm">
          {/* Header with gamification elements */}
          <div className="bg-gradient-to-r from-primary via-primary to-primary-foreground px-4 py-3 text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20" />
            
            <div className="relative flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-bold text-sm">
                    {currentLanguage === 'he' ? 'שלב' : 'Step'} {currentStep + 1}/{totalSteps}
                  </span>
                </div>
                
                {/* Achievement badges */}
                <div className="flex gap-1">
                  {Array.from({ length: achievements }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Points display */}
                <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                  <Trophy className="h-3 w-3 mr-1" />
                  {userPoints}
                </Badge>

                {/* Language toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    hapticFeedback.selection();
                    setLanguage(currentLanguage === 'en' ? 'he' : 'en');
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/10 p-1 h-6 w-6"
                >
                  <Globe className="h-3 w-3" />
                </Button>

                {/* Close button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-white/80 hover:text-white hover:bg-white/10 p-1 h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <Progress 
              value={progressPercentage} 
              className="h-2 bg-white/20"
            />
          </div>

          {/* Content */}
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Step icon and title */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base text-foreground leading-tight" dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}>
                    {currentStepData.title[currentLanguage]}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed" dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}>
                    {currentStepData.content[currentLanguage]}
                  </p>
                </div>
              </div>

              {/* Step completion indicator */}
              {completedSteps.includes(currentStepData.id) && (
                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                    {currentLanguage === 'he' ? 'הושלם!' : 'Completed!'}
                  </span>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-3 w-3" />
                  {currentLanguage === 'he' ? 'קודם' : 'Previous'}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-muted-foreground"
                  >
                    {currentLanguage === 'he' ? 'דלג' : 'Skip'}
                  </Button>

                  <Button
                    size="sm"
                    onClick={handleNext}
                    className="bg-primary hover:bg-primary/90 flex items-center gap-1"
                  >
                    {currentStep === totalSteps - 1 
                      ? (currentLanguage === 'he' ? 'סיום' : 'Finish')
                      : (currentLanguage === 'he' ? 'הבא' : 'Next')
                    }
                    {currentStep !== totalSteps - 1 && <ChevronRight className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Celebration animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            className="fixed inset-0 z-[80] pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-6xl"
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.2, 1] }}
              transition={{ duration: 0.6 }}
            >
              🎉
            </motion.div>
            <motion.div
              className="absolute text-yellow-400"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ duration: 0.8 }}
            >
              <Zap className="h-12 w-12" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

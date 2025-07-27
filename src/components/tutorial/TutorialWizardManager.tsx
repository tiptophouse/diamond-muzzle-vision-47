
import React, { useState, useEffect } from 'react';
import { useTutorial } from '@/contexts/TutorialContext';
import { GamifiedTutorial } from './GamifiedTutorial';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, X, Play, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function TutorialWizardManager() {
  const tutorial = useTutorial();
  if (!tutorial) return null;

  const { 
    isActive, 
    startTutorial, 
    skipTutorial, 
    restartTutorial,
    hasSeenTutorial,
    currentLanguage 
  } = tutorial;

  const [showWelcome, setShowWelcome] = useState(!hasSeenTutorial && !isActive);

  // Auto-show welcome for new users
  useEffect(() => {
    if (!hasSeenTutorial && !isActive) {
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTutorial, isActive]);

  const handleStartTutorial = () => {
    setShowWelcome(false);
    startTutorial();
  };

  const handleSkipWelcome = () => {
    setShowWelcome(false);
    skipTutorial();
  };

  const handleTutorialComplete = () => {
    setShowWelcome(false);
  };

  return (
    <>
      {/* Main gamified tutorial */}
      {isActive && (
        <GamifiedTutorial onComplete={handleTutorialComplete} />
      )}

      {/* Welcome overlay for new users */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ height: '100vh' }}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-full max-w-md"
            >
              <Card className="shadow-2xl border-2 border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 px-6 py-4 text-primary-foreground relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-6 w-6" />
                        <h2 className="text-xl font-bold">
                          {currentLanguage === 'he' 
                            ? 'ברוכים הבאים למזל יהלומים!' 
                            : 'Welcome to Diamond Mazal!'
                          }
                        </h2>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSkipWelcome}
                        className="text-white/80 hover:text-white hover:bg-white/10 p-1"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6" dir={currentLanguage === 'he' ? 'rtl' : 'ltr'}>
                    <div className="text-center space-y-4">
                      <div className="text-6xl mb-4">💎</div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {currentLanguage === 'he' 
                          ? 'מוכנים למסע מדהים?' 
                          : 'Ready for an Amazing Journey?'
                        }
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {currentLanguage === 'he' 
                          ? 'אני כאן כדי להדריך אתכם דרך כל התכונות של המערכת. הסיור האינטראקטיביה שלנו יעזור לכם להתחיל בקלות!'
                          : 'I\'m here to guide you through all the features of our system. Our interactive tour will help you get started easily!'
                        }
                      </p>
                    </div>

                    {/* Features preview */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg text-center">
                        <div className="text-xl mb-1">📱</div>
                        <div className="font-medium text-blue-700 dark:text-blue-400">
                          {currentLanguage === 'he' ? 'סרוק תעודות' : 'Scan Certificates'}
                        </div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg text-center">
                        <div className="text-xl mb-1">📊</div>
                        <div className="font-medium text-green-700 dark:text-green-400">
                          {currentLanguage === 'he' ? 'נהל מלאי' : 'Manage Inventory'}
                        </div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg text-center">
                        <div className="text-xl mb-1">🏪</div>
                        <div className="font-medium text-purple-700 dark:text-purple-400">
                          {currentLanguage === 'he' ? 'חנות ציבורית' : 'Public Store'}
                        </div>
                      </div>
                      <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg text-center">
                        <div className="text-xl mb-1">📈</div>
                        <div className="font-medium text-orange-700 dark:text-orange-400">
                          {currentLanguage === 'he' ? 'תובנות' : 'Analytics'}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-3">
                      <Button
                        onClick={handleStartTutorial}
                        className="w-full h-12 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-semibold flex items-center justify-center gap-2 shadow-lg"
                      >
                        <Play className="h-5 w-5" />
                        {currentLanguage === 'he' ? 'התחל סיור מודרך' : 'Start Guided Tour'}
                      </Button>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={handleSkipWelcome}
                          className="flex-1"
                        >
                          {currentLanguage === 'he' ? 'אולי מאוחר יותר' : 'Maybe Later'}
                        </Button>
                        
                        {hasSeenTutorial && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              restartTutorial();
                              setShowWelcome(false);
                            }}
                            className="flex-1 flex items-center gap-1"
                          >
                            <RotateCcw className="h-4 w-4" />
                            {currentLanguage === 'he' ? 'התחל מחדש' : 'Restart'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

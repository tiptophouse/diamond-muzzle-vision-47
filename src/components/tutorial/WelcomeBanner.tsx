
import React from 'react';
import { useTutorial } from '@/contexts/TutorialContext';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';

export function WelcomeBanner() {
  const { hasSeenTutorial, startTutorial } = useTutorial();

  // Don't show if user has already seen the tutorial
  if (hasSeenTutorial) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 mb-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Welcome to Diamond Muzzle! 💎</h3>
            <p className="text-blue-100 text-sm">
              Take a quick tour to discover all the powerful features available to you.
            </p>
          </div>
        </div>
        
        <Button
          onClick={startTutorial}
          variant="secondary"
          size="sm"
          className="bg-white text-blue-600 hover:bg-blue-50"
        >
          Start Tour
        </Button>
      </div>
    </div>
  );
}

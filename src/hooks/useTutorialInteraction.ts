import { useEffect } from 'react';
import { useTutorial } from '@/contexts/TutorialContext';

export function useTutorialInteraction(elementSelector: string) {
  const { waitingForClick, handleRequiredClick, currentStepData } = useTutorial();

  useEffect(() => {
    if (!waitingForClick || !currentStepData?.targetElement) return;
    
    if (currentStepData.targetElement === elementSelector) {
      const element = document.querySelector(elementSelector);
      if (element) {
        const handleClick = () => {
          handleRequiredClick();
        };

        element.addEventListener('click', handleClick);
        
        // Add visual emphasis
        element.classList.add('tutorial-highlight');
        
        return () => {
          element.removeEventListener('click', handleClick);
          element.classList.remove('tutorial-highlight');
        };
      }
    }
  }, [waitingForClick, currentStepData, elementSelector, handleRequiredClick]);
}

// CSS for tutorial highlighting
const tutorialStyles = `
  .tutorial-highlight {
    position: relative;
    animation: tutorial-pulse 2s infinite;
  }
  
  .tutorial-highlight::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border: 2px solid #3b82f6;
    border-radius: 8px;
    pointer-events: none;
    animation: tutorial-glow 1.5s ease-in-out infinite alternate;
  }
  
  @keyframes tutorial-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }
  
  @keyframes tutorial-glow {
    from { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
    to { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('tutorial-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'tutorial-styles';
  styleSheet.textContent = tutorialStyles;
  document.head.appendChild(styleSheet);
}
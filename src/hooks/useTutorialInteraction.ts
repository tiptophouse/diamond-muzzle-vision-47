import { useEffect } from 'react';
import { useTutorial } from '@/contexts/TutorialContext';

export function useTutorialInteraction(elementSelector: string) {
  const { waitingForClick, handleRequiredClick, currentStepData } = useTutorial();

  useEffect(() => {
    if (!waitingForClick || !currentStepData?.targetElement) return;
    
    if (currentStepData.targetElement === elementSelector) {
      const element = document.querySelector(elementSelector) as HTMLElement;
      if (element) {
        const handleClick = () => {
          handleRequiredClick(elementSelector);
        };

        element.addEventListener('click', handleClick);
        
        // Add visual emphasis and instructions
        element.classList.add('tutorial-highlight', 'tutorial-pulse');
        
        // Add click instruction overlay
        const instruction = document.createElement('div');
        instruction.className = 'tutorial-click-instruction';
        instruction.innerHTML = `
          <div class="tutorial-arrow">👆</div>
          <div class="tutorial-text">CLICK HERE!</div>
        `;
        element.style.position = 'relative';
        element.appendChild(instruction);
        
        return () => {
          element.removeEventListener('click', handleClick);
          element.classList.remove('tutorial-highlight', 'tutorial-pulse');
          const instructionEl = element.querySelector('.tutorial-click-instruction');
          if (instructionEl) {
            instructionEl.remove();
          }
        };
      }
    }
  }, [waitingForClick, currentStepData, elementSelector, handleRequiredClick]);
}

// CSS for tutorial highlighting with more visual emphasis
const tutorialStyles = `
  .tutorial-highlight {
    position: relative !important;
    z-index: 999 !important;
    animation: tutorial-super-pulse 1.5s infinite;
    border: 3px solid #3b82f6 !important;
    border-radius: 12px !important;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.6) !important;
    background: rgba(59, 130, 246, 0.1) !important;
  }
  
  .tutorial-pulse {
    animation: tutorial-bounce 2s infinite;
  }
  
  .tutorial-click-instruction {
    position: absolute;
    top: -60px;
    left: 50%;
    transform: translateX(-50%);
    background: #ff4444;
    color: white;
    padding: 8px 16px;
    border-radius: 8px;
    font-weight: bold;
    font-size: 12px;
    text-align: center;
    z-index: 9999;
    animation: tutorial-bounce-instruction 1s infinite;
    box-shadow: 0 4px 12px rgba(255, 68, 68, 0.4);
  }
  
  .tutorial-arrow {
    font-size: 24px;
    animation: tutorial-point 1s infinite;
    margin-bottom: 4px;
  }
  
  .tutorial-text {
    font-weight: 900;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  }
  
  @keyframes tutorial-super-pulse {
    0%, 100% { 
      transform: scale(1);
      border-color: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.6);
    }
    50% { 
      transform: scale(1.05);
      border-color: #ff4444;
      box-shadow: 0 0 0 8px rgba(255, 68, 68, 0.4), 0 0 40px rgba(255, 68, 68, 0.8);
    }
  }
  
  @keyframes tutorial-bounce {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
  
  @keyframes tutorial-bounce-instruction {
    0%, 100% { transform: translateX(-50%) translateY(0px); }
    50% { transform: translateX(-50%) translateY(-5px); }
  }
  
  @keyframes tutorial-point {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.3); }
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('tutorial-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'tutorial-styles';
  styleSheet.textContent = tutorialStyles;
  document.head.appendChild(styleSheet);
}

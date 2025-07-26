
import { useEffect } from 'react';
import { useInteractiveWizard } from '@/contexts/InteractiveWizardContext';

export function useWizardInteraction(elementId: string, actionType?: string) {
  const { isActive, currentQuestData, waitingForAction, handleActionCompleted } = useInteractiveWizard();

  useEffect(() => {
    if (!isActive || !currentQuestData || !waitingForAction) return;
    
    // Check if this element matches the current quest target
    const targetMatches = currentQuestData.targetElement === `.${elementId}` || 
                         currentQuestData.targetElement === `#${elementId}` ||
                         currentQuestData.targetElement === elementId;
    
    if (targetMatches) {
      const element = document.querySelector(`#${elementId}`) || 
                     document.querySelector(`.${elementId}`) ||
                     document.querySelector(elementId);
      
      if (element) {
        // Add wizard highlighting
        element.classList.add('wizard-target');
        
        // For specific action types, we might want different behavior
        if (actionType === 'scan') {
          // Handle scan completion
          const handleScanComplete = () => {
            handleActionCompleted();
          };
          
          // Listen for scan completion events
          element.addEventListener('scanComplete', handleScanComplete);
          return () => element.removeEventListener('scanComplete', handleScanComplete);
        }
        
        return () => {
          element.classList.remove('wizard-target');
        };
      }
    }
  }, [isActive, currentQuestData, waitingForAction, elementId, actionType, handleActionCompleted]);
}

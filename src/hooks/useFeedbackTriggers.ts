
import { useEffect, useState, useCallback } from 'react';
import { useFeedbackCollection } from './useFeedbackCollection';

interface FeedbackTrigger {
  id: string;
  category: string;
  condition: () => boolean;
  priority: number;
  delay?: number;
  cooldown?: number; // Minutes before showing again
}

export function useFeedbackTriggers() {
  const [activeTrigger, setActiveTrigger] = useState<FeedbackTrigger | null>(null);
  const [shownTriggers, setShownTriggers] = useState<Set<string>>(new Set());
  const { trackInteraction } = useFeedbackCollection();

  const triggers: FeedbackTrigger[] = [
    {
      id: 'successful_upload',
      category: 'upload_experience',
      condition: () => {
        const successfulUploads = parseInt(localStorage.getItem('successful_uploads') || '0');
        return successfulUploads > 0 && successfulUploads % 5 === 0; // Every 5 uploads
      },
      priority: 1,
      delay: 2000,
      cooldown: 60, // 1 hour
    },
    {
      id: 'inventory_interaction',
      category: 'inventory_experience',
      condition: () => {
        const inventoryActions = parseInt(localStorage.getItem('inventory_actions') || '0');
        return inventoryActions > 10; // After 10 inventory actions
      },
      priority: 2,
      delay: 3000,
      cooldown: 120, // 2 hours
    },
    {
      id: 'chat_usage',
      category: 'chat_experience',
      condition: () => {
        const chatMessages = parseInt(localStorage.getItem('chat_messages_sent') || '0');
        return chatMessages > 5; // After 5 chat messages
      },
      priority: 3,
      delay: 1000,
      cooldown: 180, // 3 hours
    },
    {
      id: 'session_duration',
      category: 'overall_experience',
      condition: () => {
        const sessionStart = parseInt(localStorage.getItem('session_start_time') || '0');
        const now = Date.now();
        return (now - sessionStart) > 10 * 60 * 1000; // After 10 minutes
      },
      priority: 4,
      delay: 5000,
      cooldown: 240, // 4 hours
    },
  ];

  const checkTriggers = useCallback(() => {
    const availableTriggers = triggers
      .filter(trigger => {
        // Check if trigger condition is met
        if (!trigger.condition()) return false;
        
        // Check cooldown
        const lastShown = localStorage.getItem(`feedback_trigger_${trigger.id}`);
        if (lastShown) {
          const lastShownTime = parseInt(lastShown);
          const cooldownMs = (trigger.cooldown || 60) * 60 * 1000;
          if (Date.now() - lastShownTime < cooldownMs) return false;
        }
        
        return true;
      })
      .sort((a, b) => a.priority - b.priority);

    if (availableTriggers.length > 0 && !activeTrigger) {
      const trigger = availableTriggers[0];
      
      setTimeout(() => {
        setActiveTrigger(trigger);
        localStorage.setItem(`feedback_trigger_${trigger.id}`, Date.now().toString());
        trackInteraction('feedback_trigger_shown', trigger.category, { trigger_id: trigger.id });
      }, trigger.delay || 0);
    }
  }, [activeTrigger, trackInteraction]);

  const closeFeedback = useCallback(() => {
    if (activeTrigger) {
      trackInteraction('feedback_trigger_closed', activeTrigger.category, { 
        trigger_id: activeTrigger.id 
      });
    }
    setActiveTrigger(null);
  }, [activeTrigger, trackInteraction]);

  // Track user actions for trigger conditions
  const trackAction = useCallback((action: string, count: number = 1) => {
    const currentCount = parseInt(localStorage.getItem(action) || '0');
    localStorage.setItem(action, (currentCount + count).toString());
    
    // Check triggers after action
    setTimeout(checkTriggers, 1000);
  }, [checkTriggers]);

  useEffect(() => {
    // Set session start time
    if (!localStorage.getItem('session_start_time')) {
      localStorage.setItem('session_start_time', Date.now().toString());
    }

    // Check triggers on mount and periodically
    checkTriggers();
    const interval = setInterval(checkTriggers, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [checkTriggers]);

  return {
    activeTrigger,
    closeFeedback,
    trackAction,
  };
}

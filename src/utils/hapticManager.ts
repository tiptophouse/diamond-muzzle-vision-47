/**
 * Centralized haptic feedback manager to prevent excessive feedback
 * Only allows essential haptic feedback events
 */

import { useTelegramHapticFeedback } from '@/hooks/useTelegramHapticFeedback';

class HapticManager {
  private lastFeedbackTime = 0;
  private readonly MIN_FEEDBACK_INTERVAL = 100; // Minimum 100ms between feedback events
  private readonly haptic = useTelegramHapticFeedback();

  /**
   * Provides essential haptic feedback with throttling
   * Should only be used for critical user interactions
   */
  public essentialFeedback(type: 'success' | 'error' | 'selection' = 'selection') {
    const now = Date.now();
    if (now - this.lastFeedbackTime < this.MIN_FEEDBACK_INTERVAL) {
      return; // Throttle feedback
    }
    
    this.lastFeedbackTime = now;
    
    switch (type) {
      case 'success':
        this.haptic.notificationOccurred('success');
        break;
      case 'error':
        this.haptic.notificationOccurred('error');
        break;
      case 'selection':
      default:
        this.haptic.selectionChanged();
        break;
    }
  }

  /**
   * Light feedback for button presses - use sparingly
   */
  public buttonPress() {
    this.essentialFeedback('selection');
  }
}

export const hapticManager = new HapticManager();
import { useTrackButtonClick } from '@/hooks/useTrackButtonClick';

/**
 * Component to track button clicks from group messages
 * Must be rendered within TelegramAuthProvider context
 */
export function ButtonClickTracker() {
  useTrackButtonClick();
  return null;
}

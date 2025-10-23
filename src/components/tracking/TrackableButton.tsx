import { Button, ButtonProps } from '@/components/ui/button';
import { useButtonClickTracking } from '@/hooks/useButtonClickTracking';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

interface TrackableButtonProps extends ButtonProps {
  trackId: string;
  trackLabel?: string;
  trackContext?: Record<string, any>;
  hapticFeedback?: boolean;
}

export function TrackableButton({
  trackId,
  trackLabel,
  trackContext,
  hapticFeedback = true,
  onClick,
  children,
  ...props
}: TrackableButtonProps) {
  const { trackButtonClick } = useButtonClickTracking();
  const { haptic } = useTelegramWebApp();

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Track the button click
    const label = trackLabel || (typeof children === 'string' ? children : trackId);
    await trackButtonClick(trackId, label, trackContext);

    // Provide haptic feedback
    if (hapticFeedback && haptic) {
      haptic.impactOccurred('medium');
    }

    // Call original onClick if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      data-track-id={trackId}
      data-track-label={trackLabel}
    >
      {children}
    </Button>
  );
}

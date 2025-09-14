/**
 * Success Feedback Components
 * Provides user feedback for successful operations
 */

import React, { useEffect } from 'react';
import { CheckCircle, Diamond, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTelegramSDK } from '@/hooks/useTelegramSDK';

interface SuccessToastProps {
  title: string;
  message?: string;
  onClose?: () => void;
  duration?: number;
  className?: string;
}

export function SuccessToast({ 
  title, 
  message, 
  onClose, 
  duration = 3000, 
  className 
}: SuccessToastProps) {
  const { haptic } = useTelegramSDK();

  useEffect(() => {
    // Trigger success haptic feedback
    haptic.notification('success');

    if (duration > 0 && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose, haptic]);

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 bg-card border border-green-200 shadow-lg rounded-lg p-4 max-w-sm animate-slide-in-right",
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-green-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground">{title}</h4>
          {message && (
            <p className="text-xs text-muted-foreground mt-1">{message}</p>
          )}
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </div>
  );
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  primaryAction?: {
    text: string;
    onClick: () => void;
  };
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
}

export function SuccessModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  primaryAction, 
  secondaryAction 
}: SuccessModalProps) {
  const { haptic } = useTelegramSDK();

  useEffect(() => {
    if (isOpen) {
      haptic.notification('success');
    }
  }, [isOpen, haptic]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border shadow-lg rounded-xl p-6 max-w-sm w-full animate-scale-in">
        <div className="text-center space-y-4">
          {/* Success icon with animation */}
          <div className="relative mx-auto w-16 h-16">
            <div className="absolute inset-0 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <Sparkles className="w-4 h-4 text-green-400 absolute -top-1 -right-1 animate-ping" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {message && (
              <p className="text-muted-foreground text-sm">{message}</p>
            )}
          </div>
          
          <div className="flex gap-2 pt-2">
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                {secondaryAction.text}
              </button>
            )}
            <button
              onClick={primaryAction?.onClick || onClose}
              className="flex-1 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              {primaryAction?.text || 'OK'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface OperationFeedbackProps {
  operation: 'add' | 'delete' | 'update' | 'save';
  itemType: string;
  success: boolean;
  onClose?: () => void;
  details?: string;
}

export function OperationFeedback({ 
  operation, 
  itemType, 
  success, 
  onClose, 
  details 
}: OperationFeedbackProps) {
  const { haptic } = useTelegramSDK();

  const getOperationText = () => {
    const actions = {
      add: 'added',
      delete: 'deleted',
      update: 'updated',
      save: 'saved'
    };
    return actions[operation];
  };

  const getEmoji = () => {
    if (!success) return '❌';
    
    switch (operation) {
      case 'add': return '✨';
      case 'delete': return '🗑️';
      case 'update': return '📝';
      case 'save': return '💾';
      default: return '✅';
    }
  };

  useEffect(() => {
    haptic.notification(success ? 'success' : 'error');
  }, [success, haptic]);

  const title = success 
    ? `${itemType} ${getOperationText()} successfully`
    : `Failed to ${operation} ${itemType}`;

  return (
    <SuccessToast
      title={`${getEmoji()} ${title}`}
      message={details}
      onClose={onClose}
      className={success ? 'border-green-200' : 'border-red-200'}
    />
  );
}
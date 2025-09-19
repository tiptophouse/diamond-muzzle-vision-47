import * as React from "react";
import { X, CheckCircle, AlertCircle, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastNotificationProps {
  title: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning" | "info";
  onClose?: () => void;
  duration?: number;
  className?: string;
}

export function ToastNotification({
  title,
  description,
  variant = "default",
  onClose,
  duration = 4000,
  className
}: ToastNotificationProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const variants = {
    default: {
      container: "bg-background border-border text-foreground",
      icon: null
    },
    success: {
      container: "bg-success/10 border-success/20 text-success-foreground",
      icon: CheckCircle
    },
    error: {
      container: "bg-destructive/10 border-destructive/20 text-destructive-foreground", 
      icon: XCircle
    },
    warning: {
      container: "bg-warning/10 border-warning/20 text-warning-foreground",
      icon: AlertCircle
    },
    info: {
      container: "bg-primary/10 border-primary/20 text-primary-foreground",
      icon: Info
    }
  };

  const { container, icon: Icon } = variants[variant];

  React.useEffect(() => {
    setIsVisible(true);
    
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ease-out",
        "rounded-2xl border shadow-lg p-4 backdrop-blur-sm",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
        container,
        className
      )}
    >
      <div className="flex items-start gap-3">
        {Icon && <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />}
        
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors touch-manipulation"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
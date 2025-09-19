import * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface FloatingActionButtonProps {
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  size?: "default" | "lg";
  children?: React.ReactNode;
}

export function FloatingActionButton({ 
  onClick, 
  icon: Icon = Plus, 
  className, 
  size = "default",
  children 
}: FloatingActionButtonProps) {
  const sizeClasses = {
    default: "h-14 w-14",
    lg: "h-16 w-16"
  };

  return (
    <Button
      onClick={onClick}
      size="icon"
      variant="premium"
      className={cn(
        "fixed shadow-2xl z-40 animate-float",
        "bg-gradient-to-r from-primary via-primary to-primary-muted",
        "hover:shadow-glow hover:scale-110",
        "active:scale-95",
        sizeClasses[size],
        className
      )}
    >
      {children || <Icon className="h-6 w-6" />}
    </Button>
  );
}

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl active:scale-95 rounded-2xl",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg hover:shadow-xl active:scale-95 rounded-2xl",
        outline: "border-2 border-primary/20 bg-background hover:bg-primary/5 hover:border-primary/30 active:scale-95 rounded-2xl",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md hover:shadow-lg active:scale-95 rounded-2xl",
        ghost: "hover:bg-accent hover:text-accent-foreground active:scale-95 rounded-xl",
        link: "text-primary underline-offset-4 hover:underline active:scale-95",
        premium: "bg-gradient-to-r from-primary to-primary-muted text-primary-foreground shadow-lg hover:shadow-xl active:scale-95 rounded-2xl font-semibold",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-lg hover:shadow-xl active:scale-95 rounded-2xl",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 px-4 py-2 text-sm rounded-xl",
        lg: "h-14 px-8 py-4 text-base rounded-2xl",
        icon: "h-12 w-12 rounded-2xl",
        mobile: "h-12 px-6 py-3 min-w-[120px] rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size }),
          // Enhanced Telegram Mini App styling
          "touch-target select-none tap-highlight-none",
          "min-h-[44px] min-w-[44px]", // iOS minimum touch target
          "flex items-center justify-center gap-2", // Proper alignment
          "font-medium tracking-tight", // Better typography
          "[&>span]:truncate [&>span]:block", // Prevent overflow
          "[&_svg]:flex-shrink-0 [&_svg]:pointer-events-none", // Icon stability
          "will-change-transform", // Optimize animations
          "active:transition-none", // Instant feedback on tap
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }


import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold ring-offset-background transition-all duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-center overflow-hidden text-ellipsis min-w-0 relative group",
  {
    variants: {
      variant: {
        default: "text-white shadow-lg hover:shadow-xl border border-primary/20 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary-dark))] hover:from-[hsl(var(--primary-glow))] hover:to-[hsl(var(--primary))] transform hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98] active:translate-y-0",
        destructive:
          "bg-gradient-to-r from-[hsl(var(--destructive))] to-[hsl(var(--destructive)_/_0.8)] text-white shadow-lg hover:shadow-xl border border-destructive/20 transform hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]",
        outline:
          "border-2 border-primary/30 bg-background/80 text-primary shadow-md hover:shadow-lg backdrop-blur-sm hover:bg-primary/5 hover:border-primary/50 transform hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]",
        secondary:
          "bg-gradient-to-r from-[hsl(var(--secondary))] to-[hsl(var(--muted))] text-secondary-foreground shadow-md hover:shadow-lg border border-border/30 transform hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]",
        ghost: "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground rounded-2xl transform hover:scale-[1.02] active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline",
        premium: "premium-button",
        diamond: "bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--primary-glow))] to-[hsl(var(--primary-dark))] text-white border border-primary/30 shadow-[var(--shadow-diamond)] hover:shadow-[var(--shadow-glow)] transform hover:-translate-y-2 hover:scale-[1.05] active:scale-[0.98] before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full group-hover:before:translate-x-full before:transition-transform before:duration-700",
      },
      size: {
        default: "h-12 px-6 py-3 text-base font-semibold min-w-[100px]",
        sm: "h-10 rounded-xl px-4 text-sm min-w-[80px]",
        lg: "h-16 rounded-2xl px-8 text-lg font-bold min-w-[120px]",
        icon: "h-12 w-12 rounded-xl shrink-0",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

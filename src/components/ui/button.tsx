
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default: "text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 hover:from-red-700 hover:to-red-800",
        outline:
          "border-2 border-primary/20 bg-white/80 text-primary shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:bg-primary/5 hover:border-primary/40 backdrop-blur-sm",
        secondary:
          "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:from-gray-200 hover:to-gray-300",
        ghost: "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 rounded-lg",
        link: "text-primary underline-offset-4 hover:underline",
        premium: "premium-button",
      },
      size: {
        default: "h-12 px-6 py-3 text-base font-semibold",
        sm: "h-9 rounded-lg px-4 text-sm",
        lg: "h-14 rounded-xl px-8 text-lg font-bold",
        icon: "h-10 w-10 rounded-lg",
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

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5",
        destructive: "bg-destructive text-destructive-foreground shadow-lg hover:bg-destructive/90 hover:shadow-xl",
        outline: "border border-primary/20 bg-card/50 backdrop-blur-sm text-foreground shadow-sm hover:bg-primary/10 hover:border-primary/40",
        secondary: "bg-secondary text-secondary-foreground shadow-lg hover:bg-secondary/80 hover:shadow-xl",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glow: "bg-primary text-primary-foreground shadow-lg btn-glow hover:shadow-2xl animate-pulse-glow",
        camera: "bg-accent text-accent-foreground shadow-lg hover:bg-accent/90 hover:shadow-xl hover:-translate-y-0.5",
        success: "bg-success text-success-foreground shadow-lg hover:bg-success/90 hover:shadow-xl",
        warning: "bg-warning text-warning-foreground shadow-lg hover:bg-warning/90 hover:shadow-xl",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-14 rounded-lg px-10 text-base",
        xl: "h-16 rounded-xl px-12 text-lg",
        icon: "h-12 w-12",
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

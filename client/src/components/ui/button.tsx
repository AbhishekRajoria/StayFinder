import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-terracotta text-cream rounded-full hover:bg-terracotta2",
        editorial:
          "border-b border-ink hover:border-terracotta hover:text-terracotta text-ink uppercase tracking-[0.18em] text-[11px] font-semibold pb-1 rounded-none bg-transparent",
        destructive:
          "bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90",
        outline:
          "border border-ink/20 text-ink bg-transparent hover:bg-linen rounded-full",
        secondary:
          "bg-bone text-ink rounded-full hover:bg-linen",
        ghost:
          "text-ink hover:bg-linen rounded-full",
        link:
          "text-terracotta underline-offset-4 hover:underline rounded-none",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-sm",
        icon: "h-10 w-10",
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

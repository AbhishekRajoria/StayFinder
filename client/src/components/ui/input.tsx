import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  variant?: "default" | "underline";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    const styles =
      variant === "underline"
        ? "w-full bg-transparent border-0 border-b border-linen focus:border-ink rounded-none px-0 py-3 text-ink placeholder:text-ink3 focus:outline-none focus:ring-0 transition-colors duration-300"
        : "flex h-11 w-full rounded-sm border border-linen bg-transparent px-4 py-2 text-base text-ink file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-ink3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-ink disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-colors duration-300";
    return (
      <input
        type={type}
        className={cn(styles, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

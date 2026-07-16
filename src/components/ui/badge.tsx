"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground border-border",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-sm",
        success:
          "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        warning:
          "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
        pro: "border-transparent bg-gradient-to-r from-primary to-violet-500 text-primary-foreground shadow-sm",
        new: "border-transparent bg-blue-500/10 text-blue-600 dark:text-blue-400",
        popular:
          "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
      },
      size: {
        sm: "text-[10px] px-2 py-0",
        md: "text-xs px-2.5 py-0.5",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
  animated?: boolean
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, dot, animated, children, ...props }, ref) => {
    return (
      <div
        className={cn(
          badgeVariants({ variant, size }),
          animated && "animate-scale-in",
          className
        )}
        ref={ref}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              "mr-1.5 h-1.5 w-1.5 rounded-full bg-current",
              animated && "animate-pulse"
            )}
          />
        )}
        {children}
      </div>
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }

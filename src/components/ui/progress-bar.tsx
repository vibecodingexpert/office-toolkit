"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils/cn"

const progressVariants = cva("h-full rounded-full transition-all duration-500", {
  variants: {
    variant: {
      default: "bg-primary",
      success: "bg-emerald-500",
      warning: "bg-amber-500",
      destructive: "bg-destructive",
      gradient: "bg-gradient-to-r from-primary to-violet-500",
    },
    size: {
      sm: "h-1",
      md: "h-2",
      lg: "h-3",
      xl: "h-4",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
})

interface ProgressBarProps
  extends VariantProps<typeof progressVariants> {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = false,
  variant,
  size,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-sm font-medium text-foreground">{label}</span>
          )}
          {showPercentage && (
            <motion.span
              key={Math.round(percentage)}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-muted-foreground tabular-nums"
            >
              {Math.round(percentage)}%
            </motion.span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-muted",
          size === "sm" && "h-1",
          size === "md" && "h-2",
          size === "lg" && "h-3",
          size === "xl" && "h-4"
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn(progressVariants({ variant, size }))}
        />
      </div>
    </div>
  )
}

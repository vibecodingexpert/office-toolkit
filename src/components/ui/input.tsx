"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils/cn"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  wrapperClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, icon, wrapperClassName, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-")

    return (
      <div className={cn("space-y-2", wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {icon}
            </div>
          )}
          <motion.div
            initial={false}
            animate={
              error
                ? { x: [0, -4, 4, -4, 4, 0] }
                : {}
            }
            transition={{ duration: 0.3 }}
          >
            <input
              id={inputId}
              type={type}
              className={cn(
                "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
                error && "border-destructive focus-visible:ring-destructive",
                icon && "pl-10",
                className
              )}
              ref={ref}
              aria-invalid={!!error}
              aria-describedby={error ? `${inputId}-error` : undefined}
              {...props}
            />
          </motion.div>
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            id={`${inputId}-error`}
            className="text-sm text-destructive"
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }

"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils/cn"

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        xs: "h-6 w-6",
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
        "2xl": "h-20 w-20",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

const avatarFallbackVariants = cva(
  "flex h-full w-full items-center justify-center rounded-full font-medium",
  {
    variants: {
      size: {
        xs: "text-[9px]",
        sm: "text-xs",
        md: "text-sm",
        lg: "text-base",
        xl: "text-lg",
        "2xl": "text-xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
)

interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  src?: string
  alt?: string
  fallback?: string
  online?: boolean
  className?: string
}

const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, src, alt, fallback, online, ...props }, ref) => {
  const initials = React.useMemo(() => {
    if (fallback) return fallback.slice(0, 2).toUpperCase()
    if (alt) {
      return alt
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    }
    return "?"
  }, [fallback, alt])

  return (
    <div className="relative inline-flex">
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        {...props}
      >
        <AvatarPrimitive.Image
          src={src}
          alt={alt || "Avatar"}
          className="aspect-square h-full w-full object-cover"
        />
        <AvatarPrimitive.Fallback
          className={cn(
            avatarFallbackVariants({ size }),
            "bg-gradient-to-br from-primary/20 to-primary/10 text-primary"
          )}
          delayMs={600}
        >
          {initials}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>

      {online !== undefined && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-background",
            size === "xs" && "h-1.5 w-1.5",
            size === "sm" && "h-2 w-2",
            size === "md" && "h-2.5 w-2.5",
            size === "lg" || size === "xl" || size === "2xl"
              ? "h-3 w-3"
              : "h-2.5 w-2.5",
            online ? "bg-emerald-500" : "bg-muted-foreground"
          )}
        />
      )}
    </div>
  )
})
Avatar.displayName = AvatarPrimitive.Root.displayName

export { Avatar }

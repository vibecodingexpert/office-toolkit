"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { Sun, Moon, Monitor } from "lucide-react"

interface ThemeToggleProps {
  showLabel?: boolean
  className?: string
}

const themes = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
] as const

export function ThemeToggle({ showLabel = false, className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={cn("h-9 w-9 rounded-lg border border-input bg-background", className)} />
    )
  }

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark")
    else if (theme === "dark") setTheme("system")
    else setTheme("light")
  }

  const currentIcon = themes.find((t) => t.value === theme)?.icon || Sun

  if (showLabel) {
    return (
      <div className={cn("flex gap-1 rounded-xl border border-border bg-background p-1", className)}>
        {themes.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
              theme === value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={cycleTheme}
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
        className
      )}
      aria-label={`Current theme: ${theme}. Click to cycle.`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          {theme === "light" ? (
            <Sun className="h-4 w-4" />
          ) : theme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Monitor className="h-4 w-4" />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  )
}

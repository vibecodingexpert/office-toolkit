"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { useToolStore } from "@/lib/store/use-tool-store"
import type { Tool } from "@/types"
import {
  Heart,
  Share2,
  Sparkles,
  Star,
  ArrowLeft,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface ToolHeaderProps {
  tool: Tool
  onBack?: () => void
  actions?: React.ReactNode
  className?: string
}

export function ToolHeader({ tool, onBack, actions, className }: ToolHeaderProps) {
  const { addFavorite, removeFavorite, isFavorite } = useToolStore()
  const favorited = isFavorite(tool.id)

  const handleFavorite = () => {
    if (favorited) {
      removeFavorite(tool.id)
    } else {
      addFavorite(tool.id)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: tool.name,
        text: tool.description,
        url: window.location.href,
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn("space-y-6", className)}
    >
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl shadow-lg"
            style={{ backgroundColor: tool.color || "#6366f1" }}
          >
            <span className="text-2xl font-bold text-white">
              {tool.name.charAt(0)}
            </span>
          </motion.div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {tool.name}
              </h1>
              <div className="flex items-center gap-1.5">
                {tool.isNew && (
                  <Badge variant="new" animated>
                    New
                  </Badge>
                )}
                {tool.isPopular && (
                  <Badge variant="popular" dot animated>
                    Popular
                  </Badge>
                )}
                {tool.isPro && (
                  <Badge variant="pro">
                    <Lock className="mr-1 h-3 w-3" />
                    Pro
                  </Badge>
                )}
                {tool.isTrending && (
                  <Badge variant="warning" dot>
                    Trending
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-base text-muted-foreground max-w-2xl">
              {tool.description}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleFavorite}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition-colors",
              favorited
                ? "text-red-500 border-red-500/30 bg-red-500/5"
                : "text-muted-foreground hover:text-red-400 hover:border-red-500/20"
            )}
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-all",
                favorited && "fill-current"
              )}
            />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Share"
          >
            <Share2 className="h-5 w-5" />
          </motion.button>

          {actions}
        </div>
      </div>
    </motion.div>
  )
}

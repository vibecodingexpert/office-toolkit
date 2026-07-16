"use client"

import * as React from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { cn } from "@/lib/utils/cn"
import { useToolStore } from "@/lib/store/use-tool-store"
import type { Tool } from "@/types"
import { Heart, Sparkles, Lock, Star } from "lucide-react"

interface ToolCardProps {
  tool: Tool
  index?: number
}

const iconMap: Record<string, React.ReactNode> = {
  Heart: <Heart className="h-5 w-5" />,
  Lock: <Lock className="h-5 w-5" />,
}

export function ToolCard({ tool, index = 0 }: ToolCardProps) {
  const { favorites, addFavorite, removeFavorite, isFavorite } = useToolStore()
  const favorited = isFavorite(tool.id)

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (favorited) {
      removeFavorite(tool.id)
    } else {
      addFavorite(tool.id)
    }
  }

  const IconComponent = iconMap[tool.icon] || (
    <span className="text-lg font-bold">{tool.icon.charAt(0)}</span>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        href={`/tools/${tool.slug}`}
        className={cn(
          "group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
        )}
      >
        <div className="flex items-start justify-between">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm"
            style={{ backgroundColor: tool.color || "#6366f1" }}
          >
            {tool.icon === "Sparkles" ? (
              <Sparkles className="h-5 w-5" />
            ) : tool.icon === "Star" ? (
              <Star className="h-5 w-5" />
            ) : (
              IconComponent
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {tool.isNew && (
              <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                NEW
              </span>
            )}
            {tool.isPro && (
              <span className="inline-flex items-center rounded-full bg-gradient-to-r from-primary/10 to-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                PRO
              </span>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {tool.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {tool.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-medium uppercase tracking-wider"
            style={{ color: tool.color || "#6366f1" }}
          >
            {tool.category}
          </span>

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleFavorite}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              favorited
                ? "text-red-500 bg-red-500/10"
                : "text-muted-foreground hover:text-red-400 hover:bg-red-500/5"
            )}
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={cn("h-4 w-4 transition-all", favorited && "fill-current")}
            />
          </motion.button>
        </div>
      </Link>
    </motion.div>
  )
}

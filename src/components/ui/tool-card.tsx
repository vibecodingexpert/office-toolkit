"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils/cn"
import type { Tool } from "@/types"
import { Sparkles, Star, Heart, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface ToolCardProps {
  tool: Tool
  index?: number
}

const iconMap: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="h-5 w-5" />,
  Star: <Star className="h-5 w-5" />,
  Heart: <Heart className="h-5 w-5" />,
  Lock: <Lock className="h-5 w-5" />,
}

const categoryColors: Record<string, string> = {
  pdf: "#0d9488",
  image: "#06b6d4",
  document: "#6366f1",
  developer: "#22c55e",
  ai: "#a855f7",
  security: "#ef4444",
}

export function ToolCard({ tool, index = 0 }: ToolCardProps) {
  const categoryColor = tool.color || categoryColors[tool.category?.toLowerCase()] || "#6366f1"

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all duration-200",
        "hover:shadow-md hover:-translate-y-0.5"
      )}
      style={{ borderLeftColor: categoryColor, borderLeftWidth: 3 }}
    >
      {tool.isPopular && (
        <Badge variant="new" size="sm" className="absolute top-3 right-3">
          Popular
        </Badge>
      )}
      {tool.isNew && !tool.isPopular && (
        <Badge variant="new" size="sm" className="absolute top-3 right-3">
          New
        </Badge>
      )}

      <div
        className="flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-sm"
        style={{ backgroundColor: categoryColor }}
      >
        {iconMap[tool.icon] || (
          <span className="text-sm font-bold">{tool.name.charAt(0)}</span>
        )}
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
          style={{ color: categoryColor }}
        >
          {tool.category}
        </span>
      </div>
    </Link>
  )
}

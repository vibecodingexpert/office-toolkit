"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import type { Tool } from "@/types"
import { Sparkles, Star, Heart, Lock, ArrowRight } from "lucide-react"
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

export function ToolCard({ tool, index = 0 }: ToolCardProps) {
  const categoryColor = tool.color || "#0d9488"

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
    >
      <Link
        href={`/tools/${tool.slug}`}
        className="group relative block"
      >
        <div
          className={cn(
            "relative rounded-xl border border-border bg-card p-5 transition-all duration-200",
            "hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
          )}
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
            className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg text-white shadow-sm ring-1 ring-white/10 transition-transform group-hover:scale-110"
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
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {tool.description}
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span
              className="text-[10px] font-medium uppercase tracking-widest"
              style={{ color: categoryColor }}
            >
              {tool.category}
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </div>

          <div
            className="absolute inset-x-0 bottom-0 h-0.5 rounded-b-xl transition-all duration-200 scale-x-0 group-hover:scale-x-100"
            style={{ backgroundColor: categoryColor }}
          />
        </div>
      </Link>
    </motion.div>
  )
}

"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { useToolStore } from "@/lib/store/use-tool-store"
import { categories, tools } from "@/lib/utils/tools-data"
import { ToolCard } from "@/components/ui/tool-card"
import { Search, Sparkles } from "lucide-react"
import type { ToolCategory } from "@/types"

const categoryIcons: Record<string, React.ReactNode> = {
  pdf: <span className="text-xs font-bold">PDF</span>,
  image: <span className="text-xs font-bold">IMG</span>,
  document: <span className="text-xs font-bold">DOC</span>,
  developer: <span className="text-xs font-bold">DEV</span>,
  video: <span className="text-xs font-bold">VID</span>,
  audio: <span className="text-xs font-bold">AUD</span>,
  business: <span className="text-xs font-bold">BIZ</span>,
  office: <span className="text-xs font-bold">OFF</span>,
  ai: <span className="text-xs font-bold">AI</span>,
  security: <span className="text-xs font-bold">SEC</span>,
  utility: <span className="text-xs font-bold">UTL</span>,
}

export default function ToolsPage() {
  const { selectedCategory, setSelectedCategory } = useToolStore()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const filteredCategories = React.useMemo(() => {
    if (!searchQuery) return categories
    const q = searchQuery.toLowerCase()
    return categories.filter((cat) => {
      const catTools = tools.filter((t) => t.category === cat.id)
      return catTools.some(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      )
    })
  }, [searchQuery])

  const filteredTools = React.useCallback(
    (categoryId: string) => {
      const catTools = tools.filter((t) => t.category === categoryId)
      if (!searchQuery) return catTools
      const q = searchQuery.toLowerCase()
      return catTools.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      )
    },
    [searchQuery]
  )

  const totalResults = React.useMemo(() => {
    if (!searchQuery) return tools.length
    const q = searchQuery.toLowerCase()
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    ).length
  }, [searchQuery])

  const visibleCategories =
    selectedCategory === "all"
      ? filteredCategories
      : filteredCategories.filter((c) => c.id === selectedCategory)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            All Tools
          </h1>
          <p className="mt-2 text-muted-foreground">
            Browse our collection of {tools.length}+ free and premium tools
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools by name or description..."
            className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all",
              selectedCategory === "all"
                ? "border-primary/30 bg-primary/10 text-primary shadow-sm"
                : "border-border bg-background text-muted-foreground hover:border-primary/20 hover:text-foreground hover:bg-accent/50"
            )}
          >
            <Sparkles className="h-4 w-4" />
            All Tools
            <span className="ml-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] tabular-nums">
              {tools.length}
            </span>
          </button>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "border-primary/30 bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-background text-muted-foreground hover:border-primary/20 hover:text-foreground hover:bg-accent/50"
                )}
              >
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold text-white"
                  style={{ backgroundColor: cat.color }}
                >
                  {cat.name.charAt(0)}
                </span>
                {cat.name}
                <span className="ml-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] tabular-nums">
                  {cat.toolCount}
                </span>
              </button>
            )
          })}
        </div>

        {searchQuery && mounted && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-muted-foreground"
          >
            Found {totalResults} tool{totalResults !== 1 ? "s" : ""} for
            &ldquo;{searchQuery}&rdquo;
          </motion.p>
        )}
      </motion.div>

      {/* Tools Grid grouped by category */}
      <AnimatePresence mode="wait">
        {visibleCategories.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-20 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-primary/10">
              <Search className="h-8 w-8 text-primary/60" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              No tools found
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Try adjusting your search or filter to find what you&apos;re
              looking for
            </p>
            <button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
              }}
              className="mt-4 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={selectedCategory + searchQuery}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-12"
          >
            {visibleCategories.map((category) => {
              const categoryTools = filteredTools(category.id)
              if (categoryTools.length === 0) return null

              return (
                <section key={category.id}>
                  <div className="mb-5 flex items-center gap-3">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-white text-xs font-bold shadow-sm"
                      style={{ backgroundColor: category.color }}
                    >
                      {categoryIcons[category.id] || category.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">
                        {category.name}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                    <div className="ml-auto hidden sm:block">
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {categoryTools.length} tool
                        {categoryTools.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {categoryTools.map((tool, index) => (
                      <ToolCard key={tool.id} tool={tool} index={index} />
                    ))}
                  </div>
                </section>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

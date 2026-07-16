"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { useToolStore } from "@/lib/store/use-tool-store"
import { categories, tools } from "@/lib/utils/tools-data"
import { ToolCard } from "@/components/ui/tool-card"
import { Search, Sparkles, X } from "lucide-react"

export default function ToolsPage() {
  const { selectedCategory, setSelectedCategory } = useToolStore()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [mounted, setMounted] = React.useState(false)
  const scrollRef = React.useRef<HTMLDivElement>(null)

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
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          All <span className="text-primary">Tools</span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Browse our collection of {tools.length}+ free and premium tools to boost your productivity
        </p>

        {/* Search */}
        <div className="relative mx-auto mt-6 max-w-xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools by name or description..."
            className="h-12 w-full rounded-xl border border-border bg-background pl-12 pr-12 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Category Pills */}
      <div
        ref={scrollRef}
        className="mb-10 flex gap-2 overflow-x-auto pb-2 scrollbar-none"
      >
        <button
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
            selectedCategory === "all"
              ? "border-primary bg-primary/10 text-primary shadow-sm"
              : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
          )}
        >
          <Sparkles className="h-4 w-4" />
          All
          <span className="ml-0.5 rounded-md bg-muted px-1.5 py-0.5 text-[11px] tabular-nums">
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
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                isActive
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
              )}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
              {cat.name}
              <span className="ml-0.5 rounded-md bg-muted px-1.5 py-0.5 text-[11px] tabular-nums">
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
          className="mb-6 text-sm text-muted-foreground"
        >
          Found {totalResults} tool{totalResults !== 1 ? "s" : ""} for
          &ldquo;{searchQuery}&rdquo;
        </motion.p>
      )}

      {/* Tools Grid */}
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
                  <div className="mb-5 flex items-center gap-3 border-b border-border pb-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <h2 className="text-xl font-semibold text-foreground">
                      {category.name}
                    </h2>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {categoryTools.length} tool
                      {categoryTools.length !== 1 ? "s" : ""}
                    </span>
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

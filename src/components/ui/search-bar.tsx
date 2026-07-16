"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils/cn"
import { useToolStore } from "@/lib/store/use-tool-store"
import { searchTools } from "@/lib/utils/tools-data"
import type { Tool, ToolCategory } from "@/types"
import {
  Search,
  Command,
  Clock,
  TrendingUp,
  X,
  ArrowUpDown,
  FileText,
  Image,
  File,
  Code,
  Video,
  Music,
  Briefcase,
  Building2,
  Sparkles,
  Shield,
  Wrench,
} from "lucide-react"

const categoryIcons: Record<ToolCategory, React.ReactNode> = {
  pdf: <FileText className="h-4 w-4" />,
  image: <Image className="h-4 w-4" />,
  document: <File className="h-4 w-4" />,
  developer: <Code className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  audio: <Music className="h-4 w-4" />,
  business: <Briefcase className="h-4 w-4" />,
  office: <Building2 className="h-4 w-4" />,
  ai: <Sparkles className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  utility: <Wrench className="h-4 w-4" />,
}

const categoryNames: Record<ToolCategory, string> = {
  pdf: "PDF",
  image: "Image",
  document: "Document",
  developer: "Developer",
  video: "Video",
  audio: "Audio",
  business: "Business",
  office: "Office",
  ai: "AI",
  security: "Security",
  utility: "Utility",
}

const popularSearches = [
  "PDF to Word",
  "Image Compressor",
  "QR Generator",
  "Password Generator",
  "Word Counter",
]

export function SearchBar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<Tool[]>([])
  const [selectedIndex, setSelectedIndex] = React.useState(-1)
  const [categoryFilter, setCategoryFilter] = React.useState<ToolCategory | "all">("all")
  const inputRef = React.useRef<HTMLInputElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const recentTools = useToolStore((s) => s.recentTools)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === "Escape") {
        setIsOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  React.useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setQuery("")
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleSearch = (value: string) => {
    setQuery(value)
    setSelectedIndex(-1)
    if (value.trim()) {
      const searched = searchTools(value)
      if (categoryFilter !== "all") {
        setResults(searched.filter((t) => t.category === categoryFilter))
      } else {
        setResults(searched)
      }
    } else {
      setResults([])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : 0
      )
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : results.length - 1
      )
    } else if (e.key === "Enter" && selectedIndex >= 0 && results[selectedIndex]) {
      handleSelect(results[selectedIndex])
    }
  }

  const handleSelect = (tool: Tool) => {
    useToolStore.getState().addRecent(tool.id)
    setIsOpen(false)
    setQuery("")
    router.push(`/tools/${tool.slug}`)
  }

  const filteredResults =
    categoryFilter === "all"
      ? results
      : results.filter((t) => t.category === categoryFilter)

  return (
    <>
      {/* Search trigger */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex h-10 w-full max-w-sm items-center gap-2 rounded-xl border border-input bg-background px-4 py-2 text-sm text-muted-foreground shadow-sm transition-all hover:border-primary/30 hover:shadow-sm hover:shadow-primary/5"
        )}
      >
        <Search className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left">Search tools...</span>
        <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
          <Command className="h-3 w-3" />K
        </kbd>
      </motion.button>

      {/* Search overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              ref={containerRef}
              className="fixed left-1/2 top-[15%] w-full max-w-xl -translate-x-1/2"
            >
              <div className="glass rounded-2xl border border-border shadow-2xl overflow-hidden">
                {/* Search input */}
                <div className="flex items-center gap-3 border-b border-border px-5 py-3">
                  <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search tools..."
                    className="flex-1 bg-transparent text-base text-foreground placeholder-muted-foreground outline-none"
                  />
                  {query && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setQuery("")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  )}
                </div>

                {/* Category filter */}
                <div className="flex gap-1.5 border-b border-border px-4 py-2.5 overflow-x-auto no-scrollbar">
              {(["all", ...Object.keys(categoryNames)] as (ToolCategory | "all")[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      "whitespace-nowrap rounded-lg px-3 py-1 text-xs font-medium transition-colors",
                      categoryFilter === cat
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    {cat === "all" ? "All" : categoryNames[cat as ToolCategory]}
                  </button>
                ))}
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto">
                  {query && filteredResults.length > 0 && (
                    <div className="p-2">
                      {filteredResults.slice(0, 8).map((tool, index) => (
                        <motion.button
                          key={tool.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => handleSelect(tool)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                            selectedIndex === index
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent/50"
                          )}
                        >
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                            style={{ backgroundColor: tool.color || "#6366f1" }}
                          >
                            <span className="text-xs font-bold text-white">
                              {tool.name.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-foreground">
                              {tool.name}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {tool.description}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {tool.isNew && (
                              <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
                                NEW
                              </span>
                            )}
                            {tool.isPro && (
                              <span className="rounded bg-gradient-to-r from-primary/10 to-violet-500/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                PRO
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {categoryNames[tool.category]}
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {query && filteredResults.length === 0 && (
                    <div className="flex flex-col items-center gap-2 py-12 text-center">
                      <Search className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground">
                        No tools found for &ldquo;{query}&rdquo;
                      </p>
                    </div>
                  )}

                  {!query && (
                    <div className="p-4 space-y-4">
                      {recentTools.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 px-1 mb-2">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Recent
                            </span>
                          </div>
                          <div className="space-y-1">
                            {recentTools.slice(0, 3).map((toolId) => {
                              const tool = searchTools("").find(
                                (t) => t.id === toolId
                              )
                              if (!tool) return null
                              return (
                                <button
                                  key={tool.id}
                                  onClick={() => handleSelect(tool)}
                                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-accent/50 transition-colors"
                                >
                                  <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <span className="text-sm text-foreground">
                                    {tool.name}
                                  </span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 px-1 mb-2">
                          <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Popular
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {popularSearches.map((term) => (
                            <button
                              key={term}
                              onClick={() => {
                                setQuery(term)
                                handleSearch(term)
                              }}
                              className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="border-t border-border px-4 py-2.5">
                  <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ArrowUpDown className="h-3 w-3" /> Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-border bg-muted px-1 text-[10px]">
                        ↵
                      </kbd>{" "}
                      Select
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="rounded border border-border bg-muted px-1 text-[10px]">
                        Esc
                      </kbd>{" "}
                      Close
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { useToolStore } from "@/lib/store/use-tool-store"
import { categories, tools } from "@/lib/utils/tools-data"
import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import type { ToolCategory } from "@/types"
import {
  X,
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
  Heart,
  Clock,
} from "lucide-react"

const categoryIcons: Record<string, React.ReactNode> = {
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

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isMobileSidebarOpen, setMobileSidebarOpen } = useToolStore()
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="relative min-h-screen bg-background">
      <Sidebar />

      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ opacity: 0, x: "-100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-sidebar shadow-2xl md:hidden"
            >
              <div className="flex h-full flex-col">
                <div className="flex h-16 items-center justify-between border-b border-border px-5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-500 shadow-sm">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-bold">
                      Office<span className="text-primary"> Toolkit</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-4">
                  <MobileSidebarContent />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div
        className={cn(
          "flex min-h-screen flex-col transition-all duration-300",
          "md:ml-[72px] lg:ml-[260px]"
        )}
      >
        <Navbar />

        <main className="flex-1 pt-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={mounted ? pathname : "/"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

function MobileSidebarContent() {
  const {
    selectedCategory,
    setSelectedCategory,
    setMobileSidebarOpen,
    favorites,
    recentTools,
  } = useToolStore()

  const favoriteTools = React.useMemo(
    () => tools.filter((t) => favorites.includes(t.id)),
    [favorites]
  )

  const recentToolItems = React.useMemo(
    () => {
      const items = recentTools
        .map((id) => tools.find((t) => t.id === id))
        .filter((t): t is NonNullable<typeof t> => t != null)
      return items.slice(0, 5)
    },
    [recentTools]
  )

  const handleCategoryClick = (cat: ToolCategory | "all") => {
    setSelectedCategory(cat)
    setMobileSidebarOpen(false)
  }

  return (
    <>
      <button
        onClick={() => handleCategoryClick("all")}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          selectedCategory === "all"
            ? "bg-accent text-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}
      >
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            selectedCategory === "all"
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground"
          )}
        >
          <Sparkles className="h-4 w-4" />
        </div>
        All Tools
      </button>

      <div className="mt-2 space-y-0.5">
        {categories.map((category) => {
          const isActive = selectedCategory === category.id
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground"
                style={isActive ? { backgroundColor: category.color, color: "white" } : {}}
              >
                {categoryIcons[category.id]}
              </div>
              <span className="flex-1 text-left">{category.name}</span>
              <span className="text-[11px] text-muted-foreground">
                {category.toolCount}
              </span>
            </button>
          )
        })}
      </div>

      {favoriteTools.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 px-3 py-1.5">
            <Heart className="h-3 w-3 text-muted-foreground" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Favorites
            </span>
          </div>
          <div className="mt-1 space-y-0.5">
            {favoriteTools.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-md"
                  style={{ backgroundColor: tool.color || "#6366f1" }}
                >
                  <span className="text-[10px] font-bold text-white">
                    {tool.name.charAt(0)}
                  </span>
                </div>
                <span className="truncate">{tool.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recentToolItems.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 px-3 py-1.5">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Recent
            </span>
          </div>
          <div className="mt-1 space-y-0.5">
            {recentToolItems.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground"
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-md"
                  style={{ backgroundColor: tool.color || "#6366f1" }}
                >
                  <span className="text-[10px] font-bold text-white">
                    {tool.name.charAt(0)}
                  </span>
                </div>
                <span className="truncate">{tool.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

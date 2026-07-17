"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { useToolStore } from "@/lib/store/use-tool-store"
import { categories, tools } from "@/lib/utils/tools-data"
import type { ToolCategory } from "@/types"
import {
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
  Settings,
  HelpCircle,
  LogOut,
  PanelLeftClose,
  PanelLeft,
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

const bottomLinks = [
  { label: "Settings", icon: Settings, href: "/settings" },
  { label: "Help", icon: HelpCircle, href: "/help" },
]

export function Sidebar() {
  const pathname = usePathname()
  const {
    selectedCategory,
    setSelectedCategory,
    isSidebarOpen,
    toggleSidebar,
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

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarOpen ? 260 : 72 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "fixed left-0 top-0 z-30 hidden h-full flex-col border-r border-border bg-sidebar md:flex",
        isSidebarOpen ? "w-[260px]" : "w-[72px]"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-border",
          isSidebarOpen ? "px-5 justify-between" : "justify-center"
        )}
      >
        {isSidebarOpen ? (
          <>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-500 shadow-sm">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold">
                Office<span className="text-primary"> Toolkit</span>
              </span>
            </Link>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleSidebar}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <PanelLeftClose className="h-4 w-4" />
            </motion.button>
          </>
        ) : (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <PanelLeft className="h-4 w-4" />
          </motion.button>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {/* Categories */}
        <div className="space-y-0.5">
          <AnimatePresence mode="wait">
            {isSidebarOpen && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
              >
                Categories
              </motion.p>
            )}
          </AnimatePresence>

          {/* All Tools */}
          <button
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              selectedCategory === "all"
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              !isSidebarOpen && "justify-center px-0"
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                selectedCategory === "all"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <AnimatePresence mode="wait">
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  All Tools
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Category items */}
          {categories.map((category) => {
            const isActive = selectedCategory === category.id
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                  !isSidebarOpen && "justify-center px-0"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                    isActive
                      ? "text-white shadow-sm"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                  style={isActive ? { backgroundColor: category.color } : {}}
                >
                  {categoryIcons[category.id]}
                </div>
                <AnimatePresence mode="wait">
                  {isSidebarOpen && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="flex flex-1 items-center justify-between"
                    >
                      <span>{category.name}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {category.toolCount}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            )
          })}
        </div>

        {/* Favorites section */}
        {favoriteTools.length > 0 && (
          <div className="mt-5 space-y-0.5">
            <AnimatePresence mode="wait">
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-3 py-1.5"
                >
                  <Heart className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Favorites
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            {favoriteTools.slice(0, 4).map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/50 hover:text-foreground",
                  pathname === `/tools/${tool.slug}`
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground",
                  !isSidebarOpen && "justify-center px-0"
                )}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: tool.color || "#6366f1" }}
                >
                  <span className="text-xs font-bold text-white">
                    {tool.name.charAt(0)}
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="truncate"
                    >
                      {tool.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            ))}
          </div>
        )}

        {/* Recent section */}
        {recentToolItems.length > 0 && (
          <div className="mt-5 space-y-0.5">
            <AnimatePresence mode="wait">
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-3 py-1.5"
                >
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Recent
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            {recentToolItems.map((tool) => (
              <Link
                key={tool.id}
                href={`/tools/${tool.slug}`}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/50 hover:text-foreground",
                  pathname === `/tools/${tool.slug}`
                    ? "bg-accent text-foreground"
                    : "text-muted-foreground",
                  !isSidebarOpen && "justify-center px-0"
                )}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: tool.color || "#6366f1" }}
                >
                  <span className="text-xs font-bold text-white">
                    {tool.name.charAt(0)}
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="truncate"
                    >
                      {tool.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom section */}
      <div className="border-t border-border px-2 py-2">
        {bottomLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                !isSidebarOpen && "justify-center px-0"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  isActive ? "bg-accent" : ""
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <AnimatePresence mode="wait">
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    {link.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </div>
    </motion.aside>
  )
}

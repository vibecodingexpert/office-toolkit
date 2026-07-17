"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
  const router = useRouter()
  const {
    selectedCategory,
    setSelectedCategory,
    isSidebarOpen,
    toggleSidebar,
    favorites,
    recentTools,
  } = useToolStore()

  const isOnTools = pathname === "/tools"

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

  const NavItem = ({
    icon,
    label,
    isActive,
    color,
    onClick,
    href,
    showCount,
    count,
  }: {
    icon: React.ReactNode
    label: string
    isActive?: boolean
    color?: string
    onClick?: () => void
    href?: string
    showCount?: boolean
    count?: number
  }) => {
    const content = (
      <div
        className={cn(
          "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
          !isSidebarOpen && "justify-center px-0"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full"
            style={{ backgroundColor: color || "hsl(var(--primary))" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-150",
            isActive && color
              ? "text-white shadow-sm"
              : isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground group-hover:text-foreground"
          )}
          style={isActive && color ? { backgroundColor: color } : {}}
        >
          {icon}
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
              <span>{label}</span>
              {showCount && (
                <span className="text-[11px] text-muted-foreground">{count}</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )

    if (href) {
      return <Link href={href}>{content}</Link>
    }

    return <button onClick={onClick} className="w-full">{content}</button>
  }

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
      <div className="flex-1 overflow-y-auto px-2 py-3 scrollbar-thin">
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

          <NavItem
            icon={<Sparkles className="h-4 w-4" />}
            label="All Tools"
            isActive={selectedCategory === "all" && isOnTools}
            onClick={() => {
              setSelectedCategory("all")
              if (!isOnTools) router.push("/tools")
            }}
          />

          {categories.map((category) => (
            <NavItem
              key={category.id}
              icon={categoryIcons[category.id]}
              label={category.name}
              isActive={selectedCategory === category.id && isOnTools}
              color={category.color}
              showCount
              count={category.toolCount}
              onClick={() => {
                setSelectedCategory(category.id)
                if (!isOnTools) router.push("/tools")
              }}
            />
          ))}
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
              <NavItem
                key={tool.id}
                icon={
                  <span className="text-xs font-bold text-white">
                    {tool.name.charAt(0)}
                  </span>
                }
                label={tool.name}
                href={`/tools/${tool.slug}`}
                isActive={pathname === `/tools/${tool.slug}`}
                color={tool.color || "#6366f1"}
              />
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
              <NavItem
                key={tool.id}
                icon={
                  <span className="text-xs font-bold text-white">
                    {tool.name.charAt(0)}
                  </span>
                }
                label={tool.name}
                href={`/tools/${tool.slug}`}
                isActive={pathname === `/tools/${tool.slug}`}
                color={tool.color || "#6366f1"}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom section */}
      <div className="border-t border-border px-2 py-2">
        {bottomLinks.map((link) => {
          const Icon = link.icon
          return (
            <NavItem
              key={link.label}
              icon={<Icon className="h-4 w-4" />}
              label={link.label}
              href={link.href}
              isActive={pathname === link.href}
            />
          )
        })}
      </div>
    </motion.aside>
  )
}

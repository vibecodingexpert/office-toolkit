"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { SearchBar } from "@/components/ui/search-bar"
import { popularTools, tools } from "@/lib/utils/tools-data"
import { cn } from "@/lib/utils/cn"
import {
  Sparkles,
  Clock,
  TrendingUp,
  FileText,
  Image,
  File,
  Code,
  Video,
  Music,
  Briefcase,
  Building2,
  Shield,
  Wrench,
  ArrowRight,
  Star,
  Zap,
  Download,
  Heart,
  Bell,
  ChevronRight,
  BookOpen,
  Settings,
  MessageSquare,
} from "lucide-react"

const categoryIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-5 w-5" />,
  image: <Image className="h-5 w-5" />,
  document: <File className="h-5 w-5" />,
  developer: <Code className="h-5 w-5" />,
  video: <Video className="h-5 w-5" />,
  audio: <Music className="h-5 w-5" />,
  business: <Briefcase className="h-5 w-5" />,
  office: <Building2 className="h-5 w-5" />,
  ai: <Sparkles className="h-5 w-5" />,
  security: <Shield className="h-5 w-5" />,
  utility: <Wrench className="h-5 w-5" />,
}

const quickStats = [
  {
    label: "Tools Used",
    value: "47",
    icon: Zap,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Favorites",
    value: "12",
    icon: Heart,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    label: "Downloads",
    value: "89",
    icon: Download,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Pro Status",
    value: "Active",
    icon: Star,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    badge: "Pro",
  },
]

const recentToolsData = [
  {
    id: "compress-pdf",
    name: "Compress PDF",
    category: "pdf",
    time: "2 minutes ago",
  },
  {
    id: "image-compressor",
    name: "Image Compressor",
    category: "image",
    time: "15 minutes ago",
  },
  {
    id: "qr-generator",
    name: "QR Generator",
    category: "image",
    time: "1 hour ago",
  },
  {
    id: "word-counter",
    name: "Word Counter",
    category: "document",
    time: "3 hours ago",
  },
  {
    id: "merge-pdf",
    name: "Merge PDF",
    category: "pdf",
    time: "Yesterday",
  },
]

const quickActions = [
  {
    label: "New Document",
    description: "Create a blank document",
    icon: FileText,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    href: "/tools/word-editor",
  },
  {
    label: "Convert PDF",
    description: "Convert files between formats",
    icon: File,
    color: "text-primary",
    bg: "bg-primary/10",
    href: "/tools/pdf-to-word",
  },
  {
    label: "Compress Image",
    description: "Reduce image file size",
    icon: Image,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    href: "/tools/image-compressor",
  },
  {
    label: "AI Assistant",
    description: "Chat with AI help",
    icon: MessageSquare,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    href: "/tools/ai-chat",
  },
]

function getToolColor(slug: string): string {
  const tool = tools.find((t) => t.slug === slug || t.id === slug)
  return tool?.color || "#6366f1"
}

function getToolCategoryName(catId: string): string {
  const names: Record<string, string> = {
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
  return names[catId] || catId
}

export default function DashboardPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <DashboardLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto"
      >
        {/* Welcome Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Avatar size="md" src="" alt="John" fallback="JD" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Welcome back, John
                </h1>
                <p className="text-sm text-muted-foreground">
                  Here&apos;s what&apos;s happening with your tools today.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <SearchBar />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                3
              </span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            >
              <Settings className="h-4 w-4" />
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {quickStats.map((stat) => (
            <Card
              key={stat.label}
              variant="default"
              padding="md"
              hover="lift"
              className="relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                </div>
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl",
                    stat.bg
                  )}
                >
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </div>
              {stat.badge && (
                <Badge variant="pro" size="sm" className="absolute top-3 right-3">
                  {stat.badge}
                </Badge>
              )}
            </Card>
          ))}
        </motion.div>

        {/* Continue Where You Left Off */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Continue Where You Left Off</h2>
            </div>
            <Link
              href="/tools"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
            >
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {recentToolsData.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -2, scale: 1.02 }}
              >
                <Link
                  href={`/tools/${item.id}`}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 group"
                  )}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: getToolColor(item.id) }}
                  >
                    <span className="text-sm font-bold text-white">
                      {item.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Popular Tools */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Popular Tools</h2>
            </div>
            <Link
              href="/tools"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
            >
              Explore all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {popularTools.slice(0, 8).map((tool, i) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -3, scale: 1.02 }}
              >
                <Link
                  href={`/tools/${tool.slug}`}
                  className={cn(
                    "group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm"
                      style={{ backgroundColor: tool.color || "#6366f1" }}
                    >
                      {categoryIcons[tool.category] || (
                        <FileText className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {tool.isNew && (
                        <Badge variant="new" size="sm">
                          NEW
                        </Badge>
                      )}
                      {tool.isPro && (
                        <Badge variant="pro" size="sm">
                          PRO
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                      {tool.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-medium uppercase tracking-wider"
                      style={{ color: tool.color || "#6366f1" }}
                    >
                      {getToolCategoryName(tool.category)}
                    </span>
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0"
                      style={{ backgroundColor: `${tool.color}15`, color: tool.color }}
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2.5 mb-4">
            <Zap className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -2, scale: 1.02 }}
              >
                <Link
                  href={action.href}
                  className={cn(
                    "flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 group"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                      action.bg
                    )}
                  >
                    <action.icon className={cn("h-5 w-5", action.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {action.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}

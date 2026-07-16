"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card } from "@/components/ui/card"
import { ToolCard } from "@/components/ui/tool-card"
import { categories, popularTools, tools } from "@/lib/utils/tools-data"
import { cn } from "@/lib/utils/cn"
import {
  Wrench,
  FolderOpen,
  TrendingUp,
  Clock,
  ArrowRight,
  ChevronRight,
  LayoutGrid,
  Zap,
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

const stats = [
  {
    label: "Total Tools",
    value: tools.length,
    icon: Wrench,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Categories",
    value: categories.length,
    icon: FolderOpen,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    label: "Popular Tools",
    value: popularTools.length,
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    label: "Recently Used",
    value: "5",
    icon: Clock,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
]

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
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your central hub for Office Toolkit Pro
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat) => (
            <Card
              key={stat.label}
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
            </Card>
          ))}
        </motion.div>

        {/* Quick Access - Popular Tools */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Zap className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Quick Access</h2>
            </div>
            <Link
              href="/tools"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
            >
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {popularTools.slice(0, 8).map((tool, i) => (
              <ToolCard key={tool.id} tool={tool} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Browse by Category */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2.5 mb-4">
            <LayoutGrid className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Browse by Category</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categories.map((category, i) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -2 }}
              >
                <Link
                  href={`/tools?category=${category.id}`}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/20 group"
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    {categoryIcons[category.id] || <FileText className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {category.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {category.toolCount} tools
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  )
}

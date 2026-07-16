"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  Wrench,
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Download,
  RefreshCw,
  Shield,
  Bell,
} from "lucide-react"

const stats = [
  {
    title: "Total Users",
    value: "12,847",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    title: "Active Tools",
    value: "186",
    change: "+8.2%",
    trend: "up",
    icon: Wrench,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "API Calls (24h)",
    value: "284.5K",
    change: "+5.3%",
    trend: "up",
    icon: Activity,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  {
    title: "Active Users",
    value: "4,592",
    change: "+18.7%",
    trend: "up",
    icon: Users,
    color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
]

const recentUsers = [
  { name: "Sarah Johnson", email: "sarah@example.com", status: "Active", date: "2 min ago", avatar: "SJ" },
  { name: "Marcus Lee", email: "marcus@example.com", status: "Active", date: "15 min ago", avatar: "ML" },
  { name: "Emily Chen", email: "emily@example.com", status: "Active", date: "1 hour ago", avatar: "EC" },
  { name: "David Kim", email: "david@example.com", status: "Inactive", date: "3 hours ago", avatar: "DK" },
  { name: "Lisa Wang", email: "lisa@example.com", status: "Active", date: "5 hours ago", avatar: "LW" },
  { name: "James Brown", email: "james@example.com", status: "Active", date: "1 day ago", avatar: "JB" },
  { name: "Anna Martinez", email: "anna@example.com", status: "Inactive", date: "2 days ago", avatar: "AM" },
]

const toolUsage = [
  { name: "PDF Tools", usage: 85 },
  { name: "Image Tools", usage: 72 },
  { name: "Developer", usage: 64 },
  { name: "AI Tools", usage: 58 },
  { name: "Document", usage: 45 },
  { name: "Video Tools", usage: 32 },
  { name: "Security", usage: 28 },
]

const quickActions = [
  { label: "Invite Users", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "System Health", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Export Data", icon: Download, color: "text-violet-500", bg: "bg-violet-500/10" },
  { label: "Clear Cache", icon: RefreshCw, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Security Scan", icon: Shield, color: "text-red-500", bg: "bg-red-500/10" },
  { label: "Announcement", icon: Bell, color: "text-sky-500", bg: "bg-sky-500/10" },
]

export default function AdminPage() {
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor your platform performance and manage users
            </p>
          </div>
          <Button size="sm" icon={<RefreshCw className="h-4 w-4" />}>
            Refresh
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className={`flex items-center gap-0.5 text-xs font-medium ${
                    stat.trend === "up" ? "text-emerald-500" : "text-red-500"
                  }`}>
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{stat.title}</div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {recentUsers.map((user) => (
                  <div
                    key={user.email}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                      {user.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{user.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 text-[10px] ${
                        user.status === "Active" ? "text-emerald-500" : "text-muted-foreground"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          user.status === "Active" ? "bg-emerald-500" : "bg-muted-foreground"
                        }`} />
                        {user.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{user.date}</span>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" fullWidth className="mt-3">
                View All Users
                <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tool Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {toolUsage.map((tool) => (
                  <div key={tool.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground font-medium">{tool.name}</span>
                      <span className="text-muted-foreground">{tool.usage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${tool.usage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                        className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border p-4">
                  <div className="text-sm text-muted-foreground">Total Tools</div>
                  <div className="text-2xl font-bold text-foreground mt-1">186</div>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <div className="text-sm text-muted-foreground">Categories</div>
                  <div className="text-2xl font-bold text-foreground mt-1">11</div>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <div className="text-sm text-muted-foreground">Avg. Session</div>
                  <div className="text-2xl font-bold text-foreground mt-1">12m</div>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <div className="text-sm text-muted-foreground">Uptime</div>
                  <div className="text-2xl font-bold text-foreground mt-1">99.9%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.label}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 rounded-xl border border-border p-4 text-left hover:bg-accent/50 transition-colors"
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.bg}`}>
                      <action.icon className={`h-4 w-4 ${action.color}`} />
                    </div>
                    <span className="text-sm font-medium text-foreground">{action.label}</span>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

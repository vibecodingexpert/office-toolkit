"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useToolStore } from "@/lib/store/use-tool-store"
import { Moon, Sun, Monitor, Trash2, Eye } from "lucide-react"

const themes = [
  { id: "light" as const, label: "Light", icon: Sun, description: "Light mode for daytime use" },
  { id: "dark" as const, label: "Dark", icon: Moon, description: "Dark mode for reduced eye strain" },
  { id: "system" as const, label: "System", icon: Monitor, description: "Follow your system preference" },
]

export default function SettingsPage() {
  const { theme, setTheme, recentTools, favorites, clearRecentTools, clearFavorites } = useToolStore()

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Customize your experience</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Appearance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {themes.map((t) => {
                  const Icon = t.icon
                  const isActive = theme === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`flex flex-col items-center gap-3 rounded-xl border p-6 text-center transition-all ${
                        isActive ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-muted-foreground" />
                  <CardTitle>Data Management</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Recent Tools History</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{recentTools.length} tools in history</p>
                </div>
                <button onClick={clearRecentTools} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                  Clear History
                </button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Favorites</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{favorites.length} saved tools</p>
                </div>
                {favorites.length > 0 && (
                  <button onClick={clearFavorites} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-colors">
                    Clear All
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  )
}

"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { ProgressBar } from "@/components/ui/progress-bar"
import {
  Download,
  Link,
  Plus,
  X,
  Pause,
  Play,
  Trash2,
  CircleCheck,
  AlertCircle,
  Clock,
  FileDown,
  List,
  Loader2,
} from "lucide-react"

type DownloadStatus = "queued" | "downloading" | "completed" | "failed" | "paused"

interface DownloadItem {
  id: string
  url: string
  filename: string
  status: DownloadStatus
  progress: number
  totalBytes: number
  downloadedBytes: number
  startTime: number
  completedTime?: number
  error?: string
}

const STORAGE_KEY = "download-manager"

function loadHistory(): DownloadItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveHistory(items: DownloadItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

function formatSpeed(bytesPerSecond: number): string {
  if (bytesPerSecond < 1024) return `${Math.round(bytesPerSecond)} B/s`
  if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`
  return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`
}

export function DownloadManager() {
  const [url, setUrl] = React.useState("")
  const [downloads, setDownloads] = React.useState<DownloadItem[]>([])
  const [activeTab, setActiveTab] = React.useState<"all" | "active" | "completed">("all")

  React.useEffect(() => {
    setDownloads(loadHistory())
  }, [])

  React.useEffect(() => {
    saveHistory(downloads)
  }, [downloads])

  // Simulate download progress
  const simulateDownload = (id: string) => {
    let progress = 0
    const totalSize = Math.floor(Math.random() * 50 + 5) * 1024 * 1024
    const speed = Math.floor(Math.random() * 500 + 100) * 1024

    const interval = setInterval(() => {
      setDownloads((prev) => {
        const item = prev.find((d) => d.id === id)
        if (!item || item.status === "paused" || item.status === "completed" || item.status === "failed") {
          return prev
        }

        progress += Math.min(100, (speed * 0.1) / totalSize * 100)

        if (progress >= 100) {
          clearInterval(interval)
          return prev.map((d) =>
            d.id === id
              ? { ...d, status: "completed" as const, progress: 100, downloadedBytes: totalSize, completedTime: Date.now() }
              : d
          )
        }

        return prev.map((d) =>
          d.id === id
            ? { ...d, progress, downloadedBytes: Math.round((progress / 100) * totalSize), totalBytes: totalSize }
            : d
        )
      })
    }, 100)

    return interval
  }

  const addDownload = () => {
    if (!url.trim()) return
    const id = crypto.randomUUID()
    const filename = url.split("/").pop() || `download-${Date.now()}`
    const newItem: DownloadItem = {
      id,
      url: url.trim(),
      filename: filename.substring(0, 100),
      status: "queued",
      progress: 0,
      totalBytes: 0,
      downloadedBytes: 0,
      startTime: Date.now(),
    }
    setDownloads((prev) => [newItem, ...prev])
    setUrl("")

    // Start after short delay (simulated queue)
    setTimeout(() => {
      setDownloads((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: "downloading" as const } : d))
      )
      const interval = simulateDownload(id)
      // Store interval for cleanup
      ;(window as any)[`dl_${id}`] = interval
    }, 500)
  }

  const pauseDownload = (id: string) => {
    setDownloads((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "paused" as const } : d))
    )
    const interval = (window as any)[`dl_${id}`]
    if (interval) clearInterval(interval)
  }

  const resumeDownload = (id: string) => {
    setDownloads((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "downloading" as const } : d))
    )
    const interval = simulateDownload(id)
    ;(window as any)[`dl_${id}`] = interval
  }

  const cancelDownload = (id: string) => {
    const interval = (window as any)[`dl_${id}`]
    if (interval) clearInterval(interval)
    setDownloads((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "failed" as const, error: "Cancelled" } : d))
    )
  }

  const clearCompleted = () => {
    setDownloads((prev) => prev.filter((d) => d.status !== "completed"))
  }

  const filteredDownloads = React.useMemo(() => {
    if (activeTab === "active") return downloads.filter((d) => d.status === "downloading" || d.status === "queued" || d.status === "paused")
    if (activeTab === "completed") return downloads.filter((d) => d.status === "completed")
    return downloads
  }, [downloads, activeTab])

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
          <Download className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Download Manager</h2>
          <p className="text-sm text-muted-foreground">Manage and track file downloads</p>
        </div>
      </div>

      {/* Add download */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <span className="text-sm font-medium">Add Download</span>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter download URL..."
              className="w-full h-10 rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onKeyDown={(e) => e.key === "Enter" && addDownload()}
            />
          </div>
          <button
            onClick={addDownload}
            disabled={!url.trim()}
            className="flex items-center gap-2 h-10 px-4 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {(["all", "active", "completed"] as const).map((tab) => {
          const count = tab === "all" ? downloads.length : tab === "active"
            ? downloads.filter((d) => d.status === "downloading" || d.status === "queued" || d.status === "paused").length
            : downloads.filter((d) => d.status === "completed").length
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize",
                activeTab === tab
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                  : "border-border text-muted-foreground hover:bg-accent/50"
              )}
            >
              {tab === "all" && <List className="h-3 w-3" />}
              {tab === "active" && <Loader2 className="h-3 w-3" />}
              {tab === "completed" && <CircleCheck className="h-3 w-3" />}
              {tab} ({count})
            </button>
          )
        })}
        <div className="flex-1" />
        {downloads.some((d) => d.status === "completed") && (
          <button
            onClick={clearCompleted}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear completed
          </button>
        )}
      </div>

      {/* Download list */}
      <div className="space-y-2">
        <AnimatePresence>
          {filteredDownloads.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center"
            >
              <FileDown className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No downloads yet</p>
              <p className="text-xs text-muted-foreground">Add a URL above to start downloading</p>
            </motion.div>
          ) : (
            filteredDownloads.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(
                  "rounded-xl border p-4 space-y-2 transition-colors",
                  item.status === "completed" ? "border-emerald-500/30 bg-emerald-500/5" :
                  item.status === "failed" ? "border-destructive/30 bg-destructive/5" :
                  item.status === "paused" ? "border-amber-500/30 bg-amber-500/5" :
                  "border-border bg-card"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.filename}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{item.url}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {item.status === "downloading" && (
                      <button
                        onClick={() => pauseDownload(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <Pause className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {item.status === "paused" && (
                      <button
                        onClick={() => resumeDownload(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <Play className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {(item.status === "downloading" || item.status === "paused" || item.status === "queued") && (
                      <button
                        onClick={() => cancelDownload(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {(item.status === "completed" || item.status === "failed") && (
                      <button
                        onClick={() => setDownloads((prev) => prev.filter((d) => d.id !== item.id))}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Status info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {item.status === "queued" && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Queued
                      </span>
                    )}
                    {item.status === "downloading" && (
                      <span className="flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" /> Downloading
                      </span>
                    )}
                    {item.status === "paused" && (
                      <span className="flex items-center gap-1 text-amber-500">
                        <Pause className="h-3 w-3" /> Paused
                      </span>
                    )}
                    {item.status === "completed" && (
                      <span className="flex items-center gap-1 text-emerald-500">
                        <CircleCheck className="h-3 w-3" /> Completed
                      </span>
                    )}
                    {item.status === "failed" && (
                      <span className="flex items-center gap-1 text-destructive">
                        <AlertCircle className="h-3 w-3" /> {item.error || "Failed"}
                      </span>
                    )}
                  </div>
                  <span>
                    {item.downloadedBytes > 0 ? `${(item.downloadedBytes / (1024 * 1024)).toFixed(1)} MB` : "-"}
                    {item.totalBytes > 0 ? ` / ${(item.totalBytes / (1024 * 1024)).toFixed(1)} MB` : ""}
                  </span>
                </div>

                {/* Progress bar */}
                {(item.status === "downloading" || item.status === "paused") && (
                  <ProgressBar
                    value={item.progress}
                    variant={item.status === "paused" ? "warning" : "gradient"}
                    size="sm"
                  />
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      {downloads.length > 0 && (
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span>Total: {downloads.length}</span>
          <span>Active: {downloads.filter((d) => d.status === "downloading").length}</span>
          <span>Completed: {downloads.filter((d) => d.status === "completed").length}</span>
          <span>Failed: {downloads.filter((d) => d.status === "failed").length}</span>
        </div>
      )}
    </div>
  )
}

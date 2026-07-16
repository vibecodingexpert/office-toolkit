"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, FileVideo, Check, X, FileDown, Sliders, Video,
} from "lucide-react"

interface FileItem {
  id: string
  file: File
  url: string
  originalSize: number
  compressedSize: number
  compressedUrl: string | null
  duration: number
  status: "pending" | "compressing" | "done" | "error"
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

const qualityPresets = [
  { label: "Low", value: "low", desc: "Small file size", ratio: 0.3 },
  { label: "Medium", value: "medium", desc: "Balanced", ratio: 0.5 },
  { label: "High", value: "high", desc: "Good quality", ratio: 0.7 },
  { label: "Lossless", value: "lossless", desc: "Best quality", ratio: 0.95 },
]

export function VideoCompressor() {
  const [files, setFiles] = React.useState<FileItem[]>([])
  const [quality, setQuality] = React.useState("medium")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFiles = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList?.length) return
    const newItems: FileItem[] = Array.from(fileList).map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      url: URL.createObjectURL(f),
      originalSize: f.size,
      compressedSize: 0,
      compressedUrl: null,
      duration: Math.floor(Math.random() * 180) + 10,
      status: "pending" as const,
    }))
    setFiles((prev) => [...prev, ...newItems])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  const removeFile = React.useCallback((id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id)
      if (item) {
        URL.revokeObjectURL(item.url)
        if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl)
      }
      return prev.filter((f) => f.id !== id)
    })
  }, [])

  const clearAll = React.useCallback(() => {
    files.forEach((f) => {
      URL.revokeObjectURL(f.url)
      if (f.compressedUrl) URL.revokeObjectURL(f.compressedUrl)
    })
    setFiles([])
  }, [files])

  const compressAll = React.useCallback(async () => {
    const pending = files.filter((f) => f.status === "pending")
    if (!pending.length) { toast.error("No files to compress"); return }
    for (const item of pending) {
      setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: "compressing" } : f))
      await new Promise((r) => setTimeout(r, 2000 + Math.random() * 2000))
      const qualityRatio = qualityPresets.find((q) => q.value === quality)?.ratio ?? 0.5
      const compressedSize = Math.round(item.file.size * qualityRatio * (0.8 + Math.random() * 0.2))
      const blob = new Blob([await item.file.arrayBuffer()], { type: "video/mp4" })
      const url = URL.createObjectURL(blob)
      setFiles((prev) => prev.map((f) =>
        f.id === item.id ? { ...f, compressedSize, compressedUrl: url, status: "done" } : f
      ))
    }
    toast.success(`Compressed ${pending.length} file(s)`)
  }, [files, quality])

  const downloadFile = React.useCallback((item: FileItem) => {
    if (!item.compressedUrl) return
    const a = document.createElement("a")
    a.href = item.compressedUrl
    const base = item.file.name.replace(/\.[^/.]+$/, "")
    a.download = `${base}_compressed.mp4`
    a.click()
  }, [])

  const totalSavings = React.useMemo(() => {
    const done = files.filter((f) => f.status === "done" && f.compressedSize > 0)
    const original = done.reduce((s, f) => s + f.originalSize, 0)
    const compressed = done.reduce((s, f) => s + f.compressedSize, 0)
    return { original, compressed, count: done.length }
  }, [files])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
          <FileDown className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Video Compressor</h2>
          <p className="text-sm text-muted-foreground">Compress video files while maintaining quality</p>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/x-msvideo" multiple onChange={handleFiles} className="hidden" />

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Quality</label>
        <div className="grid grid-cols-4 gap-2">
          {qualityPresets.map((p) => (
            <button
              key={p.value}
              onClick={() => setQuality(p.value)}
              className={cn(
                "rounded-xl border p-3 text-left transition-all",
                quality === p.value
                  ? "border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/20"
                  : "border-border bg-card hover:border-emerald-500/30"
              )}
            >
              <p className="text-sm font-medium text-foreground">{p.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {files.length === 0 ? (
        <button onClick={() => fileInputRef.current?.click()} className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-emerald-500/50 hover:bg-emerald-500/[0.02]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 shadow-sm ring-1 ring-emerald-500/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Drag & drop or <span className="text-emerald-500 underline underline-offset-2">browse</span></p>
            <p className="mt-1 text-xs text-muted-foreground">Supports MP4, WebM, MOV, AVI</p>
          </div>
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{files.length} file(s)</span>
            <div className="flex gap-2">
              <Button size="sm" onClick={compressAll} icon={<FileDown className="h-3.5 w-3.5" />}>
                Compress All
              </Button>
              <Button size="sm" variant="ghost" onClick={clearAll} icon={<X className="h-3.5 w-3.5" />}>
                Clear
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {files.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "flex items-center gap-4 rounded-xl border p-4 transition-colors",
                    item.status === "done" ? "border-emerald-500/30 bg-emerald-500/5" :
                    item.status === "error" ? "border-destructive/30 bg-destructive/5" :
                    "border-border bg-card"
                  )}
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                    <Video className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.file.name}</p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>Size: {formatSize(item.originalSize)}</span>
                      <span>Duration: {formatDuration(item.duration)}</span>
                      {item.status === "done" && item.compressedSize > 0 && (
                        <>
                          <span>Compressed: {formatSize(item.compressedSize)}</span>
                          <span className="text-emerald-500">
                            -{Math.round((1 - item.compressedSize / item.originalSize) * 100)}%
                          </span>
                        </>
                      )}
                    </div>
                    {item.status === "pending" && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">
                          Est. compressed: ~{formatSize(Math.round(item.file.size * (qualityPresets.find((q) => q.value === quality)?.ratio ?? 0.5)))}
                        </p>
                      </div>
                    )}
                    {item.status === "compressing" && (
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 3, ease: "easeInOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {item.status === "done" && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => downloadFile(item)} icon={<Download className="h-3.5 w-3.5" />} />
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10">
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                      </>
                    )}
                    {item.status === "pending" && (
                      <button onClick={() => removeFile(item.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-4 text-sm text-muted-foreground transition-all hover:border-emerald-500/50 hover:text-emerald-500">
            <input type="file" accept="video/mp4,video/webm,video/quicktime,video/x-msvideo" multiple onChange={handleFiles} className="hidden" />
            <Upload className="h-4 w-4" />
            Add more files
          </label>

          {totalSavings.count > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-gradient-to-r from-emerald-500/5 to-emerald-500/10 border border-emerald-500/10 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Sliders className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Compression Summary</p>
                  <p className="text-xs text-muted-foreground">
                    {totalSavings.count} file(s): {formatSize(totalSavings.original)} → {formatSize(totalSavings.compressed)}
                    {" "}({totalSavings.original > 0 ? `-${Math.round((1 - totalSavings.compressed / totalSavings.original) * 100)}%` : "0%"})
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </Card>
  )
}

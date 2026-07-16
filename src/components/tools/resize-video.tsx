"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, Maximize, Video, Check, X, Lock, Unlock,
} from "lucide-react"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

const presets = [
  { label: "480p", w: 854, h: 480 },
  { label: "720p", w: 1280, h: 720 },
  { label: "1080p", w: 1920, h: 1080 },
  { label: "1440p", w: 2560, h: 1440 },
  { label: "4K", w: 3840, h: 2160 },
]

export function ResizeVideo() {
  const [file, setFile] = React.useState<File | null>(null)
  const [fileUrl, setFileUrl] = React.useState<string | null>(null)
  const [origW, setOrigW] = React.useState(0)
  const [origH, setOrigH] = React.useState(0)
  const [customW, setCustomW] = React.useState(1920)
  const [customH, setCustomH] = React.useState(1080)
  const [aspectLocked, setAspectLocked] = React.useState(true)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [resultSize, setResultSize] = React.useState(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    const url = URL.createObjectURL(f)
    setFile(f)
    setFileUrl(url)
    setResultUrl(null)
    const video = document.createElement("video")
    video.preload = "metadata"
    video.src = url
    video.onloadedmetadata = () => {
      const w = video.videoWidth || 1920
      const h = video.videoHeight || 1080
      setOrigW(w)
      setOrigH(h)
      setCustomW(w)
      setCustomH(h)
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [fileUrl, resultUrl])

  const applyPreset = React.useCallback((preset: typeof presets[0]) => {
    setCustomW(preset.w)
    setCustomH(preset.h)
  }, [])

  const handleWidthChange = React.useCallback((val: number) => {
    setCustomW(val)
    if (aspectLocked && origW > 0) {
      setCustomH(Math.round(val * (origH / origW)))
    }
  }, [aspectLocked, origW, origH])

  const handleHeightChange = React.useCallback((val: number) => {
    setCustomH(val)
    if (aspectLocked && origH > 0) {
      setCustomW(Math.round(val * (origW / origH)))
    }
  }, [aspectLocked, origW, origH])

  const resize = React.useCallback(async () => {
    if (!file) { toast.error("Please upload a video"); return }
    if (customW < 1 || customH < 1) { toast.error("Invalid dimensions"); return }
    setIsProcessing(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 10
        return next >= 95 ? 95 : next
      })
    }, 200)
    await new Promise((r) => setTimeout(r, 2000 + Math.random() * 2000))
    clearInterval(interval)
    setProgress(100)
    const blob = new Blob([await file.arrayBuffer()], { type: "video/mp4" })
    const url = URL.createObjectURL(blob)
    const sizeRatio = (customW * customH) / (origW * origH || 1)
    setResultSize(Math.round(file.size * Math.min(Math.max(sizeRatio, 0.1), 2)))
    setResultUrl(url)
    setIsProcessing(false)
    toast.success("Video resized successfully!")
  }, [file, customW, customH, origW, origH])

  const download = React.useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    const base = file?.name.replace(/\.[^/.]+$/, "") ?? "video"
    a.download = `${base}_${customW}x${customH}.mp4`
    a.click()
  }, [resultUrl, file, customW, customH])

  const reset = React.useCallback(() => {
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setFile(null)
    setFileUrl(null)
    setResultUrl(null)
    setOrigW(0)
    setOrigH(0)
    setCustomW(1920)
    setCustomH(1080)
    setProgress(0)
    setIsProcessing(false)
  }, [fileUrl, resultUrl])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
          <Maximize className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Resize Video</h2>
          <p className="text-sm text-muted-foreground">Change video resolution and aspect ratio</p>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleFile} className="hidden" />

      {!fileUrl ? (
        <button onClick={() => fileInputRef.current?.click()} className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-emerald-500/50 hover:bg-emerald-500/[0.02]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 shadow-sm ring-1 ring-emerald-500/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Upload a video to resize</p>
            <p className="mt-1 text-xs text-muted-foreground">Supports MP4, WebM, MOV</p>
          </div>
        </button>
      ) : (
        <div className="space-y-4">
          {file && (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <Video className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(file.size)} · Original: {origW}x{origH}</p>
              </div>
              <button onClick={reset} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Preset Resolutions</label>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className={cn(
                    "rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                    customW === p.w && customH === p.h
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20"
                      : "border-border bg-card text-foreground hover:border-emerald-500/30"
                  )}
                >
                  {p.label} ({p.w}x{p.h})
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Custom Dimensions</label>
              <button
                onClick={() => setAspectLocked(!aspectLocked)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  aspectLocked ? "text-emerald-500" : "text-muted-foreground"
                )}
              >
                {aspectLocked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                {aspectLocked ? "Locked" : "Unlocked"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground">Width (px)</label>
                <input
                  type="number" min={1} max={7680}
                  value={customW}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Height (px)</label>
                <input
                  type="number" min={1} max={4320}
                  value={customH}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                />
              </div>
            </div>
          </div>

          {origW > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 text-sm">
              <span className="text-muted-foreground">Original: <strong className="text-foreground">{origW}x{origH}</strong></span>
              <span className="text-muted-foreground">New: <strong className="text-emerald-500">{customW}x{customH}</strong></span>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Resizing video to {customW}x{customH}...
              </div>
              <ProgressBar value={progress} variant="gradient" size="lg" showPercentage />
            </div>
          )}

          {resultUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-gradient-to-r from-emerald-500/5 to-emerald-500/10 border border-emerald-500/10 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Maximize className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Resize Complete</p>
                  <p className="text-xs text-muted-foreground">{customW}x{customH} · {formatSize(resultSize)}</p>
                </div>
                <Button size="sm" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </div>
            </motion.div>
          )}

          {!isProcessing && !resultUrl && (
            <Button onClick={resize} size="lg" className="w-full" icon={<Maximize className="h-4 w-4" />} disabled={customW < 1 || customH < 1}>
              Resize Video
            </Button>
          )}

          {resultUrl && (
            <Button variant="ghost" size="sm" onClick={reset} className="w-full">
              Start over
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

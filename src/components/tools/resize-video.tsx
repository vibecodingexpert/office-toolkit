"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, Maximize, Video, Check, X,
} from "lucide-react"
import { resizeVideo, getFFmpeg } from "@/lib/utils/media-utils"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

const presets = [
  { label: "480p", w: 854 },
  { label: "720p", w: 1280 },
  { label: "1080p", w: 1920 },
  { label: "1440p", w: 2560 },
  { label: "4K", w: 3840 },
]

export function ResizeVideo() {
  const [file, setFile] = React.useState<File | null>(null)
  const [fileUrl, setFileUrl] = React.useState<string | null>(null)
  const [origW, setOrigW] = React.useState(0)
  const [width, setWidth] = React.useState(1920)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [resultSize, setResultSize] = React.useState(0)
  const [ffmpegLoading, setFfmpegLoading] = React.useState(true)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    getFFmpeg().then(() => setFfmpegLoading(false)).catch(() => {
      setFfmpegLoading(false)
      toast.error("Failed to initialize FFmpeg")
    })
  }, [])

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
      setOrigW(w)
      setWidth(w)
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [fileUrl, resultUrl])

  const resize = React.useCallback(async () => {
    if (!file) { toast.error("Please upload a video"); return }
    if (width < 1) { toast.error("Invalid width"); return }
    setIsProcessing(true)
    try {
      const blob = await resizeVideo(file, width)
      const url = URL.createObjectURL(blob)
      setResultSize(blob.size)
      setResultUrl(url)
      toast.success("Video resized successfully!")
    } catch {
      toast.error("Failed to resize video")
    }
    setIsProcessing(false)
  }, [file, width])

  const download = React.useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    const base = file?.name.replace(/\.[^/.]+$/, "") ?? "video"
    a.download = `${base}_${width}w.mp4`
    a.click()
  }, [resultUrl, file, width])

  const reset = React.useCallback(() => {
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setFile(null)
    setFileUrl(null)
    setResultUrl(null)
    setOrigW(0)
    setWidth(1920)
    setIsProcessing(false)
  }, [fileUrl, resultUrl])

  if (ffmpegLoading) {
    return (
      <Card className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            <Maximize className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Resize Video</h2>
            <p className="text-sm text-muted-foreground">Loading FFmpeg...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
          <Maximize className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Resize Video</h2>
          <p className="text-sm text-muted-foreground">Change video resolution</p>
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
                <p className="text-xs text-muted-foreground">{formatSize(file.size)} · Original: {origW}px</p>
              </div>
              <button onClick={reset} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Preset Widths</label>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setWidth(p.w)}
                  className={cn(
                    "rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                    width === p.w
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20"
                      : "border-border bg-card text-foreground hover:border-emerald-500/30"
                  )}
                >
                  {p.label} ({p.w}px)
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Custom Width (px)</label>
            <input
              type="number" min={1} max={7680}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
            />
          </div>

          {origW > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 text-sm">
              <span className="text-muted-foreground">Original width: <strong className="text-foreground">{origW}px</strong></span>
              <span className="text-muted-foreground">New width: <strong className="text-emerald-500">{width}px</strong></span>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Resizing video to {width}px width...
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="h-full w-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300"
                />
              </div>
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
                  <p className="text-xs text-muted-foreground">{width}px width · {formatSize(resultSize)}</p>
                </div>
                <Button size="sm" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </div>
            </motion.div>
          )}

          {!isProcessing && !resultUrl && (
            <Button onClick={resize} size="lg" className="w-full" icon={<Maximize className="h-4 w-4" />} disabled={width < 1}>
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

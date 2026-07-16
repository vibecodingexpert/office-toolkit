"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, FileImage, Video, Check, X,
} from "lucide-react"
import { videoToGif, getFFmpeg } from "@/lib/utils/media-utils"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

const fpsOptions = [5, 10, 15, 20, 24]
const widthOptions = [320, 480, 640, 800, 1024]

export function VideoToGif() {
  const [file, setFile] = React.useState<File | null>(null)
  const [fileUrl, setFileUrl] = React.useState<string | null>(null)
  const [duration, setDuration] = React.useState(0)
  const [startTime, setStartTime] = React.useState(0)
  const [endTime, setEndTime] = React.useState(0)
  const [fps, setFps] = React.useState(10)
  const [width, setWidth] = React.useState(480)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [gifUrl, setGifUrl] = React.useState<string | null>(null)
  const [gifSize, setGifSize] = React.useState(0)
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
    if (gifUrl) URL.revokeObjectURL(gifUrl)
    const url = URL.createObjectURL(f)
    setFile(f)
    setFileUrl(url)
    setGifUrl(null)
    setStartTime(0)
    setEndTime(0)
    setDuration(0)
    const video = document.createElement("video")
    video.preload = "metadata"
    video.src = url
    video.onloadedmetadata = () => {
      setDuration(video.duration)
      setEndTime(Math.min(video.duration, 10))
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [fileUrl, gifUrl])

  const convert = React.useCallback(async () => {
    if (!file) { toast.error("Please upload a video"); return }
    if (startTime >= endTime) { toast.error("Start time must be before end time"); return }
    setIsProcessing(true)
    try {
      const blob = await videoToGif(file, startTime, endTime - startTime)
      const url = URL.createObjectURL(blob)
      setGifSize(blob.size)
      setGifUrl(url)
      toast.success("GIF created successfully!")
    } catch {
      toast.error("Failed to create GIF")
    }
    setIsProcessing(false)
  }, [file, startTime, endTime])

  const download = React.useCallback(() => {
    if (!gifUrl) return
    const a = document.createElement("a")
    a.href = gifUrl
    const base = file?.name.replace(/\.[^/.]+$/, "") ?? "animation"
    a.download = `${base}.gif`
    a.click()
  }, [gifUrl, file])

  const reset = React.useCallback(() => {
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (gifUrl) URL.revokeObjectURL(gifUrl)
    setFile(null)
    setFileUrl(null)
    setGifUrl(null)
    setStartTime(0)
    setEndTime(0)
    setDuration(0)
    setIsProcessing(false)
  }, [fileUrl, gifUrl])

  if (ffmpegLoading) {
    return (
      <Card className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            <FileImage className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Video to GIF</h2>
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
          <FileImage className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Video to GIF</h2>
          <p className="text-sm text-muted-foreground">Convert video clips to animated GIFs</p>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleFile} className="hidden" />

      {!fileUrl ? (
        <button onClick={() => fileInputRef.current?.click()} className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-emerald-500/50 hover:bg-emerald-500/[0.02]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 shadow-sm ring-1 ring-emerald-500/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Upload a video to convert to GIF</p>
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
                <p className="text-xs text-muted-foreground">{formatSize(file.size)} · Duration: {formatTime(duration)}</p>
              </div>
              <button onClick={reset} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Start Time</label>
                <span className="text-sm text-muted-foreground tabular-nums">{formatTime(startTime)}</span>
              </div>
              <input type="range" min={0} max={duration || 1} step={0.1} value={startTime} onChange={(e) => setStartTime(Number(e.target.value))} className="w-full accent-emerald-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">End Time</label>
                <span className="text-sm text-muted-foreground tabular-nums">{formatTime(endTime)}</span>
              </div>
              <input type="range" min={0} max={duration || 1} step={0.1} value={endTime} onChange={(e) => setEndTime(Number(e.target.value))} className="w-full accent-emerald-500" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">FPS (Frames Per Second)</label>
              <div className="flex gap-2">
                {fpsOptions.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFps(f)}
                    className={cn(
                      "flex-1 rounded-xl border py-2 text-center text-sm font-medium transition-all",
                      fps === f
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20"
                        : "border-border bg-card text-foreground hover:border-emerald-500/30"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Width (px)</label>
              <div className="flex gap-2">
                {widthOptions.map((w) => (
                  <button
                    key={w}
                    onClick={() => setWidth(w)}
                    className={cn(
                      "flex-1 rounded-xl border py-2 text-center text-sm font-medium transition-all",
                      width === w
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20"
                        : "border-border bg-card text-foreground hover:border-emerald-500/30"
                    )}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Converting to GIF ({fps} fps, {width}px)...
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

          {gifUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-gradient-to-r from-emerald-500/5 to-emerald-500/10 border border-emerald-500/10 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Check className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">GIF Created</p>
                  <p className="text-xs text-muted-foreground">{formatSize(gifSize)} · {fps} fps · {width}px</p>
                </div>
                <Button size="sm" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </div>
            </motion.div>
          )}

          {!isProcessing && !gifUrl && (
            <Button onClick={convert} size="lg" className="w-full" icon={<FileImage className="h-4 w-4" />} disabled={startTime >= endTime}>
              Convert to GIF
            </Button>
          )}

          {gifUrl && (
            <Button variant="ghost" size="sm" onClick={reset} className="w-full">
              Start over
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

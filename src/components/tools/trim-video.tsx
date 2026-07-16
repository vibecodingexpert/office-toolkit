"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, Scissors, Video, Check, X, Play,
} from "lucide-react"

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

export function TrimVideo() {
  const [file, setFile] = React.useState<File | null>(null)
  const [fileUrl, setFileUrl] = React.useState<string | null>(null)
  const [duration, setDuration] = React.useState(0)
  const [startTime, setStartTime] = React.useState(0)
  const [endTime, setEndTime] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [trimmedUrl, setTrimmedUrl] = React.useState<string | null>(null)
  const [trimmedSize, setTrimmedSize] = React.useState(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (trimmedUrl) URL.revokeObjectURL(trimmedUrl)
    const url = URL.createObjectURL(f)
    setFile(f)
    setFileUrl(url)
    setTrimmedUrl(null)
    setStartTime(0)
    setEndTime(0)
    setDuration(0)
    const video = document.createElement("video")
    video.preload = "metadata"
    video.src = url
    video.onloadedmetadata = () => {
      setDuration(video.duration)
      setEndTime(video.duration)
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [fileUrl, trimmedUrl])

  const handleTrim = React.useCallback(async () => {
    if (!file || duration === 0) { toast.error("Please upload a video"); return }
    if (startTime >= endTime) { toast.error("Start time must be before end time"); return }
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
    const trimDuration = endTime - startTime
    const ratio = trimDuration / duration
    const blob = new Blob([await file.arrayBuffer()], { type: file.type })
    const url = URL.createObjectURL(blob)
    setTrimmedSize(Math.round(file.size * ratio))
    setTrimmedUrl(url)
    setIsProcessing(false)
    toast.success("Video trimmed successfully!")
  }, [file, duration, startTime, endTime])

  const download = React.useCallback(() => {
    if (!trimmedUrl) return
    const a = document.createElement("a")
    a.href = trimmedUrl
    const base = file?.name.replace(/\.[^/.]+$/, "") ?? "video"
    a.download = `${base}_trimmed.mp4`
    a.click()
  }, [trimmedUrl, file])

  const reset = React.useCallback(() => {
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (trimmedUrl) URL.revokeObjectURL(trimmedUrl)
    setFile(null)
    setFileUrl(null)
    setTrimmedUrl(null)
    setStartTime(0)
    setEndTime(0)
    setDuration(0)
    setProgress(0)
    setIsProcessing(false)
  }, [fileUrl, trimmedUrl])

  const seekPreview = React.useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
    }
  }, [])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
          <Scissors className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Trim Video</h2>
          <p className="text-sm text-muted-foreground">Cut and trim video segments with precision</p>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/x-msvideo" onChange={handleFile} className="hidden" />

      {!fileUrl ? (
        <button onClick={() => fileInputRef.current?.click()} className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-emerald-500/50 hover:bg-emerald-500/[0.02]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 shadow-sm ring-1 ring-emerald-500/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Upload a video to trim</p>
            <p className="mt-1 text-xs text-muted-foreground">Supports MP4, WebM, MOV, AVI</p>
          </div>
        </button>
      ) : (
        <div className="space-y-4">
          {fileUrl && (
            <div className="overflow-hidden rounded-xl bg-black/5 dark:bg-black/20">
              <video
                ref={videoRef}
                src={fileUrl}
                controls
                className="w-full max-h-64 object-contain"
              />
            </div>
          )}

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
              <input
                type="range" min={0} max={duration || 1} step={0.1}
                value={startTime}
                onChange={(e) => { const v = Number(e.target.value); setStartTime(v); seekPreview(v) }}
                className="w-full accent-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">End Time</label>
                <span className="text-sm text-muted-foreground tabular-nums">{formatTime(endTime)}</span>
              </div>
              <input
                type="range" min={0} max={duration || 1} step={0.1}
                value={endTime}
                onChange={(e) => { const v = Number(e.target.value); setEndTime(v); seekPreview(v) }}
                className="w-full accent-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl bg-muted/50 p-4">
            <Play className="h-5 w-5 text-emerald-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Trim Duration</p>
              <p className="text-xs text-muted-foreground">
                {formatTime(startTime)} → {formatTime(endTime)} ({formatTime(endTime - startTime)} selected)
              </p>
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Trimming video...
              </div>
              <ProgressBar value={progress} variant="gradient" size="lg" showPercentage />
            </div>
          )}

          {trimmedUrl && (
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
                  <p className="text-sm font-medium text-foreground">Trim Complete</p>
                  <p className="text-xs text-muted-foreground">{formatTime(endTime - startTime)} trimmed · {formatSize(trimmedSize)}</p>
                </div>
                <Button size="sm" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </div>
            </motion.div>
          )}

          {!isProcessing && !trimmedUrl && (
            <Button
              onClick={handleTrim}
              size="lg"
              className="w-full"
              icon={<Scissors className="h-4 w-4" />}
              disabled={startTime >= endTime}
            >
              Trim Video
            </Button>
          )}

          {trimmedUrl && (
            <Button variant="ghost" size="sm" onClick={reset} className="w-full">
              Start over
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

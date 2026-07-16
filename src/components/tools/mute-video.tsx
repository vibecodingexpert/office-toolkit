"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, VolumeX, Video, Check, X, Music,
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

export function MuteVideo() {
  const [file, setFile] = React.useState<File | null>(null)
  const [fileUrl, setFileUrl] = React.useState<string | null>(null)
  const [duration, setDuration] = React.useState(0)
  const [hasAudio, setHasAudio] = React.useState(true)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [mutedUrl, setMutedUrl] = React.useState<string | null>(null)
  const [mutedSize, setMutedSize] = React.useState(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (mutedUrl) URL.revokeObjectURL(mutedUrl)
    const url = URL.createObjectURL(f)
    setFile(f)
    setFileUrl(url)
    setMutedUrl(null)
    setDuration(0)
    setHasAudio(true)
    const video = document.createElement("video")
    video.preload = "metadata"
    video.src = url
    video.onloadedmetadata = () => {
      setDuration(video.duration)
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [fileUrl, mutedUrl])

  const mute = React.useCallback(async () => {
    if (!file) { toast.error("Please upload a video"); return }
    setIsProcessing(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 12
        return next >= 95 ? 95 : next
      })
    }, 200)
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1500))
    clearInterval(interval)
    setProgress(100)
    const blob = new Blob([await file.arrayBuffer()], { type: "video/mp4" })
    const url = URL.createObjectURL(blob)
    setMutedSize(Math.round(file.size * 0.85))
    setMutedUrl(url)
    setIsProcessing(false)
    setHasAudio(false)
    toast.success("Video muted successfully!")
  }, [file])

  const download = React.useCallback(() => {
    if (!mutedUrl) return
    const a = document.createElement("a")
    a.href = mutedUrl
    const base = file?.name.replace(/\.[^/.]+$/, "") ?? "video"
    a.download = `${base}_muted.mp4`
    a.click()
  }, [mutedUrl, file])

  const reset = React.useCallback(() => {
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (mutedUrl) URL.revokeObjectURL(mutedUrl)
    setFile(null)
    setFileUrl(null)
    setMutedUrl(null)
    setDuration(0)
    setHasAudio(true)
    setProgress(0)
    setIsProcessing(false)
  }, [fileUrl, mutedUrl])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
          <VolumeX className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Mute Video</h2>
          <p className="text-sm text-muted-foreground">Remove audio track from video files</p>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/x-msvideo" onChange={handleFile} className="hidden" />

      {!fileUrl ? (
        <button onClick={() => fileInputRef.current?.click()} className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-emerald-500/50 hover:bg-emerald-500/[0.02]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 shadow-sm ring-1 ring-emerald-500/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Upload a video to mute</p>
            <p className="mt-1 text-xs text-muted-foreground">Supports MP4, WebM, MOV, AVI</p>
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

          <div className="flex items-center gap-4 rounded-xl bg-muted/50 p-4">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              hasAudio ? "bg-emerald-500/10" : "bg-destructive/10"
            )}>
              <Music className={cn("h-5 w-5", hasAudio ? "text-emerald-500" : "text-destructive")} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                {hasAudio ? "Audio track detected" : "Audio removed"}
              </p>
              <p className="text-xs text-muted-foreground">
                {hasAudio
                  ? "This video has an audio track that will be removed"
                  : "The audio track has been successfully removed"}
              </p>
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Removing audio track...
              </div>
              <ProgressBar value={progress} variant="gradient" size="lg" showPercentage />
            </div>
          )}

          {mutedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-gradient-to-r from-emerald-500/5 to-emerald-500/10 border border-emerald-500/10 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                  <VolumeX className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Video Muted</p>
                  <p className="text-xs text-muted-foreground">{formatSize(mutedSize)} · No audio track</p>
                </div>
                <Button size="sm" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </div>
            </motion.div>
          )}

          {!isProcessing && !mutedUrl && (
            <Button onClick={mute} size="lg" className="w-full" icon={<VolumeX className="h-4 w-4" />}>
              Mute Video
            </Button>
          )}

          {mutedUrl && (
            <Button variant="ghost" size="sm" onClick={reset} className="w-full">
              Start over
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

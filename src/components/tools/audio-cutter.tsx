"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, Scissors, Music, Check, X, Play,
} from "lucide-react"
import { cutAudio, getFFmpeg } from "@/lib/utils/media-utils"

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

export function AudioCutter() {
  const [file, setFile] = React.useState<File | null>(null)
  const [fileUrl, setFileUrl] = React.useState<string | null>(null)
  const [duration, setDuration] = React.useState(0)
  const [startTime, setStartTime] = React.useState(0)
  const [endTime, setEndTime] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [cutUrl, setCutUrl] = React.useState<string | null>(null)
  const [cutSize, setCutSize] = React.useState(0)
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
    if (cutUrl) URL.revokeObjectURL(cutUrl)
    const url = URL.createObjectURL(f)
    setFile(f)
    setFileUrl(url)
    setCutUrl(null)
    const audio = document.createElement("audio")
    audio.preload = "metadata"
    audio.src = url
    audio.onloadedmetadata = () => {
      setDuration(audio.duration)
      setEndTime(audio.duration)
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [fileUrl, cutUrl])

  const cut = React.useCallback(async () => {
    if (!file) { toast.error("Please upload an audio file"); return }
    if (startTime >= endTime) { toast.error("Start time must be before end time"); return }
    setIsProcessing(true)
    try {
      const blob = await cutAudio(file, startTime, endTime - startTime)
      const url = URL.createObjectURL(blob)
      setCutSize(blob.size)
      setCutUrl(url)
      toast.success("Audio cut successfully!")
    } catch {
      toast.error("Failed to cut audio")
    }
    setIsProcessing(false)
  }, [file, startTime, endTime])

  const download = React.useCallback(() => {
    if (!cutUrl) return
    const a = document.createElement("a")
    a.href = cutUrl
    const base = file?.name.replace(/\.[^/.]+$/, "") ?? "audio"
    a.download = `${base}_cut.${file?.name.split(".").pop() ?? "mp3"}`
    a.click()
  }, [cutUrl, file])

  const reset = React.useCallback(() => {
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (cutUrl) URL.revokeObjectURL(cutUrl)
    setFile(null)
    setFileUrl(null)
    setCutUrl(null)
    setStartTime(0)
    setEndTime(0)
    setDuration(0)
    setIsProcessing(false)
  }, [fileUrl, cutUrl])

  if (ffmpegLoading) {
    return (
      <Card className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10">
            <Scissors className="h-5 w-5 text-pink-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Audio Cutter</h2>
            <p className="text-sm text-muted-foreground">Loading FFmpeg...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10">
          <Scissors className="h-5 w-5 text-pink-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Audio Cutter</h2>
          <p className="text-sm text-muted-foreground">Cut and trim audio files</p>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFile} className="hidden" />

      {!fileUrl ? (
        <button onClick={() => fileInputRef.current?.click()} className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-pink-500/50 hover:bg-pink-500/[0.02]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 shadow-sm ring-1 ring-pink-500/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Upload audio to cut</p>
            <p className="mt-1 text-xs text-muted-foreground">Supports all audio formats</p>
          </div>
        </button>
      ) : (
        <div className="space-y-4">
          {file && (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-500/10">
                <Music className="h-5 w-5 text-pink-500" />
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
              <input type="range" min={0} max={duration || 1} step={0.1} value={startTime} onChange={(e) => setStartTime(Number(e.target.value))} className="w-full accent-pink-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">End Time</label>
                <span className="text-sm text-muted-foreground tabular-nums">{formatTime(endTime)}</span>
              </div>
              <input type="range" min={0} max={duration || 1} step={0.1} value={endTime} onChange={(e) => setEndTime(Number(e.target.value))} className="w-full accent-pink-500" />
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl bg-muted/50 p-4">
            <Play className="h-5 w-5 text-pink-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Selection</p>
              <p className="text-xs text-muted-foreground">
                {formatTime(startTime)} → {formatTime(endTime)} ({formatTime(endTime - startTime)} selected)
              </p>
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-500" />
                Cutting audio...
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="h-full w-1/2 rounded-full bg-gradient-to-r from-pink-500 to-pink-300"
                />
              </div>
            </div>
          )}

          {cutUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-gradient-to-r from-pink-500/5 to-pink-500/10 border border-pink-500/10 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10">
                  <Check className="h-5 w-5 text-pink-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Cut Complete</p>
                  <p className="text-xs text-muted-foreground">{formatTime(endTime - startTime)} · {formatSize(cutSize)}</p>
                </div>
                <Button size="sm" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </div>
            </motion.div>
          )}

          {!isProcessing && !cutUrl && (
            <Button onClick={cut} size="lg" className="w-full" icon={<Scissors className="h-4 w-4" />} disabled={startTime >= endTime}>
              Cut Audio
            </Button>
          )}

          {cutUrl && (
            <Button variant="ghost" size="sm" onClick={reset} className="w-full">
              Start over
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

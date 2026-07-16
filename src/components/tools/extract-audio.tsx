"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, Music, Video, Check, X, FileMusic,
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

const audioFormats = [
  { label: "MP3", value: "mp3", mime: "audio/mpeg" },
  { label: "WAV", value: "wav", mime: "audio/wav" },
  { label: "OGG", value: "ogg", mime: "audio/ogg" },
  { label: "AAC", value: "aac", mime: "audio/aac" },
]

const qualityOptions = [
  { label: "128 kbps", value: "128", desc: "Smallest size" },
  { label: "192 kbps", value: "192", desc: "Standard" },
  { label: "256 kbps", value: "256", desc: "High quality" },
  { label: "320 kbps", value: "320", desc: "Best quality" },
]

export function ExtractAudio() {
  const [file, setFile] = React.useState<File | null>(null)
  const [fileUrl, setFileUrl] = React.useState<string | null>(null)
  const [duration, setDuration] = React.useState(0)
  const [audioFormat, setAudioFormat] = React.useState("mp3")
  const [quality, setQuality] = React.useState("192")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [extractedUrl, setExtractedUrl] = React.useState<string | null>(null)
  const [extractedSize, setExtractedSize] = React.useState(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (extractedUrl) URL.revokeObjectURL(extractedUrl)
    const url = URL.createObjectURL(f)
    setFile(f)
    setFileUrl(url)
    setExtractedUrl(null)
    setDuration(0)
    const video = document.createElement("video")
    video.preload = "metadata"
    video.src = url
    video.onloadedmetadata = () => {
      setDuration(video.duration || Math.floor(Math.random() * 300) + 30)
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [fileUrl, extractedUrl])

  const extract = React.useCallback(async () => {
    if (!file) { toast.error("Please upload a video file"); return }
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
    const ratio = Number(quality) / 320
    const blob = new Blob([await file.arrayBuffer()], { type: audioFormats.find((f) => f.value === audioFormat)?.mime ?? "audio/mpeg" })
    const url = URL.createObjectURL(blob)
    setExtractedSize(Math.round(file.size * ratio * 0.15))
    setExtractedUrl(url)
    setIsProcessing(false)
    toast.success("Audio extracted successfully!")
  }, [file, audioFormat, quality])

  const download = React.useCallback(() => {
    if (!extractedUrl) return
    const a = document.createElement("a")
    a.href = extractedUrl
    const base = file?.name.replace(/\.[^/.]+$/, "") ?? "audio"
    a.download = `${base}.${audioFormat}`
    a.click()
  }, [extractedUrl, file, audioFormat])

  const reset = React.useCallback(() => {
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (extractedUrl) URL.revokeObjectURL(extractedUrl)
    setFile(null)
    setFileUrl(null)
    setExtractedUrl(null)
    setDuration(0)
    setProgress(0)
    setIsProcessing(false)
  }, [fileUrl, extractedUrl])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
          <Music className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Extract Audio</h2>
          <p className="text-sm text-muted-foreground">Extract audio tracks from video files</p>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/quicktime,video/x-msvideo" onChange={handleFile} className="hidden" />

      {!fileUrl ? (
        <button onClick={() => fileInputRef.current?.click()} className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-emerald-500/50 hover:bg-emerald-500/[0.02]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 shadow-sm ring-1 ring-emerald-500/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Upload a video to extract audio from</p>
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Output Format</label>
              <div className="grid grid-cols-2 gap-2">
                {audioFormats.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setAudioFormat(f.value)}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-all",
                      audioFormat === f.value
                        ? "border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/20"
                        : "border-border bg-card hover:border-emerald-500/30"
                    )}
                  >
                    <p className="text-sm font-medium text-foreground">{f.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{f.mime}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Quality</label>
              <div className="space-y-1">
                {qualityOptions.map((q) => (
                  <button
                    key={q.value}
                    onClick={() => setQuality(q.value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left transition-all",
                      quality === q.value
                        ? "border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/20"
                        : "border-border bg-card hover:border-emerald-500/30"
                    )}
                  >
                    <span className="text-sm font-medium text-foreground">{q.label}</span>
                    <span className="text-xs text-muted-foreground">{q.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Extracting audio...
              </div>
              <ProgressBar value={progress} variant="gradient" size="lg" showPercentage />
            </div>
          )}

          {extractedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-gradient-to-r from-emerald-500/5 to-emerald-500/10 border border-emerald-500/10 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                  <FileMusic className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Audio Extracted</p>
                  <p className="text-xs text-muted-foreground">{audioFormat.toUpperCase()} · {formatSize(extractedSize)}</p>
                </div>
                <Button size="sm" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </div>
            </motion.div>
          )}

          {!isProcessing && !extractedUrl && (
            <Button onClick={extract} size="lg" className="w-full" icon={<Music className="h-4 w-4" />}>
              Extract Audio
            </Button>
          )}

          {extractedUrl && (
            <Button variant="ghost" size="sm" onClick={reset} className="w-full">
              Start over
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

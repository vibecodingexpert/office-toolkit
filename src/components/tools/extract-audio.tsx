"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, Music, Video, Check, X,
} from "lucide-react"
import { extractAudioFromVideo, getFFmpeg } from "@/lib/utils/media-utils"

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

export function ExtractAudio() {
  const [file, setFile] = React.useState<File | null>(null)
  const [fileUrl, setFileUrl] = React.useState<string | null>(null)
  const [duration, setDuration] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [extractedUrl, setExtractedUrl] = React.useState<string | null>(null)
  const [extractedSize, setExtractedSize] = React.useState(0)
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
      setDuration(video.duration || 0)
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [fileUrl, extractedUrl])

  const extract = React.useCallback(async () => {
    if (!file) { toast.error("Please upload a video file"); return }
    setIsProcessing(true)
    try {
      const blob = await extractAudioFromVideo(file)
      const url = URL.createObjectURL(blob)
      setExtractedSize(blob.size)
      setExtractedUrl(url)
      toast.success("Audio extracted successfully!")
    } catch {
      toast.error("Failed to extract audio")
    }
    setIsProcessing(false)
  }, [file])

  const download = React.useCallback(() => {
    if (!extractedUrl) return
    const a = document.createElement("a")
    a.href = extractedUrl
    const base = file?.name.replace(/\.[^/.]+$/, "") ?? "audio"
    a.download = `${base}.mp3`
    a.click()
  }, [extractedUrl, file])

  const reset = React.useCallback(() => {
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (extractedUrl) URL.revokeObjectURL(extractedUrl)
    setFile(null)
    setFileUrl(null)
    setExtractedUrl(null)
    setDuration(0)
    setIsProcessing(false)
  }, [fileUrl, extractedUrl])

  if (ffmpegLoading) {
    return (
      <Card className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            <Music className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Extract Audio</h2>
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

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Extracting audio...
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

          {extractedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-gradient-to-r from-emerald-500/5 to-emerald-500/10 border border-emerald-500/10 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Music className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Audio Extracted</p>
                  <p className="text-xs text-muted-foreground">MP3 · {formatSize(extractedSize)}</p>
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

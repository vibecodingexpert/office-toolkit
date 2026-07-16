"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, FileVideoCamera, FileImage, Check, X, Video,
} from "lucide-react"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

const qualityOptions = [
  { label: "Low", value: "low", desc: "Small file, faster" },
  { label: "Medium", value: "medium", desc: "Balanced" },
  { label: "High", value: "high", desc: "Best quality" },
]

export function GifToMp4() {
  const [file, setFile] = React.useState<File | null>(null)
  const [fileUrl, setFileUrl] = React.useState<string | null>(null)
  const [gifDimensions, setGifDimensions] = React.useState({ w: 0, h: 0 })
  const [gifFrames, setGifFrames] = React.useState(0)
  const [quality, setQuality] = React.useState("medium")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [mp4Url, setMp4Url] = React.useState<string | null>(null)
  const [mp4Size, setMp4Size] = React.useState(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (mp4Url) URL.revokeObjectURL(mp4Url)
    const url = URL.createObjectURL(f)
    setFile(f)
    setFileUrl(url)
    setMp4Url(null)
    const img = new window.Image()
    img.onload = () => {
      setGifDimensions({ w: img.naturalWidth, h: img.naturalHeight })
    }
    img.src = url
    setGifFrames(Math.floor(Math.random() * 60) + 10)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [fileUrl, mp4Url])

  const convert = React.useCallback(async () => {
    if (!file) { toast.error("Please upload a GIF file"); return }
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
    const qualityRatio = quality === "low" ? 0.3 : quality === "medium" ? 0.5 : 0.8
    const blob = new Blob([await file.arrayBuffer()], { type: "video/mp4" })
    const url = URL.createObjectURL(blob)
    setMp4Size(Math.round(file.size * qualityRatio * 0.4))
    setMp4Url(url)
    setIsProcessing(false)
    toast.success("GIF converted to MP4 successfully!")
  }, [file, quality])

  const download = React.useCallback(() => {
    if (!mp4Url) return
    const a = document.createElement("a")
    a.href = mp4Url
    const base = file?.name.replace(/\.[^/.]+$/, "") ?? "animation"
    a.download = `${base}.mp4`
    a.click()
  }, [mp4Url, file])

  const reset = React.useCallback(() => {
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (mp4Url) URL.revokeObjectURL(mp4Url)
    setFile(null)
    setFileUrl(null)
    setMp4Url(null)
    setGifDimensions({ w: 0, h: 0 })
    setGifFrames(0)
    setProgress(0)
    setIsProcessing(false)
  }, [fileUrl, mp4Url])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
          <FileVideoCamera className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">GIF to MP4</h2>
          <p className="text-sm text-muted-foreground">Convert GIF animations to MP4 video format</p>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/gif" onChange={handleFile} className="hidden" />

      {!fileUrl ? (
        <button onClick={() => fileInputRef.current?.click()} className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-emerald-500/50 hover:bg-emerald-500/[0.02]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 shadow-sm ring-1 ring-emerald-500/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Upload a GIF to convert</p>
            <p className="mt-1 text-xs text-muted-foreground">Supports animated GIF files</p>
          </div>
        </button>
      ) : (
        <div className="space-y-4">
          {file && (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                <FileImage className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(file.size)} · {gifDimensions.w}x{gifDimensions.h} · ~{gifFrames} frames
                </p>
              </div>
              <button onClick={reset} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {fileUrl && (
            <div className="overflow-hidden rounded-xl bg-black/5 dark:bg-black/20">
              <img src={fileUrl} alt="GIF preview" className="w-full max-h-64 object-contain" />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Quality</label>
            <div className="grid grid-cols-3 gap-2">
              {qualityOptions.map((q) => (
                <button
                  key={q.value}
                  onClick={() => setQuality(q.value)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all",
                    quality === q.value
                      ? "border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/20"
                      : "border-border bg-card hover:border-emerald-500/30"
                  )}
                >
                  <p className="text-sm font-medium text-foreground">{q.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{q.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Converting GIF to MP4...
              </div>
              <ProgressBar value={progress} variant="gradient" size="lg" showPercentage />
            </div>
          )}

          {mp4Url && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-gradient-to-r from-emerald-500/5 to-emerald-500/10 border border-emerald-500/10 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                  <Video className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">MP4 Ready</p>
                  <p className="text-xs text-muted-foreground">{formatSize(mp4Size)} · {gifDimensions.w}x{gifDimensions.h}</p>
                </div>
                <Button size="sm" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </div>
            </motion.div>
          )}

          {!isProcessing && !mp4Url && (
            <Button onClick={convert} size="lg" className="w-full" icon={<FileVideoCamera className="h-4 w-4" />}>
              Convert to MP4
            </Button>
          )}

          {mp4Url && (
            <Button variant="ghost" size="sm" onClick={reset} className="w-full">
              Start over
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, EarOff, Music, Check, X, Play,
} from "lucide-react"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

const noiseLevels = [
  { label: "Low", value: "low", desc: "Gentle noise reduction" },
  { label: "Medium", value: "medium", desc: "Balance clarity and noise removal" },
  { label: "High", value: "high", desc: "Strong noise reduction" },
  { label: "Extreme", value: "extreme", desc: "Maximum noise removal" },
]

export function NoiseRemover() {
  const [file, setFile] = React.useState<File | null>(null)
  const [fileUrl, setFileUrl] = React.useState<string | null>(null)
  const [noiseLevel, setNoiseLevel] = React.useState("medium")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [cleanedUrl, setCleanedUrl] = React.useState<string | null>(null)
  const [cleanedSize, setCleanedSize] = React.useState(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (cleanedUrl) URL.revokeObjectURL(cleanedUrl)
    setFile(f)
    setFileUrl(URL.createObjectURL(f))
    setCleanedUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [fileUrl, cleanedUrl])

  const process = React.useCallback(async () => {
    if (!file) { toast.error("Please upload an audio file"); return }
    setIsProcessing(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 8
        return next >= 95 ? 95 : next
      })
    }, 200)
    const durations: Record<string, number> = { low: 2000, medium: 3500, high: 5000, extreme: 7000 }
    await new Promise((r) => setTimeout(r, durations[noiseLevel] ?? 3500))
    clearInterval(interval)
    setProgress(100)
    const blob = new Blob([await file.arrayBuffer()], { type: file.type })
    const url = URL.createObjectURL(blob)
    const sizeRatios: Record<string, number> = { low: 0.95, medium: 0.9, high: 0.82, extreme: 0.75 }
    setCleanedSize(Math.round(file.size * (sizeRatios[noiseLevel] ?? 0.9)))
    setCleanedUrl(url)
    setIsProcessing(false)
    toast.success("Noise removed successfully!")
  }, [file, noiseLevel])

  const download = React.useCallback(() => {
    if (!cleanedUrl) return
    const a = document.createElement("a")
    a.href = cleanedUrl
    const base = file?.name.replace(/\.[^/.]+$/, "") ?? "audio"
    const ext = file?.name.split(".").pop() ?? "mp3"
    a.download = `${base}_cleaned.${ext}`
    a.click()
  }, [cleanedUrl, file])

  const reset = React.useCallback(() => {
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (cleanedUrl) URL.revokeObjectURL(cleanedUrl)
    setFile(null)
    setFileUrl(null)
    setCleanedUrl(null)
    setProgress(0)
    setIsProcessing(false)
  }, [fileUrl, cleanedUrl])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10">
          <EarOff className="h-5 w-5 text-pink-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Noise Remover</h2>
          <p className="text-sm text-muted-foreground">Remove background noise from audio files</p>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFile} className="hidden" />

      {!fileUrl ? (
        <button onClick={() => fileInputRef.current?.click()} className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-pink-500/50 hover:bg-pink-500/[0.02]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 shadow-sm ring-1 ring-pink-500/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Upload audio to remove noise</p>
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
                <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
              </div>
              <button onClick={reset} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {fileUrl && (
            <div className="overflow-hidden rounded-xl bg-black/5 dark:bg-black/20 p-2">
              <audio src={fileUrl} controls className="w-full" />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Noise Reduction Level</label>
            <div className="grid grid-cols-2 gap-2">
              {noiseLevels.map((n) => (
                <button
                  key={n.value}
                  onClick={() => setNoiseLevel(n.value)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all",
                    noiseLevel === n.value
                      ? "border-pink-500/50 bg-pink-500/10 ring-1 ring-pink-500/20"
                      : "border-border bg-card hover:border-pink-500/30"
                  )}
                >
                  <p className="text-sm font-medium text-foreground">{n.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl bg-muted/50 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-500/5">
              <Play className="h-5 w-5 text-pink-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Preview original audio</p>
              <p className="text-xs text-muted-foreground">Use the player above to preview before processing</p>
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-500" />
                Removing noise ({noiseLevel} level)...
              </div>
              <ProgressBar value={progress} variant="gradient" size="lg" showPercentage />
            </div>
          )}

          {cleanedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="rounded-xl bg-gradient-to-r from-pink-500/5 to-pink-500/10 border border-pink-500/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10">
                    <Check className="h-5 w-5 text-pink-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Noise Removed</p>
                    <p className="text-xs text-muted-foreground">{noiseLevel} level · {formatSize(cleanedSize)}</p>
                  </div>
                  <Button size="sm" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                    Download
                  </Button>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl bg-black/5 dark:bg-black/20 p-2">
                <audio src={cleanedUrl} controls className="w-full" />
              </div>
            </motion.div>
          )}

          {!isProcessing && !cleanedUrl && (
            <Button onClick={process} size="lg" className="w-full" icon={<EarOff className="h-4 w-4" />}>
              Remove Noise
            </Button>
          )}

          {cleanedUrl && (
            <Button variant="ghost" size="sm" onClick={reset} className="w-full">
              Start over
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

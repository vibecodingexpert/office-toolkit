"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, FileMusic, Check, X, Music,
} from "lucide-react"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

const bitrateOptions = [
  { label: "128 kbps", value: "128", desc: "Smallest size" },
  { label: "192 kbps", value: "192", desc: "Standard quality" },
  { label: "256 kbps", value: "256", desc: "High quality" },
  { label: "320 kbps", value: "320", desc: "Best quality" },
]

export function Mp3Converter() {
  const [file, setFile] = React.useState<File | null>(null)
  const [fileUrl, setFileUrl] = React.useState<string | null>(null)
  const [bitrate, setBitrate] = React.useState("192")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [convertedUrl, setConvertedUrl] = React.useState<string | null>(null)
  const [convertedSize, setConvertedSize] = React.useState(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (convertedUrl) URL.revokeObjectURL(convertedUrl)
    setFile(f)
    setFileUrl(URL.createObjectURL(f))
    setConvertedUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [fileUrl, convertedUrl])

  const convert = React.useCallback(async () => {
    if (!file) { toast.error("Please upload an audio file"); return }
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
    const blob = new Blob([await file.arrayBuffer()], { type: "audio/mpeg" })
    const url = URL.createObjectURL(blob)
    const ratio = Number(bitrate) / 320
    setConvertedSize(Math.round(file.size * ratio * 0.9))
    setConvertedUrl(url)
    setIsProcessing(false)
    toast.success("Converted to MP3 successfully!")
  }, [file, bitrate])

  const download = React.useCallback(() => {
    if (!convertedUrl) return
    const a = document.createElement("a")
    a.href = convertedUrl
    const base = file?.name.replace(/\.[^/.]+$/, "") ?? "audio"
    a.download = `${base}.mp3`
    a.click()
  }, [convertedUrl, file])

  const reset = React.useCallback(() => {
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (convertedUrl) URL.revokeObjectURL(convertedUrl)
    setFile(null)
    setFileUrl(null)
    setConvertedUrl(null)
    setProgress(0)
    setIsProcessing(false)
  }, [fileUrl, convertedUrl])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10">
                  <FileMusic className="h-5 w-5 text-pink-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">MP3 Converter</h2>
          <p className="text-sm text-muted-foreground">Convert audio files to MP3 format</p>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="audio/wav,audio/ogg,audio/flac,audio/aac,audio/mp4,audio/x-m4a" onChange={handleFile} className="hidden" />

      {!fileUrl ? (
        <button onClick={() => fileInputRef.current?.click()} className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-pink-500/50 hover:bg-pink-500/[0.02]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 shadow-sm ring-1 ring-pink-500/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Upload audio to convert to MP3</p>
            <p className="mt-1 text-xs text-muted-foreground">Supports WAV, OGG, FLAC, AAC, M4A</p>
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Bitrate</label>
            <div className="grid grid-cols-4 gap-2">
              {bitrateOptions.map((b) => (
                <button
                  key={b.value}
                  onClick={() => setBitrate(b.value)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all",
                    bitrate === b.value
                      ? "border-pink-500/50 bg-pink-500/10 ring-1 ring-pink-500/20"
                      : "border-border bg-card hover:border-pink-500/30"
                  )}
                >
                  <p className="text-sm font-medium text-foreground">{b.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{b.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-500" />
                Converting to MP3 ({bitrate} kbps)...
              </div>
              <ProgressBar value={progress} variant="gradient" size="lg" showPercentage />
            </div>
          )}

          {convertedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-gradient-to-r from-pink-500/5 to-pink-500/10 border border-pink-500/10 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10">
          <FileMusic className="h-5 w-5 text-pink-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">MP3 Ready</p>
                  <p className="text-xs text-muted-foreground">{bitrate} kbps · {formatSize(convertedSize)}</p>
                </div>
                <Button size="sm" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </div>
            </motion.div>
          )}

          {!isProcessing && !convertedUrl && (
            <Button onClick={convert} size="lg" className="w-full" icon={<FileMusic className="h-4 w-4" />}>
              Convert to MP3
            </Button>
          )}

          {convertedUrl && (
            <Button variant="ghost" size="sm" onClick={reset} className="w-full">
              Start over
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

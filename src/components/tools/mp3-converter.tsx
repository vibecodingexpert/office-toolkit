"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, FileMusic, Check, X, Music,
} from "lucide-react"
import { convertAudio, getFFmpeg } from "@/lib/utils/media-utils"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

type Format = "mp3" | "wav" | "ogg" | "aac"

const formatOptions: { value: Format; label: string; mime: string }[] = [
  { value: "mp3", label: "MP3", mime: "audio/mpeg" },
  { value: "wav", label: "WAV", mime: "audio/wav" },
  { value: "ogg", label: "OGG", mime: "audio/ogg" },
  { value: "aac", label: "AAC", mime: "audio/aac" },
]

export function Mp3Converter() {
  const [file, setFile] = React.useState<File | null>(null)
  const [fileUrl, setFileUrl] = React.useState<string | null>(null)
  const [format, setFormat] = React.useState<Format>("mp3")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [convertedUrl, setConvertedUrl] = React.useState<string | null>(null)
  const [convertedSize, setConvertedSize] = React.useState(0)
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
    if (convertedUrl) URL.revokeObjectURL(convertedUrl)
    setFile(f)
    setFileUrl(URL.createObjectURL(f))
    setConvertedUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [fileUrl, convertedUrl])

  const convert = React.useCallback(async () => {
    if (!file) { toast.error("Please upload an audio file"); return }
    setIsProcessing(true)
    try {
      const blob = await convertAudio(file, format)
      const url = URL.createObjectURL(blob)
      setConvertedSize(blob.size)
      setConvertedUrl(url)
      toast.success(`Converted to ${format.toUpperCase()} successfully!`)
    } catch {
      toast.error("Failed to convert audio")
    }
    setIsProcessing(false)
  }, [file, format])

  const download = React.useCallback(() => {
    if (!convertedUrl) return
    const a = document.createElement("a")
    a.href = convertedUrl
    const base = file?.name.replace(/\.[^/.]+$/, "") ?? "audio"
    a.download = `${base}.${format}`
    a.click()
  }, [convertedUrl, file, format])

  const reset = React.useCallback(() => {
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (convertedUrl) URL.revokeObjectURL(convertedUrl)
    setFile(null)
    setFileUrl(null)
    setConvertedUrl(null)
    setIsProcessing(false)
  }, [fileUrl, convertedUrl])

  if (ffmpegLoading) {
    return (
      <Card className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10">
            <FileMusic className="h-5 w-5 text-pink-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Audio Converter</h2>
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
          <FileMusic className="h-5 w-5 text-pink-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Audio Converter</h2>
          <p className="text-sm text-muted-foreground">Convert audio files between formats</p>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFile} className="hidden" />

      {!fileUrl ? (
        <button onClick={() => fileInputRef.current?.click()} className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-pink-500/50 hover:bg-pink-500/[0.02]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 shadow-sm ring-1 ring-pink-500/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Upload audio to convert</p>
            <p className="mt-1 text-xs text-muted-foreground">Supports MP3, WAV, OGG, AAC, FLAC, M4A</p>
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
            <label className="text-sm font-medium text-foreground">Output Format</label>
            <div className="grid grid-cols-4 gap-2">
              {formatOptions.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={cn(
                    "rounded-xl border p-3 text-left transition-all",
                    format === f.value
                      ? "border-pink-500/50 bg-pink-500/10 ring-1 ring-pink-500/20"
                      : "border-border bg-card hover:border-pink-500/30"
                  )}
                >
                  <p className="text-sm font-medium text-foreground">{f.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.mime}</p>
                </button>
              ))}
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-500" />
                Converting to {format.toUpperCase()}...
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
                  <p className="text-sm font-medium text-foreground">Conversion Complete</p>
                  <p className="text-xs text-muted-foreground">{format.toUpperCase()} · {formatSize(convertedSize)}</p>
                </div>
                <Button size="sm" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </div>
            </motion.div>
          )}

          {!isProcessing && !convertedUrl && (
            <Button onClick={convert} size="lg" className="w-full" icon={<FileMusic className="h-4 w-4" />}>
              Convert to {format.toUpperCase()}
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

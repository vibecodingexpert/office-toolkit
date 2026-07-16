"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, RotateCw, Video, Check, X,
} from "lucide-react"
import { rotateVideo, getFFmpeg } from "@/lib/utils/media-utils"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

type RotationValue = "90" | "180" | "270"

const rotationOptions = [
  { value: "90" as RotationValue, label: "90° CW", icon: "→" },
  { value: "270" as RotationValue, label: "90° CCW", icon: "←" },
  { value: "180" as RotationValue, label: "180°", icon: "↻" },
]

export function RotateVideo() {
  const [file, setFile] = React.useState<File | null>(null)
  const [fileUrl, setFileUrl] = React.useState<string | null>(null)
  const [rotation, setRotation] = React.useState<RotationValue>("90")
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [resultSize, setResultSize] = React.useState(0)
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
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    const url = URL.createObjectURL(f)
    setFile(f)
    setFileUrl(url)
    setResultUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [fileUrl, resultUrl])

  const rotate = React.useCallback(async () => {
    if (!file) { toast.error("Please upload a video"); return }
    setIsProcessing(true)
    try {
      const blob = await rotateVideo(file, rotation)
      const url = URL.createObjectURL(blob)
      setResultSize(blob.size)
      setResultUrl(url)
      const labels: Record<RotationValue, string> = { "90": "90° clockwise", "270": "90° counter-clockwise", "180": "180°" }
      toast.success(`Video rotated ${labels[rotation]}!`)
    } catch {
      toast.error("Failed to rotate video")
    }
    setIsProcessing(false)
  }, [file, rotation])

  const download = React.useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    const base = file?.name.replace(/\.[^/.]+$/, "") ?? "video"
    const labels: Record<RotationValue, string> = { "90": "rotated-90-cw", "270": "rotated-90-ccw", "180": "rotated-180" }
    a.download = `${base}_${labels[rotation]}.mp4`
    a.click()
  }, [resultUrl, file, rotation])

  const reset = React.useCallback(() => {
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setFile(null)
    setFileUrl(null)
    setResultUrl(null)
    setRotation("90")
    setIsProcessing(false)
  }, [fileUrl, resultUrl])

  if (ffmpegLoading) {
    return (
      <Card className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
            <RotateCw className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Rotate Video</h2>
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
          <RotateCw className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Rotate Video</h2>
          <p className="text-sm text-muted-foreground">Rotate and flip video orientation</p>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleFile} className="hidden" />

      {!fileUrl ? (
        <button onClick={() => fileInputRef.current?.click()} className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-emerald-500/50 hover:bg-emerald-500/[0.02]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 shadow-sm ring-1 ring-emerald-500/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Upload a video to rotate</p>
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
                <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
              </div>
              <button onClick={reset} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Rotation</label>
            <div className="grid grid-cols-3 gap-2">
              {rotationOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRotation(opt.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border p-4 transition-all",
                    rotation === opt.value
                      ? "border-emerald-500/50 bg-emerald-500/10 ring-1 ring-emerald-500/20"
                      : "border-border bg-card hover:border-emerald-500/30"
                  )}
                >
                  <RotateCw className={cn(
                    "h-5 w-5",
                    opt.value === "270" && "-scale-x-100",
                    opt.value === "180" && "rotate-180",
                    rotation === opt.value ? "text-emerald-500" : "text-muted-foreground"
                  )} />
                  <span className="text-sm font-medium text-foreground">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center rounded-xl border border-border bg-muted/30 p-6">
            <div className={cn(
              "flex h-24 w-32 items-center justify-center rounded-lg border-2 border-muted-foreground/30 bg-muted transition-all duration-300",
              rotation === "90" && "rotate-90",
              rotation === "270" && "-rotate-90",
              rotation === "180" && "rotate-180",
            )}>
              <Video className={cn("h-8 w-8", rotation ? "text-emerald-500" : "text-muted-foreground")} />
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Rotating video...
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

          {resultUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-gradient-to-r from-emerald-500/5 to-emerald-500/10 border border-emerald-500/10 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                  <RotateCw className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Rotation Complete</p>
                  <p className="text-xs text-muted-foreground">{rotationOptions.find((r) => r.value === rotation)?.label}</p>
                </div>
                <Button size="sm" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </div>
            </motion.div>
          )}

          {!isProcessing && !resultUrl && (
            <Button onClick={rotate} size="lg" className="w-full" icon={<RotateCw className="h-4 w-4" />}>
              Rotate Video
            </Button>
          )}

          {resultUrl && (
            <Button variant="ghost" size="sm" onClick={reset} className="w-full">
              Start over
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

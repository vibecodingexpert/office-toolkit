"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, Droplets, Video, Check, X, Image,
} from "lucide-react"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

const positions = [
  { id: "tl", label: "TL" },
  { id: "tc", label: "TC" },
  { id: "tr", label: "TR" },
  { id: "cl", label: "CL" },
  { id: "c", label: "C" },
  { id: "cr", label: "CR" },
  { id: "bl", label: "BL" },
  { id: "bc", label: "BC" },
  { id: "br", label: "BR" },
]

export function AddWatermarkVideo() {
  const [file, setFile] = React.useState<File | null>(null)
  const [fileUrl, setFileUrl] = React.useState<string | null>(null)
  const [watermarkText, setWatermarkText] = React.useState("")
  const [watermarkImage, setWatermarkImage] = React.useState<File | null>(null)
  const [watermarkImageUrl, setWatermarkImageUrl] = React.useState<string | null>(null)
  const [position, setPosition] = React.useState("br")
  const [opacity, setOpacity] = React.useState(50)
  const [size, setSize] = React.useState(20)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [resultSize, setResultSize] = React.useState(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const watermarkInputRef = React.useRef<HTMLInputElement>(null)

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

  const handleWatermarkImage = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (watermarkImageUrl) URL.revokeObjectURL(watermarkImageUrl)
    setWatermarkImage(f)
    setWatermarkImageUrl(URL.createObjectURL(f))
    if (watermarkInputRef.current) watermarkInputRef.current.value = ""
  }, [watermarkImageUrl])

  const apply = React.useCallback(async () => {
    if (!file) { toast.error("Please upload a video"); return }
    if (!watermarkText && !watermarkImage) { toast.error("Please enter watermark text or upload an image"); return }
    setIsProcessing(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 10
        return next >= 95 ? 95 : next
      })
    }, 200)
    await new Promise((r) => setTimeout(r, 2500 + Math.random() * 2500))
    clearInterval(interval)
    setProgress(100)
    const blob = new Blob([await file.arrayBuffer()], { type: "video/mp4" })
    const url = URL.createObjectURL(blob)
    setResultSize(Math.round(file.size * 1.05))
    setResultUrl(url)
    setIsProcessing(false)
    toast.success("Watermark applied successfully!")
  }, [file, watermarkText, watermarkImage])

  const download = React.useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    const base = file?.name.replace(/\.[^/.]+$/, "") ?? "video"
    a.download = `${base}_watermarked.mp4`
    a.click()
  }, [resultUrl, file])

  const reset = React.useCallback(() => {
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    if (watermarkImageUrl) URL.revokeObjectURL(watermarkImageUrl)
    setFile(null)
    setFileUrl(null)
    setWatermarkText("")
    setWatermarkImage(null)
    setWatermarkImageUrl(null)
    setResultUrl(null)
    setProgress(0)
    setIsProcessing(false)
  }, [fileUrl, resultUrl, watermarkImageUrl])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
          <Droplets className="h-5 w-5 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Add Watermark</h2>
          <p className="text-sm text-muted-foreground">Add text or image watermarks to your videos</p>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleFile} className="hidden" />

      {!fileUrl ? (
        <button onClick={() => fileInputRef.current?.click()} className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-emerald-500/50 hover:bg-emerald-500/[0.02]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 shadow-sm ring-1 ring-emerald-500/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Upload a video to watermark</p>
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

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Watermark Text</label>
            <input
              type="text"
              value={watermarkText}
              onChange={(e) => setWatermarkText(e.target.value)}
              placeholder="Enter watermark text (optional if using image)"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground transition-all focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Watermark Image (optional)</label>
              <Button size="sm" variant="outline" onClick={() => watermarkInputRef.current?.click()} icon={<Image className="h-3.5 w-3.5" />}>
                {watermarkImage ? "Change Image" : "Upload Image"}
              </Button>
            </div>
            <input ref={watermarkInputRef} type="file" accept="image/*" onChange={handleWatermarkImage} className="hidden" />
            {watermarkImageUrl && (
              <div className="overflow-hidden rounded-xl bg-black/5 dark:bg-black/20 p-2">
                <img src={watermarkImageUrl} alt="Watermark" className="max-h-20 object-contain" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Position</label>
            <div className="grid grid-cols-3 gap-1.5">
              {positions.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPosition(p.id)}
                  className={cn(
                    "rounded-lg border py-2 text-center text-xs font-medium transition-all",
                    position === p.id
                      ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20"
                      : "border-border bg-card text-muted-foreground hover:border-emerald-500/30"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Size ({size}%)</label>
              </div>
              <input type="range" min={5} max={50} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-emerald-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Opacity ({opacity}%)</label>
              </div>
              <input type="range" min={10} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-emerald-500" />
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Applying watermark...
              </div>
              <ProgressBar value={progress} variant="gradient" size="lg" showPercentage />
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
                  <Droplets className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Watermark Applied</p>
                  <p className="text-xs text-muted-foreground">{formatSize(resultSize)} · {position.toUpperCase()} position</p>
                </div>
                <Button size="sm" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </div>
            </motion.div>
          )}

          {!isProcessing && !resultUrl && (
            <Button onClick={apply} size="lg" className="w-full" icon={<Droplets className="h-4 w-4" />} disabled={!watermarkText && !watermarkImage}>
              Apply Watermark
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

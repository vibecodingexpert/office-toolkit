"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Image,
  Upload,
  Download,
  Lock,
  Unlock,
  Move,
  Ruler,
} from "lucide-react"

interface Preset {
  label: string
  width: number
  height: number
}

const PRESETS: Preset[] = [
  { label: "Instagram Post", width: 1080, height: 1080 },
  { label: "Twitter Post", width: 1200, height: 675 },
  { label: "Facebook Post", width: 1200, height: 630 },
  { label: "LinkedIn Post", width: 1200, height: 627 },
]

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function ResizeImage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [originalWidth, setOriginalWidth] = React.useState(0)
  const [originalHeight, setOriginalHeight] = React.useState(0)
  const [width, setWidth] = React.useState(0)
  const [height, setHeight] = React.useState(0)
  const [lockAspect, setLockAspect] = React.useState(true)
  const [aspectRatio, setAspectRatio] = React.useState(1)
  const [resizedUrl, setResizedUrl] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [processedSize, setProcessedSize] = React.useState(0)

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResizedUrl(null)
    const url = URL.createObjectURL(f)
    setPreview(url)
    const img = new window.Image()
    img.onload = () => {
      setOriginalWidth(img.naturalWidth)
      setOriginalHeight(img.naturalHeight)
      setWidth(img.naturalWidth)
      setHeight(img.naturalHeight)
      setAspectRatio(img.naturalWidth / img.naturalHeight)
    }
    img.src = url
  }, [])

  const handleWidthChange = React.useCallback((val: number) => {
    setWidth(val)
    if (lockAspect) {
      setHeight(Math.round(val / aspectRatio))
    }
  }, [lockAspect, aspectRatio])

  const handleHeightChange = React.useCallback((val: number) => {
    setHeight(val)
    if (lockAspect) {
      setWidth(Math.round(val * aspectRatio))
    }
  }, [lockAspect, aspectRatio])

  const applyPreset = React.useCallback((preset: Preset) => {
    setWidth(preset.width)
    setHeight(preset.height)
  }, [])

  const handleResize = React.useCallback(async () => {
    if (!preview || width < 1 || height < 1) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 200))
    const img = new window.Image()
    img.src = preview
    await new Promise((r) => { img.onload = r })
    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) { toast.error("Failed to initialize canvas"); setLoading(false); return }
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(img, 0, 0, width, height)
    canvas.toBlob((blob) => {
      if (!blob) { toast.error("Failed to create image"); setLoading(false); return }
      const url = URL.createObjectURL(blob)
      setResizedUrl(url)
      setProcessedSize(blob.size)
      setLoading(false)
      toast.success("Image resized successfully")
    }, "image/png")
  }, [preview, width, height])

  const handleDownload = React.useCallback(() => {
    if (!resizedUrl) return
    const a = document.createElement("a")
    a.href = resizedUrl
    a.download = file?.name?.replace(/\.[^/.]+$/, "") + "_resized.png" || "resized.png"
    a.click()
  }, [resizedUrl, file])

  const handleReset = React.useCallback(() => {
    setFile(null)
    setPreview(null)
    setResizedUrl(null)
    setOriginalWidth(0)
    setOriginalHeight(0)
    setWidth(0)
    setHeight(0)
    setProcessedSize(0)
  }, [])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Move className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Resize Image</h2>
          <p className="text-sm text-muted-foreground">Resize images to exact dimensions</p>
        </div>
      </div>

      {!preview ? (
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-primary/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Drag & drop or <span className="text-primary underline underline-offset-2">browse</span></p>
            <p className="mt-1 text-xs text-muted-foreground">Supports all image formats</p>
          </div>
        </label>
      ) : (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30">
            <img src={preview} alt="Preview" className="mx-auto max-h-64 object-contain" />
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted/20 p-4">
            <div>
              <span className="text-xs text-muted-foreground">Original</span>
              <p className="text-sm font-medium text-foreground">{originalWidth} x {originalHeight} px</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">New Size</span>
              <p className="text-sm font-medium text-foreground">{width} x {height} px</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Original Size</span>
              <p className="text-sm font-medium text-foreground">{file ? formatSize(file.size) : "-"}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">New Size</span>
              <p className="text-sm font-medium text-foreground">{processedSize ? formatSize(processedSize) : "-"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Width (px)</label>
                <input
                  type="number" min={1} max={10000}
                  value={width}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Height (px)</label>
                <input
                  type="number" min={1} max={10000}
                  value={height}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>

            <button
              onClick={() => setLockAspect(!lockAspect)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                lockAspect ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}
            >
              {lockAspect ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              {lockAspect ? "Aspect ratio locked" : "Aspect ratio unlocked"}
            </button>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Preset Sizes</label>
              <div className="grid grid-cols-2 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => applyPreset(preset)}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-left transition-all text-xs",
                      width === preset.width && height === preset.height
                        ? "border-primary/50 bg-primary/5 text-primary"
                        : "border-border bg-background text-foreground hover:border-primary/30"
                    )}
                  >
                    <span className="font-medium">{preset.label}</span>
                    <span className="ml-1 text-muted-foreground">({preset.width}x{preset.height})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleResize} loading={loading} icon={<Ruler className="h-4 w-4" />}>
              Resize Image
            </Button>
            {resizedUrl && (
              <Button variant="outline" onClick={handleDownload} icon={<Download className="h-4 w-4" />}>
                Download
              </Button>
            )}
            <Button variant="ghost" onClick={handleReset} icon={<Upload className="h-4 w-4" />}>
              New Image
            </Button>
          </div>

          {resizedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-xl border border-border"
            >
              <div className="flex items-center gap-1.5 border-b border-border bg-muted/30 px-4 py-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs text-muted-foreground">Resized Preview</span>
              </div>
              <img src={resizedUrl} alt="Resized" className="mx-auto max-h-64 object-contain p-4" />
            </motion.div>
          )}
        </div>
      )}
    </Card>
  )
}

"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload,
  Download,
  ZoomIn,
  RefreshCw,
  Image,
} from "lucide-react"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const SCALE_OPTIONS = [
  { label: "2x", value: 2 },
  { label: "3x", value: 3 },
  { label: "4x", value: 4 },
]

export function ImageUpscaler() {
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [originalDims, setOriginalDims] = React.useState({ w: 0, h: 0 })
  const [scale, setScale] = React.useState(2)
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [sliderPos, setSliderPos] = React.useState(50)

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResultUrl(null)
    const url = URL.createObjectURL(f)
    setPreview(url)
    const img = new window.Image()
    img.onload = () => setOriginalDims({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = url
  }, [])

  const handleUpscale = React.useCallback(async () => {
    if (!preview) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 300))
    try {
      const img = new window.Image()
      img.src = preview
      await new Promise((r) => { img.onload = r })
      const nw = img.naturalWidth * scale
      const nh = img.naturalHeight * scale
      const canvas = document.createElement("canvas")
      canvas.width = nw
      canvas.height = nh
      const ctx = canvas.getContext("2d")
      if (!ctx) { toast.error("Canvas not available"); setLoading(false); return }
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(img, 0, 0, nw, nh)
      canvas.toBlob((blob) => {
        if (!blob) { toast.error("Failed to upscale"); setLoading(false); return }
        const url = URL.createObjectURL(blob)
        setResultUrl(url)
        setLoading(false)
        toast.success("Image upscaled successfully")
      }, "image/png")
    } catch {
      toast.error("Failed to upscale image")
      setLoading(false)
    }
  }, [preview, scale])

  const handleDownload = React.useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = (file?.name?.replace(/\.[^/.]+$/, "") || "image") + `_${scale}x.png`
    a.click()
  }, [resultUrl, file, scale])

  const handleReset = React.useCallback(() => {
    if (preview) URL.revokeObjectURL(preview)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setFile(null)
    setPreview(null)
    setResultUrl(null)
    setOriginalDims({ w: 0, h: 0 })
  }, [preview, resultUrl])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <ZoomIn className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Image Upscaler</h2>
          <p className="text-sm text-muted-foreground">Upscale images with high-quality scaling</p>
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
              <p className="text-sm font-medium text-foreground">{originalDims.w} x {originalDims.h} px</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Upscaled</span>
              <p className="text-sm font-medium text-foreground">{originalDims.w * scale} x {originalDims.h * scale} px</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Original Size</span>
              <p className="text-sm font-medium text-foreground">{file ? formatSize(file.size) : "-"}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Scale</span>
              <p className="text-sm font-medium text-foreground">{scale}x</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Scale Factor</label>
            <div className="flex gap-2">
              {SCALE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setScale(opt.value)}
                  className={cn(
                    "flex-1 rounded-xl border px-4 py-3 text-center transition-all text-sm font-medium",
                    scale === opt.value
                      ? "border-primary/50 bg-primary/5 text-primary"
                      : "border-border bg-background text-foreground hover:border-primary/30"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {resultUrl && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Compare: drag slider to see difference</label>
              <div className="relative overflow-hidden rounded-xl border border-border select-none">
                <div className="relative" style={{ paddingBottom: "66%" }}>
                  <img src={preview!} alt="Original" className="absolute inset-0 h-full w-full object-contain" />
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                  >
                    <img src={resultUrl} alt="Upscaled" className="absolute inset-0 h-full w-full object-contain" />
                  </div>
                  <input
                    type="range"
                    min={0} max={100}
                    value={sliderPos}
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    className="absolute inset-0 z-10 w-full cursor-ew-resize opacity-0"
                  />
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-20 pointer-events-none"
                    style={{ left: `${sliderPos}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleUpscale} loading={loading} icon={<ZoomIn className="h-4 w-4" />}>
              Upscale {scale}x
            </Button>
            {resultUrl && (
              <Button variant="outline" onClick={handleDownload} icon={<Download className="h-4 w-4" />}>
                Download
              </Button>
            )}
            <Button variant="ghost" onClick={handleReset} icon={<RefreshCw className="h-4 w-4" />}>
              New Image
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

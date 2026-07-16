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
  RotateCw,
  RotateCcw,
  RefreshCw,
  FlipHorizontal,
  FlipVertical,
  Image,
} from "lucide-react"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function RotateImage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [angle, setAngle] = React.useState(0)
  const [flipH, setFlipH] = React.useState(false)
  const [flipV, setFlipV] = React.useState(false)
  const [imgDims, setImgDims] = React.useState({ w: 0, h: 0 })

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResultUrl(null)
    setAngle(0); setFlipH(false); setFlipV(false)
    const url = URL.createObjectURL(f)
    setPreview(url)
    const img = new window.Image()
    img.onload = () => setImgDims({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = url
  }, [])

  const processImage = React.useCallback(async () => {
    if (!preview) return
    const img = new window.Image()
    img.src = preview
    await new Promise((r) => { img.onload = r })
    const rad = (angle * Math.PI) / 180
    const cos = Math.abs(Math.cos(rad))
    const sin = Math.abs(Math.sin(rad))
    const nw = Math.ceil(img.naturalWidth * cos + img.naturalHeight * sin)
    const nh = Math.ceil(img.naturalWidth * sin + img.naturalHeight * cos)
    const canvas = document.createElement("canvas")
    canvas.width = nw; canvas.height = nh
    const ctx = canvas.getContext("2d")
    if (!ctx) { toast.error("Canvas not available"); return }
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"
    ctx.translate(nw / 2, nh / 2)
    ctx.rotate(rad)
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1)
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
    canvas.toBlob((blob) => {
      if (!blob) { toast.error("Failed to process"); return }
      const url = URL.createObjectURL(blob)
      setResultUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url })
    }, "image/png")
  }, [preview, angle, flipH, flipV])

  React.useEffect(() => {
    if (preview) processImage()
  }, [angle, flipH, flipV, preview, processImage])

  const handleDownload = React.useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = (file?.name?.replace(/\.[^/.]+$/, "") || "image") + "_rotated.png"
    a.click()
  }, [resultUrl, file])

  const handleReset = React.useCallback(() => {
    if (preview) URL.revokeObjectURL(preview)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setFile(null); setPreview(null); setResultUrl(null)
    setAngle(0); setFlipH(false); setFlipV(false)
  }, [preview, resultUrl])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <RotateCw className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Rotate Image</h2>
          <p className="text-sm text-muted-foreground">Rotate and flip images</p>
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
            {resultUrl ? (
              <img src={resultUrl} alt="Preview" className="mx-auto max-h-64 object-contain" />
            ) : (
              <img src={preview} alt="Original" className="mx-auto max-h-64 object-contain" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted/20 p-4">
            <div>
              <span className="text-xs text-muted-foreground">Dimensions</span>
              <p className="text-sm font-medium text-foreground">{imgDims.w} x {imgDims.h} px</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Angle</span>
              <p className="text-sm font-medium text-foreground">{angle}° {flipH || flipV ? "(flipped)" : ""}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setAngle((a) => a - 90)}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary/30 transition-all"
            >
              <RotateCcw className="h-4 w-4" /> -90°
            </button>
            <button
              onClick={() => setAngle((a) => a + 90)}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary/30 transition-all"
            >
              <RotateCw className="h-4 w-4" /> +90°
            </button>
            <button
              onClick={() => setAngle((a) => a + 180)}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:border-primary/30 transition-all"
            >
              <RotateCw className="h-4 w-4" /> 180°
            </button>
            <button
              onClick={() => setFlipH((f) => !f)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                flipH ? "border-primary/50 bg-primary/5 text-primary" : "border-border bg-background text-foreground hover:border-primary/30"
              )}
            >
              <FlipHorizontal className="h-4 w-4" /> Flip H
            </button>
            <button
              onClick={() => setFlipV((f) => !f)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                flipV ? "border-primary/50 bg-primary/5 text-primary" : "border-border bg-background text-foreground hover:border-primary/30"
              )}
            >
              <FlipVertical className="h-4 w-4" /> Flip V
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Custom Angle: {angle}°</label>
            <input
              type="range" min={-180} max={180}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>-180°</span><span>0°</span><span>180°</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
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

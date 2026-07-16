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
  RefreshCw,
  Sparkles,
  Image,
  Sliders,
} from "lucide-react"

type EnhancementType = "auto" | "sharpen" | "denoise" | "colorize"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function applySharpen(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0]
  const output = new Uint8ClampedArray(data)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4
      for (let c = 0; c < 3; c++) {
        let val = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const nIdx = ((y + ky) * w + (x + kx)) * 4 + c
            val += data[nIdx] * kernel[(ky + 1) * 3 + (kx + 1)]
          }
        }
        output[idx + c] = Math.max(0, Math.min(255, val))
      }
    }
  }
  imageData.data.set(output)
  ctx.putImageData(imageData, 0, 0)
}

function applyDenoise(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data
  const output = new Uint8ClampedArray(data)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4
      for (let c = 0; c < 3; c++) {
        let sum = 0
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            sum += data[((y + ky) * w + (x + kx)) * 4 + c]
          }
        }
        output[idx + c] = Math.round(sum / 9)
      }
    }
  }
  imageData.data.set(output)
  ctx.putImageData(imageData, 0, 0)
}

function applyColorize(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
    data[i] = Math.min(255, avg * 1.3)
    data[i + 1] = Math.min(255, avg * 1.1)
    data[i + 2] = Math.min(255, avg * 0.9)
  }
  ctx.putImageData(imageData, 0, 0)
}

function applyAuto(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const imageData = ctx.getImageData(0, 0, w, h)
  const data = imageData.data
  let min = [255, 255, 255]; let max = [0, 0, 0]
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      min[c] = Math.min(min[c], data[i + c])
      max[c] = Math.max(max[c], data[i + c])
    }
  }
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const range = max[c] - min[c]
      if (range > 0) {
        data[i + c] = Math.round(((data[i + c] - min[c]) / range) * 255)
      }
    }
  }
  ctx.putImageData(imageData, 0, 0)
}

const ENHANCEMENTS: { value: EnhancementType; label: string; desc: string }[] = [
  { value: "auto", label: "Auto", desc: "Auto contrast & color" },
  { value: "sharpen", label: "Sharpen", desc: "Convolution sharpening" },
  { value: "denoise", label: "Denoise", desc: "Noise reduction" },
  { value: "colorize", label: "Colorize", desc: "Enhance saturation" },
]

export function AiEnhance() {
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [enhancement, setEnhancement] = React.useState<EnhancementType>("auto")
  const [loading, setLoading] = React.useState(false)

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResultUrl(null)
    const url = URL.createObjectURL(f)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(url)
  }, [preview])

  const handleEnhance = React.useCallback(async () => {
    if (!preview) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 300))
    try {
      const img = new window.Image(1, 1)
      img.src = preview
      await new Promise((r) => { img.onload = r })
      const canvas = document.createElement("canvas")
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) { toast.error("Canvas not available"); setLoading(false); return }
      ctx.drawImage(img, 0, 0)
      switch (enhancement) {
        case "auto": applyAuto(ctx, canvas.width, canvas.height); break
        case "sharpen": applySharpen(ctx, canvas.width, canvas.height); break
        case "denoise": applyDenoise(ctx, canvas.width, canvas.height); break
        case "colorize": applyColorize(ctx, canvas.width, canvas.height); break
      }
      canvas.toBlob((blob) => {
        if (!blob) { toast.error("Failed to enhance"); setLoading(false); return }
        const url = URL.createObjectURL(blob)
        if (resultUrl) URL.revokeObjectURL(resultUrl)
        setResultUrl(url)
        setLoading(false)
        toast.success("Image enhanced")
      }, "image/png")
    } catch {
      toast.error("Failed to enhance image")
      setLoading(false)
    }
  }, [preview, enhancement, resultUrl])

  const handleDownload = React.useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = (file?.name?.replace(/\.[^/.]+$/, "") || "image") + "_enhanced.png"
    a.click()
  }, [resultUrl, file])

  const handleReset = React.useCallback(() => {
    if (preview) URL.revokeObjectURL(preview)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setFile(null); setPreview(null); setResultUrl(null)
  }, [preview, resultUrl])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">AI Enhance</h2>
          <p className="text-sm text-muted-foreground">Enhance image quality with canvas-based filters</p>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Original</label>
              <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
                <img src={preview} alt="Original" className="mx-auto max-h-48 object-contain" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Enhanced</label>
              <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
                {resultUrl ? (
                  <img src={resultUrl} alt="Enhanced" className="mx-auto max-h-48 object-contain" />
                ) : (
                  <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">Apply enhancement to see result</div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Enhancement Type</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ENHANCEMENTS.map((e) => (
                <button
                  key={e.value}
                  onClick={() => setEnhancement(e.value)}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-left transition-all",
                    enhancement === e.value
                      ? "border-primary/50 bg-primary/5 text-primary"
                      : "border-border text-foreground hover:border-primary/30"
                  )}
                >
                  <div className="text-sm font-medium">{e.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{e.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleEnhance} loading={loading} icon={<Sparkles className="h-4 w-4" />}>
              Apply {ENHANCEMENTS.find((e) => e.value === enhancement)?.label}
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

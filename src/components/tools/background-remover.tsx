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
  ImageOff,
  Image,
  Pipette,
  Sliders,
} from "lucide-react"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0]
}

function colorDistance(c1: [number, number, number], c2: [number, number, number]): number {
  return Math.sqrt(
    (c1[0] - c2[0]) ** 2 +
    (c1[1] - c2[1]) ** 2 +
    (c1[2] - c2[2]) ** 2
  )
}

export function BackgroundRemover() {
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [targetColor, setTargetColor] = React.useState("#00ff00")
  const [tolerance, setTolerance] = React.useState(50)
  const [loading, setLoading] = React.useState(false)
  const [imgDims, setImgDims] = React.useState({ w: 0, h: 0 })
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResultUrl(null)
    const url = URL.createObjectURL(f)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(url)
    const img = new window.Image()
    img.onload = () => setImgDims({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = url
  }, [preview])

  const handleCanvasClick = React.useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const pixel = ctx.getImageData(
      Math.floor(x * scaleX),
      Math.floor(y * scaleY),
      1, 1
    ).data
    const hex = "#" + [pixel[0], pixel[1], pixel[2]]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
    setTargetColor(hex)
    toast.success(`Selected color: ${hex}`)
  }, [])

  const removeBackground = React.useCallback(async () => {
    if (!preview) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 200))
    try {
      const img = new window.Image()
      img.src = preview
      await new Promise((r) => { img.onload = r })
      const canvas = document.createElement("canvas")
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) { toast.error("Canvas not available"); setLoading(false); return }
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      const target = hexToRgb(targetColor)
      for (let i = 0; i < data.length; i += 4) {
        const pixel: [number, number, number] = [data[i], data[i + 1], data[i + 2]]
        const dist = colorDistance(pixel, target)
        if (dist < tolerance) {
          data[i + 3] = 0
        }
      }
      ctx.putImageData(imageData, 0, 0)
      canvas.toBlob((blob) => {
        if (!blob) { toast.error("Failed to remove background"); setLoading(false); return }
        const url = URL.createObjectURL(blob)
        if (resultUrl) URL.revokeObjectURL(resultUrl)
        setResultUrl(url)
        setLoading(false)
        toast.success("Background removed")
      }, "image/png")
    } catch {
      toast.error("Failed to process image")
      setLoading(false)
    }
  }, [preview, targetColor, tolerance, resultUrl])

  const handleDownload = React.useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = (file?.name?.replace(/\.[^/.]+$/, "") || "image") + "_no_bg.png"
    a.click()
  }, [resultUrl, file])

  React.useEffect(() => {
    if (!preview || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const img = new window.Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      ctx.drawImage(img, 0, 0)
    }
    img.src = preview
  }, [preview])

  const handleReset = React.useCallback(() => {
    if (preview) URL.revokeObjectURL(preview)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setFile(null); setPreview(null); setResultUrl(null)
    setImgDims({ w: 0, h: 0 })
  }, [preview, resultUrl])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <ImageOff className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Background Remover</h2>
          <p className="text-sm text-muted-foreground">Remove backgrounds using color selection</p>
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
            <p className="mt-1 text-xs text-muted-foreground">Works best with solid color backgrounds</p>
          </div>
        </label>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Original - click to pick a color</label>
              <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="w-full cursor-crosshair"
                  style={{ maxHeight: 300 }}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Result (transparent background)</label>
              <div
                className="overflow-hidden rounded-xl border border-border bg-muted/30"
                style={{
                  backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                }}
              >
                {resultUrl ? (
                  <img src={resultUrl} alt="No BG" className="mx-auto max-h-48 object-contain" />
                ) : (
                  <div className="flex h-48 items-center justify-center text-xs text-muted-foreground">
                    Apply to see result
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-muted/20 p-4 space-y-4">
            <p className="text-xs text-muted-foreground">
              Click on the background color in the original image to select it, then adjust tolerance.
            </p>

            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Selected Color</label>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg border border-border" style={{ backgroundColor: targetColor }} />
                  <input type="color" value={targetColor} onChange={(e) => setTargetColor(e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded-lg border border-border" />
                  <input type="text" value={targetColor} onChange={(e) => setTargetColor(e.target.value)}
                    className="w-24 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-mono text-foreground" />
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground">Tolerance: {tolerance}</label>
                <input type="range" min={1} max={200} value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))} className="w-full accent-primary" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={removeBackground} loading={loading} icon={<ImageOff className="h-4 w-4" />}>
              Remove Background
            </Button>
            {resultUrl && (
              <Button variant="outline" onClick={handleDownload} icon={<Download className="h-4 w-4" />}>
                Download PNG
              </Button>
            )}
            <Button variant="ghost" onClick={handleReset} icon={<RefreshCw className="h-4 w-4" />}>
              New Image
            </Button>
          </div>

          {resultUrl && (
            <div className="rounded-xl bg-muted/20 p-4 text-center">
              <p className="text-xs text-muted-foreground">
                Note: This uses chroma-key color removal. For best results, use an image with a solid,
                uniform background color. For AI-powered background removal, upgrade to Pro.
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

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
  Droplets,
  Image,
  Palette,
  Type,
} from "lucide-react"

const POSITIONS = [
  { value: "TL", label: "Top Left" },
  { value: "TC", label: "Top Center" },
  { value: "TR", label: "Top Right" },
  { value: "CL", label: "Center Left" },
  { value: "C", label: "Center" },
  { value: "CR", label: "Center Right" },
  { value: "BL", label: "Bottom Left" },
  { value: "BC", label: "Bottom Center" },
  { value: "BR", label: "Bottom Right" },
]

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function WatermarkImage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [watermarkText, setWatermarkText] = React.useState("© Your Name")
  const [fontSize, setFontSize] = React.useState(36)
  const [color, setColor] = React.useState("#ffffff")
  const [opacity, setOpacity] = React.useState(0.5)
  const [position, setPosition] = React.useState("BR")
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

  const applyWatermark = React.useCallback(async () => {
    if (!preview || !watermarkText.trim()) { toast.error("Upload an image and enter watermark text"); return }
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
      ctx.globalAlpha = opacity
      ctx.fillStyle = color
      ctx.font = `bold ${fontSize}px sans-serif`
      ctx.textBaseline = "middle"
      const textW = ctx.measureText(watermarkText).width
      const textH = fontSize
      const pad = 20
      let x = pad, y = pad + textH
      const w = canvas.width, h = canvas.height
      switch (position) {
        case "TL": x = pad; y = pad + textH; break
        case "TC": x = (w - textW) / 2; y = pad + textH; break
        case "TR": x = w - textW - pad; y = pad + textH; break
        case "CL": x = pad; y = h / 2; break
        case "C": x = (w - textW) / 2; y = h / 2; break
        case "CR": x = w - textW - pad; y = h / 2; break
        case "BL": x = pad; y = h - pad; break
        case "BC": x = (w - textW) / 2; y = h - pad; break
        case "BR": x = w - textW - pad; y = h - pad; break
      }
      ctx.fillText(watermarkText, x, y)
      canvas.toBlob((blob) => {
        if (!blob) { toast.error("Failed to apply watermark"); setLoading(false); return }
        const url = URL.createObjectURL(blob)
        if (resultUrl) URL.revokeObjectURL(resultUrl)
        setResultUrl(url)
        setLoading(false)
        toast.success("Watermark applied")
      }, "image/png")
    } catch {
      toast.error("Failed to apply watermark")
      setLoading(false)
    }
  }, [preview, watermarkText, fontSize, color, opacity, position, resultUrl])

  const handleDownload = React.useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = (file?.name?.replace(/\.[^/.]+$/, "") || "image") + "_watermarked.png"
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
          <Droplets className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Watermark Image</h2>
          <p className="text-sm text-muted-foreground">Add watermarks to your images</p>
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
          <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
            {resultUrl ? (
              <img src={resultUrl} alt="Watermarked" className="mx-auto max-h-48 object-contain" />
            ) : (
              <img src={preview} alt="Preview" className="mx-auto max-h-48 object-contain" />
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Watermark Text</label>
              <input type="text" value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Font Size: {fontSize}px</label>
                <input type="range" min={12} max={120} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-primary" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Opacity: {Math.round(opacity * 100)}%</label>
                <input type="range" min={0} max={100} value={opacity * 100} onChange={(e) => setOpacity(Number(e.target.value) / 100)} className="w-full accent-primary" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                    className="h-9 w-9 cursor-pointer rounded-lg border border-border" />
                  <input type="text" value={color} onChange={(e) => setColor(e.target.value)}
                    className="flex-1 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-mono text-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Position</label>
                <select value={position} onChange={(e) => setPosition(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30">
                  {POSITIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={applyWatermark} loading={loading} icon={<Droplets className="h-4 w-4" />}>
              Apply Watermark
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

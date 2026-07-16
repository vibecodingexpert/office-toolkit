"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload,
  Download,
  RefreshCw,
  LayoutGrid,
  Image,
  Palette,
  X,
  GripVertical,
} from "lucide-react"

interface LayoutPreset {
  name: string
  cols: number
  rows: number
}

const LAYOUTS: LayoutPreset[] = [
  { name: "2x1", cols: 2, rows: 1 },
  { name: "1x2", cols: 1, rows: 2 },
  { name: "2x2", cols: 2, rows: 2 },
  { name: "3x1", cols: 3, rows: 1 },
  { name: "1x3", cols: 1, rows: 3 },
  { name: "3x2", cols: 3, rows: 2 },
]

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function CollageMaker() {
  const [images, setImages] = React.useState<{ id: string; file: File; url: string }[]>([])
  const [layout, setLayout] = React.useState<LayoutPreset>(LAYOUTS[0])
  const [gap, setGap] = React.useState(4)
  const [bgColor, setBgColor] = React.useState("#ffffff")
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)

  const handleFiles = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList?.length) return
    const maxSlots = layout.cols * layout.rows
    const remaining = maxSlots - images.length
    if (remaining <= 0) { toast.error(`Maximum ${maxSlots} images for this layout`); return }
    const newItems = Array.from(fileList).slice(0, remaining).map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      url: URL.createObjectURL(f),
    }))
    setImages((prev) => [...prev, ...newItems])
  }, [images.length, layout])

  const removeImage = React.useCallback((id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id)
      if (item) URL.revokeObjectURL(item.url)
      return prev.filter((i) => i.id !== id)
    })
  }, [])

  const clearAll = React.useCallback(() => {
    images.forEach((i) => URL.revokeObjectURL(i.url))
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setImages([]); setResultUrl(null)
  }, [images, resultUrl])

  React.useEffect(() => {
    setImages([])
    setResultUrl(null)
  }, [layout])

  const generateCollage = React.useCallback(async () => {
    const slots = layout.cols * layout.rows
    if (images.length === 0 || images.length > slots) {
      toast.error(`Need 1-${slots} images for this layout`)
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 300))
    try {
      const loaded = await Promise.all(
        images.map((item) => new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new window.Image()
          img.onload = () => resolve(img)
          img.onerror = () => reject(new Error("Failed to load"))
          img.src = item.url
        }))
      )
      const cellW = 400; const cellH = 300
      const canvas = document.createElement("canvas")
      canvas.width = layout.cols * cellW + (layout.cols - 1) * gap
      canvas.height = layout.rows * cellH + (layout.rows - 1) * gap
      const ctx = canvas.getContext("2d")
      if (!ctx) { toast.error("Canvas not available"); setLoading(false); return }
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      let idx = 0
      for (let r = 0; r < layout.rows; r++) {
        for (let c = 0; c < layout.cols; c++) {
          if (idx >= loaded.length) break
          const img = loaded[idx]
          const x = c * (cellW + gap)
          const y = r * (cellH + gap)
          const sx = Math.max(0, (img.naturalWidth - img.naturalHeight * (cellW / cellH)) / 2)
          const sy = Math.max(0, (img.naturalHeight - img.naturalWidth * (cellH / cellW)) / 2)
          const sw = Math.min(img.naturalWidth, img.naturalHeight * (cellW / cellH))
          const sh = Math.min(img.naturalHeight, img.naturalWidth * (cellH / cellW))
          ctx.drawImage(img, sx, sy, sw, sh, x, y, cellW, cellH)
          idx++
        }
      }
      canvas.toBlob((blob) => {
        if (!blob) { toast.error("Failed to create collage"); setLoading(false); return }
        const url = URL.createObjectURL(blob)
        if (resultUrl) URL.revokeObjectURL(resultUrl)
        setResultUrl(url)
        setLoading(false)
        toast.success("Collage created!")
      }, "image/png")
    } catch {
      toast.error("Failed to create collage")
      setLoading(false)
    }
  }, [images, layout, gap, bgColor, resultUrl])

  const handleDownload = React.useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = "collage.png"
    a.click()
  }, [resultUrl])

  const maxSlots = layout.cols * layout.rows

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <LayoutGrid className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Collage Maker</h2>
          <p className="text-sm text-muted-foreground">Create beautiful photo collages</p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Layout</label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {LAYOUTS.map((l) => (
            <button
              key={l.name}
              onClick={() => setLayout(l)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
                layout.name === l.name
                  ? "border-primary/50 bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              )}
            >
              {l.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Spacing: {gap}px</label>
          <input type="range" min={0} max={20} value={gap} onChange={(e) => setGap(Number(e.target.value))} className="w-full accent-primary" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Background</label>
          <div className="flex items-center gap-2">
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
              className="h-9 w-9 cursor-pointer rounded-lg border border-border" />
            <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
              className="flex-1 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-mono text-foreground" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: maxSlots }).map((_, idx) => {
          const img = images[idx]
          return (
            <div
              key={idx}
              className={cn(
                "relative flex aspect-[4/3] items-center justify-center rounded-xl border-2 border-dashed transition-all",
                img ? "border-border bg-muted/30" : "border-dashed border-border bg-muted/10"
              )}
            >
              {img ? (
                <>
                  <img src={img.url} alt={`Image ${idx + 1}`} className="h-full w-full rounded-xl object-cover" />
                  <button onClick={() => removeImage(img.id)}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow-sm hover:bg-destructive/90 transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">Slot {idx + 1}</span>
              )}
            </div>
          )
        })}
      </div>

      {images.length < maxSlots && (
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-4 text-sm text-muted-foreground transition-all hover:border-primary/50 hover:text-primary">
          <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
          <Upload className="h-4 w-4" />
          Add Image{maxSlots - images.length > 1 ? "s" : ""} ({images.length}/{maxSlots})
        </label>
      )}

      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          <Button onClick={generateCollage} loading={loading} icon={<LayoutGrid className="h-4 w-4" />}>
            Generate Collage
          </Button>
          {resultUrl && (
            <Button variant="outline" onClick={handleDownload} icon={<Download className="h-4 w-4" />}>
              Download
            </Button>
          )}
          <Button variant="ghost" onClick={clearAll} icon={<RefreshCw className="h-4 w-4" />}>
            Clear
          </Button>
        </div>
      )}

      {resultUrl && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-xl border border-border"
        >
          <div className="flex items-center gap-1.5 border-b border-border bg-muted/30 px-4 py-2">
            <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-xs text-muted-foreground">Collage Result</span>
          </div>
          <img src={resultUrl} alt="Collage" className="mx-auto max-h-80 object-contain p-4" />
        </motion.div>
      )}
    </Card>
  )
}

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
  FlipHorizontal,
  FlipVertical,
  RefreshCw,
  Image,
} from "lucide-react"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function FlipImage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [flipH, setFlipH] = React.useState(false)
  const [flipV, setFlipV] = React.useState(false)
  const [imgDims, setImgDims] = React.useState({ w: 0, h: 0 })

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResultUrl(null)
    setFlipH(false); setFlipV(false)
    const url = URL.createObjectURL(f)
    setPreview(url)
    const img = new window.Image()
    img.onload = () => setImgDims({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = url
  }, [])

  const processFlip = React.useCallback(async (h: boolean, v: boolean) => {
    if (!preview) return
    const img = new window.Image()
    img.src = preview
    await new Promise((r) => { img.onload = r })
    const canvas = document.createElement("canvas")
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
    const ctx = canvas.getContext("2d")
    if (!ctx) { toast.error("Canvas not available"); return }
    ctx.imageSmoothingEnabled = true
    ctx.translate(h ? canvas.width : 0, v ? canvas.height : 0)
    ctx.scale(h ? -1 : 1, v ? -1 : 1)
    ctx.drawImage(img, 0, 0)
    canvas.toBlob((blob) => {
      if (!blob) { toast.error("Failed to flip"); return }
      const url = URL.createObjectURL(blob)
      setResultUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return url })
    }, "image/png")
  }, [preview])

  React.useEffect(() => {
    if (preview) processFlip(flipH, flipV)
  }, [flipH, flipV, preview, processFlip])

  const toggleFlipH = React.useCallback(() => setFlipH((f) => !f), [])
  const toggleFlipV = React.useCallback(() => setFlipV((f) => !f), [])
  const applyBoth = React.useCallback(() => {
    setFlipH(true); setFlipV(true)
  }, [])

  const handleDownload = React.useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = (file?.name?.replace(/\.[^/.]+$/, "") || "image") + "_flipped.png"
    a.click()
  }, [resultUrl, file])

  const handleReset = React.useCallback(() => {
    if (preview) URL.revokeObjectURL(preview)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setFile(null); setPreview(null); setResultUrl(null)
    setFlipH(false); setFlipV(false)
  }, [preview, resultUrl])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <FlipHorizontal className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Flip Image</h2>
          <p className="text-sm text-muted-foreground">Flip images horizontally or vertically</p>
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
              <span className="text-xs text-muted-foreground">File Size</span>
              <p className="text-sm font-medium text-foreground">{file ? formatSize(file.size) : "-"}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={toggleFlipH}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl border px-6 py-4 text-sm font-medium transition-all",
                flipH ? "border-primary/50 bg-primary/5 text-primary" : "border-border bg-background text-foreground hover:border-primary/30"
              )}
            >
              <FlipHorizontal className="h-5 w-5" /> Flip Horizontal
            </button>
            <button
              onClick={toggleFlipV}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl border px-6 py-4 text-sm font-medium transition-all",
                flipV ? "border-primary/50 bg-primary/5 text-primary" : "border-border bg-background text-foreground hover:border-primary/30"
              )}
            >
              <FlipVertical className="h-5 w-5" /> Flip Vertical
            </button>
          </div>

          <button
            onClick={applyBoth}
            className="w-full rounded-xl border border-dashed border-border bg-background px-4 py-3 text-sm font-medium text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all"
          >
            Flip Both (Horizontal + Vertical)
          </button>

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
                <span className="ml-2 text-xs text-muted-foreground">Flipped Result</span>
              </div>
              <img src={resultUrl} alt="Flipped" className="mx-auto max-h-64 object-contain p-4" />
            </motion.div>
          )}
        </div>
      )}
    </Card>
  )
}

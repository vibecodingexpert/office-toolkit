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
  FileImage,
  Image,
} from "lucide-react"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function JpgToWebp() {
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [quality, setQuality] = React.useState(80)
  const [imgDims, setImgDims] = React.useState({ w: 0, h: 0 })
  const [loading, setLoading] = React.useState(false)

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

  const handleConvert = React.useCallback(async () => {
    if (!preview) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 200))
    try {
      const img = new window.Image()
      img.src = preview
      await new Promise((r) => { img.onload = r })
      const canvas = document.createElement("canvas")
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) { toast.error("Canvas not available"); setLoading(false); return }
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((blob) => {
        if (!blob) { toast.error("Failed to convert"); setLoading(false); return }
        const url = URL.createObjectURL(blob)
        if (resultUrl) URL.revokeObjectURL(resultUrl)
        setResultUrl(url)
        setLoading(false)
        toast.success("Converted to WebP")
      }, "image/webp", quality / 100)
    } catch {
      toast.error("Failed to convert image")
      setLoading(false)
    }
  }, [preview, quality, resultUrl])

  const handleDownload = React.useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = (file?.name?.replace(/\.[^/.]+$/, "") || "image") + ".webp"
    a.click()
  }, [resultUrl, file])

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
          <FileImage className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">JPG to WebP</h2>
          <p className="text-sm text-muted-foreground">Convert JPG to modern WebP format</p>
        </div>
      </div>

      {!preview ? (
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
          <input type="file" accept="image/jpeg,image/png" onChange={handleFile} className="hidden" />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-primary/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Drag & drop or <span className="text-primary underline underline-offset-2">browse</span></p>
            <p className="mt-1 text-xs text-muted-foreground">Supports JPG, PNG</p>
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
              <p className="mt-1 text-xs text-muted-foreground">{file ? formatSize(file.size) : ""}</p>
            </div>
            {resultUrl && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">WebP Result</label>
                <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
                  <img src={resultUrl} alt="WebP" className="mx-auto max-h-48 object-contain" />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted/20 p-4">
            <div>
              <span className="text-xs text-muted-foreground">Dimensions</span>
              <p className="text-sm font-medium text-foreground">{imgDims.w} x {imgDims.h} px</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Format</span>
              <p className="text-sm font-medium text-foreground">{file?.type || "-"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">WebP Quality: {quality}%</label>
            <input
              type="range" min={1} max={100}
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1%</span><span>50%</span><span>100%</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleConvert} loading={loading} icon={<FileImage className="h-4 w-4" />}>
              Convert to WebP
            </Button>
            {resultUrl && (
              <Button variant="outline" onClick={handleDownload} icon={<Download className="h-4 w-4" />}>
                Download WebP
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

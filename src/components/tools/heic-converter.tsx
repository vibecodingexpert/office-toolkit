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
  AlertCircle,
} from "lucide-react"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const FORMATS = [
  { value: "image/jpeg", label: "JPEG", ext: "jpg" },
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/webp", label: "WebP", ext: "webp" },
]

export function HeicConverter() {
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [targetFormat, setTargetFormat] = React.useState("image/jpeg")
  const [quality, setQuality] = React.useState(90)
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
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) { toast.error("Canvas not available"); setLoading(false); return }
      if (targetFormat === "image/jpeg") {
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.drawImage(img, 0, 0)
      canvas.toBlob((blob) => {
        if (!blob) { toast.error("Failed to convert"); setLoading(false); return }
        const url = URL.createObjectURL(blob)
        if (resultUrl) URL.revokeObjectURL(resultUrl)
        setResultUrl(url)
        setLoading(false)
        toast.success(`Converted to ${FORMATS.find((f) => f.value === targetFormat)?.label}`)
      }, targetFormat, quality / 100)
    } catch {
      toast.error("Failed to convert image")
      setLoading(false)
    }
  }, [preview, targetFormat, quality, resultUrl])

  const handleDownload = React.useCallback(() => {
    if (!resultUrl) return
    const ext = FORMATS.find((f) => f.value === targetFormat)?.ext || "jpg"
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = (file?.name?.replace(/\.[^/.]+$/, "") || "image") + `.${ext}`
    a.click()
  }, [resultUrl, file, targetFormat])

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
          <h2 className="text-lg font-semibold">HEIC Converter</h2>
          <p className="text-sm text-muted-foreground">Convert HEIC images to standard formats</p>
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Browser Limitation</p>
          <p className="text-xs text-muted-foreground mt-1">
            HEIC decoding requires native system libraries. If you upload a HEIC file, it may not display
            in all browsers. For best results, use Chrome or Edge on macOS/iOS, or convert on a device
            that supports HEIC natively.
          </p>
        </div>
      </div>

      {!preview ? (
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
          <input type="file" accept=".heic,.heif,image/*" onChange={handleFile} className="hidden" />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-primary/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Upload HEIC/HEIF file <span className="text-primary underline underline-offset-2">browse</span></p>
            <p className="mt-1 text-xs text-muted-foreground">Accepts .heic and .heif images</p>
          </div>
        </label>
      ) : (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
            <img src={preview} alt="Preview" className="mx-auto max-h-64 object-contain" />
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted/20 p-4">
            <div>
              <span className="text-xs text-muted-foreground">Dimensions</span>
              <p className="text-sm font-medium text-foreground">{imgDims.w} x {imgDims.h} px</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Size</span>
              <p className="text-sm font-medium text-foreground">{file ? formatSize(file.size) : "-"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Target Format</label>
            <div className="flex gap-2">
              {FORMATS.map((fmt) => (
                <button
                  key={fmt.value}
                  onClick={() => setTargetFormat(fmt.value)}
                  className={cn(
                    "flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all",
                    targetFormat === fmt.value
                      ? "border-primary/50 bg-primary/5 text-primary"
                      : "border-border text-foreground hover:border-primary/30"
                  )}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Quality: {quality}%</label>
            <input type="range" min={1} max={100} value={quality}
              onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-primary" />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleConvert} loading={loading} icon={<FileImage className="h-4 w-4" />}>
              Convert
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
                <span className="ml-2 text-xs text-muted-foreground">Converted Result</span>
              </div>
              <img src={resultUrl} alt="Converted" className="mx-auto max-h-64 object-contain p-4" />
            </motion.div>
          )}
        </div>
      )}
    </Card>
  )
}

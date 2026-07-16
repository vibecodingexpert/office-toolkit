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
  Grid,
  Check,
} from "lucide-react"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

interface IconSize {
  label: string
  size: number
  selected: boolean
}

export function IcoGenerator() {
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [sizes, setSizes] = React.useState<IconSize[]>([
    { label: "16x16", size: 16, selected: true },
    { label: "32x32", size: 32, selected: true },
    { label: "48x48", size: 48, selected: true },
    { label: "64x64", size: 64, selected: false },
    { label: "128x128", size: 128, selected: false },
    { label: "256x256", size: 256, selected: false },
  ])
  const [previews, setPreviews] = React.useState<{ size: number; url: string }[]>([])

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResultUrl(null)
    setPreviews([])
    const url = URL.createObjectURL(f)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(url)
  }, [preview])

  const toggleSize = React.useCallback((size: number) => {
    setSizes((prev) => prev.map((s) => s.size === size ? { ...s, selected: !s.selected } : s))
  }, [])

  const handleGenerate = React.useCallback(async () => {
    if (!preview) return
    const selected = sizes.filter((s) => s.selected)
    if (!selected.length) { toast.error("Select at least one size"); return }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 300))
    try {
      const img = new window.Image()
      img.src = preview
      await new Promise((r) => { img.onload = r })
      const generated: { size: number; url: string }[] = []
      for (const s of selected) {
        const canvas = document.createElement("canvas")
        canvas.width = s.size; canvas.height = s.size
        const ctx = canvas.getContext("2d")
        if (!ctx) continue
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, 0, 0, s.size, s.size)
        const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"))
        if (blob) {
          generated.push({ size: s.size, url: URL.createObjectURL(blob) })
        }
      }
      if (!generated.length) { toast.error("Failed to generate icons"); setLoading(false); return }
      setPreviews(generated)
      const masterCanvas = document.createElement("canvas")
      const totalW = generated.length * 260
      masterCanvas.width = totalW; masterCanvas.height = 300
      const mctx = masterCanvas.getContext("2d")
      if (mctx) {
        let offset = 10
        for (const g of generated) {
          const iconImg = new window.Image()
          iconImg.src = g.url
          await new Promise((r) => { iconImg.onload = r })
          mctx.drawImage(iconImg, offset + (130 - g.size / 2), 50, g.size, g.size)
          mctx.fillStyle = "#888"
          mctx.font = "12px sans-serif"
          mctx.textAlign = "center"
          mctx.fillText(`${g.size}x${g.size}`, offset + 130, 120)
          offset += 260
        }
      }
      const masterBlob = await new Promise<Blob | null>((r) => masterCanvas.toBlob(r, "image/png"))
      if (masterBlob) {
        const url = URL.createObjectURL(masterBlob)
        if (resultUrl) URL.revokeObjectURL(resultUrl)
        setResultUrl(url)
      }
      setLoading(false)
      toast.success(`Generated ${generated.length} icon size(s)`)
    } catch {
      toast.error("Failed to generate icons")
      setLoading(false)
    }
  }, [preview, sizes, resultUrl])

  const handleDownload = React.useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = (file?.name?.replace(/\.[^/.]+$/, "") || "icon") + "_icons.png"
    a.click()
  }, [resultUrl, file])

  const handleReset = React.useCallback(() => {
    if (preview) URL.revokeObjectURL(preview)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    previews.forEach((p) => URL.revokeObjectURL(p.url))
    setFile(null); setPreview(null); setResultUrl(null)
    setPreviews([])
  }, [preview, resultUrl, previews])

  React.useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url))
    }
  }, [previews])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Grid className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">ICO Generator</h2>
          <p className="text-sm text-muted-foreground">Generate favicon ICO files</p>
        </div>
      </div>

      {!preview ? (
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
          <input type="file" accept="image/png" onChange={handleFile} className="hidden" />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-primary/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Upload PNG image <span className="text-primary underline underline-offset-2">browse</span></p>
            <p className="mt-1 text-xs text-muted-foreground">PNG with transparency recommended</p>
          </div>
        </label>
      ) : (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-border bg-muted/30 p-4 flex items-center justify-center">
            <img src={preview} alt="Preview" className="max-h-48 object-contain" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Icon Sizes</label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {sizes.map((s) => (
                <button
                  key={s.size}
                  onClick={() => toggleSize(s.size)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-xs transition-all",
                    s.selected
                      ? "border-primary/50 bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {s.selected && <Check className="h-3 w-3" />}
                  <span className="font-medium">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {previews.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Generated Icons</label>
              <div className="flex flex-wrap gap-4">
                {previews.map((p) => (
                  <div key={p.size} className="flex flex-col items-center gap-1 rounded-xl border border-border bg-muted/30 p-4">
                    <img src={p.url} alt={`${p.size}x${p.size}`} className="bg-white dark:bg-gray-800 rounded" style={{ width: Math.min(p.size, 64), height: Math.min(p.size, 64) }} />
                    <span className="text-xs text-muted-foreground">{p.size}x{p.size}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleGenerate} loading={loading} icon={<Grid className="h-4 w-4" />}>
              Generate Icons
            </Button>
            {resultUrl && (
              <Button variant="outline" onClick={handleDownload} icon={<Download className="h-4 w-4" />}>
                Download Preview
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

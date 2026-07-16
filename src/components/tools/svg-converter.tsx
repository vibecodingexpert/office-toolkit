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
  FileCode,
  Clipboard,
} from "lucide-react"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const SCALE_OPTIONS = [
  { label: "1x", value: 1 },
  { label: "2x", value: 2 },
  { label: "3x", value: 3 },
  { label: "4x", value: 4 },
]

export function SvgConverter() {
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [targetFormat, setTargetFormat] = React.useState<"image/png" | "image/jpeg">("image/png")
  const [scale, setScale] = React.useState(2)
  const [svgCode, setSvgCode] = React.useState("")
  const [useSvgCode, setUseSvgCode] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResultUrl(null)
    setUseSvgCode(false)
    const url = URL.createObjectURL(f)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(url)
    f.text().then((text) => setSvgCode(text)).catch(() => {})
  }, [preview])

  const handleConvert = React.useCallback(async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 200))
    try {
      let svgText = svgCode
      if (!useSvgCode && file) {
        svgText = await file.text()
      }
      const parser = new DOMParser()
      const doc = parser.parseFromString(svgText, "image/svg+xml")
      const svgEl = doc.querySelector("svg")
      if (!svgEl) { toast.error("Invalid SVG"); setLoading(false); return }
      const viewBox = svgEl.getAttribute("viewBox")
      let w = 800, h = 600
      if (viewBox) {
        const parts = viewBox.split(/\s+/).map(Number)
        if (parts.length === 4) { w = parts[2]; h = parts[3] }
      } else {
        w = parseInt(svgEl.getAttribute("width") || "800")
        h = parseInt(svgEl.getAttribute("height") || "600")
      }
      const canvas = document.createElement("canvas")
      canvas.width = w * scale; canvas.height = h * scale
      const ctx = canvas.getContext("2d")
      if (!ctx) { toast.error("Canvas not available"); setLoading(false); return }
      const blob = new Blob([svgText], { type: "image/svg+xml" })
      const url = URL.createObjectURL(blob)
      const img = new window.Image()
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error("SVG load failed"))
        img.src = url
      })
      if (targetFormat === "image/jpeg") {
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      canvas.toBlob((b) => {
        if (!b) { toast.error("Failed to convert"); setLoading(false); return }
        const rUrl = URL.createObjectURL(b)
        if (resultUrl) URL.revokeObjectURL(resultUrl)
        setResultUrl(rUrl)
        setLoading(false)
        toast.success("SVG converted successfully")
      }, targetFormat)
    } catch {
      toast.error("Failed to convert SVG")
      setLoading(false)
    }
  }, [svgCode, useSvgCode, file, targetFormat, scale, resultUrl])

  const handleDownload = React.useCallback(() => {
    if (!resultUrl) return
    const ext = targetFormat === "image/png" ? "png" : "jpg"
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = (file?.name?.replace(/\.[^/.]+$/, "") || "svg_output") + `.${ext}`
    a.click()
  }, [resultUrl, file, targetFormat])

  const handleReset = React.useCallback(() => {
    if (preview) URL.revokeObjectURL(preview)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setFile(null); setPreview(null); setResultUrl(null)
    setSvgCode(""); setUseSvgCode(false)
  }, [preview, resultUrl])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <FileCode className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">SVG Converter</h2>
          <p className="text-sm text-muted-foreground">Convert SVG to PNG or JPG</p>
        </div>
      </div>

      {!preview && !useSvgCode ? (
        <div className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
            <input type="file" accept=".svg,image/svg+xml" onChange={handleFile} className="hidden" />
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-primary/10">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Upload SVG file or <span className="text-primary underline underline-offset-2">browse</span></p>
              <p className="mt-1 text-xs text-muted-foreground">.svg files</p>
            </div>
          </label>
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">or paste SVG code</span></div>
          </div>
          <div className="space-y-2">
            <textarea
              value={svgCode}
              onChange={(e) => { setSvgCode(e.target.value); setUseSvgCode(true); if (preview) { URL.revokeObjectURL(preview); setPreview(null) } }}
              placeholder="<svg>...</svg>"
              rows={6}
              className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground font-mono placeholder-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { navigator.clipboard.readText().then(setSvgCode).catch(() => toast.error("Cannot paste")) }}
              icon={<Clipboard className="h-3.5 w-3.5" />}
            >
              Paste from Clipboard
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {preview && (
            <div className="overflow-hidden rounded-xl border border-border bg-muted/30 p-4 flex items-center justify-center">
              <img src={preview} alt="SVG Preview" className="max-h-48 object-contain" />
            </div>
          )}

          {useSvgCode && svgCode && (
            <div className="overflow-hidden rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center justify-center h-32 bg-white dark:bg-gray-800 rounded-lg" dangerouslySetInnerHTML={{ __html: svgCode }} />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Target Format</label>
            <div className="flex gap-2">
              <button
                onClick={() => setTargetFormat("image/png")}
                className={cn("flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all", targetFormat === "image/png" ? "border-primary/50 bg-primary/5 text-primary" : "border-border text-foreground hover:border-primary/30")}
              >
                PNG
              </button>
              <button
                onClick={() => setTargetFormat("image/jpeg")}
                className={cn("flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all", targetFormat === "image/jpeg" ? "border-primary/50 bg-primary/5 text-primary" : "border-border text-foreground hover:border-primary/30")}
              >
                JPG
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Scale</label>
            <div className="flex gap-2">
              {SCALE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setScale(opt.value)}
                  className={cn("flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all", scale === opt.value ? "border-primary/50 bg-primary/5 text-primary" : "border-border text-foreground hover:border-primary/30")}
                >
                  {opt.label}
                </button>
              ))}
            </div>
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
              New SVG
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
                <span className="ml-2 text-xs text-muted-foreground">Result</span>
              </div>
              <img src={resultUrl} alt="Converted" className="mx-auto max-h-64 object-contain p-4" />
            </motion.div>
          )}
        </div>
      )}
    </Card>
  )
}

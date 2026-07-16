"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Upload, Download, Copy, FileImage, ImageIcon } from "lucide-react"

export function SvgConverter() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [svgContent, setSvgContent] = React.useState("")
  const [image, setImage] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<string | null>(null)
  const [format, setFormat] = React.useState<"png" | "jpg">("png")
  const [scale, setScale] = React.useState(1)

  const handleSvgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const r = new FileReader()
    r.onload = (ev) => { const text = ev.target?.result as string; setSvgContent(text); renderSvg(text) }
    r.readAsText(file)
  }

  const handleSvgPaste = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSvgContent(e.target.value)
    if (e.target.value.trim()) renderSvg(e.target.value)
  }

  const renderSvg = (svg: string) => {
    const blob = new Blob([svg], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    setImage(url)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const img = new Image(1, 1)
    img.onload = () => {
      canvas.width = img.width * scale; canvas.height = img.height * scale
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high"
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      setResult(canvas.toDataURL(format === "png" ? "image/png" : "image/jpeg"))
      toast.success("SVG rendered")
    }
    img.src = url
  }

  React.useEffect(() => { if (image) renderSvg(svgContent) }, [scale, format])

  const handleDownload = () => {
    if (!result) return
    const link = document.createElement("a"); link.download = `converted.${format}`; link.href = result; link.click()
    toast.success(`SVG converted to ${format.toUpperCase()}`)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><ImageIcon className="h-6 w-6 text-teal-500" /><div><h1 className="text-2xl font-bold text-foreground">SVG Converter</h1><p className="text-sm text-muted-foreground">Convert SVG to PNG/JPG raster images</p></div></div>
        <div className="flex items-center gap-2">
          <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="png">PNG</option><option value="jpg">JPEG</option></select>
          <label className="cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"><Upload className="mr-1 inline h-4 w-4" />SVG<input type="file" accept=".svg" onChange={handleSvgUpload} className="hidden" /></label>
          {result && <Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /></Button>}
        </div>
      </motion.div>

      <div className="flex items-center gap-4"><span className="text-sm text-foreground">Scale:</span><input type="range" min="0.5" max="4" step="0.25" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-32" /><span className="text-xs text-muted-foreground">{scale}x</span></div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card><h3 className="mb-2 font-semibold text-foreground">SVG Source</h3><textarea value={svgContent} onChange={handleSvgPaste} rows={12} className="w-full resize-y rounded-lg border border-input bg-background p-4 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Paste SVG code or upload an SVG file..." /></Card>
        <Card className="flex items-center justify-center p-4">
          {result ? <img src={result} alt="Rasterized" className="max-w-full rounded-lg shadow-md" /> : <p className="text-sm text-muted-foreground">Enter SVG code to preview</p>}
        </Card>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Upload, Download, RefreshCw, ZoomIn, ZoomOut, ImageIcon } from "lucide-react"

export function BackgroundRemover() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [image, setImage] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [zoom, setZoom] = React.useState(1)
  const [threshold, setThreshold] = React.useState(160)
  const [color, setColor] = React.useState("#ffffff")
  const [mode, setMode] = React.useState<"remove" | "replace">("remove")

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => { setImage(ev.target?.result as string); setResult(null) }; r.readAsDataURL(file) }
  }

  const processImage = () => {
    if (!image) { toast.error("Please upload an image"); return }
    setLoading(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const img = new Image(1, 1)
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
        if (avg > threshold) {
          if (mode === "remove") { data[i + 3] = 0 }
          else { const c = hexToRgb(color); data[i] = c.r; data[i + 1] = c.g; data[i + 2] = c.b }
        }
      }
      ctx.putImageData(imageData, 0, 0)
      setResult(canvas.toDataURL())
      setLoading(false)
      toast.success("Background processed")
    }
    img.src = image
  }

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16)
    return { r, g, b }
  }

  const handleDownload = () => {
    if (!result) return
    const link = document.createElement("a"); link.download = "background-removed.png"; link.href = result; link.click()
    toast.success("Image downloaded")
  }

  const handlePaste = async () => {
    try {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        const blob = item.getType("image/png") || item.getType("image/jpeg")
        if (blob) { const url = URL.createObjectURL(await blob); setImage(url); setResult(null); return }
      }
    } catch { toast.error("No image in clipboard") }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><ImageIcon className="h-6 w-6 text-teal-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Background Remover</h1><p className="text-sm text-muted-foreground">Remove or replace image backgrounds</p></div></div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-sm"><ZoomOut className="h-3 w-3 text-muted-foreground" /><input type="range" min="0.5" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-16" /><ZoomIn className="h-3 w-3 text-muted-foreground" /></div>
          <Button variant="outline" size="sm" onClick={handlePaste}><Upload className="h-4 w-4" /> Paste</Button>
          <label className="cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"><Upload className="mr-1 inline h-4 w-4" />Upload<input type="file" accept="image/*" onChange={handleImage} className="hidden" /></label>
          {result && <Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /></Button>}
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setMode("remove")} className={`rounded-lg border px-4 py-2 text-sm ${mode === "remove" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>Remove Background</button>
        <button onClick={() => setMode("replace")} className={`rounded-lg border px-4 py-2 text-sm ${mode === "replace" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>Replace with Color</button>
        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-1 text-sm"><span className="text-muted-foreground">Threshold:</span><input type="range" min="0" max="255" value={threshold} onChange={(e) => setThreshold(parseInt(e.target.value))} className="w-20" /><span className="text-xs text-muted-foreground">{threshold}</span></div>
        {mode === "replace" && <div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Color:</span><input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-8 rounded border" /></div>}
        <Button variant="primary" size="sm" onClick={processImage} disabled={loading}><RefreshCw className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`} />{loading ? "Processing..." : "Process"}</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {image && <Card className="flex items-center justify-center p-4"><div className="overflow-auto rounded-lg border border-border" style={{ maxHeight: 500 }}><img src={image} alt="Original" className="max-w-full" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }} /></div></Card>}
        {result && <Card className="flex items-center justify-center p-4"><div className="overflow-auto rounded-lg border border-border" style={{ maxHeight: 500 }}><img src={result} alt="Result" className="max-w-full" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }} /></div></Card>}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

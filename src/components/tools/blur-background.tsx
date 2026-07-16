"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Upload, Download, ZoomIn, ZoomOut, ImageIcon } from "lucide-react"

export function BlurBackground() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [image, setImage] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<string | null>(null)
  const [blurRadius, setBlurRadius] = React.useState(10)
  const [zoom, setZoom] = React.useState(1)

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => { setImage(ev.target?.result as string); setResult(null) }; r.readAsDataURL(file) }
  }

  const processImage = () => {
    if (!image) { toast.error("Please upload an image"); return }
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const img = new Image(1, 1)
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      const w = canvas.width, h = canvas.height
      const imageData = ctx.getImageData(0, 0, w, h)
      const data = imageData.data
      const r = blurRadius
      const copy = new Uint8ClampedArray(data)
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let tr = 0, tg = 0, tb = 0, count = 0
          for (let dy = -r; dy <= r; dy++) {
            for (let dx = -r; dx <= r; dx++) {
              const ny = Math.min(h - 1, Math.max(0, y + dy))
              const nx = Math.min(w - 1, Math.max(0, x + dx))
              const idx = (ny * w + nx) * 4
              tr += copy[idx]; tg += copy[idx + 1]; tb += copy[idx + 2]
              count++
            }
          }
          const idx = (y * w + x) * 4
          data[idx] = tr / count; data[idx + 1] = tg / count; data[idx + 2] = tb / count
        }
      }
      ctx.putImageData(imageData, 0, 0)
      setResult(canvas.toDataURL())
      toast.success("Background blurred")
    }
    img.src = image
  }

  const handleDownload = () => {
    if (!result) return
    const link = document.createElement("a"); link.download = "blurred.png"; link.href = result; link.click()
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
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><ImageIcon className="h-6 w-6 text-teal-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Blur Background</h1><p className="text-sm text-muted-foreground">Apply blur effect to images</p></div></div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-sm"><ZoomOut className="h-3 w-3 text-muted-foreground" /><input type="range" min="0.5" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-16" /><ZoomIn className="h-3 w-3 text-muted-foreground" /></div>
          <Button variant="outline" size="sm" onClick={handlePaste}><Upload className="h-4 w-4" /> Paste</Button>
          <label className="cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"><Upload className="mr-1 inline h-4 w-4" />Upload<input type="file" accept="image/*" onChange={handleImage} className="hidden" /></label>
          {result && <Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /></Button>}
        </div>
      </motion.div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-1 text-sm"><span className="text-muted-foreground">Blur Radius:</span><input type="range" min="1" max="30" value={blurRadius} onChange={(e) => setBlurRadius(parseInt(e.target.value))} className="w-24" /><span className="text-xs text-muted-foreground">{blurRadius}px</span></div>
        {image && <Button variant="primary" size="sm" onClick={processImage}>Apply Blur</Button>}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {image && <Card className="flex items-center justify-center p-4"><div className="overflow-auto rounded-lg border border-border" style={{ maxHeight: 500 }}><img src={image} alt="Original" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }} /></div></Card>}
        {result && <Card className="flex items-center justify-center p-4"><div className="overflow-auto rounded-lg border border-border" style={{ maxHeight: 500 }}><img src={result} alt="Blurred" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }} /></div></Card>}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

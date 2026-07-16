"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Upload, Download, ImageIcon, ZoomIn, ZoomOut, RefreshCw } from "lucide-react"

const PRESETS = [
  { name: "Social", w: 1080, h: 1080 },
  { name: "Banner", w: 1200, h: 630 },
  { name: "Thumbnail", w: 1280, h: 720 },
  { name: "Icon", w: 256, h: 256 },
  { name: "Custom", w: 0, h: 0 },
]

export function ResizeImage() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [image, setImage] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<string | null>(null)
  const [preset, setPreset] = React.useState(PRESETS[3])
  const [width, setWidth] = React.useState(256)
  const [height, setHeight] = React.useState(256)
  const [keepAspect, setKeepAspect] = React.useState(true)
  const [zoom, setZoom] = React.useState(1)

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => { setImage(ev.target?.result as string); setResult(null) }; r.readAsDataURL(file) }
  }

  React.useEffect(() => {
    if (preset.w > 0) setWidth(preset.w)
    if (preset.h > 0) setHeight(preset.h)
  }, [preset])

  const resize = () => {
    if (!image) { toast.error("Upload an image"); return }
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const img = new Image(1, 1)
    img.onload = () => {
      let w = width, h = height
      if (keepAspect) {
        const ar = img.width / img.height
        if (w / h > ar) w = h * ar
        else h = w / ar
      }
      canvas.width = Math.round(w); canvas.height = Math.round(h)
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high"
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      setResult(canvas.toDataURL())
      toast.success(`Image resized to ${Math.round(w)}x${Math.round(h)}`)
    }
    img.src = image
  }

  const handleDownload = () => {
    if (!result) return
    const link = document.createElement("a"); link.download = "resized.png"; link.href = result; link.click()
    toast.success("Resized image downloaded")
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><ImageIcon className="h-6 w-6 text-teal-500" /><div><h1 className="text-2xl font-bold text-foreground">Resize Image</h1><p className="text-sm text-muted-foreground">Resize images to exact dimensions</p></div></div>
        <div className="flex items-center gap-2"><label className="cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"><Upload className="mr-1 inline h-4 w-4" />Upload<input type="file" accept="image/*" onChange={handleImage} className="hidden" /></label>{result && <Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /></Button>}</div>
      </motion.div>
      {image && <div className="flex flex-wrap gap-2">{PRESETS.map((p) => (<button key={p.name} onClick={() => setPreset(p)} className={`rounded-lg border px-4 py-2 text-sm ${preset.name === p.name ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{p.name}{p.w > 0 ? ` (${p.w}x${p.h})` : ""}</button>))}</div>}
      <div className="grid gap-6 lg:grid-cols-2">
        {image && <Card className="p-4"><div className="overflow-auto rounded-lg border border-border" style={{ maxHeight: 400 }}><img src={image} alt="Original" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }} /></div></Card>}
        <div className="space-y-4">
          {result && <Card className="flex items-center justify-center p-4"><img src={result} alt="Resized" className="max-w-full rounded-lg" /></Card>}
          <Card><h3 className="mb-4 font-semibold text-foreground">Dimensions</h3><div className="grid grid-cols-2 gap-3"><div><label className="text-sm text-foreground">Width (px)</label><input type="number" value={width} onChange={(e) => setWidth(parseInt(e.target.value) || 1)} className="mt-1 w-full rounded border border-input bg-background px-2 py-1 text-sm" /></div><div><label className="text-sm text-foreground">Height (px)</label><input type="number" value={height} onChange={(e) => setHeight(parseInt(e.target.value) || 1)} className="mt-1 w-full rounded border border-input bg-background px-2 py-1 text-sm" /></div></div><label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={keepAspect} onChange={(e) => setKeepAspect(e.target.checked)} /><span>Keep aspect ratio</span></label><div className="mt-3"><Button variant="primary" onClick={resize}><RefreshCw className="mr-1 h-4 w-4" /> Resize</Button></div></Card>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Upload, Download, Crop, ZoomIn, ZoomOut, ImageIcon, RefreshCw } from "lucide-react"

const PRESETS = [
  { name: "Square 1:1", w: 1, h: 1 },
  { name: "4:3", w: 4, h: 3 },
  { name: "16:9", w: 16, h: 9 },
  { name: "3:2", w: 3, h: 2 },
  { name: "Free", w: 0, h: 0 },
]

export function CropImage() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [image, setImage] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<string | null>(null)
  const [preset, setPreset] = React.useState(PRESETS[0])
  const [x, setX] = React.useState(0)
  const [y, setY] = React.useState(0)
  const [cw, setCw] = React.useState(200)
  const [ch, setCh] = React.useState(200)
  const [zoom, setZoom] = React.useState(1)
  const [dragging, setDragging] = React.useState(false)
  const [imgSize, setImgSize] = React.useState({ w: 0, h: 0 })
  const dragRef = React.useRef({ startX: 0, startY: 0, origX: 0, origY: 0 })

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => { setImage(ev.target?.result as string); setResult(null) }; r.readAsDataURL(file) }
  }

  React.useEffect(() => {
    if (!image) return
    const img = new Image(1, 1)
    img.onload = () => { setImgSize({ w: img.width, h: img.height }) }
    img.src = image
  }, [image])

  React.useEffect(() => {
    if (preset.w > 0 && preset.h > 0) {
      const ar = preset.w / preset.h
      setCh(Math.round(cw / ar))
    }
  }, [preset, cw])

  const doCrop = () => {
    if (!image) { toast.error("Upload an image first"); return }
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = cw; canvas.height = ch
    const img = new Image(1, 1)
    img.onload = () => {
      ctx.drawImage(img, x, y, cw, ch, 0, 0, cw, ch)
      setResult(canvas.toDataURL())
      toast.success("Image cropped")
    }
    img.src = image
  }

  const handleDownload = () => {
    if (!result) return
    const link = document.createElement("a"); link.download = "cropped.png"; link.href = result; link.click()
    toast.success("Cropped image downloaded")
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><Crop className="h-6 w-6 text-teal-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Crop Image</h1><p className="text-sm text-muted-foreground">Crop images with preset aspect ratios</p></div></div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-sm"><ZoomOut className="h-3 w-3 text-muted-foreground" /><input type="range" min="0.5" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-16" /><ZoomIn className="h-3 w-3 text-muted-foreground" /></div>
          <label className="cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"><Upload className="mr-1 inline h-4 w-4" />Upload<input type="file" accept="image/*" onChange={handleImage} className="hidden" /></label>
          {image && <Button variant="primary" size="sm" onClick={doCrop}><Crop className="mr-1 h-4 w-4" /> Crop</Button>}
          {result && <Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /></Button>}
        </div>
      </motion.div>

      {image && <div className="flex flex-wrap gap-2">{PRESETS.map((p) => (<button key={p.name} onClick={() => setPreset(p)} className={`rounded-lg border px-4 py-2 text-sm ${preset.name === p.name ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{p.name}</button>))}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        {image && <Card className="p-4"><div className="overflow-auto rounded-lg border border-border" style={{ maxHeight: 500 }}><img src={image} alt="Original" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }} /></div><div className="mt-2 flex gap-4 text-xs text-muted-foreground"><span>Position: ({x}, {y})</span><span>Size: {cw} x {ch}</span></div></Card>}
        <div className="space-y-4">
          {result && <Card className="flex items-center justify-center p-4"><img src={result} alt="Cropped" className="max-w-full rounded-lg" /></Card>}
          <Card><h3 className="mb-4 font-semibold text-foreground">Crop Settings</h3><div className="grid grid-cols-2 gap-3"><div><label className="text-sm text-foreground">X Offset</label><input type="number" value={x} onChange={(e) => setX(parseInt(e.target.value) || 0)} className="mt-1 w-full rounded border border-input bg-background px-2 py-1 text-sm" /></div><div><label className="text-sm text-foreground">Y Offset</label><input type="number" value={y} onChange={(e) => setY(parseInt(e.target.value) || 0)} className="mt-1 w-full rounded border border-input bg-background px-2 py-1 text-sm" /></div><div><label className="text-sm text-foreground">Width</label><input type="number" value={cw} onChange={(e) => setCw(parseInt(e.target.value) || 1)} className="mt-1 w-full rounded border border-input bg-background px-2 py-1 text-sm" /></div><div><label className="text-sm text-foreground">Height</label><input type="number" value={ch} onChange={(e) => setCh(parseInt(e.target.value) || 1)} className="mt-1 w-full rounded border border-input bg-background px-2 py-1 text-sm" /></div></div></Card>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

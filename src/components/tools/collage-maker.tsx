"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { Upload, Download, Plus, Trash2, Grid3X3, LayoutGrid, Columns, Rows } from "lucide-react"

const LAYOUTS = [
  { id: "grid", name: "Grid", icon: Grid3X3, cols: 2, rows: 2 },
  { id: "rows", name: "Rows", icon: Rows, cols: 1, rows: 3 },
  { id: "columns", name: "Columns", icon: Columns, cols: 3, rows: 1 },
  { id: "custom", name: "Custom", icon: LayoutGrid, cols: 2, rows: 3 },
]

const PRESETS = [
  { id: "instagram", name: "Instagram", width: 1080, height: 1080, spacing: 10 },
  { id: "facebook", name: "Facebook", width: 1200, height: 630, spacing: 10 },
  { id: "twitter", name: "Twitter", width: 1200, height: 675, spacing: 8 },
  { id: "pinterest", name: "Pinterest", width: 1000, height: 1500, spacing: 12 },
  { id: "custom", name: "Custom", width: 800, height: 800, spacing: 10 },
]

export function CollageMaker() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [images, setImages] = React.useState<string[]>([])
  const [layout, setLayout] = React.useState(LAYOUTS[0])
  const [preset, setPreset] = React.useState(PRESETS[0])
  const [customWidth, setCustomWidth] = React.useState(800)
  const [customHeight, setCustomHeight] = React.useState(800)
  const [spacing, setSpacing] = React.useState(10)
  const [bgColor, setBgColor] = React.useState("#ffffff")
  const [rounded, setRounded] = React.useState(0)

  React.useEffect(() => { if (images.length > 0) generateCollage() }, [images, layout, preset, spacing, bgColor, rounded])

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const readers = files.map((f) => new Promise<string>((resolve) => { const r = new FileReader(); r.onload = (ev) => resolve(ev.target?.result as string); r.readAsDataURL(f) }))
    Promise.all(readers).then((results) => setImages([...images, ...results]))
  }

  const generateCollage = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const w = preset.id === "custom" ? customWidth : preset.width
    const h = preset.id === "custom" ? customHeight : preset.height
    canvas.width = w; canvas.height = h

    ctx.fillStyle = bgColor; ctx.fillRect(0, 0, w, h)
    const cols = layout.cols, rows = layout.rows
    const maxSlots = cols * rows
    const useImgs = images.slice(0, maxSlots)
    if (useImgs.length === 0) return

    const cellW = (w - spacing * (cols + 1)) / cols
    const cellH = (h - spacing * (rows + 1)) / rows

    let loaded = 0
    useImgs.forEach((src, i) => {
      const img = new Image(1, 1)
      img.onload = () => {
        const col = i % cols, row = Math.floor(i / cols)
        const x = spacing + col * (cellW + spacing)
        const y = spacing + row * (cellH + spacing)
        ctx.save()
        if (rounded > 0) { ctx.beginPath(); ctx.roundRect(x, y, cellW, cellH, rounded); ctx.clip() }
        const sx = img.width / img.height > cellW / cellH ? 0 : (cellH * img.width / img.height - cellW) / 2
        const sy = img.width / img.height > cellW / cellH ? (cellW * img.height / img.width - cellH) / 2 : 0
        const sw = img.width / img.height > cellW / cellH ? cellW : cellW * img.height / img.width
        const sh = img.width / img.height > cellW / cellH ? cellH * img.width / img.height : cellH
        ctx.drawImage(img, -sx, -sy, sw, sh, x, y, cellW, cellH)
        ctx.restore()
        loaded++
        if (loaded === useImgs.length) toast.success("Collage generated")
      }
      img.src = src
    })
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a"); link.download = "collage.png"; link.href = canvas.toDataURL(); link.click()
    toast.success("Collage downloaded")
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><Grid3X3 className="h-6 w-6 text-teal-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Collage Maker</h1><p className="text-sm text-muted-foreground">Create photo collages with grid layouts</p></div></div>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"><Upload className="mr-1 inline h-4 w-4" />Add Photos<input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" /></label>
          {images.length > 0 && <Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /></Button>}
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex items-center justify-center p-4">
          <canvas ref={canvasRef} className="max-w-full rounded-lg shadow-md" />
        </Card>

        <div className="space-y-4">
          <Card><h3 className="mb-4 font-semibold text-foreground">Layout</h3><div className="flex flex-wrap gap-2">{LAYOUTS.map((l) => (<button key={l.id} onClick={() => setLayout(l)} className={cn("flex items-center gap-2 rounded-lg border px-4 py-2 text-sm", layout.id === l.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}><l.icon className="h-4 w-4" />{l.name}</button>))}</div></Card>
          <Card><h3 className="mb-4 font-semibold text-foreground">Canvas Size</h3><div className="flex flex-wrap gap-2 mb-3">{PRESETS.map((p) => (<button key={p.id} onClick={() => setPreset(p)} className={cn("rounded-lg border px-3 py-1 text-xs", preset.id === p.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>{p.name} ({p.width}x{p.height})</button>))}</div>{preset.id === "custom" && <div className="flex gap-3"><input type="number" value={customWidth} onChange={(e) => setCustomWidth(parseInt(e.target.value) || 800)} className="w-24 rounded border border-input bg-background px-2 py-1 text-sm" placeholder="Width" /><span className="text-muted-foreground self-center">x</span><input type="number" value={customHeight} onChange={(e) => setCustomHeight(parseInt(e.target.value) || 800)} className="w-24 rounded border border-input bg-background px-2 py-1 text-sm" placeholder="Height" /></div>}</Card>
          <Card><h3 className="mb-4 font-semibold text-foreground">Style</h3><div className="flex flex-wrap gap-4"><div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Spacing:</span><input type="range" min="0" max="40" value={spacing} onChange={(e) => setSpacing(parseInt(e.target.value))} className="w-20" /><span className="text-xs text-muted-foreground">{spacing}px</span></div><div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Rounded:</span><input type="range" min="0" max="40" value={rounded} onChange={(e) => setRounded(parseInt(e.target.value))} className="w-20" /></div><div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">BG:</span><input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-8 w-8 rounded border" /></div></div></Card>
          <Card><h3 className="mb-2 font-semibold text-foreground">Images ({images.length})</h3><div className="flex flex-wrap gap-2">{images.map((src, i) => (<div key={i} className="group relative"><img src={src} alt="" className="h-16 w-16 rounded object-cover" /><button onClick={() => setImages(images.filter((_, j) => j !== i))} className="absolute -right-1 -top-1 hidden rounded-full bg-destructive p-0.5 text-white group-hover:block"><Trash2 className="h-3 w-3" /></button></div>))}</div></Card>
        </div>
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { Upload, Download, Type, ImageIcon, Trash2, ZoomIn, ZoomOut } from "lucide-react"

export function WatermarkImage() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [image, setImage] = React.useState<string | null>(null)
  const [watermark, setWatermark] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<string | null>(null)
  const [text, setText] = React.useState("")
  const [opacity, setOpacity] = React.useState(0.3)
  const [position, setPosition] = React.useState("bottom-right")
  const [fontSize, setFontSize] = React.useState(32)
  const [color, setColor] = React.useState("#ffffff")
  const [zoom, setZoom] = React.useState(1)

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => { setImage(ev.target?.result as string); setResult(null) }; r.readAsDataURL(file) }
  }

  const handleWatermark = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => { setWatermark(ev.target?.result as string); setResult(null) }; r.readAsDataURL(file) }
  }

  const applyWatermark = () => {
    if (!image) { toast.error("Upload an image"); return }
    if (!text && !watermark) { toast.error("Add text or upload a watermark image"); return }
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const img = new Image(1, 1)
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      ctx.globalAlpha = opacity

      if (watermark) {
        const wm = new Image(1, 1)
        wm.onload = () => {
          const positions: Record<string, [number, number]> = {
            "top-left": [10, 10], "top-right": [canvas.width - wm.width - 10, 10],
            "bottom-left": [10, canvas.height - wm.height - 10], "bottom-right": [canvas.width - wm.width - 10, canvas.height - wm.height - 10],
            "center": [(canvas.width - wm.width) / 2, (canvas.height - wm.height) / 2],
          }
          const [px, py] = positions[position] || positions["bottom-right"]
          ctx.drawImage(wm, px, py)
          ctx.globalAlpha = 1
          setResult(canvas.toDataURL())
          toast.success("Watermark applied")
        }
        wm.onerror = () => { toast.error("Failed to load watermark image") }
        wm.src = watermark
      } else if (text) {
        const positions: Record<string, [number, number]> = {
          "top-left": [10, fontSize + 10], "top-right": [canvas.width - 10, fontSize + 10],
          "bottom-left": [10, canvas.height - 10], "bottom-right": [canvas.width - 10, canvas.height - 10],
          "center": [canvas.width / 2, canvas.height / 2],
        }
        const [px, py] = positions[position] || positions["bottom-right"]
        ctx.font = `bold ${fontSize}px Arial`
        ctx.fillStyle = color
        ctx.textAlign = position.includes("right") ? "right" : position === "center" ? "center" : "left"
        ctx.textBaseline = position.includes("bottom") ? "bottom" : position === "center" ? "middle" : "top"
        ctx.fillText(text, px, py)
        ctx.globalAlpha = 1
        setResult(canvas.toDataURL())
        toast.success("Watermark applied")
      }
    }
    img.src = image
  }

  const handleDownload = () => {
    if (!result) return
    const link = document.createElement("a"); link.download = "watermarked.png"; link.href = result; link.click()
    toast.success("Watermarked image downloaded")
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><ImageIcon className="h-6 w-6 text-teal-500" /><div><h1 className="text-2xl font-bold text-foreground">Watermark Image</h1><p className="text-sm text-muted-foreground">Add text or image watermarks</p></div></div>
        <label className="cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"><Upload className="mr-1 inline h-4 w-4" />Upload Image<input type="file" accept="image/*" onChange={handleImage} className="hidden" /></label>
        {result && <Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /></Button>}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {image && <Card className="flex items-center justify-center p-4"><div className="overflow-auto rounded-lg border border-border" style={{ maxHeight: 400 }}><img src={image} alt="Original" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }} /></div></Card>}
          {result && <Card className="flex items-center justify-center p-4"><div className="overflow-auto rounded-lg border border-border" style={{ maxHeight: 400 }}><img src={result} alt="Watermarked" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }} /></div></Card>}
        </div>

        <div className="space-y-4">
          <Card><h3 className="mb-4 font-semibold text-foreground">Text Watermark</h3><Input label="Watermark Text" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Confidential" /><div className="mt-3 grid grid-cols-2 gap-3"><div className="flex items-center gap-2"><span className="text-sm text-foreground">Size:</span><input type="number" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value) || 24)} className="w-16 rounded border border-input bg-background px-2 py-1 text-sm" /></div><div className="flex items-center gap-2"><span className="text-sm text-foreground">Color:</span><input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-8 rounded border" /></div></div></Card>
          <Card><h3 className="mb-4 font-semibold text-foreground">Image Watermark</h3>{watermark ? <div className="flex items-center gap-3"><img src={watermark} alt="" className="h-12 object-contain" /><Button variant="ghost" size="sm" onClick={() => setWatermark(null)}><Trash2 className="h-4 w-4" /></Button></div> : <label className="cursor-pointer rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary/50"><Upload className="mr-1 inline h-4 w-4" />Upload Watermark Image<input type="file" accept="image/*" onChange={handleWatermark} className="hidden" /></label>}</Card>
          <Card><h3 className="mb-4 font-semibold text-foreground">Settings</h3><div className="flex items-center gap-4 mb-3"><span className="text-sm text-foreground">Opacity:</span><input type="range" min="0.05" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-24" /><span className="text-xs text-muted-foreground">{Math.round(opacity * 100)}%</span></div><div><label className="text-sm text-foreground">Position</label><div className="mt-1 flex flex-wrap gap-1">{["top-left", "top-right", "center", "bottom-left", "bottom-right"].map((p) => (<button key={p} onClick={() => setPosition(p)} className={`rounded border px-2 py-1 text-xs ${position === p ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{p}</button>))}</div></div><div className="mt-4"><Button variant="primary" onClick={applyWatermark}>Apply Watermark</Button></div></Card>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

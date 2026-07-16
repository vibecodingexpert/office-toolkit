"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Upload, Download, FlipHorizontal, FlipVertical, ImageIcon, RefreshCw, ZoomIn, ZoomOut } from "lucide-react"

export function FlipImage() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [image, setImage] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<string | null>(null)
  const [hFlip, setHFlip] = React.useState(false)
  const [vFlip, setVFlip] = React.useState(false)
  const [zoom, setZoom] = React.useState(1)
  const [format, setFormat] = React.useState("png")

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => { setImage(ev.target?.result as string); setResult(null) }; r.readAsDataURL(file) }
  }

  const processFlip = () => {
    if (!image) { toast.error("Upload an image first"); return }
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const img = new Image(1, 1)
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height
      ctx.save()
      ctx.translate(hFlip ? canvas.width : 0, vFlip ? canvas.height : 0)
      ctx.scale(hFlip ? -1 : 1, vFlip ? -1 : 1)
      ctx.drawImage(img, 0, 0)
      ctx.restore()
      setResult(canvas.toDataURL(format === "jpg" ? "image/jpeg" : "image/png"))
      toast.success("Image flipped")
    }
    img.src = image
  }

  React.useEffect(() => { if (image) processFlip() }, [hFlip, vFlip])

  const handleDownload = () => {
    if (!result) return
    const ext = format === "jpg" ? "jpg" : "png"
    const link = document.createElement("a"); link.download = `flipped.${ext}`; link.href = result; link.click()
    toast.success("Image downloaded")
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><FlipHorizontal className="h-6 w-6 text-teal-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Flip Image</h1><p className="text-sm text-muted-foreground">Flip images horizontally or vertically</p></div></div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-sm"><ZoomOut className="h-3 w-3 text-muted-foreground" /><input type="range" min="0.5" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-16" /><ZoomIn className="h-3 w-3 text-muted-foreground" /></div>
          <select value={format} onChange={(e) => setFormat(e.target.value)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="png">PNG</option><option value="jpg">JPEG</option></select>
          <label className="cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"><Upload className="mr-1 inline h-4 w-4" />Upload<input type="file" accept="image/*" onChange={handleImage} className="hidden" /></label>
          {result && <Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /></Button>}
        </div>
      </motion.div>

      {image && <div className="flex flex-wrap gap-2">
        <button onClick={() => setHFlip(!hFlip)} className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${hFlip ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}><FlipHorizontal className="h-4 w-4" /> Flip Horizontal</button>
        <button onClick={() => setVFlip(!vFlip)} className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm ${vFlip ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}><FlipVertical className="h-4 w-4" /> Flip Vertical</button>
      </div>}

      <div className="grid gap-6 lg:grid-cols-2">
        {image && <Card className="flex items-center justify-center p-4"><div className="overflow-auto rounded-lg border border-border" style={{ maxHeight: 500 }}><img src={image} alt="Original" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }} /></div></Card>}
        {result && <Card className="flex items-center justify-center p-4"><div className="overflow-auto rounded-lg border border-border" style={{ maxHeight: 500 }}><img src={result} alt="Flipped" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }} /></div></Card>}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

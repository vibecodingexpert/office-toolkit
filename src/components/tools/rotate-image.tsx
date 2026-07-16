"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Upload, Download, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, ImageIcon, ZoomIn, ZoomOut } from "lucide-react"

export function RotateImage() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [image, setImage] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<string | null>(null)
  const [angle, setAngle] = React.useState(0)
  const [zoom, setZoom] = React.useState(1)

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => { setImage(ev.target?.result as string); setAngle(0); setResult(null) }; r.readAsDataURL(file) }
  }

  const rotate = (delta: number) => { setAngle((prev) => { const na = prev + delta; renderCanvas(na); return na }) }

  const renderCanvas = (deg: number) => {
    if (!image) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const img = new Image(1, 1)
    img.onload = () => {
      const rad = (deg * Math.PI) / 180
      const cos = Math.abs(Math.cos(rad)), sin = Math.abs(Math.sin(rad))
      canvas.width = img.width * cos + img.height * sin
      canvas.height = img.width * sin + img.height * cos
      ctx.save()
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(rad)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)
      ctx.restore()
      setResult(canvas.toDataURL())
    }
    img.src = image
  }

  React.useEffect(() => { if (image) renderCanvas(angle) }, [image])

  const handleDownload = () => {
    if (!result) return
    const link = document.createElement("a"); link.download = "rotated.png"; link.href = result; link.click()
    toast.success("Rotated image downloaded")
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><ImageIcon className="h-6 w-6 text-teal-500" /><div><h1 className="text-2xl font-bold text-foreground">Rotate Image</h1><p className="text-sm text-muted-foreground">Rotate images by any angle</p></div></div>
        <div className="flex items-center gap-2"><label className="cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"><Upload className="mr-1 inline h-4 w-4" />Upload<input type="file" accept="image/*" onChange={handleImage} className="hidden" /></label>{result && <Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /></Button>}</div>
      </motion.div>
      {image && <div className="flex flex-wrap items-center gap-2"><Button variant="outline" size="sm" onClick={() => rotate(-90)}><RotateCcw className="h-4 w-4" /> -90</Button><Button variant="outline" size="sm" onClick={() => rotate(90)}><RotateCw className="h-4 w-4" /> +90</Button><Button variant="outline" size="sm" onClick={() => setAngle(0)}>Reset</Button><div className="flex items-center gap-2 rounded-lg border border-border px-3 py-1 text-sm"><span className="text-muted-foreground">Angle:</span><input type="range" min="-180" max="180" value={angle} onChange={(e) => { const v = parseInt(e.target.value); setAngle(v); renderCanvas(v) }} className="w-24" /><span className="text-xs text-muted-foreground">{angle}\u00B0</span></div></div>}
      <div className="grid gap-6 lg:grid-cols-2">
        {image && <Card className="flex items-center justify-center p-4"><div className="overflow-auto rounded-lg border border-border" style={{ maxHeight: 400 }}><img src={image} alt="Original" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }} /></div></Card>}
        {result && <Card className="flex items-center justify-center p-4"><div className="overflow-auto rounded-lg border border-border" style={{ maxHeight: 400 }}><img src={result} alt="Rotated" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }} /></div></Card>}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

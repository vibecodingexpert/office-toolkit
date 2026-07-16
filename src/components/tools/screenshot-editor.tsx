"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Upload, Download, ImageIcon, Crop, Type, Square, Circle, Undo2, ZoomIn, ZoomOut } from "lucide-react"

type Tool = "crop" | "text" | "rect" | "circle"
interface Annotation { id: string; type: Tool; x: number; y: number; w: number; h: number; color: string; text?: string; fontSize?: number }

export function ScreenshotEditor() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [image, setImage] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<string | null>(null)
  const [tool, setTool] = React.useState<Tool>("crop")
  const [annotations, setAnnotations] = React.useState<Annotation[]>([])
  const [color, setColor] = React.useState("#e11d48")
  const [zoom, setZoom] = React.useState(1)

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => { setImage(ev.target?.result as string); setAnnotations([]); setResult(null) }; r.readAsDataURL(file) }
  }

  React.useEffect(() => { if (image) drawCanvas() }, [image, annotations])

  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas || !image) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const img = new Image(1, 1)
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      for (const a of annotations) {
        ctx.strokeStyle = a.color; ctx.fillStyle = a.color + "30"; ctx.lineWidth = 2
        if (a.type === "rect") { ctx.fillRect(a.x, a.y, a.w, a.h); ctx.strokeRect(a.x, a.y, a.w, a.h) }
        else if (a.type === "circle") { ctx.beginPath(); ctx.ellipse(a.x + a.w / 2, a.y + a.h / 2, a.w / 2, a.h / 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke() }
        else if (a.type === "text") { ctx.font = `bold ${a.fontSize || 24}px Arial`; ctx.fillStyle = a.color; ctx.fillText(a.text || "", a.x, a.y) }
      }
      setResult(canvas.toDataURL())
    }
    img.src = image
  }

  const addAnnotation = () => {
    if (!image) { toast.error("Upload an image first"); return }
    const newAn: Annotation = { id: crypto.randomUUID(), type: tool, x: 50, y: 50, w: 150, h: 100, color, text: "Text", fontSize: 24 }
    setAnnotations([...annotations, newAn])
  }

  const handleDownload = () => {
    if (!result) return
    const link = document.createElement("a"); link.download = "edited-screenshot.png"; link.href = result; link.click()
    toast.success("Edited screenshot downloaded")
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><ImageIcon className="h-6 w-6 text-teal-500" /><div><h1 className="text-2xl font-bold text-foreground">Screenshot Editor</h1><p className="text-sm text-muted-foreground">Annotate and edit screenshots</p></div></div>
        <div className="flex items-center gap-2"><label className="cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"><Upload className="mr-1 inline h-4 w-4" />Upload<input type="file" accept="image/*" onChange={handleImage} className="hidden" /></label>{result && <Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /></Button>}</div>
      </motion.div>

      {image && <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setTool("crop")} className={`flex items-center gap-1 rounded-lg border px-3 py-1 text-sm ${tool === "crop" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}><Crop className="h-4 w-4" />Crop</button>
        <button onClick={() => setTool("rect")} className={`flex items-center gap-1 rounded-lg border px-3 py-1 text-sm ${tool === "rect" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}><Square className="h-4 w-4" />Rect</button>
        <button onClick={() => setTool("circle")} className={`flex items-center gap-1 rounded-lg border px-3 py-1 text-sm ${tool === "circle" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}><Circle className="h-4 w-4" />Circle</button>
        <button onClick={() => setTool("text")} className={`flex items-center gap-1 rounded-lg border px-3 py-1 text-sm ${tool === "text" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}><Type className="h-4 w-4" />Text</button>
        <div className="flex items-center gap-1"><span className="text-xs text-muted-foreground">Color:</span><input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-7 w-7 rounded border" /></div>
        <Button variant="outline" size="sm" onClick={addAnnotation}><Square className="h-4 w-4" /> Add</Button>
        <Button variant="ghost" size="sm" onClick={() => setAnnotations([])}><Undo2 className="h-4 w-4" /> Clear</Button>
      </div>}

      <div className="grid gap-6 lg:grid-cols-2">
        {image && <Card className="flex items-center justify-center p-4"><canvas ref={canvasRef} className="max-w-full rounded-lg border border-border" style={{ maxHeight: 500 }} /></Card>}
        {annotations.length > 0 && <Card className="p-4"><h3 className="mb-2 font-semibold text-foreground">Annotations</h3>{annotations.map((a) => <div key={a.id} className="mb-2 flex items-center justify-between rounded border border-border p-2 text-xs"><span>{a.type}: ({Math.round(a.x)},{Math.round(a.y)})</span><button onClick={() => setAnnotations(annotations.filter((x) => x.id !== a.id))} className="text-destructive">&times;</button></div>)}</Card>}
      </div>
    </div>
  )
}

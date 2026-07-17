"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Upload, Download, ImageIcon, ZoomIn, ZoomOut, Server } from "lucide-react"
import { isPythonBackendAvailable, getPythonBackendUrl } from "@/lib/python-backend"

const SCALES = [2, 3, 4]

export function ImageUpscaler() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [image, setImage] = React.useState<string | null>(null)
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [result, setResult] = React.useState<string | null>(null)
  const [scale, setScale] = React.useState(2)
  const [zoom, setZoom] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const usePython = isPythonBackendAvailable()

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setImageFile(file); const r = new FileReader(); r.onload = (ev) => { setImage(ev.target?.result as string); setResult(null) }; r.readAsDataURL(file) }
  }

  const upscaleJs = () => {
    if (!image) { toast.error("Upload an image"); return }
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const img = new Image(1, 1)
    img.onload = () => {
      canvas.width = img.width * scale; canvas.height = img.height * scale
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      setResult(canvas.toDataURL())
      toast.success(`Upscaled ${scale}x (JS)`)
    }
    img.src = image
  }

  const upscale = async () => {
    if (!image || !imageFile) { toast.error("Upload an image"); return }
    if (usePython) {
      setLoading(true)
      try {
        const fd = new FormData(); fd.append("file", imageFile); fd.append("scale", String(scale))
        const res = await fetch(`${getPythonBackendUrl()}/api/image-upscaler/upscale`, { method: "POST", body: fd })
        if (!res.ok) { const e = await res.json().catch(() => ({ error: "Failed" })); throw new Error(e.error) }
        const blob = await res.blob(); const url = URL.createObjectURL(blob); setResult(url)
        toast.success(`Upscaled ${scale}x (Python)`)
      } catch (e: any) {
        console.warn("Python backend failed, falling back to JS:", e)
        upscaleJs()
      } finally { setLoading(false) }
    } else { upscaleJs() }
  }

  const handleDownload = () => {
    if (!result) return
    const link = document.createElement("a"); link.download = "upscaled.png"; link.href = result; link.click()
    toast.success("Upscaled image downloaded")
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><ImageIcon className="h-6 w-6 text-teal-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Image Upscaler</h1><p className="text-sm text-muted-foreground">Enlarge images using smart upscaling</p></div></div>
        <div className="flex items-center gap-2">{usePython && <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600"><Server className="h-3 w-3" />Python</span>}<label className="cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"><Upload className="mr-1 inline h-4 w-4" />Upload<input type="file" accept="image/*" onChange={handleImage} className="hidden" /></label>{result && <Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /></Button>}</div>
      </motion.div>
      {image && <div className="flex flex-wrap items-center gap-2">{SCALES.map((s) => (<button key={s} onClick={() => setScale(s)} className={`rounded-lg border px-4 py-2 text-sm ${scale === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{s}x</button>))}<Button variant="primary" size="sm" onClick={upscale} disabled={loading}>{loading ? "Processing..." : "Upscale"}</Button></div>}
      <div className="grid gap-6 lg:grid-cols-2">
        {image && <Card className="p-4"><div className="overflow-auto rounded-lg border border-border" style={{ maxHeight: 400 }}><img src={image} alt="Original" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }} /></div></Card>}
        {result && <Card className="p-4"><div className="overflow-auto rounded-lg border border-border" style={{ maxHeight: 400 }}><img src={result} alt="Upscaled" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }} /></div></Card>}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

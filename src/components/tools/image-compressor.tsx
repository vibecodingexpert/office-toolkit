"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Upload, Download, ImageIcon, ZoomIn, ZoomOut } from "lucide-react"

export function ImageCompressor() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [image, setImage] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<string | null>(null)
  const [quality, setQuality] = React.useState(80)
  const [zoom, setZoom] = React.useState(1)
  const [origSize, setOrigSize] = React.useState(0)
  const [compSize, setCompSize] = React.useState(0)

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setOrigSize(file.size)
      const r = new FileReader()
      r.onload = (ev) => { setImage(ev.target?.result as string); setResult(null) }
      r.readAsDataURL(file)
    }
  }

  const compress = () => {
    if (!image) { toast.error("Upload an image"); return }
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const img = new Image(1, 1)
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      const dataUrl = canvas.toDataURL("image/jpeg", quality / 100)
      setResult(dataUrl)
      const bytes = atob(dataUrl.split(",")[1]).length
      setCompSize(bytes)
      toast.success(`Compressed: ${((1 - bytes / origSize) * 100).toFixed(0)}% smaller`)
    }
    img.src = image
  }

  const handleDownload = () => {
    if (!result) return
    const link = document.createElement("a"); link.download = "compressed.jpg"; link.href = result; link.click()
    toast.success("Compressed image downloaded")
  }

  const formatBytes = (bytes: number) => bytes > 1048576 ? `${(bytes / 1048576).toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><ImageIcon className="h-6 w-6 text-teal-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Image Compressor</h1><p className="text-sm text-muted-foreground">Reduce image file size with quality control</p></div></div>
        <div className="flex items-center gap-2"><label className="cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"><Upload className="mr-1 inline h-4 w-4" />Upload<input type="file" accept="image/*" onChange={handleImage} className="hidden" /></label>{result && <Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /></Button>}</div>
      </motion.div>
      <div className="flex flex-wrap items-center gap-4"><div className="flex items-center gap-2 rounded-lg border border-border px-3 py-1 text-sm"><span className="text-muted-foreground">Quality:</span><input type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(parseInt(e.target.value))} className="w-24" /><span className="text-xs text-muted-foreground">{quality}%</span></div>{image && <Button variant="primary" size="sm" onClick={compress}>Compress</Button>}</div>
      <div className="grid gap-6 lg:grid-cols-2">
        {image && <Card className="p-4"><div className="overflow-auto rounded-lg border border-border" style={{ maxHeight: 400 }}><img src={image} alt="Original" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }} /></div><p className="mt-2 text-xs text-muted-foreground">Original: {formatBytes(origSize)}</p></Card>}
        {result && <Card className="p-4"><div className="overflow-auto rounded-lg border border-border" style={{ maxHeight: 400 }}><img src={result} alt="Compressed" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }} /></div><p className="mt-2 text-xs text-muted-foreground">Compressed: {formatBytes(compSize)} ({((1 - compSize / origSize) * 100).toFixed(0)}% smaller)</p></Card>}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

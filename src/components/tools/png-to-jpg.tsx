"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Upload, Download, ImageIcon } from "lucide-react"

export function PngToJpg() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [image, setImage] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<string | null>(null)
  const [quality, setQuality] = React.useState(90)

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => convert(ev.target?.result as string); r.readAsDataURL(file) }
  }

  const convert = (src: string) => {
    setImage(src)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const img = new Image(1, 1)
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      const dataUrl = canvas.toDataURL("image/jpeg", quality / 100)
      setResult(dataUrl)
      toast.success("Converted to JPG")
    }
    img.src = src
  }

  const handleDownload = () => {
    if (!result) return
    const link = document.createElement("a"); link.download = "converted.jpg"; link.href = result; link.click()
    toast.success("JPG downloaded")
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><ImageIcon className="h-6 w-6 text-teal-500" /><div><h1 className="text-2xl font-bold text-foreground">PNG to JPG</h1><p className="text-sm text-muted-foreground">Convert PNG images to JPEG format</p></div></div>
        <label className="cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"><Upload className="mr-1 inline h-4 w-4" />Upload PNG<input type="file" accept="image/png" onChange={handleImage} className="hidden" /></label>
        {result && <Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /></Button>}
      </motion.div>
      <div className="flex items-center gap-4"><span className="text-sm text-foreground">Quality:</span><input type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(parseInt(e.target.value))} className="w-40" /><span className="text-xs text-muted-foreground">{quality}%</span></div>
      <div className="grid gap-6 lg:grid-cols-2">
        {image && <Card className="flex items-center justify-center p-4"><img src={image} alt="Original" className="max-h-80 rounded-lg" /></Card>}
        {result && <Card className="flex items-center justify-center p-4"><img src={result} alt="JPG" className="max-h-80 rounded-lg" /></Card>}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

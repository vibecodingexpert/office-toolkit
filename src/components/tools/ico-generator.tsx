"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Upload, Download, ImageIcon } from "lucide-react"

const SIZES = [16, 24, 32, 48, 64, 128, 256]
const FORMATS = ["ico", "png"]

export function IcoGenerator() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [image, setImage] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<string[]>([])
  const [selectedSize, setSelectedSize] = React.useState(64)

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => { setImage(ev.target?.result as string); setResult([]) }; r.readAsDataURL(file) }
  }

  const generateIco = () => {
    if (!image) { toast.error("Upload an image"); return }
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = selectedSize; canvas.height = selectedSize
    const img = new Image(1, 1)
    img.onload = () => {
      ctx.drawImage(img, 0, 0, selectedSize, selectedSize)
      const urls: string[] = []
      SIZES.filter((s) => s <= selectedSize).forEach((s) => {
        const c = document.createElement("canvas"); c.width = s; c.height = s
        const cx = c.getContext("2d"); cx?.drawImage(img, 0, 0, s, s)
        urls.push(c.toDataURL("image/png"))
      })
      setResult(urls)
      toast.success(`Icon generated (${selectedSize}x${selectedSize})`)
    }
    img.src = image
  }

  React.useEffect(() => { if (image) generateIco() }, [image, selectedSize])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a"); link.download = `icon-${selectedSize}x${selectedSize}.png`; link.href = canvas.toDataURL(); link.click()
    toast.success("Icon downloaded")
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><ImageIcon className="h-6 w-6 text-teal-500" /></div><div><h1 className="text-2xl font-bold text-foreground">ICO Generator</h1><p className="text-sm text-muted-foreground">Generate icons in multiple sizes</p></div></div>
        <label className="cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"><Upload className="mr-1 inline h-4 w-4" />Upload<input type="file" accept="image/*" onChange={handleImage} className="hidden" /></label>
        {result.length > 0 && <Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /></Button>}
      </motion.div>
      <div className="flex flex-wrap gap-2">{SIZES.map((s) => (<button key={s} onClick={() => setSelectedSize(s)} className={`rounded-lg border px-4 py-2 text-sm ${selectedSize === s ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{s}x{s}</button>))}</div>
      <div className="grid gap-6 lg:grid-cols-2">
        {image && <Card className="flex items-center justify-center p-4"><img src={image} alt="Original" className="max-w-full rounded-lg" style={{ maxHeight: 400 }} /></Card>}
        {result.length > 0 && <Card className="p-4"><h3 className="mb-4 font-semibold text-foreground">Generated Icons</h3><div className="flex flex-wrap gap-4">{result.map((u, i) => (<div key={i} className="text-center"><img src={u} alt="" className="rounded border border-border" /><p className="mt-1 text-xs text-muted-foreground">{SIZES.filter((s) => s <= selectedSize)[i]}x{SIZES.filter((s) => s <= selectedSize)[i]}</p></div>))}</div></Card>}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

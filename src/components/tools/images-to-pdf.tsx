"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Upload, Download, Plus, Trash2, ImageIcon, ArrowUpDown } from "lucide-react"
import jsPDF from "jspdf"

export function ImagesToPdf() {
  const [images, setImages] = React.useState<string[]>([])
  const [pageSize, setPageSize] = React.useState("a4")
  const [orientation, setOrientation] = React.useState<"portrait" | "landscape">("portrait")
  const [margin, setMargin] = React.useState(10)
  const [fit, setFit] = React.useState<"contain" | "cover">("contain")

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const readers = files.map((f) => new Promise<string>((resolve) => { const r = new FileReader(); r.onload = (ev) => resolve(ev.target?.result as string); r.readAsDataURL(f) }))
    Promise.all(readers).then((results) => setImages([...images, ...results]))
  }

  const moveImage = (i: number, dir: number) => {
    const j = i + dir
    if (j < 0 || j >= images.length) return
    const arr = [...images]; [arr[i], arr[j]] = [arr[j], arr[i]]; setImages(arr)
  }

  const generatePdf = async () => {
    if (images.length === 0) { toast.error("Add at least one image"); return }
    const sizes: Record<string, [number, number]> = { a4: [210, 297], a3: [297, 420], letter: [215.9, 279.4] }
    const [w, h] = orientation === "portrait" ? sizes[pageSize] : [sizes[pageSize][1], sizes[pageSize][0]]
    const doc = new jsPDF({ unit: "mm", format: [w, h], orientation })

    for (let i = 0; i < images.length; i++) {
      if (i > 0) doc.addPage([w, h])
      const img = new Image(1, 1)
      await new Promise<void>((resolve) => {
        img.onload = () => {
          const m = margin
          const maxW = w - 2 * m, maxH = h - 2 * m
          let iw: number, ih: number
          if (fit === "contain") {
            const ar = img.width / img.height
            iw = Math.min(maxW, maxH * ar)
            ih = Math.min(maxH, maxW / ar)
          } else {
            iw = maxW; ih = maxH
          }
          const x = (w - iw) / 2, y = (h - ih) / 2
          doc.addImage(img, "JPEG", x, y, iw, ih, undefined, "FAST")
          resolve()
        }
        img.src = images[i]
      })
    }
    doc.save("images.pdf")
    toast.success("PDF created successfully")
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><ImageIcon className="h-6 w-6 text-teal-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Images to PDF</h1><p className="text-sm text-muted-foreground">Convert multiple images to a single PDF</p></div></div>
        <div className="flex items-center gap-2"><label className="cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"><Upload className="mr-1 inline h-4 w-4" />Add Images<input type="file" accept="image/*" multiple onChange={handleImages} className="hidden" /></label>{images.length > 0 && <Button variant="primary" size="sm" onClick={generatePdf}><Download className="mr-1 h-4 w-4" /> Create PDF</Button>}</div>
      </motion.div>

      <div className="flex flex-wrap gap-4">
        <div><label className="text-sm font-medium text-foreground">Page Size</label><select value={pageSize} onChange={(e) => setPageSize(e.target.value)} className="ml-2 rounded border border-input bg-background px-2 py-1 text-sm"><option value="a4">A4</option><option value="a3">A3</option><option value="letter">Letter</option></select></div>
        <div><label className="text-sm font-medium text-foreground">Orientation</label><select value={orientation} onChange={(e) => setOrientation(e.target.value as any)} className="ml-2 rounded border border-input bg-background px-2 py-1 text-sm"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></div>
        <div className="flex items-center gap-2"><span className="text-sm text-foreground">Margin:</span><input type="range" min="0" max="30" value={margin} onChange={(e) => setMargin(parseInt(e.target.value))} className="w-20" /><span className="text-xs text-muted-foreground">{margin}mm</span></div>
        <div><label className="text-sm font-medium text-foreground">Fit</label><select value={fit} onChange={(e) => setFit(e.target.value as any)} className="ml-2 rounded border border-input bg-background px-2 py-1 text-sm"><option value="contain">Contain</option><option value="cover">Cover</option></select></div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {images.map((src, i) => (
          <Card key={i} className="group relative overflow-hidden p-2">
            <img src={src} alt="" className="h-32 w-full rounded object-cover" />
            <div className="mt-2 flex items-center justify-between"><div className="flex gap-1"><button onClick={() => moveImage(i, -1)} className="rounded p-1 text-muted-foreground hover:bg-muted"><ArrowUpDown className="h-3 w-3 rotate-90" /></button><button onClick={() => moveImage(i, 1)} className="rounded p-1 text-muted-foreground hover:bg-muted"><ArrowUpDown className="h-3 w-3 -rotate-90" /></button></div><button onClick={() => setImages(images.filter((_, j) => j !== i))} className="rounded p-1 text-destructive hover:bg-destructive/10"><Trash2 className="h-3 w-3" /></button></div>
          </Card>
        ))}
      </div>
    </div>
  )
}

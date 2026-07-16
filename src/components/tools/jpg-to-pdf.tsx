"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Upload, Download, ImageIcon, ZoomIn, ZoomOut } from "lucide-react"
import jsPDF from "jspdf"

export function JpgToPdf() {
  const [image, setImage] = React.useState<string | null>(null)
  const [pageSize, setPageSize] = React.useState("a4")
  const [orientation, setOrientation] = React.useState<"portrait" | "landscape">("portrait")
  const [margin, setMargin] = React.useState(10)
  const [fit, setFit] = React.useState<"contain" | "cover">("contain")

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => setImage(ev.target?.result as string); r.readAsDataURL(file) }
  }

  const generatePdf = () => {
    if (!image) { toast.error("Upload an image"); return }
    const sizes: Record<string, [number, number]> = { a4: [210, 297], a3: [297, 420], letter: [215.9, 279.4] }
    const [w, h] = orientation === "portrait" ? sizes[pageSize] : [sizes[pageSize][1], sizes[pageSize][0]]
    const doc = new jsPDF({ unit: "mm", format: [w, h], orientation })
    const img = new Image(1, 1)
    img.onload = () => {
      const m = margin
      const maxW = w - 2 * m, maxH = h - 2 * m
      let iw: number, ih: number
      if (fit === "contain") { const ar = img.width / img.height; iw = Math.min(maxW, maxH * ar); ih = Math.min(maxH, maxW / ar) }
      else { iw = maxW; ih = maxH }
      const x = (w - iw) / 2, y = (h - ih) / 2
      doc.addImage(img, "JPEG", x, y, iw, ih, undefined, "FAST")
      doc.save("image.pdf")
      toast.success("PDF created")
    }
    img.src = image
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><ImageIcon className="h-6 w-6 text-teal-500" /><div><h1 className="text-2xl font-bold text-foreground">JPG to PDF</h1><p className="text-sm text-muted-foreground">Convert JPG images to PDF</p></div></div>
        <label className="cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"><Upload className="mr-1 inline h-4 w-4" />Upload JPG<input type="file" accept="image/jpeg" onChange={handleImage} className="hidden" /></label>
        {image && <Button variant="primary" size="sm" onClick={generatePdf}><Download className="mr-1 h-4 w-4" /> Create PDF</Button>}
      </motion.div>
      {image && <Card className="flex items-center justify-center p-4"><img src={image} alt="" className="max-h-96 rounded-lg object-contain" /></Card>}
      <div className="flex flex-wrap gap-4">
        <div><label className="text-sm font-medium text-foreground">Size</label><select value={pageSize} onChange={(e) => setPageSize(e.target.value)} className="ml-2 rounded border border-input bg-background px-2 py-1 text-sm"><option value="a4">A4</option><option value="a3">A3</option><option value="letter">Letter</option></select></div>
        <div><label className="text-sm font-medium text-foreground">Orientation</label><select value={orientation} onChange={(e) => setOrientation(e.target.value as any)} className="ml-2 rounded border border-input bg-background px-2 py-1 text-sm"><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></div>
        <div className="flex items-center gap-2"><span className="text-sm text-foreground">Margin:</span><input type="range" min="0" max="30" value={margin} onChange={(e) => setMargin(parseInt(e.target.value))} className="w-20" /><span className="text-xs text-muted-foreground">{margin}mm</span></div>
      </div>
    </div>
  )
}

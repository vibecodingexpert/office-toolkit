"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Upload, Download, Type, Palette, RefreshCw, ImageIcon, Trash2 } from "lucide-react"

const FONTS = ["Impact", "Arial Black", "Helvetica Bold", "Comic Sans MS", "Verdana", "Georgia"]
const POSITIONS = ["top", "bottom", "both"]
const PRESETS = [
  { top: "WHEN YOU WRITE YOUR FIRST MEME GENERATOR", bottom: "IT ACTUALLY WORKS" },
  { top: "NOBODY:", bottom: "ME SPENDING HOURS ON THIS" },
  { top: "THIS IS FINE", bottom: "EVERYTHING IS FINE" },
  { top: "ONE DOES NOT SIMPLY", bottom: "FINISH ALL THE TASKS" },
]

export function MemeGenerator() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [image, setImage] = React.useState<string | null>(null)
  const [topText, setTopText] = React.useState("")
  const [bottomText, setBottomText] = React.useState("")
  const [fontSize, setFontSize] = React.useState(48)
  const [fontFamily, setFontFamily] = React.useState(FONTS[0])
  const [textColor, setTextColor] = React.useState("#ffffff")
  const [strokeColor, setStrokeColor] = React.useState("#000000")
  const [position, setPosition] = React.useState("both")
  const [zoom, setZoom] = React.useState(1)

  React.useEffect(() => { drawMeme() }, [image, topText, bottomText, fontSize, fontFamily, textColor, strokeColor, position])

  const drawMeme = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    if (!image) return
    const img = new Image(1, 1)
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      ctx.textAlign = "center"
      ctx.textBaseline = "top"
      ctx.strokeStyle = strokeColor
      ctx.fillStyle = textColor
      ctx.lineWidth = fontSize / 15

      const lines = (txt: string, maxW: number) => {
        ctx.font = `bold ${fontSize}px ${fontFamily}`
        const words = txt.split(" ")
        const result: string[] = []
        let line = ""
        for (const w of words) {
          const test = line ? `${line} ${w}` : w
          if (ctx.measureText(test).width > maxW && line) { result.push(line); line = w }
          else line = test
        }
        if (line) result.push(line)
        return result
      }

      const maxW = canvas.width * 0.9
      const lineH = fontSize * 1.2
      const margin = fontSize * 0.3

      if (position === "top" || position === "both") {
        const linesArr = lines(topText, maxW)
        const totalH = linesArr.length * lineH
        let y = margin
        for (const l of linesArr) {
          ctx.beginPath()
          ctx.lineWidth = fontSize / 15
          ctx.strokeStyle = strokeColor
          ctx.strokeText(l, canvas.width / 2, y)
          ctx.fillStyle = textColor
          ctx.fillText(l, canvas.width / 2, y)
          y += lineH
        }
      }
      if (position === "bottom" || position === "both") {
        const linesArr = lines(bottomText, maxW)
        const totalH = linesArr.length * lineH
        let y = canvas.height - totalH - margin
        for (const l of linesArr) {
          ctx.beginPath()
          ctx.strokeStyle = strokeColor
          ctx.lineWidth = fontSize / 15
          ctx.strokeText(l, canvas.width / 2, y)
          ctx.fillStyle = textColor
          ctx.fillText(l, canvas.width / 2, y)
          y += lineH
        }
      }
    }
    img.src = image
  }

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => { setImage(ev.target?.result as string) }; r.readAsDataURL(file) }
  }

  const applyPreset = (p: typeof PRESETS[0]) => { setTopText(p.top); setBottomText(p.bottom) }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a"); link.download = "meme.png"; link.href = canvas.toDataURL(); link.click()
    toast.success("Meme downloaded")
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><ImageIcon className="h-6 w-6 text-teal-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Meme Generator</h1><p className="text-sm text-muted-foreground">Create memes with custom text</p></div></div>
        <label className="cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"><Upload className="mr-1 inline h-4 w-4" />Upload Image<input type="file" accept="image/*" onChange={handleImage} className="hidden" /></label>
        {image && <Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /></Button>}
      </motion.div>

      {image && <div className="flex flex-wrap gap-2">{PRESETS.map((p, i) => (<button key={i} onClick={() => applyPreset(p)} className="rounded-lg border border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary/50">{p.top.slice(0, 20)}...</button>))}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex items-center justify-center p-4">
          {image ? <canvas ref={canvasRef} className="max-w-full rounded-lg shadow-md" /> : <div className="py-12 text-center text-muted-foreground"><Type className="mx-auto h-12 w-12" /><p className="mt-2">Upload an image to start</p></div>}
        </Card>

        <div className="space-y-4">
          <Card><h3 className="mb-4 font-semibold text-foreground">Text</h3><div><label className="text-sm text-foreground">Top Text</label><input type="text" value={topText} onChange={(e) => setTopText(e.target.value.toUpperCase())} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm uppercase" placeholder="TOP TEXT" /></div><div className="mt-3"><label className="text-sm text-foreground">Bottom Text</label><input type="text" value={bottomText} onChange={(e) => setBottomText(e.target.value.toUpperCase())} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm uppercase" placeholder="BOTTOM TEXT" /></div></Card>
          <Card><h3 className="mb-4 font-semibold text-foreground">Style</h3><div className="grid grid-cols-2 gap-3"><div><label className="text-sm text-foreground">Font</label><select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="mt-1 w-full rounded border border-input bg-background px-2 py-1 text-sm">{FONTS.map((f) => <option key={f}>{f}</option>)}</select></div><div><label className="text-sm text-foreground">Size</label><input type="number" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value) || 48)} className="mt-1 w-full rounded border border-input bg-background px-2 py-1 text-sm" /></div><div className="flex items-center gap-2"><span className="text-sm text-foreground">Fill:</span><input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="h-8 w-8 rounded border" /></div><div className="flex items-center gap-2"><span className="text-sm text-foreground">Stroke:</span><input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} className="h-8 w-8 rounded border" /></div></div><div className="mt-3"><label className="text-sm text-foreground">Position</label><div className="mt-1 flex gap-2">{POSITIONS.map((p) => (<button key={p} onClick={() => setPosition(p)} className={`rounded border px-3 py-1 text-xs ${position === p ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{p}</button>))}</div></div></Card>
        </div>
      </div>
    </div>
  )
}

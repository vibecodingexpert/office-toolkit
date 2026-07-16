"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { Download, Image, Type, Palette, RefreshCw, Trash2 } from "lucide-react"

const PRESETS = [
  { id: "corporate", name: "Corporate", bg: "#1e293b", text: "#ffffff", accent: "#14b8a6", font: "Inter" },
  { id: "creative", name: "Creative", bg: "#0f172a", text: "#e2e8f0", accent: "#f59e0b", font: "Georgia" },
  { id: "minimal", name: "Minimal", bg: "#ffffff", text: "#1e293b", accent: "#14b8a6", font: "Arial" },
  { id: "dark", name: "Dark", bg: "#0a0a0a", text: "#fafafa", accent: "#a855f7", font: "Helvetica" },
  { id: "nature", name: "Nature", bg: "#064e3b", text: "#d1fae5", accent: "#34d399", font: "Georgia" },
]

const FONTS = ["Arial", "Helvetica", "Georgia", "Inter", "Times New Roman", "Courier New"]

interface DraggableText {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  fontFamily: string
}

export function BusinessCardMaker() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [info, setInfo] = React.useState({ name: "", title: "", company: "", email: "", phone: "", website: "", address: "" })
  const [logo, setLogo] = React.useState("")
  const [preset, setPreset] = React.useState(PRESETS[0])
  const [draggables, setDraggables] = React.useState<DraggableText[]>([])
  const [dragging, setDragging] = React.useState<string | null>(null)
  const [font, setFont] = React.useState("Arial")
  const [scale, setScale] = React.useState(1)
  const [zoom, setZoom] = React.useState(1)

  React.useEffect(() => { drawCanvas() }, [info, logo, preset, draggables, font, zoom])
  React.useEffect(() => { handleAutoLayout() }, [])

  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    ctx.fillStyle = preset.bg
    ctx.fillRect(0, 0, w, h)
    ctx.save()
    ctx.scale(zoom, zoom)

    if (logo) {
      const img = new window.Image(1, 1)
      img.onload = () => {
        const lh = 50
        const lw = (img.width / img.height) * lh
        ctx.drawImage(img, 15, 15, lw, lh)
        drawTextOverlay(ctx, w, h)
      }
      img.src = logo
    } else {
      drawTextOverlay(ctx, w, h)
    }
  }

  const drawTextOverlay = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.textBaseline = "top"
    const baseX = 20
    let y = 75

    ctx.font = `bold 20px ${font}`
    ctx.fillStyle = preset.accent
    ctx.fillText(info.company || "COMPANY NAME", baseX, 20)

    ctx.font = `bold 16px ${font}`
    ctx.fillStyle = preset.text
    ctx.fillText(info.name || "Your Name", baseX, y)
    y += 22

    ctx.font = `14px ${font}`
    ctx.fillStyle = preset.accent
    ctx.fillText(info.title || "Job Title", baseX, y)
    y += 22

    ctx.font = `11px ${font}`
    ctx.fillStyle = preset.text
    const details = [info.email, info.phone, info.website, info.address].filter(Boolean)
    details.forEach((d) => {
      if (y > h - 10) return
      ctx.fillText(d, baseX, y)
      y += 16
    })

    draggables.forEach((d) => {
      ctx.font = `${d.fontSize}px ${d.fontFamily}`
      ctx.fillStyle = d.color
      ctx.fillText(d.text, d.x, d.y)
    })
  }

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => setLogo(ev.target?.result as string || ""); r.readAsDataURL(file) }
  }

  const handleAutoLayout = () => {
    setDraggables([])
    toast.success("Auto-layout applied")
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    link.download = "business-card.png"
    link.href = canvas.toDataURL()
    link.click()
    toast.success("Business card downloaded")
  }

  const handleDownloadSVG = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    link.download = "business-card.svg"
    link.href = canvas.toDataURL("image/svg+xml")
    link.click()
    toast.success("Business card downloaded as SVG")
  }

  const addDraggableText = () => {
    setDraggables([...draggables, { id: crypto.randomUUID(), text: "New Text", x: 50, y: 50, fontSize: 14, color: preset.text, fontFamily: font }])
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><Download className="h-6 w-6 text-teal-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Business Card Maker</h1><p className="text-sm text-muted-foreground">Design professional business cards with drag & drop</p></div></div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-sm"><span className="text-muted-foreground">Zoom:</span><input type="range" min="0.5" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-20" /></div>
          <Button variant="primary" onClick={handleDownload}><Download className="h-4 w-4" /> PNG</Button>
          <Button variant="outline" onClick={handleDownloadSVG}>SVG</Button>
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-2">{PRESETS.map((p) => (<button key={p.id} onClick={() => setPreset(p)} className={cn("flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-colors", preset.id === p.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50")}><div className="h-4 w-4 rounded" style={{ backgroundColor: p.bg, border: "1px solid var(--border)" }} />{p.name}</button>))}</div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex items-center justify-center p-4">
          <canvas ref={canvasRef} width={600} height={340} className="w-full max-w-lg rounded-lg shadow-lg" style={{ imageRendering: "pixelated" }} />
        </Card>

        <div className="space-y-4">
          <Card><h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground"><Type className="h-4 w-4 text-teal-500" />Info</h3><div className="grid gap-3 sm:grid-cols-2"><Input label="Name" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} /><Input label="Title" value={info.title} onChange={(e) => setInfo({ ...info, title: e.target.value })} /><Input label="Company" value={info.company} onChange={(e) => setInfo({ ...info, company: e.target.value })} /><Input label="Email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} /><Input label="Phone" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} /><Input label="Website" value={info.website} onChange={(e) => setInfo({ ...info, website: e.target.value })} /><div className="sm:col-span-2"><Input label="Address" value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} /></div></div></Card>
          <Card><h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground"><Image className="h-4 w-4 text-teal-500" />Logo</h3><input type="file" accept="image/*" onChange={handleLogo} className="text-sm" />{logo && <Button variant="ghost" size="sm" onClick={() => setLogo("")} className="mt-2"><Trash2 className="h-4 w-4" /> Remove</Button>}</Card>
          <Card><h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground"><Palette className="h-4 w-4 text-teal-500" />Style</h3><div><label className="text-sm font-medium text-foreground">Font</label><select value={font} onChange={(e) => setFont(e.target.value)} className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">{FONTS.map((f) => <option key={f} value={f}>{f}</option>)}</select></div></Card>
          <Card><div className="flex items-center justify-between"><h3 className="font-semibold text-foreground">Drag Text</h3><Button variant="outline" size="sm" onClick={addDraggableText}><Type className="h-4 w-4" /> Add</Button></div>{draggables.map((d) => <div key={d.id} className="mt-2 rounded border border-border p-2 text-sm">{d.text}<button onClick={() => setDraggables(draggables.filter((x) => x.id !== d.id))} className="ml-2 text-destructive">&times;</button></div>)}</Card>
          <div className="flex gap-2"><Button variant="primary" onClick={handleAutoLayout}><RefreshCw className="h-4 w-4" /> Auto Layout</Button></div>
        </div>
      </div>
    </div>
  )
}

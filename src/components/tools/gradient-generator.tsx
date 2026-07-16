"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Copy, Download, RefreshCw, ImageIcon } from "lucide-react"

const TYPES = [
  { id: "linear", name: "Linear" },
  { id: "radial", name: "Radial" },
  { id: "conic", name: "Conic" },
]

const DIRECTIONS = [
  { id: "to right", name: "\u2192" },
  { id: "to left", name: "\u2190" },
  { id: "to bottom", name: "\u2193" },
  { id: "to top", name: "\u2191" },
  { id: "to bottom right", name: "\u2198" },
  { id: "to top left", name: "\u2196" },
]

const PRESETS = [
  { id: "ocean", name: "Ocean", c1: "#06b6d4", c2: "#3b82f6" },
  { id: "sunset", name: "Sunset", c1: "#f97316", c2: "#e11d48" },
  { id: "forest", name: "Forest", c1: "#22c55e", c2: "#166534" },
  { id: "lavender", name: "Lavender", c1: "#a855f7", c2: "#7c3aed" },
  { id: "gold", name: "Gold", c1: "#f59e0b", c2: "#d97706" },
  { id: "teal", name: "Teal", c1: "#14b8a6", c2: "#0d9488" },
  { id: "midnight", name: "Midnight", c1: "#1e293b", c2: "#0f172a" },
  { id: "cherry", name: "Cherry", c1: "#ec4899", c2: "#be185d" },
]

export function GradientGenerator() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [color1, setColor1] = React.useState("#14b8a6")
  const [color2, setColor2] = React.useState("#0d9488")
  const [type, setType] = React.useState(TYPES[0])
  const [direction, setDirection] = React.useState(DIRECTIONS[0])
  const [width, setWidth] = React.useState(600)
  const [height, setHeight] = React.useState(200)

  React.useEffect(() => { drawGradient() }, [color1, color2, type, direction, width, height])

  const drawGradient = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = width; canvas.height = height
    let grad: CanvasGradient
    if (type.id === "linear") {
      let angle = 0
      switch (direction.id) {
        case "to right": angle = 0; break; case "to left": angle = Math.PI; break
        case "to bottom": angle = Math.PI / 2; break; case "to top": angle = -Math.PI / 2; break
        case "to bottom right": angle = Math.PI / 4; break; case "to top left": angle = -3 * Math.PI / 4; break
      }
      const cx = width / 2, cy = height / 2
      const r = Math.sqrt(width * width + height * height) / 2
      const sx = cx + r * Math.cos(angle + Math.PI), sy = cy + r * Math.sin(angle + Math.PI)
      const ex = cx + r * Math.cos(angle), ey = cy + r * Math.sin(angle)
      grad = ctx.createLinearGradient(sx, sy, ex, ey)
    } else if (type.id === "radial") {
      grad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2)
    } else {
      grad = ctx.createConicGradient(0, width / 2, height / 2)
    }
    grad.addColorStop(0, color1)
    grad.addColorStop(1, color2)
    if (type.id === "conic") {
      ctx.translate(width / 2, height / 2)
      ctx.fillStyle = grad as CanvasGradient
      ctx.fillRect(-width / 2, -height / 2, width, height)
    } else {
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)
    }
  }

  const copyCSS = () => {
    const css = `background: ${type.id === "linear" ? `linear-gradient(${direction.id}, ${color1}, ${color2})` : type.id === "radial" ? `radial-gradient(circle, ${color1}, ${color2})` : `conic-gradient(from 0deg, ${color1}, ${color2})`};`
    navigator.clipboard.writeText(css)
    toast.success("CSS copied")
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a"); link.download = "gradient.png"; link.href = canvas.toDataURL(); link.click()
    toast.success("Gradient downloaded")
  }

  const randomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`
  const randomize = () => { setColor1(randomColor()); setColor2(randomColor()) }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><ImageIcon className="h-6 w-6 text-teal-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Gradient Generator</h1><p className="text-sm text-muted-foreground">Create beautiful CSS gradients</p></div></div>
        <div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={copyCSS}><Copy className="h-4 w-4" /> CSS</Button><Button variant="outline" size="sm" onClick={randomize}><RefreshCw className="h-4 w-4" /> Random</Button><Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /></Button></div>
      </motion.div>

      <div className="flex flex-wrap gap-2">{TYPES.map((t) => (<button key={t.id} onClick={() => setType(t)} className={`rounded-lg border px-4 py-2 text-sm ${type.id === t.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{t.name}</button>))}</div>
      {type.id === "linear" && <div className="flex flex-wrap gap-2">{DIRECTIONS.map((d) => (<button key={d.id} onClick={() => setDirection(d)} className={`rounded-lg border px-3 py-1 text-sm ${direction.id === d.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{d.name}</button>))}</div>}

      <Card className="flex items-center justify-center p-4"><canvas ref={canvasRef} className="w-full max-w-2xl rounded-lg shadow-lg" /></Card>

      <Card><h3 className="mb-4 font-semibold text-foreground">Colors</h3><div className="flex flex-wrap gap-4">
        {PRESETS.map((p) => (<button key={p.id} onClick={() => { setColor1(p.c1); setColor2(p.c2) }} className="flex items-center gap-2 rounded-lg border px-3 py-1 text-xs hover:border-primary/50"><div className="flex"><div className="h-4 w-4 rounded-l" style={{ backgroundColor: p.c1 }} /><div className="h-4 w-4 rounded-r" style={{ backgroundColor: p.c2 }} /></div>{p.name}</button>))}
      </div></Card>
      <Card><div className="flex flex-wrap gap-4"><div className="flex items-center gap-2"><span className="text-sm text-foreground">Color 1:</span><input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="h-10 w-10 rounded border" /></div><div className="flex items-center gap-2"><span className="text-sm text-foreground">Color 2:</span><input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="h-10 w-10 rounded border" /></div><div className="flex items-center gap-2"><span className="text-sm text-foreground">Width:</span><input type="number" value={width} onChange={(e) => setWidth(parseInt(e.target.value) || 600)} className="w-20 rounded border border-input bg-background px-2 py-1 text-sm" /></div><div className="flex items-center gap-2"><span className="text-sm text-foreground">Height:</span><input type="number" value={height} onChange={(e) => setHeight(parseInt(e.target.value) || 200)} className="w-20 rounded border border-input bg-background px-2 py-1 text-sm" /></div></div></Card>
    </div>
  )
}

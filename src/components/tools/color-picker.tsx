"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Copy, Pipette, RefreshCw, Palette, History, Trash2 } from "lucide-react"

const PREDEFINED = ["#14b8a6", "#0f172a", "#6366f1", "#e11d48", "#f59e0b", "#84cc16", "#06b6d4", "#a855f7", "#ec4899", "#10b981"]

export function ColorPicker() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [image, setImage] = React.useState<string | null>(null)
  const [pickedColor, setPickedColor] = React.useState("#14b8a6")
  const [history, setHistory] = React.useState<string[]>([])
  const [format, setFormat] = React.useState<"hex" | "rgb" | "hsl">("hex")
  const [zoom, setZoom] = React.useState(1)

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => setImage(ev.target?.result as string); r.readAsDataURL(file) }
  }

  const pickColor = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)
    const pixel = ctx.getImageData(x, y, 1, 1).data
    const hex = `#${pixel[0].toString(16).padStart(2, "0")}${pixel[1].toString(16).padStart(2, "0")}${pixel[2].toString(16).padStart(2, "0")}`
    setPickedColor(hex)
    if (!history.includes(hex)) setHistory([hex, ...history].slice(0, 20))
  }

  const toRgb = (hex: string) => { const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16); return `rgb(${r}, ${g}, ${b})` }
  const toHsl = (hex: string) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0, l = (max + min) / 2
    if (max !== min) { const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min); if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6; else if (max === g) h = ((b - r) / d + 2) / 6; else h = ((r - g) / d + 4) / 6 }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
  }

  const colorDisplay = format === "hex" ? pickedColor : format === "rgb" ? toRgb(pickedColor) : toHsl(pickedColor)

  const copyColor = () => { navigator.clipboard.writeText(colorDisplay); toast.success(`${format.toUpperCase()} copied`) }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><Palette className="h-6 w-6 text-teal-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Color Picker</h1><p className="text-sm text-muted-foreground">Pick colors from images with format conversion</p></div></div>
        <div className="flex items-center gap-2">
          <select value={format} onChange={(e) => setFormat(e.target.value as any)} className="rounded-lg border border-input bg-background px-3 py-2 text-sm"><option value="hex">HEX</option><option value="rgb">RGB</option><option value="hsl">HSL</option></select>
          <Button variant="outline" size="sm" onClick={() => setHistory([])}><Trash2 className="h-4 w-4" /></Button>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col items-center justify-center p-4">
          {image ? <canvas ref={canvasRef} className="max-w-full cursor-crosshair rounded-lg border border-border" style={{ maxHeight: 400 }} onClick={pickColor} /> : <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground"><Pipette className="h-12 w-12" /><p>Upload an image to pick colors</p></div>}
          <input type="file" accept="image/*" onChange={handleImage} className="mt-3 text-sm" />
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-xl border-2 shadow-md" style={{ backgroundColor: pickedColor }} />
              <div><h2 className="text-xl font-bold text-foreground" style={{ color: pickedColor }}>{colorDisplay}</h2><p className="text-xs text-muted-foreground">Click on image to pick a color</p></div>
              <Button variant="primary" size="sm" onClick={copyColor}><Copy className="h-4 w-4" /></Button>
            </div>
          </Card>
          <Card><h3 className="mb-3 font-semibold text-foreground">Color Schemes & Harmonies</h3><div className="space-y-2 text-sm text-muted-foreground"><div className="flex items-center gap-3"><div className="h-6 w-6 rounded" style={{ backgroundColor: pickedColor }} /><span>Base Color</span></div><div className="flex items-center gap-3"><div className="h-6 w-6 rounded" style={{ backgroundColor: pickedColor }} /><span>Complementary</span></div></div></Card>
          <Card><h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground"><History className="h-4 w-4" />History</h3><div className="flex flex-wrap gap-2">{history.map((c) => (<button key={c} onClick={() => setPickedColor(c)} className="group relative h-8 w-8 rounded-lg border transition-transform hover:scale-110" style={{ backgroundColor: c }} title={c}><span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100">{c}</span></button>))}</div></Card>
          <Card><h3 className="mb-3 font-semibold text-foreground">Predefined Colors</h3><div className="flex flex-wrap gap-2">{PREDEFINED.map((c) => (<button key={c} onClick={() => setPickedColor(c)} className="h-8 w-8 rounded-lg border transition-transform hover:scale-110" style={{ backgroundColor: c }} title={c} />))}</div></Card>
        </div>
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { Download, QrCode, Image, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils/cn"

const QR_COLORS = ["#14b8a6", "#0f172a", "#6366f1", "#e11d48", "#f59e0b", "#84cc16", "#06b6d4", "#a855f7"]
const SIZES = [
  { id: "small", name: "Small", val: 200 },
  { id: "medium", name: "Medium", val: 300 },
  { id: "large", name: "Large", val: 400 },
]

export function QrBusinessCard() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [info, setInfo] = React.useState({ name: "", title: "", company: "", email: "", phone: "", website: "", address: "" })
  const [logo, setLogo] = React.useState("")
  const [qrColor, setQrColor] = React.useState("#14b8a6")
  const [bgColor, setBgColor] = React.useState("#ffffff")
  const [size, setSize] = React.useState(SIZES[0])
  const [showInfo, setShowInfo] = React.useState(true)
  const [border, setBorder] = React.useState(true)

  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${info.name || "Your Name"}
N:${info.name?.split(" ").reverse().join(";") || ";;"}
ORG:${info.company || ""}
TITLE:${info.title || ""}
TEL;TYPE=WORK,VOICE:${info.phone || ""}
EMAIL:${info.email || ""}
ADR;TYPE=WORK:;;${info.address || ""};;;;
URL:${info.website || ""}
END:VCARD`

  const generateQR = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const s = size.val
    canvas.width = s
    canvas.height = s

    try {
      const QRCode = (await import("qrcode")).default
      const qrDataUrl = await QRCode.toDataURL(vcard, { width: s, color: { dark: qrColor, light: bgColor }, margin: 2, errorCorrectionLevel: "H" })
      const img = new window.Image(1, 1)
      img.onload = () => {
        ctx.clearRect(0, 0, s, s)
        ctx.drawImage(img, 0, 0, s, s)
        if (logo) {
          const logoImg = new window.Image(1, 1)
          logoImg.onload = () => {
            const ls = s * 0.2
            const lx = (s - ls) / 2
            const ly = (s - ls) / 2
            ctx.fillStyle = bgColor
            ctx.fillRect(lx - 2, ly - 2, ls + 4, ls + 4)
            ctx.drawImage(logoImg, lx, ly, ls, ls)
          }
          logoImg.src = logo
        }
      }
      img.src = qrDataUrl
    } catch {
      toast.error("Failed to generate QR code")
    }
  }

  React.useEffect(() => { generateQR() }, [vcard, qrColor, bgColor, logo, size])

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => setLogo(ev.target?.result as string); r.readAsDataURL(file) }
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    link.download = "qr-business-card.png"
    link.href = canvas.toDataURL()
    link.click()
    toast.success("QR code downloaded")
  }

  const handleDownloadSVG = async () => {
    try {
      const QRCode = (await import("qrcode")).default
      const svgStr = await QRCode.toString(vcard, { type: "svg", color: { dark: qrColor, light: bgColor }, margin: 2, errorCorrectionLevel: "H" })
      const blob = new Blob([svgStr], { type: "image/svg+xml" })
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = "qr-business-card.svg"
      a.click()
      toast.success("QR code downloaded as SVG")
    } catch { toast.error("Failed to generate SVG") }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><QrCode className="h-6 w-6 text-teal-500" /></div><div><h1 className="text-2xl font-bold text-foreground">QR Business Card</h1><p className="text-sm text-muted-foreground">vCard QR code generator for contact sharing</p></div></div>
        <div className="flex items-center gap-2"><Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /> PNG</Button><Button variant="outline" size="sm" onClick={handleDownloadSVG}>SVG</Button></div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col items-center justify-center p-6">
          <canvas ref={canvasRef} className="max-w-full rounded-lg shadow-md" style={{ maxHeight: 400 }} />
          <div className="mt-4 flex items-center gap-2">{SIZES.map((s) => (<button key={s.id} onClick={() => setSize(s)} className={cn("rounded-lg border px-3 py-1 text-xs", size.id === s.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>{s.name}</button>))}</div>
          <p className="mt-2 text-xs text-muted-foreground">QR encodes vCard contact data</p>
        </Card>

        <div className="space-y-4">
          <Card><h3 className="mb-4 font-semibold text-foreground">Contact Info</h3><div className="grid gap-3 sm:grid-cols-2"><Input label="Name" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} /><Input label="Title" value={info.title} onChange={(e) => setInfo({ ...info, title: e.target.value })} /><Input label="Company" value={info.company} onChange={(e) => setInfo({ ...info, company: e.target.value })} /><Input label="Email" type="email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} /><Input label="Phone" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} /><Input label="Website" value={info.website} onChange={(e) => setInfo({ ...info, website: e.target.value })} /><div className="sm:col-span-2"><Input label="Address" value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} /></div></div></Card>
          <Card><h3 className="mb-4 font-semibold text-foreground">Style</h3><div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium text-foreground">QR Color</label><div className="mt-1 flex flex-wrap gap-1">{QR_COLORS.map((c) => (<button key={c} onClick={() => setQrColor(c)} className={cn("h-6 w-6 rounded-full border transition-transform", qrColor === c && "scale-125 ring-2 ring-primary")} style={{ backgroundColor: c }} />))}</div></div><div><label className="text-sm font-medium text-foreground">Background</label><div className="mt-1 flex flex-wrap gap-1">{["#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0", "#0f172a", "#1e293b"].map((c) => (<button key={c} onClick={() => setBgColor(c)} className={cn("h-6 w-6 rounded-full border transition-transform", bgColor === c && "scale-125 ring-2 ring-primary")} style={{ backgroundColor: c }} />))}</div></div></div><div className="mt-3 flex items-center gap-4"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showInfo} onChange={(e) => setShowInfo(e.target.checked)} /><span>Show info below QR</span></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={border} onChange={(e) => setBorder(e.target.checked)} /><span>Border</span></label></div></Card>
          <Card><h3 className="mb-4 font-semibold text-foreground">Logo Overlay</h3>{logo ? <div className="flex items-center gap-3"><img src={logo} alt="" className="h-12 w-12 rounded object-cover" /><Button variant="ghost" size="sm" onClick={() => setLogo("")}><Trash2 className="h-4 w-4" /></Button></div> : <label className="cursor-pointer rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary/50"><Image className="mr-1 inline h-4 w-4" />Upload Logo<input type="file" accept="image/*" onChange={handleLogo} className="hidden" /></label>}</Card>
        </div>
      </div>
    </div>
  )
}

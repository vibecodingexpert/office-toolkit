"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { Download, QrCode, Image, Share2 } from "lucide-react"

const COLORS = ["#000000", "#3b82f6", "#8b5cf6", "#10b981", "#ef4444", "#f59e0b"]

function generateQRDataUrl(text: string, fgColor: string, size: number): string {
  const moduleCount = 21
  const cellSize = size / moduleCount
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) return ""
  ctx.fillStyle = "#ffffff"
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = fgColor

  const finderSize = 7
  for (let r = 0; r < finderSize; r++) {
    for (let c = 0; c < finderSize; c++) {
      if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize)
      }
    }
  }
  for (let r = 0; r < finderSize; r++) {
    for (let c = 0; c < finderSize; c++) {
      if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
        ctx.fillRect((moduleCount - finderSize + c) * cellSize, r * cellSize, cellSize, cellSize)
      }
    }
  }
  for (let r = 0; r < finderSize; r++) {
    for (let c = 0; c < finderSize; c++) {
      if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
        ctx.fillRect(c * cellSize, (moduleCount - finderSize + r) * cellSize, cellSize, cellSize)
      }
    }
  }

  const hash = text.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const seeded = (i: number) => ((hash * (i + 1) * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff

  let idx = 0
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      const isFinder = (r < 7 && c < 7) || (r < 7 && c >= moduleCount - 7) || (r >= moduleCount - 7 && c < 7)
      const isTiming = r === 6 || c === 6
      if (!isFinder && !isTiming && seeded(idx++) > 0.5) {
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize)
      }
    }
  }

  return canvas.toDataURL("image/png")
}

export function QrBusinessCard() {
  const [info, setInfo] = React.useState({ name: "", title: "", company: "", email: "", phone: "", website: "", address: "" })
  const [logo, setLogo] = React.useState<string | null>(null)
  const [qrColor, setQrColor] = React.useState("#000000")
  const [showQR, setShowQR] = React.useState(false)

  const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${info.name}
ORG:${info.company}
TITLE:${info.title}
TEL:${info.phone}
EMAIL:${info.email}
ADR:${info.address}
URL:${info.website}
END:VCARD`

  const qrDataUrl = showQR ? generateQRDataUrl(vCardData, qrColor, 200) : ""

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = (ev) => setLogo(ev.target?.result as string); r.readAsDataURL(file) }
  }

  const handleDownload = async () => {
    if (!info.name) { toast.error("Please enter a name"); return }
    const card = document.getElementById("qr-card-preview")
    if (!card) return
    try {
      const { toPng } = await import("html-to-image")
      const dataUrl = await toPng(card, { quality: 1, pixelRatio: 2 })
      const a = document.createElement("a")
      a.href = dataUrl
      a.download = `${info.name.replace(/\s+/g, "-")}-qr-card.png`
      a.click()
    } catch { toast.error("Failed to download") }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><QrCode className="h-6 w-6 text-teal-500" /></div><div><h1 className="text-2xl font-bold text-foreground">QR Business Card</h1><p className="text-sm text-muted-foreground">Digital business cards with QR</p></div></div>
        <Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /> Download</Button>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card><h3 className="mb-4 font-semibold text-foreground">Business Info</h3>
            <div className="mb-4 flex items-center gap-4">{logo && <img src={logo} alt="" className="h-12 w-12 rounded-lg object-cover" />}<label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary/50"><Image className="h-4 w-4" /> Logo<input type="file" accept="image/*" onChange={handleLogo} className="hidden" /></label></div>
            <div className="grid gap-4"><Input label="Name" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} /><Input label="Title" value={info.title} onChange={(e) => setInfo({ ...info, title: e.target.value })} /><Input label="Company" value={info.company} onChange={(e) => setInfo({ ...info, company: e.target.value })} /><Input label="Email" type="email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} /><Input label="Phone" value={info.phone} onChange={(e) => setInfo({ ...info, phone: e.target.value })} /><Input label="Website" value={info.website} onChange={(e) => setInfo({ ...info, website: e.target.value })} /><Input label="Address" value={info.address} onChange={(e) => setInfo({ ...info, address: e.target.value })} /></div>
          </Card>
          <Card><h3 className="mb-4 font-semibold text-foreground">QR Code Settings</h3>
            <label className="text-sm font-medium text-foreground">QR Color</label>
            <div className="mt-2 flex flex-wrap gap-2">{COLORS.map((c) => (<button key={c} onClick={() => setQrColor(c)} className={cn("h-8 w-8 rounded-full border-2 transition-all", qrColor === c ? "border-foreground scale-110" : "border-transparent")} style={{ backgroundColor: c }} />))}</div>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowQR(true)}><QrCode className="mr-1 h-4 w-4" /> Generate QR Code</Button>
          </Card>
        </div>

        <div className="space-y-6">
          <Card padding="none" className="overflow-hidden">
            <div className="border-b border-border bg-muted/30 px-5 py-3"><span className="text-sm font-medium text-foreground">Preview</span></div>
            <div id="qr-card-preview" className="bg-white p-6 dark:bg-gray-950">
              <div className="flex flex-col items-center gap-6">
                <div className="flex items-center gap-4 w-full border-b border-gray-200 dark:border-gray-700 pb-4">
                  {logo && <img src={logo} alt="" className="h-16 w-16 rounded-xl object-cover" />}
                  <div className="flex-1"><h3 className="text-lg font-bold text-gray-900 dark:text-white">{info.name || "Your Name"}</h3><p className="text-sm text-gray-500">{info.title}{info.company && ` · ${info.company}`}</p></div>
                </div>
                <div className="w-full space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {info.email && <p>✉ {info.email}</p>}
                  {info.phone && <p>📞 {info.phone}</p>}
                  {info.website && <p>🌐 {info.website}</p>}
                  {info.address && <p>📍 {info.address}</p>}
                </div>
                {showQR && qrDataUrl && (
                  <div className="flex flex-col items-center gap-2 border-t border-gray-200 dark:border-gray-700 pt-4 w-full">
                    <img src={qrDataUrl} alt="QR Code" className="h-40 w-40" />
                    <p className="text-xs text-gray-400">Scan for vCard</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

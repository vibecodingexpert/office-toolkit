"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  QrCode,
  Download,
  Copy,
  Check,
  Image,
  Palette,
  Upload,
} from "lucide-react"

const ERROR_CORRECTION = [
  { label: "L (Low)", value: "L" },
  { label: "M (Medium)", value: "M" },
  { label: "Q (Quartile)", value: "Q" },
  { label: "H (High)", value: "H" },
]

export function QrGenerator() {
  const [text, setText] = React.useState("https://example.com")
  const [size, setSize] = React.useState(300)
  const [fgColor, setFgColor] = React.useState("#000000")
  const [bgColor, setBgColor] = React.useState("#ffffff")
  const [ecLevel, setEcLevel] = React.useState("M")
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  const generateQR = React.useCallback(async () => {
    if (!text.trim()) { toast.error("Please enter text or URL"); return }
    try {
      const QRCode = (await import("qrcode")).default
      const url = await QRCode.toDataURL(text, {
        width: size,
        color: { dark: fgColor, light: bgColor },
        margin: 2,
        errorCorrectionLevel: ecLevel as "L" | "M" | "Q" | "H",
      })
      if (resultUrl) URL.revokeObjectURL(resultUrl)
      setResultUrl(url)
      toast.success("QR code generated")
    } catch {
      toast.error("Failed to generate QR code")
    }
  }, [text, size, fgColor, bgColor, ecLevel, resultUrl])

  const handleCopy = React.useCallback(async () => {
    if (!resultUrl) return
    try {
      const blob = await fetch(resultUrl).then((r) => r.blob())
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ])
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy image")
    }
  }, [resultUrl])

  const handleDownload = React.useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = "qrcode.png"
    a.click()
  }, [resultUrl])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <QrCode className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">QR Generator</h2>
          <p className="text-sm text-muted-foreground">Generate QR codes instantly</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Text / URL</label>
            <input
              type="text" value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text or URL..."
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Size: {size}px</label>
            <input
              type="range" min={100} max={500} step={10}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Foreground</label>
              <div className="flex items-center gap-2">
                <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded-lg border border-border" />
                <input type="text" value={fgColor} onChange={(e) => setFgColor(e.target.value)}
                  className="flex-1 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-mono text-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Background</label>
              <div className="flex items-center gap-2">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded-lg border border-border" />
                <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-mono text-foreground" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Error Correction</label>
            <div className="grid grid-cols-2 gap-2">
              {ERROR_CORRECTION.map((ec) => (
                <button
                  key={ec.value}
                  onClick={() => setEcLevel(ec.value)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                    ecLevel === ec.value
                      ? "border-primary/50 bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {ec.label}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={generateQR} fullWidth icon={<QrCode className="h-4 w-4" />}>
            Generate QR Code
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          {resultUrl ? (
            <>
              <div className="overflow-hidden rounded-2xl border border-border bg-muted/30 p-4 shadow-sm">
                <img src={resultUrl} alt="QR Code" style={{ width: size, height: size, maxWidth: "100%" }} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} icon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}>
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </div>
            </>
          ) : (
            <div className="flex h-64 w-64 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20">
              <QrCode className="h-16 w-16 text-muted-foreground/40" />
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

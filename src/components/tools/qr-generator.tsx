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

function getQRModules(text: string, ecLevel: string): boolean[][] {
  const len = text.length
  const version = Math.max(1, Math.min(10, Math.ceil(len / 10)))
  const size = 17 + version * 4
  const modules: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false))

  const finderPattern = [
    [1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
  ]

  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      if (r < finderPattern.length && c < finderPattern[r].length) {
        modules[r][c] = finderPattern[r][c] === 1
        modules[r][size - 7 + c] = finderPattern[r][c] === 1
        modules[size - 7 + r][c] = finderPattern[r][c] === 1
      }
    }
  }

  const separators = [
    { r: 7, c: [0, 1, 2, 3, 4, 5, 6, 7] },
    { r: [0, 1, 2, 3, 4, 5, 6, 7], c: 7 },
    { r: 7, c: [size - 7, size - 6, size - 5, size - 4, size - 3, size - 2, size - 1] },
    { r: [0, 1, 2, 3, 4, 5, 6, 7], c: size - 8 },
    { r: [size - 8], c: [0, 1, 2, 3, 4, 5, 6, 7] },
    { r: [size - 7, size - 6, size - 5, size - 4, size - 3, size - 2, size - 1], c: 7 },
  ]

  for (const sep of separators) {
    if (typeof sep.r === "number" && Array.isArray(sep.c)) {
      for (const c of sep.c) if (c >= 0 && c < size) modules[sep.r][c] = false
    } else if (Array.isArray(sep.r) && typeof sep.c === "number") {
      for (const r of sep.r) if (r >= 0 && r < size) modules[r][sep.c] = false
    }
  }

  const timingSize = size - 16
  for (let i = 8; i < 8 + timingSize; i++) {
    if (i < size) {
      modules[6][i] = i % 2 === 0
      modules[i][6] = i % 2 === 0
    }
  }

  const dataBits: number[] = []
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    for (let b = 7; b >= 0; b--) {
      dataBits.push((code >> b) & 1)
    }
  }

  const totalModules = (size - 16) * (size - 16) - 2 * 8 * 8 + 1
  while (dataBits.length < totalModules) {
    dataBits.push(0)
  }

  let bitIdx = 0
  for (let row = size - 1; row >= 0; row -= 2) {
    if (row === 6) row = 5
    for (let col = size - 1; col >= 0; col -= 2) {
      for (let c of [col, col - 1]) {
        if (c < 0 || row >= size || c >= size) continue
        if (modules[row][c] === undefined || (row < 8 && c < 8) ||
            (row < 8 && c >= size - 8) || (row >= size - 8 && c < 8) ||
            row === 6 || c === 6) continue
        if (bitIdx < dataBits.length) {
          modules[row][c] = dataBits[bitIdx] === 1
          bitIdx++
        }
      }
    }
  }

  return modules
}

export function QrGenerator() {
  const [text, setText] = React.useState("https://example.com")
  const [size, setSize] = React.useState(300)
  const [fgColor, setFgColor] = React.useState("#000000")
  const [bgColor, setBgColor] = React.useState("#ffffff")
  const [ecLevel, setEcLevel] = React.useState("M")
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  const generateQR = React.useCallback(() => {
    if (!text.trim()) { toast.error("Please enter text or URL"); return }
    const modules = getQRModules(text, ecLevel)
    const moduleSize = Math.floor(size / modules.length)
    const offset = Math.floor((size - moduleSize * modules.length) / 2)
    const canvas = document.createElement("canvas")
    canvas.width = size; canvas.height = size
    const ctx = canvas.getContext("2d")
    if (!ctx) { toast.error("Canvas not available"); return }
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, size, size)
    ctx.fillStyle = fgColor
    for (let r = 0; r < modules.length; r++) {
      for (let c = 0; c < modules[r].length; c++) {
        if (modules[r][c]) {
          ctx.fillRect(offset + c * moduleSize, offset + r * moduleSize, moduleSize, moduleSize)
        }
      }
    }
    canvas.toBlob((blob) => {
      if (!blob) { toast.error("Failed to generate QR"); return }
      const url = URL.createObjectURL(blob)
      if (resultUrl) URL.revokeObjectURL(resultUrl)
      setResultUrl(url)
      toast.success("QR code generated")
    }, "image/png")
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

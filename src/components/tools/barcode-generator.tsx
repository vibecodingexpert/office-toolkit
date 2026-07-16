"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Barcode,
  Download,
  RefreshCw,
  Image,
} from "lucide-react"

const BARCODE_TYPES = [
  { value: "code128", label: "Code 128" },
  { value: "code39", label: "Code 39" },
  { value: "ean13", label: "EAN-13" },
  { value: "upca", label: "UPC-A" },
  { value: "itf", label: "ITF" },
]

function encodeCode128(text: string): number[] {
  const start = 104
  const stop = 106
  const codes: number[] = [start]
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    if (code >= 32 && code <= 126) {
      codes.push(code - 32)
    }
  }
  let checksum = codes[0]
  for (let i = 1; i < codes.length; i++) {
    checksum += codes[i] * i
  }
  codes.push(checksum % 103)
  codes.push(stop)
  return codes
}

function getCode128Pattern(code: number): number[] {
  const patterns: number[][] = [
    [2,1,2,2,2,2],[2,2,2,1,2,2],[2,2,2,2,2,1],[1,2,1,2,2,3],[1,2,1,3,2,2],[1,3,1,2,2,2],[1,2,2,2,1,3],[1,2,2,3,1,2],[1,3,2,2,1,2],[2,2,1,2,1,3],[2,2,1,3,1,2],[2,3,1,2,1,2],[1,1,2,2,3,2],[1,2,2,1,3,2],[1,2,2,2,3,1],[1,1,3,2,2,2],[1,2,3,1,2,2],[1,2,3,2,2,1],[2,2,3,2,1,1],[2,2,1,1,3,2],[2,2,1,2,3,1],[2,1,3,2,1,2],[2,2,3,1,1,2],[3,1,2,1,3,1],[3,1,1,2,2,2],[3,2,1,1,2,2],[3,2,1,2,2,1],[3,1,2,2,1,2],[3,2,2,1,1,2],[3,2,2,2,1,1],[2,1,2,1,2,3],[2,1,2,3,2,1],[2,3,2,1,2,1],[1,1,1,3,2,3],[1,3,1,1,2,3],[1,3,1,3,2,1],[1,1,2,3,1,3],[1,3,2,1,1,3],[1,3,2,3,1,1],[2,1,1,3,1,3],[2,3,1,1,1,3],[2,3,1,3,1,1],[1,1,2,1,3,3],[1,1,2,3,3,1],[1,3,2,1,3,1],[1,1,3,1,2,3],[1,1,3,3,2,1],[1,3,3,1,2,1],[3,1,3,1,2,1],[2,1,1,3,3,1],[2,3,1,1,3,1],[2,1,3,1,1,3],[2,1,3,3,1,1],[2,1,3,1,3,1],[3,1,1,1,2,3],[3,1,1,3,2,1],[3,3,1,1,2,1],[3,1,2,1,1,3],[3,1,2,3,1,1],[3,3,2,1,1,1],[3,1,4,1,1,2],[3,1,4,1,2,1],[3,3,1,1,1,3],[3,3,1,3,1,1],[3,1,1,1,4,2],[3,2,1,1,4,1],[1,1,1,2,2,3],[1,1,1,3,2,2],[1,3,1,2,2,2],[1,1,3,2,1,3],[1,1,3,3,1,2],[1,3,3,2,1,2],[3,1,3,2,1,2],[2,1,1,1,2,3],[2,1,1,3,2,1],[2,3,1,1,2,1],[2,1,3,1,1,2],[2,1,3,3,1,1],[2,1,4,1,2,1],[2,1,1,2,2,3],[2,1,1,2,3,2],[2,1,3,2,1,2],[2,3,1,2,1,2],[1,1,1,1,3,3],[1,1,1,3,3,1],[1,3,1,1,3,1],[1,1,3,1,2,3],[1,1,3,3,2,1],[1,3,3,1,2,1],[3,1,1,1,3,2],[3,1,1,3,2,1],[1,1,2,1,1,3],[1,1,2,3,1,1],[1,3,2,1,1,1],[2,1,1,2,1,3],[2,1,1,2,3,1],[2,1,3,2,1,1],[2,1,2,2,1,3],[2,1,2,1,3,1],[2,1,2,1,1,3],
  ]
  return patterns[code] || [1,1,1,1,1,1]
}

export function BarcodeGenerator() {
  const [text, setText] = React.useState("1234567890")
  const [barcodeType, setBarcodeType] = React.useState("code128")
  const [width, setWidth] = React.useState(400)
  const [height, setHeight] = React.useState(120)
  const [showText, setShowText] = React.useState(true)
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)

  const generateBarcode = React.useCallback(() => {
    if (!text.trim()) { toast.error("Please enter text"); return }
    try {
      const canvas = document.createElement("canvas")
      canvas.width = width; canvas.height = height + (showText ? 30 : 0)
      const ctx = canvas.getContext("2d")
      if (!ctx) { toast.error("Canvas not available"); return }
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = "#000000"

      const codes = encodeCode128(text)
      const totalWidth = codes.reduce((sum, c) => {
        const pattern = getCode128Pattern(c)
        return sum + pattern.reduce((a, b) => a + b, 0)
      }, 0)
      const scale = (width - 20) / totalWidth
      let x = 10

      for (const code of codes) {
        const pattern = getCode128Pattern(code)
        let isBar = true
        for (const p of pattern) {
          const pw = p * scale
          if (isBar) ctx.fillRect(x, 5, pw, height - 10)
          x += pw
          isBar = !isBar
        }
      }

      if (showText) {
        ctx.fillStyle = "#000000"
        ctx.font = "14px monospace"
        ctx.textAlign = "center"
        ctx.fillText(text, width / 2, height + 22)
      }

      canvas.toBlob((blob) => {
        if (!blob) { toast.error("Failed to generate barcode"); return }
        const url = URL.createObjectURL(blob)
        if (resultUrl) URL.revokeObjectURL(resultUrl)
        setResultUrl(url)
        toast.success("Barcode generated")
      }, "image/png")
    } catch {
      toast.error("Failed to generate barcode")
    }
  }, [text, width, height, showText, resultUrl, barcodeType])

  const handleDownload = React.useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = "barcode.png"
    a.click()
  }, [resultUrl])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Barcode className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Barcode Generator</h2>
          <p className="text-sm text-muted-foreground">Generate barcodes for products and labels</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Text / Number</label>
            <input
              type="text" value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter barcode value..."
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Barcode Type</label>
            <div className="grid grid-cols-2 gap-2">
              {BARCODE_TYPES.map((bt) => (
                <button
                  key={bt.value}
                  onClick={() => setBarcodeType(bt.value)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                    barcodeType === bt.value
                      ? "border-primary/50 bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {bt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Width: {width}px</label>
              <input type="range" min={200} max={600} value={width}
                onChange={(e) => setWidth(Number(e.target.value))} className="w-full accent-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Height: {height}px</label>
              <input type="range" min={50} max={300} value={height}
                onChange={(e) => setHeight(Number(e.target.value))} className="w-full accent-primary" />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showText} onChange={(e) => setShowText(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary" />
            <span className="text-sm text-foreground">Show text below barcode</span>
          </label>

          <Button onClick={generateBarcode} fullWidth icon={<Barcode className="h-4 w-4" />}>
            Generate Barcode
          </Button>
        </div>

        <div className="flex flex-col items-center justify-center gap-4">
          {resultUrl ? (
            <>
              <div className="overflow-hidden rounded-2xl border border-border bg-white p-4 shadow-sm w-full">
                <img src={resultUrl} alt="Barcode" className="w-full" />
              </div>
              <Button variant="outline" onClick={handleDownload} icon={<Download className="h-3.5 w-3.5" />}>
                Download
              </Button>
            </>
          ) : (
            <div className="flex h-40 w-full items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20">
              <Barcode className="h-12 w-12 text-muted-foreground/40" />
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload,
  Download,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  ImageIcon,
  Pipette,
  Undo2,
  Eye,
  EyeOff,
} from "lucide-react"

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function rgbToHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("")
}

function colorDistance(c1: [number, number, number], c2: [number, number, number]) {
  const dr = c1[0] - c2[0], dg = c1[1] - c2[1], db = c1[2] - c2[2]
  return Math.sqrt(dr * dr + dg * dg + db * db)
}

function createFeatherKernel(radius: number): Float32Array {
  const size = radius * 2 + 1
  const kernel = new Float32Array(size * size)
  const sigma = radius / 2
  let sum = 0
  for (let y = -radius; y <= radius; y++) {
    for (let x = -radius; x <= radius; x++) {
      const v = Math.exp(-(x * x + y * y) / (2 * sigma * sigma))
      kernel[(y + radius) * size + (x + radius)] = v
      sum += v
    }
  }
  for (let i = 0; i < kernel.length; i++) kernel[i] /= sum
  return kernel
}

export function BackgroundRemover() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const resultCanvasRef = React.useRef<HTMLCanvasElement>(null)
  const displayRef = React.useRef<HTMLDivElement>(null)
  const [image, setImage] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [zoom, setZoom] = React.useState(1)
  const [tolerance, setTolerance] = React.useState(60)
  const [replaceColor, setReplaceColor] = React.useState("#ffffff")
  const [mode, setMode] = React.useState<"remove" | "replace">("remove")
  const [sampledColor, setSampledColor] = React.useState<string | null>(null)
  const [showOriginal, setShowOriginal] = React.useState(false)
  const [featherAmount, setFeatherAmount] = React.useState(1)
  const [originalData, setOriginalData] = React.useState<ImageData | null>(null)
  const imgRef = React.useRef<HTMLImageElement | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const loadImageToCanvas = React.useCallback((src: string) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      imgRef.current = img
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.drawImage(img, 0, 0)
      setOriginalData(ctx.getImageData(0, 0, canvas.width, canvas.height))
    }
    img.src = src
  }, [])

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const r = new FileReader()
    r.onload = (ev) => {
      const src = ev.target?.result as string
      setImage(src)
      setResult(null)
      setSampledColor(null)
      loadImageToCanvas(src)
    }
    r.readAsDataURL(file)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!image) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / zoom)
    const y = Math.floor((e.clientY - rect.top) / zoom)
    const ctx = canvas.getContext("2d")
    if (!ctx || !originalData) return
    const idx = (y * canvas.width + x) * 4
    const data = originalData.data
    const r = data[idx], g = data[idx + 1], b = data[idx + 2]
    const hex = rgbToHex(r, g, b)
    setSampledColor(hex)
    toast.success(`Sampled color: ${hex}`)
  }

  const processImage = () => {
    if (!image) { toast.error("Please upload an image"); return }
    if (!originalData) { toast.error("Image not loaded"); return }
    setLoading(true)
    requestAnimationFrame(() => {
      const canvas = resultCanvasRef.current
      if (!canvas) return
      canvas.width = originalData.width
      canvas.height = originalData.height
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const imageData = new ImageData(
        new Uint8ClampedArray(originalData.data),
        originalData.width,
        originalData.height
      )
      const data = imageData.data
      const w = imageData.width
      const h = imageData.height

      let bgR: number, bgG: number, bgB: number
      if (sampledColor) {
        const c = hexToRgb(sampledColor)
        bgR = c.r; bgG = c.g; bgB = c.b
      } else {
        let tr = 0, tg = 0, tb = 0, count = 0
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const edge = x < 2 || x >= w - 3 || y < 2 || y >= h - 3
            if (edge) {
              const idx = (y * w + x) * 4
              tr += data[idx]; tg += data[idx + 1]; tb += data[idx + 2]
              count++
            }
          }
        }
        bgR = Math.round(tr / count); bgG = Math.round(tg / count); bgB = Math.round(tb / count)
      }

      const alpha = new Float32Array(w * h)
      for (let i = 0; i < alpha.length; i++) {
        const idx = i * 4
        const dist = colorDistance([data[idx], data[idx + 1], data[idx + 2]], [bgR, bgG, bgB])
        const a = Math.max(0, Math.min(1, (dist - tolerance) / 40))
        alpha[i] = a
      }

      if (featherAmount > 0) {
        const radius = featherAmount
        const kernel = createFeatherKernel(radius)
        const kSize = radius * 2 + 1
        const temp = new Float32Array(w * h)
        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            let sum = 0
            for (let ky = 0; ky < kSize; ky++) {
              const py = y + ky - radius
              if (py < 0 || py >= h) continue
              for (let kx = 0; kx < kSize; kx++) {
                const px = x + kx - radius
                if (px < 0 || px >= w) continue
                sum += alpha[py * w + px] * kernel[ky * kSize + kx]
              }
            }
            temp[y * w + x] = sum
          }
        }
        for (let i = 0; i < alpha.length; i++) alpha[i] = temp[i]
      }

      for (let i = 0; i < alpha.length; i++) {
        const idx = i * 4
        const a = alpha[i]
        if (mode === "remove") {
          data[idx + 3] = Math.round(a * 255)
        } else {
          const c = hexToRgb(replaceColor)
          const blend = 1 - a
          data[idx] = Math.round(data[idx] * a + c.r * blend)
          data[idx + 1] = Math.round(data[idx + 1] * a + c.g * blend)
          data[idx + 2] = Math.round(data[idx + 2] * a + c.b * blend)
          data[idx + 3] = 255
        }
      }

      ctx.putImageData(imageData, 0, 0)
      setResult(canvas.toDataURL("image/png"))
      setLoading(false)
      toast.success("Background processed")
    })
  }

  const handleDownload = () => {
    if (!result) return
    const link = document.createElement("a")
    link.download = "background-removed.png"
    link.href = result
    link.click()
    toast.success("Image downloaded")
  }

  const handlePaste = async () => {
    try {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        const blob = item.getType("image/png") || item.getType("image/jpeg")
        if (blob) {
          const url = URL.createObjectURL(await blob)
          setImage(url)
          setResult(null)
          setSampledColor(null)
          loadImageToCanvas(url)
          return
        }
      }
      toast.error("No image in clipboard")
    } catch { toast.error("No image in clipboard") }
  }

  const hasImage = !!image
  const canvasW = originalData?.width ?? 0
  const canvasH = originalData?.height ?? 0

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10">
            <ImageIcon className="h-6 w-6 text-teal-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Background Remover</h1>
            <p className="text-sm text-muted-foreground">Remove or replace image backgrounds with precision</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-sm">
            <ZoomOut className="h-3 w-3 text-muted-foreground" />
            <input type="range" min="0.25" max="3" step="0.05" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-16" />
            <ZoomIn className="h-3 w-3 text-muted-foreground" />
          </div>
          <Button variant="outline" size="sm" onClick={handlePaste}>
            <Upload className="h-4 w-4" /> Paste
          </Button>
          <label className="cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
            <Upload className="mr-1 inline h-4 w-4" />Upload
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>
          {result && (
            <Button variant="primary" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4" /> Download
            </Button>
          )}
        </div>
      </motion.div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
        <div className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs text-muted-foreground">
          <Pipette className="h-3.5 w-3.5" />
          <span>Click image to sample</span>
        </div>
        {sampledColor && (
          <div className="flex items-center gap-1.5 rounded-lg border border-border px-2 py-1 text-xs">
            <span className="text-muted-foreground">Sampled:</span>
            <span className="h-4 w-4 rounded border" style={{ backgroundColor: sampledColor }} />
            <span className="font-mono text-[10px]">{sampledColor}</span>
          </div>
        )}
        <div className="h-4 w-px bg-border" />
        <button
          onClick={() => setMode("remove")}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
            mode === "remove" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
          )}
        >
          Remove
        </button>
        <button
          onClick={() => setMode("replace")}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
            mode === "replace" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
          )}
        >
          Replace
        </button>
        <div className="h-4 w-px bg-border" />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Tolerance:</span>
          <input type="range" min="0" max="150" value={tolerance} onChange={(e) => setTolerance(parseInt(e.target.value))} className="w-16 accent-primary" />
          <span className="font-mono w-6">{tolerance}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Feather:</span>
          <input type="range" min="0" max="5" step="1" value={featherAmount} onChange={(e) => setFeatherAmount(parseInt(e.target.value))} className="w-12 accent-primary" />
          <span className="w-3">{featherAmount}</span>
        </div>
        {mode === "replace" && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Color:</span>
            <input type="color" value={replaceColor} onChange={(e) => setReplaceColor(e.target.value)} className="h-7 w-7 cursor-pointer rounded border" />
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          {result && (
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className={cn(
                "flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all",
                showOriginal ? "border-primary/30 bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
              )}
            >
              {showOriginal ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {showOriginal ? "Show Result" : "Show Original"}
            </button>
          )}
          <Button variant="primary" size="sm" onClick={processImage} disabled={loading || !hasImage}>
            <RefreshCw className={cn("mr-1 h-4 w-4", loading && "animate-spin")} />
            {loading ? "Processing..." : "Process"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {result && showOriginal ? "Result" : "Original"}
            </span>
            {!image && <span className="text-[10px] text-muted-foreground">Upload an image to begin</span>}
          </div>
          <div
            ref={displayRef}
            className={cn(
              "relative flex items-center justify-center overflow-auto rounded-lg border border-border",
              !image && "border-dashed bg-muted/20"
            )}
            style={{ minHeight: 400, maxHeight: 560 }}
          >
            {hasImage ? (
              <canvas
                ref={canvasRef}
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                  maxWidth: "none",
                  cursor: result ? "crosshair" : "default",
                }}
                onClick={handleCanvasClick}
                className="rounded"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground/50">
                <ImageIcon className="h-16 w-16" />
                <p className="text-sm">Upload or paste an image</p>
              </div>
            )}
          </div>
        </Card>

        <Card className="flex flex-col p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {result && !showOriginal ? "Original" : "Result"}
            </span>
            {!result && image && <span className="text-[10px] text-muted-foreground">Click Process to remove background</span>}
          </div>
          <div
            className={cn(
              "relative flex items-center justify-center overflow-auto rounded-lg border border-border",
              !result && !image && "border-dashed bg-muted/20"
            )}
            style={{ minHeight: 400, maxHeight: 560 }}
          >
            {result ? (
              <img
                src={showOriginal ? image! : result}
                alt="Result"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "top left",
                  maxWidth: "none",
                }}
                className="rounded"
              />
            ) : hasImage ? (
              <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                <RefreshCw className="h-12 w-12" />
                <p className="text-sm">Result will appear here</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground/50">
                <ImageIcon className="h-16 w-16" />
                <p className="text-sm">Upload an image first</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <canvas ref={resultCanvasRef} className="hidden" />
    </div>
  )
}

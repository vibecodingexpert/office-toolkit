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
  Monitor,
  Image,
  Palette,
  Type,
  Undo2,
  Redo2,
  Square,
  Circle,
  ArrowUpRight,
  Highlighter,
  EyeOff,
  MousePointer,
} from "lucide-react"

type ToolType = "arrow" | "rectangle" | "circle" | "text" | "highlight" | "blur" | "select"

interface Annotation {
  id: string
  type: ToolType
  x: number
  y: number
  w: number
  h: number
  color: string
  text?: string
}

const TOOLS: { type: ToolType; icon: React.ReactNode; label: string }[] = [
  { type: "select", icon: <MousePointer className="h-4 w-4" />, label: "Select" },
  { type: "arrow", icon: <ArrowUpRight className="h-4 w-4" />, label: "Arrow" },
  { type: "rectangle", icon: <Square className="h-4 w-4" />, label: "Rect" },
  { type: "circle", icon: <Circle className="h-4 w-4" />, label: "Circle" },
  { type: "text", icon: <Type className="h-4 w-4" />, label: "Text" },
  { type: "highlight", icon: <Highlighter className="h-4 w-4" />, label: "Highlight" },
  { type: "blur", icon: <EyeOff className="h-4 w-4" />, label: "Blur" },
]

export function ScreenshotEditor() {
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [activeTool, setActiveTool] = React.useState<ToolType>("select")
  const [color, setColor] = React.useState("#ff0000")
  const [annotations, setAnnotations] = React.useState<Annotation[]>([])
  const [history, setHistory] = React.useState<Annotation[][]>([])
  const [historyIdx, setHistoryIdx] = React.useState(-1)
  const [isDrawing, setIsDrawing] = React.useState(false)
  const [drawStart, setDrawStart] = React.useState({ x: 0, y: 0 })
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [imgDims, setImgDims] = React.useState({ w: 0, h: 0 })

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResultUrl(null)
    setAnnotations([])
    setHistory([])
    setHistoryIdx(-1)
    const url = URL.createObjectURL(f)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(url)
    const img = new window.Image()
    img.onload = () => setImgDims({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = url
  }, [preview])

  const pushHistory = React.useCallback((ann: Annotation[]) => {
    const newHistory = history.slice(0, historyIdx + 1)
    newHistory.push([...ann])
    setHistory(newHistory)
    setHistoryIdx(newHistory.length - 1)
  }, [history, historyIdx])

  const undo = React.useCallback(() => {
    if (historyIdx <= 0) return
    setHistoryIdx((i) => i - 1)
    setAnnotations(history[historyIdx - 1])
  }, [history, historyIdx])

  const redo = React.useCallback(() => {
    if (historyIdx >= history.length - 1) return
    setHistoryIdx((i) => i + 1)
    setAnnotations(history[historyIdx + 1])
  }, [history, historyIdx])

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !preview) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const img = new window.Image()
    img.src = preview
    img.onload = () => {
      const container = containerRef.current
      if (!container) return
      const maxW = container.clientWidth
      const maxH = 500
      const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1)
      canvas.width = img.naturalWidth * scale
      canvas.height = img.naturalHeight * scale
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const s = canvas.width / img.naturalWidth
      for (const ann of annotations) {
        ctx.strokeStyle = ann.color
        ctx.fillStyle = ann.type === "highlight" ? ann.color + "40" : "transparent"
        ctx.lineWidth = ann.type === "blur" ? 1 : 3
        const x = ann.x * s; const y = ann.y * s
        const w = ann.w * s; const h = ann.h * s
        if (ann.type === "blur") {
          ctx.filter = `blur(8px)`
          ctx.drawImage(canvas, x, y, w, h, x, y, w, h)
          ctx.filter = "none"
        } else if (ann.type === "rectangle" || ann.type === "highlight") {
          ctx.fillRect(x, y, w, h)
          ctx.strokeRect(x, y, w, h)
        } else if (ann.type === "circle") {
          ctx.beginPath()
          ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
        } else if (ann.type === "arrow") {
          ctx.beginPath()
          ctx.moveTo(x, y)
          ctx.lineTo(x + w, y + h)
          ctx.stroke()
        } else if (ann.type === "text" && ann.text) {
          ctx.font = "16px sans-serif"
          ctx.fillStyle = ann.color
          ctx.fillText(ann.text, x, y)
        }
      }
    }
  }, [preview, annotations])

  const handleMouseDown = React.useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === "select") return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width * imgDims.w
    const y = (e.clientY - rect.top) / rect.height * imgDims.h
    setIsDrawing(true)
    setDrawStart({ x, y })
    if (activeTool === "text") {
      const text = prompt("Enter text:") || "Text"
      const ann: Annotation = { id: crypto.randomUUID(), type: "text", x, y, w: 80, h: 20, color, text }
      const updated = [...annotations, ann]
      setAnnotations(updated)
      pushHistory(updated)
      setIsDrawing(false)
    }
  }, [activeTool, annotations, color, imgDims, pushHistory])

  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool === "select" || activeTool === "text") return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = (e.clientX - rect.left) / rect.width * imgDims.w
    const y = (e.clientY - rect.top) / rect.height * imgDims.h
    const updated = [...annotations]
    updated[updated.length - 1] = {
      ...updated[updated.length - 1],
      w: x - drawStart.x,
      h: y - drawStart.y,
    }
    setAnnotations(updated)
  }, [isDrawing, activeTool, annotations, drawStart, imgDims])

  const handleMouseUp = React.useCallback(() => {
    if (!isDrawing) return
    setIsDrawing(false)
    pushHistory(annotations)
  }, [isDrawing, annotations, pushHistory])

  const clearAnnotations = React.useCallback(() => {
    setAnnotations([])
    setHistory([])
    setHistoryIdx(-1)
  }, [])

  const handleExport = React.useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 100))
    try {
      canvas.toBlob((blob) => {
        if (!blob) { toast.error("Failed to export"); setLoading(false); return }
        const url = URL.createObjectURL(blob)
        if (resultUrl) URL.revokeObjectURL(resultUrl)
        setResultUrl(url)
        setLoading(false)
        toast.success("Screenshot exported")
      }, "image/png")
    } catch { setLoading(false); toast.error("Failed to export") }
  }, [resultUrl])

  const [loading, setLoading] = React.useState(false)

  const handleDownload = React.useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = (file?.name?.replace(/\.[^/.]+$/, "") || "screenshot") + "_edited.png"
    a.click()
  }, [resultUrl, file])

  const handleReset = React.useCallback(() => {
    if (preview) URL.revokeObjectURL(preview)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setFile(null); setPreview(null); setResultUrl(null)
    setAnnotations([]); setHistory([]); setHistoryIdx(-1)
  }, [preview, resultUrl])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Monitor className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Screenshot Editor</h2>
          <p className="text-sm text-muted-foreground">Edit and annotate screenshots</p>
        </div>
      </div>

      {!preview ? (
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-primary/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Upload a screenshot <span className="text-primary underline underline-offset-2">browse</span></p>
            <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WebP</p>
          </div>
        </label>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {TOOLS.map((t) => (
              <button
                key={t.type}
                onClick={() => setActiveTool(t.type)}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all",
                  activeTool === t.type
                    ? "border-primary/50 bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                )}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
            <div className="w-px h-6 bg-border mx-1" />
            <button onClick={undo} disabled={historyIdx <= 0}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all">
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button onClick={redo} disabled={historyIdx >= history.length - 1}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all">
              <Redo2 className="h-3.5 w-3.5" />
            </button>
            <div className="flex items-center gap-1 ml-2">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                className="h-7 w-7 cursor-pointer rounded border border-border" />
            </div>
            <button onClick={clearAnnotations}
              className="ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:text-destructive transition-all">
              Clear Marks
            </button>
          </div>

          <div ref={containerRef} className="overflow-hidden rounded-xl border border-border bg-muted/30">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className={cn(
                "w-full cursor-crosshair",
                activeTool === "select" && "cursor-default"
              )}
              style={{ maxHeight: 500 }}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleExport} loading={loading} icon={<Monitor className="h-4 w-4" />}>
              Export
            </Button>
            {resultUrl && (
              <Button variant="outline" onClick={handleDownload} icon={<Download className="h-4 w-4" />}>
                Download
              </Button>
            )}
            <Button variant="ghost" onClick={handleReset} icon={<RefreshCw className="h-4 w-4" />}>
              New Image
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

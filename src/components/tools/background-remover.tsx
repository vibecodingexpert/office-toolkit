"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, RefreshCw, Sparkles, Scissors,
  RotateCw, RotateCcw, FlipHorizontal, FlipVertical,
  Undo2, Redo2, Trash2, ZoomIn, ZoomOut, Maximize2, Expand,
  Brush, Eraser, Sliders, PaintBucket, X, AlertTriangle, FileImage, Plus,
  Eye, EyeOff, Crop, SplitSquareVertical, Layers, Pointer,
  Minus, Plus as PlusIcon, Palette, History, Image,
} from "lucide-react"

const SUPPORTED = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".avif"]
const MAX_FILE_SIZE = 50 * 1024 * 1024
const MAX_HISTORY = 50

function fmtSize(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1048576) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / 1048576).toFixed(1)} MB`
}

function validateFile(f: File): string | null {
  const ext = "." + (f.name.split(".").pop()?.toLowerCase() || "")
  if (!SUPPORTED.includes(ext)) return `Unsupported format: ${ext}`
  if (f.size > MAX_FILE_SIZE) return `Image too large: ${fmtSize(f.size)}. Max 50 MB.`
  return null
}

type ToolType = "brush" | "restore" | "pan" | "none"
type MaskView = "normal" | "mask" | "overlay" | "split"
type BgOption = "transparent" | "solid" | "gradient" | "blur" | "custom" | "pattern"

interface BrushCfg {
  size: number; hardness: number; opacity: number; flow: number; spacing: number
}

interface HistEntry {
  id: string; name: string; data: ImageData; w: number; h: number
}

function hexToRgb(h: string) {
  return { r: parseInt(h.slice(1, 3), 16), g: parseInt(h.slice(3, 5), 16), b: parseInt(h.slice(5, 7), 16) }
}

function gaussBlurAlpha(src: Float32Array, w: number, h: number, r: number): Float32Array {
  const sigma = r / 2, size = r * 2 + 1
  const kernel = new Float32Array(size)
  let sum = 0
  for (let i = 0; i < size; i++) { const x = i - r; const v = Math.exp(-(x * x) / (2 * sigma * sigma)); kernel[i] = v; sum += v }
  for (let i = 0; i < size; i++) kernel[i] /= sum
  const temp = new Float32Array(w * h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let s = 0; for (let kx = 0; kx < size; kx++) { const px = x + kx - r; if (px >= 0 && px < w) s += src[(y * w + px)] * kernel[kx] }; temp[y * w + x] = s }
  const dst = new Float32Array(w * h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let s = 0; for (let ky = 0; ky < size; ky++) { const py = y + ky - r; if (py >= 0 && py < h) s += temp[py * w + x] * kernel[ky] }; dst[y * w + x] = s }
  return dst
}

function computeAlphaBounds(data: ImageData) {
  const w = data.width, h = data.height
  let t = -1, b = -1, l = -1, r = -1
  for (let y = 0; y < h && t === -1; y++) for (let x = 0; x < w; x++) if (data.data[(y * w + x) * 4 + 3] > 0) { t = y; break }
  if (t === -1) return null
  for (let y = h - 1; y >= 0 && b === -1; y--) for (let x = 0; x < w; x++) if (data.data[(y * w + x) * 4 + 3] > 0) { b = y; break }
  for (let x = 0; x < w && l === -1; x++) for (let y = 0; y < h; y++) if (data.data[(y * w + x) * 4 + 3] > 0) { l = x; break }
  for (let x = w - 1; x >= 0 && r === -1; x--) for (let y = 0; y < h; y++) if (data.data[(y * w + x) * 4 + 3] > 0) { r = x; break }
  return { t, l, b, r }
}

function renderBg(ctx: CanvasRenderingContext2D, w: number, h: number, opt: BgOption, c1: string, c2: string, gt: string, custom: string | null, pat: string) {
  if (opt === "transparent") {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = "#e5e7eb"; const s = 8
    for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) if ((Math.floor(x / s) + Math.floor(y / s)) % 2 === 1) ctx.fillRect(x, y, s, s)
    return
  }
  if (opt === "solid") { ctx.fillStyle = c1; ctx.fillRect(0, 0, w, h); return }
  if (opt === "gradient") {
    let g: CanvasGradient
    if (gt === "linear-top") g = ctx.createLinearGradient(0, 0, 0, h)
    else if (gt === "linear-right") g = ctx.createLinearGradient(0, 0, w, 0)
    else if (gt === "radial") g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 2)
    else g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); return
  }
  if (opt === "custom" && custom) { const img = document.createElement("img"); img.onload = () => ctx.drawImage(img, 0, 0, w, h); img.src = custom; return }
  if (opt === "pattern") {
    ctx.fillStyle = c1; ctx.fillRect(0, 0, w, h); ctx.fillStyle = c2
    if (pat === "checkerboard") { const s = 16; for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) if ((Math.floor(x / s) + Math.floor(y / s)) % 2 === 1) ctx.fillRect(x, y, s, s) }
    else if (pat === "dots") { const sp = 20; for (let y = sp / 2; y < h; y += sp) for (let x = sp / 2; x < w; x += sp) { ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill() } }
    else if (pat === "stripes") { for (let x = 0; x < w; x += 20) ctx.fillRect(x, 0, 10, h) }
  }
}

function compositeOverBg(fg: ImageData, opt: BgOption, c1: string, c2: string, gt: string, custom: string | null, pat: string): ImageData {
  const w = fg.width, h = fg.height
  const bg = document.createElement("canvas"); bg.width = w; bg.height = h
  const bctx = bg.getContext("2d")!; renderBg(bctx, w, h, opt, c1, c2, gt, custom, pat)
  const bgData = bctx.getImageData(0, 0, w, h)
  const out = new ImageData(w, h)
  for (let i = 0; i < w * h; i++) {
    const fi = i * 4, a = fg.data[fi + 3]
    if (a === 0) { out.data[fi] = bgData.data[fi]; out.data[fi + 1] = bgData.data[fi + 1]; out.data[fi + 2] = bgData.data[fi + 2]; out.data[fi + 3] = 255 }
    else if (a === 255) { out.data[fi] = fg.data[fi]; out.data[fi + 1] = fg.data[fi + 1]; out.data[fi + 2] = fg.data[fi + 2]; out.data[fi + 3] = 255 }
    else {
      const fa = a / 255, ba = 1 - fa
      out.data[fi] = Math.round(fg.data[fi] * fa + bgData.data[fi] * ba)
      out.data[fi + 1] = Math.round(fg.data[fi + 1] * fa + bgData.data[fi + 1] * ba)
      out.data[fi + 2] = Math.round(fg.data[fi + 2] * fa + bgData.data[fi + 2] * ba)
      out.data[fi + 3] = 255
    }
  }
  return out
}

function brushDab(data: Uint8ClampedArray, w: number, h: number, cx: number, cy: number, r: number, hardness: number, opacity: number, flow: number, erase: boolean) {
  const innerR = r * hardness
  const falloff = r - innerR
  const minX = Math.max(0, Math.floor(cx - r)), maxX = Math.min(w - 1, Math.ceil(cx + r))
  const minY = Math.max(0, Math.floor(cy - r)), maxY = Math.min(h - 1, Math.ceil(cy + r))
  const f = (opacity / 100) * (flow / 100)
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
      if (dist > r) continue
      const str = dist <= innerR ? 1 : 1 - (dist - innerR) / falloff
      const delta = Math.round(str * f * 255)
      const idx = (y * w + x) * 4 + 3
      if (erase) data[idx] = Math.max(0, data[idx] - delta)
      else data[idx] = Math.min(255, data[idx] + delta)
    }
  }
}

function floodFill(data: ImageData, sx: number, sy: number, threshold: number, setA: number): ImageData {
  const w = data.width, h = data.height
  const out = new ImageData(new Uint8ClampedArray(data.data), w, h)
  const startA = out.data[(sy * w + sx) * 4 + 3]
  if (startA === setA) return out
  const visited = new Uint8Array(w * h)
  const stack: [number, number][] = [[sx, sy]]
  while (stack.length > 0) {
    const [x, y] = stack.pop()!
    if (x < 0 || x >= w || y < 0 || y >= h) continue
    const idx = y * w + x
    if (visited[idx]) continue
    visited[idx] = 1
    const pi = idx * 4
    if (Math.abs(out.data[pi + 3] - startA) > threshold) continue
    out.data[pi + 3] = setA
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
  }
  return out
}

function cloneImageData(d: ImageData): ImageData {
  return new ImageData(new Uint8ClampedArray(d.data), d.width, d.height)
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col rounded-xl border border-border bg-card overflow-hidden", className)}>
      {children}
    </div>
  )
}

export function BackgroundRemover() {
  const [images, setImages] = React.useState<ImageItem[]>([])
  const [activeIdx, setActiveIdx] = React.useState(0)
  const [processing, setProcessing] = React.useState(false)
  const cancelledRef = React.useRef(false)

  const [activeTool, setActiveTool] = React.useState<ToolType>("none")
  const [brushCfg, setBrushCfg] = React.useState<BrushCfg>({ size: 30, hardness: 80, opacity: 100, flow: 100, spacing: 10 })
  const [brushThreshold, setBrushThreshold] = React.useState(30)

  const [maskView, setMaskView] = React.useState<MaskView>("normal")
  const [sliderPos, setSliderPos] = React.useState(50)
  const [showRightOriginal, setShowRightOriginal] = React.useState(false)

  const [bgOption, setBgOption] = React.useState<BgOption>("transparent")
  const [bgColor, setBgColor] = React.useState("#ffffff")
  const [bgColor2, setBgColor2] = React.useState("#e2e8f0")
  const [gradientType, setGradientType] = React.useState("linear-diagonal")
  const [blurRadius, setBlurRadius] = React.useState(10)
  const [customBg, setCustomBg] = React.useState<string | null>(null)
  const [patternType, setPatternType] = React.useState("checkerboard")
  const [featherRadius, setFeatherRadius] = React.useState(2)
  const [edgeRefine, setEdgeRefine] = React.useState(1)
  const [transparency, setTransparency] = React.useState(100)

  const [exportFormat, setExportFormat] = React.useState<"png" | "jpeg" | "webp">("png")
  const [exportQuality, setExportQuality] = React.useState(95)
  const [exporting, setExporting] = React.useState(false)

  const [history, setHistory] = React.useState<HistEntry[]>([])
  const [histIdx, setHistIdx] = React.useState(-1)

  const [leftZoom, setLeftZoom] = React.useState(1)
  const [leftPanX, setLeftPanX] = React.useState(0)
  const [leftPanY, setLeftPanY] = React.useState(0)
  const [rightZoom, setRightZoom] = React.useState(1)
  const [rightPanX, setRightPanX] = React.useState(0)
  const [rightPanY, setRightPanY] = React.useState(0)

  const [isDragging, setIsDragging] = React.useState(false)
  const brushDrawingRef = React.useRef(false)
  const panStartRef = React.useRef<{ x: number; y: number; panX: number; panY: number } | null>(null)
  const lastDabRef = React.useRef<{ x: number; y: number } | null>(null)

  const fileRef = React.useRef<HTMLInputElement>(null)
  const bgFileRef = React.useRef<HTMLInputElement>(null)
  const leftCanvasRef = React.useRef<HTMLCanvasElement>(null)
  const rightCanvasRef = React.useRef<HTMLCanvasElement>(null)
  const leftContainerRef = React.useRef<HTMLDivElement>(null)
  const rightContainerRef = React.useRef<HTMLDivElement>(null)
  const brushCursorRef = React.useRef<HTMLDivElement>(null)

  const [originalSrc, setOriginalSrc] = React.useState<string | null>(null)
  const [fgCanvasData, setFgCanvasData] = React.useState<{ canvas: HTMLCanvasElement; origW: number; origH: number } | null>(null)
  const [renderTick, setRenderTick] = React.useState(0)
  const resultBlobRef = React.useRef<string | null>(null)
  const fgCanvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const originalSrcRef = React.useRef<string | null>(null)

  const active = images[activeIdx]

  interface ImageItem {
    id: string; file: File; originalSrc: string; width: number; height: number
    processing: boolean; progress: number; error: string | null
  }

  const getFgCtx = React.useCallback(() => fgCanvasRef.current?.getContext("2d") || null, [])

  const tick = React.useCallback(() => setRenderTick(t => t + 1), [])

  React.useEffect(() => {
    const canvas = rightCanvasRef.current
    const fgCanvas = fgCanvasRef.current
    if (!canvas || !fgCanvas || !originalSrc) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const w = fgCanvas.width, h = fgCanvas.height
    canvas.width = w; canvas.height = h

    if (showRightOriginal) {
      const img = document.createElement("img")
      img.onload = () => ctx.drawImage(img, 0, 0, w, h)
      img.src = originalSrc
      return
    }

    if (maskView === "normal") {
      const fg = fgCanvas.getContext("2d")!.getImageData(0, 0, w, h)
      const composited = compositeOverBg(fg, bgOption, bgColor, bgColor2, gradientType, customBg, patternType)
      ctx.putImageData(composited, 0, 0)
    } else if (maskView === "mask") {
      const fg = fgCanvas.getContext("2d")!.getImageData(0, 0, w, h)
      const out = new ImageData(w, h)
      for (let i = 0; i < w * h; i++) {
        const a = fg.data[i * 4 + 3]
        out.data[i * 4] = a; out.data[i * 4 + 1] = a; out.data[i * 4 + 2] = a; out.data[i * 4 + 3] = 255
      }
      ctx.putImageData(out, 0, 0)
    } else if (maskView === "overlay") {
      const img = document.createElement("img")
      img.onload = () => {
        ctx.drawImage(img, 0, 0, w, h)
        const fg = fgCanvas.getContext("2d")!.getImageData(0, 0, w, h)
        const over = new ImageData(w, h)
        for (let i = 0; i < w * h; i++) {
          const fi = i * 4, a = fg.data[fi + 3]
          over.data[fi] = fg.data[fi]; over.data[fi + 1] = fg.data[fi + 1]; over.data[fi + 2] = fg.data[fi + 2]; over.data[fi + 3] = Math.round(a * 0.5)
        }
        ctx.putImageData(over, 0, 0)
      }
      img.src = originalSrc
    }
  }, [renderTick, maskView, bgOption, bgColor, bgColor2, gradientType, customBg, patternType, showRightOriginal, originalSrc, fgCanvasData])

  React.useEffect(() => {
    const canvas = leftCanvasRef.current
    if (!canvas || !originalSrc) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const img = document.createElement("img")
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height
      ctx.drawImage(img, 0, 0)
    }
    img.src = originalSrc
  }, [originalSrc, renderTick])

  const pushHistory = React.useCallback((name: string) => {
    const ctx = getFgCtx()
    if (!ctx || !fgCanvasRef.current) return
    const w = fgCanvasRef.current.width, h = fgCanvasRef.current.height
    const id = crypto.randomUUID()
    const data = ctx.getImageData(0, 0, w, h)
    setHistory(prev => {
      const t = prev.slice(0, histIdx + 1)
      const next = [...t, { id, name, data: cloneImageData(data), w, h }]
      return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next
    })
    setHistIdx(prev => Math.min(prev + 1, MAX_HISTORY - 1))
  }, [getFgCtx, histIdx])

  const addImage = React.useCallback((file: File) => {
    const err = validateFile(file)
    if (err) { toast.error(err); return }
    const id = crypto.randomUUID()
    const r = new FileReader()
    r.onload = (ev) => {
      const src = ev.target?.result as string
      const img = document.createElement("img")
      img.onload = () => {
        const item: ImageItem = { id, file, originalSrc: src, width: img.width, height: img.height, processing: true, progress: 0, error: null }
        const nextIdx = images.length
        setImages(prev => [...prev, item])
        setActiveIdx(nextIdx)
        processWithAI(file, nextIdx)
      }
      img.src = src
    }
    r.readAsDataURL(file)
  }, [images.length])

  const processWithAI = React.useCallback(async (file: File, idx: number) => {
    cancelledRef.current = false
    setProcessing(true)
    setImages(prev => prev.map((item, i) => i === idx ? { ...item, processing: true, progress: 0, error: null } : item))
    try {
      setImages(prev => prev.map((item, i) => i === idx ? { ...item, progress: 10 } : item))
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/remove-bg", { method: "POST", body: formData })
      if (cancelledRef.current) return
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }))
        throw new Error(err.error || "Background removal failed")
      }
      setImages(prev => prev.map((item, i) => i === idx ? { ...item, progress: 60 } : item))
      const blob = await res.blob()
      if (cancelledRef.current) return
      setImages(prev => prev.map((item, i) => i === idx ? { ...item, progress: 80 } : item))
      const url = URL.createObjectURL(blob)
      resultBlobRef.current = url

      const blobImg = document.createElement("img")
      blobImg.onload = () => {
        const c = document.createElement("canvas")
        c.width = blobImg.width; c.height = blobImg.height
        const ctx = c.getContext("2d")!
        ctx.drawImage(blobImg, 0, 0)
        fgCanvasRef.current = c

        const origUrl = URL.createObjectURL(file)
        originalSrcRef.current = origUrl
        setOriginalSrc(origUrl)
        setFgCanvasData({ canvas: c, origW: blobImg.width, origH: blobImg.height })

        setImages(prev => prev.map((item, i) => i === idx ? { ...item, width: blobImg.width, height: blobImg.height, processing: false, progress: 100 } : item))
        setProcessing(false)
        setHistory([])
        setHistIdx(-1)

        const data = ctx.getImageData(0, 0, c.width, c.height)
        setHistory([{ id: crypto.randomUUID(), name: "Initial", data: cloneImageData(data), w: c.width, h: c.height }])
        setHistIdx(0)
        tick()
        toast.success("Background removed")
      }
      blobImg.src = url
    } catch (err: any) {
      if (err?.message === "Cancelled") return
      console.error(err)
      setImages(prev => prev.map((item, i) => i === idx ? { ...item, processing: false, error: "AI processing failed." } : item))
      setProcessing(false)
      toast.error("AI processing failed")
    }
  }, [tick])

  const fitZoom = React.useCallback((side: "left" | "right") => {
    const container = side === "left" ? leftContainerRef.current : rightContainerRef.current
    const fg = fgCanvasRef.current
    if (!container || !fg) return
    const cw = container.clientWidth - 32, ch = container.clientHeight - 32
    if (fg.width === 0 || fg.height === 0) return
    const z = Math.min(cw / fg.width, ch / fg.height, 2)
    if (side === "left") { setLeftZoom(z); setLeftPanX(0); setLeftPanY(0) }
    else { setRightZoom(z); setRightPanX(0); setRightPanY(0) }
  }, [])

  React.useEffect(() => {
    if (fgCanvasRef.current) { fitZoom("left"); fitZoom("right") }
  }, [fgCanvasData])

  const cancelProcessing = React.useCallback(() => {
    cancelledRef.current = true; setProcessing(false)
    setImages(prev => prev.map(item => ({ ...item, processing: false })))
    toast.info("Cancelled")
  }, [])

  const removeImage = React.useCallback((id: string) => {
    setImages(prev => {
      const idx = prev.findIndex(i => i.id === id)
      const next = prev.filter(i => i.id !== id)
      if (next.length === 0) { setActiveIdx(0); fgCanvasRef.current = null; originalSrcRef.current = null; setOriginalSrc(null); setFgCanvasData(null); setHistory([]); setHistIdx(-1) }
      else if (idx <= activeIdx && activeIdx > 0) setActiveIdx(a => a - 1)
      else if (activeIdx >= next.length) setActiveIdx(next.length - 1)
      return next
    })
  }, [activeIdx])

  const handleFileInput = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files || []).forEach(f => addImage(f))
    if (e.target) e.target.value = ""
  }, [addImage])

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/")).forEach(f => addImage(f))
  }, [addImage])

  const handlePaste = React.useCallback(async () => {
    try {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith("image/")) {
            const blob = await item.getType(type)
            addImage(new File([blob], `pasted.${type.split("/")[1]}`, { type }))
            return
          }
        }
      }
      toast.error("No image in clipboard")
    } catch { toast.error("No image in clipboard") }
  }, [addImage])

  const reprocess = React.useCallback(async () => {
    if (!active?.file) return
    fgCanvasRef.current = null; originalSrcRef.current = null; setOriginalSrc(null); setFgCanvasData(null); setHistory([]); setHistIdx(-1)
    pushHistory("Initial")
    await processWithAI(active.file, activeIdx)
  }, [active, activeIdx, processWithAI, pushHistory])

  const applyBrushDab = React.useCallback((cx: number, cy: number) => {
    const ctx = getFgCtx()
    const fg = fgCanvasRef.current
    if (!ctx || !fg) return
    const w = fg.width, h = fg.height
    const data = ctx.getImageData(0, 0, w, h)
    brushDab(data.data, w, h, cx, cy, brushCfg.size / 2, brushCfg.hardness / 100, brushCfg.opacity, brushCfg.flow, activeTool === "brush")
    ctx.putImageData(data, 0, 0)
    tick()
  }, [getFgCtx, brushCfg, activeTool, tick])

  const drawBrushLine = React.useCallback((x1: number, y1: number, x2: number, y2: number) => {
    const spacing = Math.max(1, brushCfg.spacing)
    const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
    const steps = Math.max(1, Math.floor(dist / spacing))
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t
      applyBrushDab(x, y)
    }
  }, [brushCfg.spacing, applyBrushDab])

  const mouseToCanvas = React.useCallback((e: React.MouseEvent, side: "left" | "right") => {
    const canvas = side === "left" ? leftCanvasRef.current : rightCanvasRef.current
    const fg = fgCanvasRef.current
    if (!canvas || !fg) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = fg.width / rect.width, scaleY = fg.height / rect.height
    return { x: Math.floor((e.clientX - rect.left) * scaleX), y: Math.floor((e.clientY - rect.top) * scaleY) }
  }, [])

  const handleRightDown = React.useCallback((e: React.MouseEvent) => {
    if (activeTool === "brush" || activeTool === "restore") {
      brushDrawingRef.current = true
      const p = mouseToCanvas(e, "right")
      lastDabRef.current = p
      applyBrushDab(p.x, p.y)
    } else if (activeTool === "pan" || (activeTool === "none" && e.button === 1)) {
      panStartRef.current = { x: e.clientX, y: e.clientY, panX: rightPanX, panY: rightPanY }
    }
  }, [activeTool, mouseToCanvas, applyBrushDab, rightPanX, rightPanY])

  const handleRightMove = React.useCallback((e: React.MouseEvent) => {
    if ((activeTool === "brush" || activeTool === "restore") && brushDrawingRef.current) {
      const p = mouseToCanvas(e, "right")
      if (lastDabRef.current) drawBrushLine(lastDabRef.current.x, lastDabRef.current.y, p.x, p.y)
      else applyBrushDab(p.x, p.y)
      lastDabRef.current = p

      if (brushCursorRef.current) {
        brushCursorRef.current.style.left = `${e.clientX}px`
        brushCursorRef.current.style.top = `${e.clientY}px`
      }
    }
    if (panStartRef.current) {
      const dx = e.clientX - panStartRef.current.x, dy = e.clientY - panStartRef.current.y
      setRightPanX(panStartRef.current.panX + dx); setRightPanY(panStartRef.current.panY + dy)
    }
  }, [activeTool, mouseToCanvas, drawBrushLine, applyBrushDab])

  const handleRightUp = React.useCallback(() => {
    if (brushDrawingRef.current && (activeTool === "brush" || activeTool === "restore")) {
      pushHistory(activeTool === "brush" ? "Brush stroke" : "Restore stroke")
    }
    brushDrawingRef.current = false; panStartRef.current = null; lastDabRef.current = null
  }, [activeTool, pushHistory])

  const handleLeftDown = React.useCallback((e: React.MouseEvent) => {
    panStartRef.current = { x: e.clientX, y: e.clientY, panX: leftPanX, panY: leftPanY }
  }, [leftPanX, leftPanY])

  const handleLeftMove = React.useCallback((e: React.MouseEvent) => {
    if (panStartRef.current) {
      const dx = e.clientX - panStartRef.current.x, dy = e.clientY - panStartRef.current.y
      setLeftPanX(panStartRef.current.panX + dx); setLeftPanY(panStartRef.current.panY + dy)
    }
  }, [])

  const handleLeftUp = React.useCallback(() => { panStartRef.current = null }, [])

  const handleWheel = React.useCallback((e: React.WheelEvent, side: "left" | "right") => {
    e.preventDefault()
    const factor = e.deltaY > 0 ? 0.9 : 1.1
    if (side === "left") setLeftZoom(z => Math.max(0.1, Math.min(10, z * factor)))
    else setRightZoom(z => Math.max(0.1, Math.min(10, z * factor)))
  }, [])

  const applyFeather = React.useCallback(() => {
    const ctx = getFgCtx(); if (!ctx || !fgCanvasRef.current) return
    const w = fgCanvasRef.current.width, h = fgCanvasRef.current.height
    const data = ctx.getImageData(0, 0, w, h)
    const alpha = new Float32Array(w * h)
    for (let i = 0; i < w * h; i++) alpha[i] = data.data[i * 4 + 3]
    const blurred = gaussBlurAlpha(alpha, w, h, featherRadius)
    for (let i = 0; i < w * h; i++) data.data[i * 4 + 3] = Math.round(blurred[i])
    ctx.putImageData(data, 0, 0)
    pushHistory("Feather"); tick()
  }, [getFgCtx, featherRadius, pushHistory, tick])

  const applyDilate = React.useCallback(() => {
    const ctx = getFgCtx(); if (!ctx || !fgCanvasRef.current) return
    const w = fgCanvasRef.current.width, h = fgCanvasRef.current.height
    const data = ctx.getImageData(0, 0, w, h)
    const out = new ImageData(new Uint8ClampedArray(data.data), w, h)
    const r = Math.max(1, edgeRefine)
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let m = 0; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const px = x + dx, py = y + dy; if (px >= 0 && px < w && py >= 0 && py < h) m = Math.max(m, data.data[(py * w + px) * 4 + 3]) }
      out.data[(y * w + x) * 4 + 3] = m
    }
    ctx.putImageData(out, 0, 0); pushHistory("Expand edge"); tick()
  }, [getFgCtx, edgeRefine, pushHistory, tick])

  const applyErode = React.useCallback(() => {
    const ctx = getFgCtx(); if (!ctx || !fgCanvasRef.current) return
    const w = fgCanvasRef.current.width, h = fgCanvasRef.current.height
    const data = ctx.getImageData(0, 0, w, h)
    const out = new ImageData(new Uint8ClampedArray(data.data), w, h)
    const r = Math.max(1, edgeRefine)
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let m = 255; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const px = x + dx, py = y + dy; if (px >= 0 && px < w && py >= 0 && py < h) m = Math.min(m, data.data[(py * w + px) * 4 + 3]) }
      out.data[(y * w + x) * 4 + 3] = m
    }
    ctx.putImageData(out, 0, 0); pushHistory("Shrink edge"); tick()
  }, [getFgCtx, edgeRefine, pushHistory, tick])

  const applyTransparency = React.useCallback(() => {
    const ctx = getFgCtx(); if (!ctx || !fgCanvasRef.current) return
    const w = fgCanvasRef.current.width, h = fgCanvasRef.current.height
    const data = ctx.getImageData(0, 0, w, h)
    const f = transparency / 100
    for (let i = 0; i < data.data.length; i += 4) data.data[i + 3] = Math.round(data.data[i + 3] * f)
    ctx.putImageData(data, 0, 0); pushHistory("Opacity"); tick()
  }, [getFgCtx, transparency, pushHistory, tick])

  const applyCrop = React.useCallback(() => {
    const ctx = getFgCtx(); if (!ctx || !fgCanvasRef.current) return
    const w = fgCanvasRef.current.width, h = fgCanvasRef.current.height
    const data = ctx.getImageData(0, 0, w, h)
    const b = computeAlphaBounds(data)
    if (!b) { toast.error("No content to crop"); return }
    const pad = 2, cx = Math.max(0, b.l - pad), cy = Math.max(0, b.t - pad)
    const cw = Math.min(w - cx, b.r - b.l + pad * 2), ch = Math.min(h - cy, b.b - b.t + pad * 2)
    if (cw <= 0 || ch <= 0) { toast.error("Nothing to crop"); return }
    const c = document.createElement("canvas"); c.width = cw; c.height = ch
    const cctx = c.getContext("2d")!; cctx.drawImage(fgCanvasRef.current, cx, cy, cw, ch, 0, 0, cw, ch)
    fgCanvasRef.current.width = cw; fgCanvasRef.current.height = ch
    ctx.drawImage(c, 0, 0)
    pushHistory("Crop"); tick(); fitZoom("left"); fitZoom("right")
    toast.success("Cropped")
  }, [getFgCtx, pushHistory, tick, fitZoom])

  const applyRotate = React.useCallback((cw: boolean) => {
    const fg = fgCanvasRef.current; if (!fg) return
    const ctx = fg.getContext("2d")!; const w = fg.width, h = fg.height
    const c = document.createElement("canvas"); c.width = h; c.height = w
    const cctx = c.getContext("2d")!
    cctx.translate(h / 2, w / 2); cctx.rotate(cw ? Math.PI / 2 : -Math.PI / 2)
    cctx.drawImage(fg, -w / 2, -h / 2)
    fg.width = h; fg.height = w
    fg.getContext("2d")!.drawImage(c, 0, 0)
    pushHistory(`Rotate ${cw ? "R" : "L"}`); tick(); fitZoom("left"); fitZoom("right")
  }, [pushHistory, tick, fitZoom])

  const applyFlip = React.useCallback((horizontal: boolean) => {
    const fg = fgCanvasRef.current; if (!fg) return
    const ctx = fg.getContext("2d")!
    const w = fg.width, h = fg.height
    const temp = ctx.getImageData(0, 0, w, h)
    ctx.clearRect(0, 0, w, h); ctx.save()
    ctx.translate(horizontal ? w : 0, horizontal ? 0 : h)
    ctx.scale(horizontal ? -1 : 1, horizontal ? 1 : -1)
    const tc = document.createElement("canvas"); tc.width = w; tc.height = h
    tc.getContext("2d")!.putImageData(temp, 0, 0)
    ctx.drawImage(tc, 0, 0); ctx.restore()
    pushHistory(horizontal ? "Flip H" : "Flip V"); tick()
  }, [pushHistory, tick])

  const applyMagicEraser = React.useCallback((x: number, y: number) => {
    const ctx = getFgCtx(); if (!ctx || !fgCanvasRef.current) return
    const data = ctx.getImageData(0, 0, fgCanvasRef.current.width, fgCanvasRef.current.height)
    const result = floodFill(data, x, y, brushThreshold, 0)
    ctx.putImageData(result, 0, 0)
    pushHistory("Magic erase"); tick()
    toast.success("Area erased")
  }, [getFgCtx, brushThreshold, pushHistory, tick])

  const undo = React.useCallback(() => {
    if (histIdx <= 0 || !fgCanvasRef.current) return
    const ni = histIdx - 1
    const entry = history[ni]
    const ctx = fgCanvasRef.current.getContext("2d")!
    fgCanvasRef.current.width = entry.w; fgCanvasRef.current.height = entry.h
    ctx.putImageData(entry.data, 0, 0)
    setHistIdx(ni)
    tick(); fitZoom("left"); fitZoom("right")
  }, [histIdx, history, tick, fitZoom])

  const redo = React.useCallback(() => {
    if (histIdx >= history.length - 1 || !fgCanvasRef.current) return
    const ni = histIdx + 1
    const entry = history[ni]
    const ctx = fgCanvasRef.current.getContext("2d")!
    fgCanvasRef.current.width = entry.w; fgCanvasRef.current.height = entry.h
    ctx.putImageData(entry.data, 0, 0)
    setHistIdx(ni)
    tick(); fitZoom("left"); fitZoom("right")
  }, [histIdx, history, tick, fitZoom])

  const jumpToHistory = React.useCallback((idx: number) => {
    if (idx < 0 || idx >= history.length || !fgCanvasRef.current) return
    const entry = history[idx]
    const ctx = fgCanvasRef.current.getContext("2d")!
    fgCanvasRef.current.width = entry.w; fgCanvasRef.current.height = entry.h
    ctx.putImageData(entry.data, 0, 0)
    setHistIdx(idx)
    tick(); fitZoom("left"); fitZoom("right")
  }, [history, tick, fitZoom])

  const reset = React.useCallback(() => {
    if (history.length === 0 || !fgCanvasRef.current) return
    const entry = history[0]
    const ctx = fgCanvasRef.current.getContext("2d")!
    fgCanvasRef.current.width = entry.w; fgCanvasRef.current.height = entry.h
    ctx.putImageData(entry.data, 0, 0)
    setHistIdx(0)
    tick(); fitZoom("left"); fitZoom("right")
    toast.success("Reset to initial")
  }, [history, tick, fitZoom])

  const handleExport = React.useCallback(async () => {
    if (!fgCanvasRef.current) { toast.error("No image to export"); return }
    setExporting(true)
    try {
      const fg = fgCanvasRef.current
      const w = fg.width, h = fg.height
      const c = document.createElement("canvas"); c.width = w; c.height = h
      const ctx = c.getContext("2d")!
      if (bgOption !== "transparent") {
        const bc = document.createElement("canvas"); bc.width = w; bc.height = h
        const bctx = bc.getContext("2d")!
        renderBg(bctx, w, h, bgOption, bgColor, bgColor2, gradientType, customBg, patternType)
        ctx.drawImage(bc, 0, 0)
      }
      ctx.drawImage(fg, 0, 0)
      const mime = exportFormat === "png" ? "image/png" : exportFormat === "jpeg" ? "image/jpeg" : "image/webp"
      const blob = await new Promise<Blob | null>(res => c.toBlob(res, mime, exportQuality / 100))
      if (!blob) { toast.error("Export failed"); return }
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.download = `edited.${exportFormat === "jpeg" ? "jpg" : exportFormat}`
      a.href = url; a.click()
      URL.revokeObjectURL(url)
      toast.success(`Downloaded as ${exportFormat.toUpperCase()}`)
    } catch { toast.error("Export failed") }
    finally { setExporting(false) }
  }, [exportFormat, exportQuality, bgOption, bgColor, bgColor2, gradientType, customBg, patternType])

  React.useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo() }
      if (e.ctrlKey && e.key === "z" && e.shiftKey) { e.preventDefault(); redo() }
      if (e.ctrlKey && e.key === "y") { e.preventDefault(); redo() }
      if (e.ctrlKey && e.key === "s") { e.preventDefault(); handleExport() }
      if (e.key === "b") setActiveTool(prev => prev === "brush" ? "none" : "brush")
      if (e.key === "e") setActiveTool(prev => prev === "restore" ? "none" : "restore")
      if (e.key === "h") setActiveTool(prev => prev === "pan" ? "none" : "pan")
      if (e.key === "0") fitZoom("right")
      if (e.key === "1") { setRightZoom(1); setRightPanX(0); setRightPanY(0) }
      if (e.key === "r") applyRotate(true)
      if (e.key === "[") setBrushCfg(p => ({ ...p, size: Math.max(1, p.size - 5) }))
      if (e.key === "]") setBrushCfg(p => ({ ...p, size: Math.min(500, p.size + 5) }))
    }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [undo, redo, handleExport, fitZoom, applyRotate])

  React.useEffect(() => {
    const el = brushCursorRef.current
    if (!el || !fgCanvasRef.current) return
    const z = rightZoom
    const displaySize = brushCfg.size * z
    el.style.width = `${displaySize}px`
    el.style.height = `${displaySize}px`
    el.style.borderRadius = brushCfg.hardness >= 100 ? "50%" : `${brushCfg.hardness / 100 * 50}%`
  }, [brushCfg.size, brushCfg.hardness, rightZoom])

  if (!fgCanvasData || images.length === 0 || !originalSrc) {
    return (
      <div className="mx-auto max-w-5xl space-y-6" onDrop={handleDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)}>
        <Card className={cn("relative overflow-hidden border-dashed transition-all", isDragging && "border-primary bg-primary/5")}>
          <div className="flex flex-col items-center justify-center gap-4 py-24 sm:py-32">
            <motion.div animate={isDragging ? { scale: [1, 1.05, 1], rotate: [0, -3, 3, 0] } : {}} transition={{ duration: 0.4 }}
              className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 shadow-sm ring-1 ring-teal-500/10">
              <Sparkles className="h-10 w-10 text-teal-500" />
            </motion.div>
            <div className="space-y-1.5 text-center max-w-sm">
              <p className="text-lg font-semibold text-foreground">{isDragging ? "Drop images here" : "AI Background Remover"}</p>
              <p className="text-sm text-muted-foreground">
                Drop an image, <button onClick={() => fileRef.current?.click()} className="text-teal-500 underline underline-offset-4 decoration-teal-500/30 hover:decoration-teal-500 font-medium">browse</button>, or paste
              </p>
              <p className="text-xs text-muted-foreground/60">JPG, PNG, WEBP, HEIC, AVIF — up to 50 MB</p>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={() => fileRef.current?.click()}><Upload className="h-4 w-4" /> Choose Image</Button>
              <Button variant="outline" size="sm" onClick={handlePaste}><FileImage className="h-4 w-4" /> Paste</Button>
            </div>
          </div>
        </Card>
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileInput} className="hidden" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-3" onDrop={handleDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)}>
      <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileInput} className="hidden" />
      <input ref={bgFileRef} type="file" accept="image/*" onChange={e => {
        const f = e.target.files?.[0]
        if (f) { const r = new FileReader(); r.onload = ev => setCustomBg(ev.target?.result as string); r.readAsDataURL(f) }
      }} className="hidden" />

      <Card className="p-2 sm:p-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-2 mr-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500/20 to-emerald-500/20 shadow-sm">
              <Sparkles className="h-4 w-4 text-teal-500" />
            </div>
            <span className="text-sm font-bold text-foreground hidden sm:inline">Editor</span>
          </div>
          <div className="w-px h-6 bg-border mx-1" />
          <TBtn icon={<Brush className="h-3.5 w-3.5" />} label="Brush" tip="B" active={activeTool === "brush"} onClick={() => setActiveTool(activeTool === "brush" ? "none" : "brush")} />
          <TBtn icon={<Eraser className="h-3.5 w-3.5" />} label="Restore" tip="E" active={activeTool === "restore"} onClick={() => setActiveTool(activeTool === "restore" ? "none" : "restore")} />
          <TBtn icon={<Pointer className="h-3.5 w-3.5" />} label="Pan" tip="H" active={activeTool === "pan"} onClick={() => setActiveTool(activeTool === "pan" ? "none" : "pan")} />
          <div className="w-px h-6 bg-border mx-1" />
          <TBtn icon={<Undo2 className="h-3.5 w-3.5" />} label="Undo" tip="^Z" disabled={histIdx <= 0} onClick={undo} />
          <TBtn icon={<Redo2 className="h-3.5 w-3.5" />} label="Redo" tip="^Y" disabled={histIdx >= history.length - 1} onClick={redo} />
          <TBtn icon={<RefreshCw className="h-3.5 w-3.5" />} label="Reset" onClick={reset} />
          <TBtn icon={<Crop className="h-3.5 w-3.5" />} label="Crop" onClick={applyCrop} />
          <TBtn icon={<RotateCcw className="h-3.5 w-3.5" />} label="Rot L" onClick={() => applyRotate(false)} />
          <TBtn icon={<RotateCw className="h-3.5 w-3.5" />} label="Rot R" tip="R" onClick={() => applyRotate(true)} />
          <TBtn icon={<FlipHorizontal className="h-3.5 w-3.5" />} label="Flip H" onClick={() => applyFlip(true)} />
          <TBtn icon={<FlipVertical className="h-3.5 w-3.5" />} label="Flip V" onClick={() => applyFlip(false)} />
          <div className="w-px h-6 bg-border mx-1" />
          <TBtn icon={<Maximize2 className="h-3.5 w-3.5" />} label="Fit" tip="0" onClick={() => fitZoom("right")} />
          <TBtn icon={<Expand className="h-3.5 w-3.5" />} label="1:1" tip="1" onClick={() => { setRightZoom(1); setRightPanX(0); setRightPanY(0) }} />
          <div className="w-px h-6 bg-border mx-1" />
          {images.length > 1 && <TBtn icon={<Trash2 className="h-3.5 w-3.5" />} label="Close" onClick={() => removeImage(images[activeIdx]?.id)} className="text-destructive" />}
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={handlePaste}><FileImage className="h-3.5 w-3.5" /></Button>
            <Button variant="ghost" size="sm" onClick={reprocess}><RefreshCw className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </Card>

      {active?.error && (
        <Card className="border-destructive/30 bg-destructive/5 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-destructive"><AlertTriangle className="h-4 w-4" /><span>{active.error}</span></div>
            <Button variant="outline" size="sm" onClick={reprocess}><RefreshCw className="h-4 w-4" /> Retry</Button>
          </div>
        </Card>
      )}

      <div className="flex gap-3" style={{ height: "calc(100vh - 240px)", minHeight: 420 }}>
        <Panel className="flex-1 min-w-0">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/20">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5"><Image className="h-3 w-3" /> Original</span>
            <div className="flex items-center gap-1">
              <button onClick={() => fitZoom("left")} className="p-0.5 rounded text-muted-foreground hover:text-foreground"><Maximize2 className="h-3 w-3" /></button>
              <button onClick={() => { setLeftZoom(1); setLeftPanX(0); setLeftPanY(0) }} className="p-0.5 rounded text-muted-foreground hover:text-foreground"><Expand className="h-3 w-3" /></button>
            </div>
          </div>
          <div ref={leftContainerRef} className="flex-1 flex items-center justify-center overflow-hidden bg-muted/20 relative" onWheel={e => handleWheel(e, "left")}>
            <canvas ref={leftCanvasRef}
              onMouseDown={handleLeftDown}
              onMouseMove={handleLeftMove}
              onMouseUp={handleLeftUp}
              onMouseLeave={handleLeftUp}
              style={{ transform: `translate(${leftPanX}px, ${leftPanY}px) scale(${leftZoom})`, transformOrigin: "center center", maxWidth: "none" }}
              className="rounded"
            />
          </div>
          <div className="px-3 py-1 border-t border-border bg-muted/20 text-[10px] text-muted-foreground text-right">
            {fgCanvasData?.canvas?.width ?? 0}×{fgCanvasData?.canvas?.height ?? 0} &middot; {Math.round(leftZoom * 100)}%
          </div>
        </Panel>

        <Panel className="flex-[1.3] min-w-0">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-muted/20">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5"><Layers className="h-3 w-3" /> Result</span>
              <div className="flex items-center gap-0.5 ml-2">
                {(["normal", "mask", "overlay", "split"] as MaskView[]).map(m => (
                  <button key={m} onClick={() => { setMaskView(m); setShowRightOriginal(false) }}
                    className={cn("px-1.5 py-0.5 text-[9px] font-medium rounded transition-all uppercase tracking-wider",
                      maskView === m && !showRightOriginal ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>
                    {m === "normal" ? "Result" : m === "mask" ? "Mask" : m === "overlay" ? "Overlay" : "Split"}
                  </button>
                ))}
                <button onClick={() => setShowRightOriginal(!showRightOriginal)}
                  className={cn("px-1.5 py-0.5 text-[9px] font-medium rounded transition-all uppercase tracking-wider",
                    showRightOriginal ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground")}>
                  Original
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => fitZoom("right")} className="p-0.5 rounded text-muted-foreground hover:text-foreground"><Maximize2 className="h-3 w-3" /></button>
              <button onClick={() => { setRightZoom(1); setRightPanX(0); setRightPanY(0) }} className="p-0.5 rounded text-muted-foreground hover:text-foreground"><Expand className="h-3 w-3" /></button>
            </div>
          </div>
          <div ref={rightContainerRef} className="flex-1 flex items-center justify-center overflow-hidden bg-muted/20 relative" onWheel={e => handleWheel(e, "right")}
            onMouseDown={handleRightDown}
            onMouseMove={handleRightMove}
            onMouseUp={handleRightUp}
            onMouseLeave={handleRightUp}>
            <canvas ref={rightCanvasRef}
              style={{ transform: `translate(${rightPanX}px, ${rightPanY}px) scale(${rightZoom})`, transformOrigin: "center center", maxWidth: "none" }}
              className={cn("rounded", (activeTool === "brush" || activeTool === "restore") ? "cursor-none" : "")}
            />
            {(activeTool === "brush" || activeTool === "restore") && (
              <div ref={brushCursorRef}
                className="absolute pointer-events-none border-2 rounded-full z-10"
                style={{
                  borderColor: activeTool === "brush" ? "rgba(239,68,68,0.7)" : "rgba(34,197,94,0.7)",
                  backgroundColor: activeTool === "brush" ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
                  transform: "translate(-50%, -50%)",
                  width: brushCfg.size * rightZoom,
                  height: brushCfg.size * rightZoom,
                  borderRadius: brushCfg.hardness >= 100 ? "50%" : `${brushCfg.hardness / 100 * 50}%`,
                }}
              />
            )}
            {maskView === "split" && !showRightOriginal && (
              <div className="absolute inset-0 z-10 pointer-events-none">
                <div className="absolute h-full w-0.5 bg-white shadow-lg z-20"
                  style={{ left: `${sliderPos}%`, transform: "translateX(-50%)", top: 0 }}>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center border border-primary">
                    <ArrowLeftRightIcon className="h-3 w-3 text-primary" />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="px-3 py-1 border-t border-border bg-muted/20 text-[10px] text-muted-foreground flex justify-between items-center">
            <span>{fgCanvasData?.canvas?.width ?? 0}×{fgCanvasData?.canvas?.height ?? 0} &middot; {Math.round(rightZoom * 100)}%</span>
            <span className="text-[10px] text-muted-foreground">Hist: {histIdx + 1}/{history.length}</span>
          </div>
        </Panel>

        <Panel className="w-56 shrink-0 overflow-y-auto">
          <div className="px-3 py-2 border-b border-border bg-muted/20">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5"><Sliders className="h-3 w-3" /> Tools</span>
          </div>

          {activeTool === "brush" || activeTool === "restore" ? (
            <div className="space-y-3 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Mode</span>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button onClick={() => setActiveTool("brush")} className={cn("px-2.5 py-1 text-[10px] font-medium", activeTool === "brush" ? "bg-destructive/10 text-destructive" : "text-muted-foreground")}>Erase</button>
                  <button onClick={() => setActiveTool("restore")} className={cn("px-2.5 py-1 text-[10px] font-medium", activeTool === "restore" ? "bg-emerald-500/10 text-emerald-500" : "text-muted-foreground")}>Restore</button>
                </div>
              </div>
              <Slider label="Size" value={brushCfg.size} min={1} max={500} step={1} onChange={v => setBrushCfg(p => ({ ...p, size: v }))} />
              <Slider label="Hardness" value={brushCfg.hardness} min={0} max={100} step={1} onChange={v => setBrushCfg(p => ({ ...p, hardness: v }))} />
              <Slider label="Opacity" value={brushCfg.opacity} min={1} max={100} step={1} onChange={v => setBrushCfg(p => ({ ...p, opacity: v }))} />
              <Slider label="Flow" value={brushCfg.flow} min={1} max={100} step={1} onChange={v => setBrushCfg(p => ({ ...p, flow: v }))} />
              <Slider label="Spacing" value={brushCfg.spacing} min={1} max={100} step={1} onChange={v => setBrushCfg(p => ({ ...p, spacing: v }))} />
            </div>
          ) : activeTool === "pan" ? (
            <div className="p-3 text-xs text-muted-foreground">
              <p>Drag to pan</p>
              <p className="mt-1">Middle-click or hold H</p>
            </div>
          ) : (
            <div className="p-3 text-xs text-muted-foreground">
              <p>Select a tool above</p>
              <div className="mt-2 space-y-1 text-[10px]">
                <p><kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">B</kbd> Brush</p>
                <p><kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">E</kbd> Restore</p>
                <p><kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">H</kbd> Pan</p>
                <p><kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">[ ]</kbd> Brush size</p>
                <p><kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">^Z</kbd> Undo</p>
                <p><kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">^Y</kbd> Redo</p>
                <p><kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">^S</kbd> Export</p>
                <p><kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">0</kbd> Fit screen</p>
                <p><kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">1</kbd> Actual size</p>
              </div>
            </div>
          )}

          <div className="border-t border-border mt-2">
            <PopBtn2 icon={<Sliders className="h-3 w-3" />} label="Refine">
              <div className="space-y-2.5 p-3 w-52">
                <div><label className="text-[10px] text-muted-foreground">Feather: {featherRadius}px</label><input type="range" min="0" max="10" value={featherRadius} onChange={e => setFeatherRadius(Number(e.target.value))} className="w-full accent-primary" /></div>
                <Button size="sm" variant="outline" fullWidth onClick={applyFeather}>Apply Feather</Button>
                <div><label className="text-[10px] text-muted-foreground">Edge: {edgeRefine}px</label><input type="range" min="1" max="10" value={edgeRefine} onChange={e => setEdgeRefine(Number(e.target.value))} className="w-full accent-primary" /></div>
                <div className="flex gap-2"><Button size="sm" variant="outline" onClick={applyDilate}>Expand</Button><Button size="sm" variant="outline" onClick={applyErode}>Shrink</Button></div>
                <div><label className="text-[10px] text-muted-foreground">Opacity: {transparency}%</label><input type="range" min="0" max="100" value={transparency} onChange={e => setTransparency(Number(e.target.value))} className="w-full accent-primary" /></div>
                <Button size="sm" variant="outline" fullWidth onClick={applyTransparency}>Apply Opacity</Button>
              </div>
            </PopBtn2>
            <PopBtn2 icon={<PaintBucket className="h-3 w-3" />} label="Background">
              <div className="space-y-2 p-3 min-w-[210px]">
                <div className="flex flex-wrap gap-1">
                  {(["transparent", "solid", "gradient", "blur", "custom", "pattern"] as BgOption[]).map(opt => (
                    <button key={opt} onClick={() => setBgOption(opt)} className={cn("px-2 py-1 text-[9px] font-medium rounded border transition-all", bgOption === opt ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>
                {bgOption === "solid" && <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-7 rounded cursor-pointer" />}
                {bgOption === "gradient" && (
                  <div className="space-y-1.5">
                    <div className="flex gap-2 items-center"><input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="h-6 w-6 rounded cursor-pointer" /><input type="color" value={bgColor2} onChange={e => setBgColor2(e.target.value)} className="h-6 w-6 rounded cursor-pointer" /></div>
                    <select value={gradientType} onChange={e => setGradientType(e.target.value)} className="w-full rounded border border-border bg-background px-2 py-1 text-[10px]">
                      <option value="linear-diagonal">Diagonal</option><option value="linear-top">Top-Bottom</option><option value="linear-right">Left-Right</option><option value="radial">Radial</option>
                    </select>
                  </div>
                )}
                {bgOption === "blur" && <div><label className="text-[10px] text-muted-foreground">Blur: {blurRadius}px</label><input type="range" min="2" max="50" value={blurRadius} onChange={e => setBlurRadius(Number(e.target.value))} className="w-full accent-primary" /></div>}
                {bgOption === "custom" && (
                  <div className="flex gap-2 items-center">
                    <Button variant="outline" size="sm" onClick={() => bgFileRef.current?.click()}>Upload</Button>
                    {customBg && <div className="h-7 w-7 rounded border overflow-hidden shrink-0"><img src={customBg} className="h-full w-full object-cover" /></div>}
                  </div>
                )}
                {bgOption === "pattern" && (
                  <div className="space-y-1.5">
                    <select value={patternType} onChange={e => setPatternType(e.target.value)} className="w-full rounded border border-border bg-background px-2 py-1 text-[10px]">
                      <option value="checkerboard">Checkerboard</option><option value="dots">Dots</option><option value="stripes">Stripes</option>
                    </select>
                    <div className="flex gap-2 items-center"><input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="h-6 w-6 rounded cursor-pointer" /><input type="color" value={bgColor2} onChange={e => setBgColor2(e.target.value)} className="h-6 w-6 rounded cursor-pointer" /></div>
                  </div>
                )}
              </div>
            </PopBtn2>
            <PopBtn2 icon={<Download className="h-3 w-3" />} label="Export">
              <div className="space-y-2.5 p-3 min-w-[180px]">
                <div className="flex gap-1">
                  {(["png", "jpeg", "webp"] as const).map(fmt => (
                    <button key={fmt} onClick={() => setExportFormat(fmt)} className={cn("flex-1 px-2 py-1 text-[10px] font-medium rounded border transition-all", exportFormat === fmt ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}>{fmt.toUpperCase()}</button>
                  ))}
                </div>
                {exportFormat !== "png" && <div><label className="text-[10px] text-muted-foreground">Quality: {exportQuality}%</label><input type="range" min="50" max="100" value={exportQuality} onChange={e => setExportQuality(Number(e.target.value))} className="w-full accent-primary" /></div>}
                {exportFormat === "jpeg" && bgOption === "transparent" && <p className="text-[9px] text-amber-500">JPEG no transparency. White bg.</p>}
                <Button variant="primary" size="sm" fullWidth onClick={handleExport} disabled={exporting}>
                  {exporting ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Exporting...</> : <><Download className="h-3.5 w-3.5" /> Download</>}
                </Button>
              </div>
            </PopBtn2>
          </div>

          <div className="px-3 py-2 border-t border-border bg-muted/20">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5"><History className="h-3 w-3" /> History</span>
          </div>
          <div className="max-h-48 overflow-y-auto p-2 space-y-0.5">
            {history.map((entry, i) => (
              <button key={entry.id} onClick={() => jumpToHistory(i)}
                className={cn("w-full text-left px-2 py-1 rounded text-[10px] transition-colors truncate",
                  i === histIdx ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-accent")}>
                {entry.name}
              </button>
            ))}
            {history.length === 0 && <p className="text-[10px] text-muted-foreground px-2 py-1">No edits yet</p>}
          </div>
        </Panel>
      </div>

      <AnimatePresence>
        {(active?.processing || processing) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground"><RefreshCw className="h-4 w-4 animate-spin text-teal-500" /> Processing with Remove.bg AI...</div>
            <div className="h-2 w-72 overflow-hidden rounded-full bg-muted">
              <motion.div initial={{ width: 0 }} animate={{ width: `${active?.progress || 0}%` }} transition={{ duration: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500" />
            </div>
            <span className="text-xs text-muted-foreground">{active?.progress || 0}%</span>
            <Button variant="outline" size="sm" onClick={cancelProcessing}><X className="h-4 w-4" /> Cancel</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TBtn({ icon, label, tip, active, disabled, onClick, className }: {
  icon: React.ReactNode; label: string; tip?: string; active?: boolean; disabled?: boolean; onClick?: () => void; className?: string
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={cn("flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium transition-all border",
        active ? "border-primary/20 bg-primary/10 text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent",
        disabled && "opacity-40 cursor-not-allowed", className)}>
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {tip && <span className="text-[8px] text-muted-foreground/50 ml-0.5 hidden sm:inline">{tip}</span>}
    </button>
  )
}

function PopBtn2({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h)
  }, [])
  return (
    <div ref={ref} className="relative border-b border-border last:border-b-0">
      <button onClick={() => setOpen(!open)}
        className={cn("flex w-full items-center gap-2 px-3 py-2 text-[10px] font-medium transition-all",
          open ? "bg-primary/5 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
        {icon}<span>{label}</span>
        <span className="ml-auto">{open ? "▲" : "▼"}</span>
      </button>
      <AnimatePresence>{open && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.15 }} className="overflow-hidden">{children}</motion.div>}</AnimatePresence>
    </div>
  )
}

function Slider({ label, value, min, max, step, onChange }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void
}) {
  const id = React.useId()
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[10px] text-muted-foreground">{label}</label>
        <span className="text-[10px] text-foreground font-mono tabular-nums">{value}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-muted accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md" />
    </div>
  )
}

function ArrowLeftRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m21 16-4 4-4-4" /><path d="M17 20V4" /><path d="m3 8 4-4 4 4" /><path d="M7 4v16" />
    </svg>
  )
}
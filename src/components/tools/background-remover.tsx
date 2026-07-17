"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, RefreshCw, Sparkles,
  Scissors, RotateCw, RotateCcw, FlipHorizontal, FlipVertical,
  Undo2, Redo2, Trash2, ZoomIn, ZoomOut, Maximize2, Expand,
  Brush, Eraser, Sliders, PaintBucket, X, AlertTriangle, FileImage, Plus,
} from "lucide-react"

const SUPPORTED_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".avif"]
const MAX_FILE_SIZE = 50 * 1024 * 1024
const MAX_HISTORY = 30

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

function validateFile(file: File): string | null {
  const ext = "." + file.name.split(".").pop()?.toLowerCase()
  if (!SUPPORTED_EXTS.includes(ext)) return `Unsupported format: ${ext}. Use JPG, PNG, WEBP, HEIC, or AVIF.`
  if (file.size > MAX_FILE_SIZE) return `Image too large: ${fmtSize(file.size)}. Maximum is 50 MB.`
  return null
}

type BgOption = "transparent" | "solid" | "gradient" | "blur" | "custom" | "pattern"
type BrushMode = "erase" | "restore"

interface HistoryEntry {
  data: ImageData
  width: number
  height: number
}

interface ImageItem {
  id: string
  file: File
  originalSrc: string
  resultBlobUrl: string | null
  width: number
  height: number
  processing: boolean
  progress: number
  error: string | null
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return { r, g, b }
}

function applyFloodFill(data: ImageData, sx: number, sy: number, threshold: number, setAlpha: number): ImageData {
  const w = data.width, h = data.height
  const out = new ImageData(new Uint8ClampedArray(data.data), w, h)
  const startA = out.data[(sy * w + sx) * 4 + 3]
  if (startA === setAlpha) return out
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
    out.data[pi + 3] = setAlpha
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
  }
  return out
}

function applyGaussianBlurAlpha(data: ImageData, radius: number): ImageData {
  const w = data.width, h = data.height
  const src = new Float32Array(data.data.buffer.slice(0))
  const dst = new Float32Array(w * h)
  const r = Math.max(1, radius), sigma = r / 2, size = r * 2 + 1
  const kernel = new Float32Array(size)
  let sum = 0
  for (let i = 0; i < size; i++) { const x = i - r; const v = Math.exp(-(x * x) / (2 * sigma * sigma)); kernel[i] = v; sum += v }
  for (let i = 0; i < size; i++) kernel[i] /= sum
  const temp = new Float32Array(w * h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let s = 0; for (let kx = 0; kx < size; kx++) { const px = x + kx - r; if (px >= 0 && px < w) s += src[(y * w + px) * 4 + 3] * kernel[kx] }; temp[y * w + x] = s }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let s = 0; for (let ky = 0; ky < size; ky++) { const py = y + ky - r; if (py >= 0 && py < h) s += temp[py * w + x] * kernel[ky] }; dst[y * w + x] = s }
  const out = new ImageData(w, h)
  for (let i = 0; i < w * h; i++) { out.data[i * 4] = src[i * 4]; out.data[i * 4 + 1] = src[i * 4 + 1]; out.data[i * 4 + 2] = src[i * 4 + 2]; out.data[i * 4 + 3] = Math.round(dst[i]) }
  return out
}

function applyDilateAlpha(data: ImageData, radius: number): ImageData {
  const w = data.width, h = data.height, r = Math.max(1, radius)
  const out = new ImageData(new Uint8ClampedArray(data.data), w, h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let m = 0; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const px = x + dx, py = y + dy; if (px >= 0 && px < w && py >= 0 && py < h) m = Math.max(m, data.data[(py * w + px) * 4 + 3]) }; out.data[(y * w + x) * 4 + 3] = m }
  return out
}

function applyErodeAlpha(data: ImageData, radius: number): ImageData {
  const w = data.width, h = data.height, r = Math.max(1, radius)
  const out = new ImageData(new Uint8ClampedArray(data.data), w, h)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let m = 255; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const px = x + dx, py = y + dy; if (px >= 0 && px < w && py >= 0 && py < h) m = Math.min(m, data.data[(py * w + px) * 4 + 3]) }; out.data[(y * w + x) * 4 + 3] = m }
  return out
}

function computeAlphaBounds(data: ImageData) {
  const w = data.width, h = data.height
  let t = -1, b = -1, l = -1, r = -1
  for (let y = 0; y < h && t === -1; y++) for (let x = 0; x < w; x++) if (data.data[(y * w + x) * 4 + 3] > 0) { t = y; break }
  if (t === -1) return null
  for (let y = h - 1; y >= 0 && b === -1; y--) for (let x = 0; x < w; x++) if (data.data[(y * w + x) * 4 + 3] > 0) { b = y; break }
  for (let x = 0; x < w && l === -1; x++) for (let y = 0; y < h; y++) if (data.data[(y * w + x) * 4 + 3] > 0) { l = x; break }
  for (let x = w - 1; x >= 0 && r === -1; x--) for (let y = 0; y < h; y++) if (data.data[(y * w + x) * 4 + 3] > 0) { r = x; break }
  return { top: t, left: l, bottom: b, right: r }
}

function renderBackgroundToCtx(ctx: CanvasRenderingContext2D, w: number, h: number, opt: BgOption, c1: string, c2: string, gradType: string, customSrc: string | null, pattern: string) {
  if (opt === "transparent") {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = "#e5e7eb"
    const s = 8
    for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) if ((Math.floor(x / s) + Math.floor(y / s)) % 2 === 1) ctx.fillRect(x, y, s, s)
  } else if (opt === "solid") { ctx.fillStyle = c1; ctx.fillRect(0, 0, w, h) }
  else if (opt === "gradient") {
    let g: CanvasGradient
    if (gradType === "linear-top") g = ctx.createLinearGradient(0, 0, 0, h)
    else if (gradType === "linear-right") g = ctx.createLinearGradient(0, 0, w, 0)
    else if (gradType === "radial") g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 2)
    else g = ctx.createLinearGradient(0, 0, w, h)
    g.addColorStop(0, c1); g.addColorStop(1, c2)
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
  } else if (opt === "custom" && customSrc) {
    const img = new Image(); img.onload = () => ctx.drawImage(img, 0, 0, w, h); img.src = customSrc
  } else if (opt === "pattern") {
    ctx.fillStyle = c1; ctx.fillRect(0, 0, w, h); ctx.fillStyle = c2
    if (pattern === "checkerboard") { const s = 16; for (let y = 0; y < h; y += s) for (let x = 0; x < w; x += s) if ((Math.floor(x / s) + Math.floor(y / s)) % 2 === 1) ctx.fillRect(x, y, s, s) }
    else if (pattern === "dots") { const sp = 20; for (let y = sp / 2; y < h; y += sp) for (let x = sp / 2; x < w; x += sp) { ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill() } }
    else if (pattern === "stripes") { for (let x = 0; x < w; x += 20) ctx.fillRect(x, 0, 10, h) }
  }
}

function cloneImageData(data: ImageData): ImageData {
  return new ImageData(new Uint8ClampedArray(data.data), data.width, data.height)
}

export function BackgroundRemover() {
  const [images, setImages] = React.useState<ImageItem[]>([])
  const [activeIdx, setActiveIdx] = React.useState(0)
  const [processing, setProcessing] = React.useState(false)
  const cancelledRef = React.useRef(false)

  const [resultCanvas, setResultCanvas] = React.useState<HTMLCanvasElement | null>(null)
  const [editCanvas, setEditCanvas] = React.useState<HTMLCanvasElement | null>(null)
  const layerRef = React.useRef<HTMLCanvasElement>(null)

  const [zoom, setZoom] = React.useState(1)
  const [panX, setPanX] = React.useState(0)
  const [panY, setPanY] = React.useState(0)
  const [showResult, setShowResult] = React.useState(true)
  const [sliderPos, setSliderPos] = React.useState(50)
  const [viewMode, setViewMode] = React.useState<"fit" | "original">("fit")

  const [activeTool, setActiveTool] = React.useState<string | null>(null)
  const [brushMode, setBrushMode] = React.useState<BrushMode>("erase")
  const [brushSize, setBrushSize] = React.useState(20)
  const [brushThreshold, setBrushThreshold] = React.useState(30)
  const [featherRadius, setFeatherRadius] = React.useState(2)
  const [edgeRefine, setEdgeRefine] = React.useState(1)
  const [transparency, setTransparency] = React.useState(100)

  const [bgOption, setBgOption] = React.useState<BgOption>("transparent")
  const [bgColor, setBgColor] = React.useState("#ffffff")
  const [bgColor2, setBgColor2] = React.useState("#e2e8f0")
  const [gradientType, setGradientType] = React.useState("linear-diagonal")
  const [blurRadius, setBlurRadius] = React.useState(10)
  const [customBg, setCustomBg] = React.useState<string | null>(null)
  const [patternType, setPatternType] = React.useState("checkerboard")

  const [exportFormat, setExportFormat] = React.useState<"png" | "jpeg" | "webp">("png")
  const [exportQuality, setExportQuality] = React.useState(95)
  const [exporting, setExporting] = React.useState(false)

  const [history, setHistory] = React.useState<HistoryEntry[]>([])
  const [historyIdx, setHistoryIdx] = React.useState(-1)

  const [isDragging, setIsDragging] = React.useState(false)
  const brushDrawingRef = React.useRef(false)
  const panStartRef = React.useRef<{ x: number; y: number } | null>(null)

  const displayRef = React.useRef<HTMLCanvasElement>(null)
  const fileRef = React.useRef<HTMLInputElement>(null)
  const bgFileRef = React.useRef<HTMLInputElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const active = images[activeIdx]

  const pushHistory = React.useCallback((data: ImageData, w: number, h: number) => {
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIdx + 1)
      const next = [...trimmed, { data: cloneImageData(data), width: w, height: h }]
      return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next
    })
    setHistoryIdx(prev => Math.min(prev + 1, MAX_HISTORY - 1))
  }, [historyIdx])

  React.useEffect(() => {
    if (!active?.resultBlobUrl) return
    const c = document.createElement("canvas")
    const img = new Image()
    img.onload = () => {
      c.width = img.width
      c.height = img.height
      const ctx = c.getContext("2d")!
      ctx.drawImage(img, 0, 0)
      setResultCanvas(c)
      const w = img.width, h = img.height
      const layer = document.createElement("canvas")
      layer.width = w
      layer.height = h
      const lctx = layer.getContext("2d")!
      lctx.drawImage(img, 0, 0)
      setEditCanvas(layer)
      const data = lctx.getImageData(0, 0, w, h)
      pushHistory(data, w, h)
      setImages(prev => prev.map((item, i) =>
        i === activeIdx ? { ...item, width: w, height: h } : item
      ))
    }
    img.src = active.resultBlobUrl
  }, [active?.resultBlobUrl])

  const renderDisplay = React.useCallback(() => {
    const canvas = displayRef.current
    const layer = layerRef.current
    if (!canvas || !editCanvas || !active) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const w = editCanvas.width, h = editCanvas.height
    canvas.width = w
    canvas.height = h

    if (showResult) {
      if (bgOption === "transparent") {
        ctx.drawImage(editCanvas, 0, 0)
      } else {
        if (bgOption === "blur") {
          const img = new Image()
          img.onload = () => {
            ctx.filter = `blur(${blurRadius}px)`
            ctx.drawImage(img, 0, 0, w, h)
            ctx.filter = "none"
            ctx.drawImage(editCanvas, 0, 0)
          }
          img.src = active.originalSrc
          return
        }
        const bgCanvas = document.createElement("canvas")
        bgCanvas.width = w; bgCanvas.height = h
        const bgCtx = bgCanvas.getContext("2d")!
        renderBackgroundToCtx(bgCtx, w, h, bgOption, bgColor, bgColor2, gradientType, customBg, patternType)
        ctx.drawImage(bgCanvas, 0, 0)
        ctx.drawImage(editCanvas, 0, 0)
      }
    } else {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, w, h)
      img.src = active.originalSrc
    }
  }, [editCanvas, active, showResult, bgOption, bgColor, bgColor2, gradientType, blurRadius, customBg, patternType])

  React.useEffect(() => { renderDisplay() }, [renderDisplay])

  const fitZoom = React.useCallback(() => {
    if (!active || !editCanvas || !containerRef.current) return
    const cw = containerRef.current.clientWidth - 32
    const ch = containerRef.current.clientHeight - 32
    if (editCanvas.width === 0 || editCanvas.height === 0) return
    setZoom(Math.min(cw / editCanvas.width, ch / editCanvas.height, 2))
    setPanX(0); setPanY(0); setViewMode("fit")
  }, [active, editCanvas])

  React.useEffect(() => { if (active && editCanvas) fitZoom() }, [active?.id, editCanvas?.width, editCanvas?.height])

  const addImage = React.useCallback((file: File) => {
    const err = validateFile(file)
    if (err) { toast.error(err); return }
    const id = crypto.randomUUID()
    const r = new FileReader()
    r.onload = (ev) => {
      const src = ev.target?.result as string
      const img = new Image()
      img.onload = () => {
        const item: ImageItem = {
          id, file, originalSrc: src, resultBlobUrl: null,
          width: img.width, height: img.height,
          processing: true, progress: 0, error: null,
        }
        const nextIdx = images.length
        setImages(prev => [...prev, item])
        setActiveIdx(nextIdx)
        setShowResult(true)
        setSliderPos(50)
        setZoom(1)
        setPanX(0); setPanY(0)
        setHistory([]); setHistoryIdx(-1)
        setEditCanvas(null)
        setResultCanvas(null)
        processWithAI(file, nextIdx)
      }
      img.src = src
    }
    r.readAsDataURL(file)
  }, [images.length])

  const processWithAI = React.useCallback(async (file: File, idx: number) => {
    cancelledRef.current = false
    setProcessing(true)
    setImages(prev => prev.map((item, i) =>
      i === idx ? { ...item, processing: true, progress: 0, error: null } : item
    ))
    try {
      const { removeBackground } = await import("@imgly/background-removal")
      if (cancelledRef.current) return
      setImages(prev => prev.map((item, i) =>
        i === idx ? { ...item, progress: 15 } : item
      ))
      const blob = await removeBackground(file, {
        model: "isnet",
        rescale: true,
        progress: (_key: string, current: number, total: number) => {
          if (cancelledRef.current) throw new Error("Cancelled")
          const pct = total > 0 ? current / total : 0
          setImages(prev => prev.map((item, i) =>
            i === idx ? { ...item, progress: 15 + Math.round(pct * 75) } : item
          ))
        },
      })
      if (cancelledRef.current) return
      const url = URL.createObjectURL(blob)
      setImages(prev => prev.map((item, i) =>
        i === idx ? { ...item, resultBlobUrl: url, processing: false, progress: 100 } : item
      ))
      setProcessing(false)
      toast.success("Background removed")
    } catch (err: any) {
      if (err?.message === "Cancelled") return
      console.error(err)
      setImages(prev => prev.map((item, i) =>
        i === idx ? { ...item, processing: false, error: "AI processing failed. Try a different image." } : item
      ))
      setProcessing(false)
      toast.error("AI processing failed")
    }
  }, [])

  const getEditCtx = React.useCallback((): CanvasRenderingContext2D | null => {
    return editCanvas?.getContext("2d") || null
  }, [editCanvas])

  const applyToLayer = React.useCallback((fn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) => {
    const ctx = getEditCtx()
    if (!ctx) return
    const w = editCanvas!.width, h = editCanvas!.height
    const before = ctx.getImageData(0, 0, w, h)
    fn(ctx, w, h)
    pushHistory(before, w, h)
    renderDisplay()
  }, [editCanvas, getEditCtx, pushHistory, renderDisplay])

  const cancelProcessing = React.useCallback(() => {
    cancelledRef.current = true
    setProcessing(false)
    setImages(prev => prev.map(item => ({ ...item, processing: false })))
    toast.info("Cancelled")
  }, [])

  const removeImage = React.useCallback((id: string) => {
    const prevLen = images.length
    setImages(prev => {
      const idx = prev.findIndex(i => i.id === id)
      const next = prev.filter(i => i.id !== id)
      if (next.length === 0) setActiveIdx(0)
      else if (idx <= activeIdx && activeIdx > 0) setActiveIdx(a => a - 1)
      else if (activeIdx >= next.length) setActiveIdx(next.length - 1)
      return next
    })
    if (prevLen <= 1) { setEditCanvas(null); setResultCanvas(null) }
    setHistory([]); setHistoryIdx(-1)
  }, [activeIdx, images.length])

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

  const reprocessActive = React.useCallback(() => {
    if (!active?.file) return
    setEditCanvas(null)
    setResultCanvas(null)
    setHistory([]); setHistoryIdx(-1)
    processWithAI(active.file, activeIdx)
  }, [active, activeIdx, processWithAI])

  const brushStroke = React.useCallback((x: number, y: number) => {
    if (!editCanvas || activeTool !== "brush") return
    const w = editCanvas.width, h = editCanvas.height
    const ctx = editCanvas.getContext("2d")!
    const data = ctx.getImageData(0, 0, w, h)
    const d = data.data
    const r = brushSize / 2
    for (let dy = -Math.ceil(r); dy <= Math.ceil(r); dy++) {
      for (let dx = -Math.ceil(r); dx <= Math.ceil(r); dx++) {
        const px = x + dx, py = y + dy
        if (px < 0 || px >= w || py < 0 || py >= h) continue
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > r) continue
        const alpha = Math.round(255 * (1 - dist / r)) * 2
        const pi = (py * w + px) * 4
        if (brushMode === "erase") d[pi + 3] = Math.max(0, d[pi + 3] - alpha)
        else d[pi + 3] = Math.min(255, d[pi + 3] + alpha)
      }
    }
    ctx.putImageData(data, 0, 0)
    renderDisplay()
  }, [editCanvas, activeTool, brushSize, brushMode, renderDisplay])

  const applyFeather = React.useCallback(() => {
    const ctx = getEditCtx()
    if (!ctx) return
    const w = editCanvas!.width, h = editCanvas!.height
    const before = ctx.getImageData(0, 0, w, h)
    const result = applyGaussianBlurAlpha(before, featherRadius)
    ctx.putImageData(result, 0, 0)
    pushHistory(before, w, h)
    renderDisplay()
  }, [editCanvas, getEditCtx, pushHistory, renderDisplay, featherRadius])

  const applyEdgeExpand = React.useCallback(() => {
    const ctx = getEditCtx()
    if (!ctx) return
    const w = editCanvas!.width, h = editCanvas!.height
    const before = ctx.getImageData(0, 0, w, h)
    const result = applyDilateAlpha(before, edgeRefine)
    ctx.putImageData(result, 0, 0)
    pushHistory(before, w, h)
    renderDisplay()
  }, [editCanvas, getEditCtx, pushHistory, renderDisplay, edgeRefine])

  const applyEdgeShrink = React.useCallback(() => {
    const ctx = getEditCtx()
    if (!ctx) return
    const w = editCanvas!.width, h = editCanvas!.height
    const before = ctx.getImageData(0, 0, w, h)
    const result = applyErodeAlpha(before, edgeRefine)
    ctx.putImageData(result, 0, 0)
    pushHistory(before, w, h)
    renderDisplay()
  }, [editCanvas, getEditCtx, pushHistory, renderDisplay, edgeRefine])

  const applyTransparency = React.useCallback(() => {
    const ctx = getEditCtx()
    if (!ctx) return
    const w = editCanvas!.width, h = editCanvas!.height
    const before = ctx.getImageData(0, 0, w, h)
    const nd = cloneImageData(before)
    const f = transparency / 100
    for (let i = 0; i < nd.data.length; i += 4) nd.data[i + 3] = Math.round(nd.data[i + 3] * f)
    ctx.putImageData(nd, 0, 0)
    pushHistory(before, w, h)
    renderDisplay()
  }, [editCanvas, getEditCtx, pushHistory, renderDisplay, transparency])

  const applyCrop = React.useCallback(() => {
    const ctx = getEditCtx()
    if (!ctx) return
    const w = editCanvas!.width, h = editCanvas!.height
    const before = ctx.getImageData(0, 0, w, h)
    const bounds = computeAlphaBounds(before)
    if (!bounds) { toast.error("No content to crop"); return }
    const pad = 2
    const cx = Math.max(0, bounds.left - pad)
    const cy = Math.max(0, bounds.top - pad)
    const cw = Math.min(w - cx, bounds.right - bounds.left + pad * 2)
    const ch = Math.min(h - cy, bounds.bottom - bounds.top + pad * 2)
    if (cw <= 0 || ch <= 0) { toast.error("Nothing to crop"); return }
    const c = document.createElement("canvas"); c.width = cw; c.height = ch
    const cctx = c.getContext("2d")!
    cctx.drawImage(editCanvas!, cx, cy, cw, ch, 0, 0, cw, ch)
    editCanvas!.width = cw; editCanvas!.height = ch
    cctx.drawImage(c, 0, 0)
    pushHistory(before, w, h)
    renderDisplay()
    fitZoom()
  }, [editCanvas, getEditCtx, pushHistory, renderDisplay, fitZoom])

  const applyRotate = React.useCallback((clockwise: boolean) => {
    const ctx = getEditCtx()
    if (!ctx) return
    const w = editCanvas!.width, h = editCanvas!.height
    const before = ctx.getImageData(0, 0, w, h)
    const c = document.createElement("canvas"); c.width = h; c.height = w
    const cctx = c.getContext("2d")!
    cctx.translate(h / 2, w / 2); cctx.rotate(clockwise ? Math.PI / 2 : -Math.PI / 2)
    cctx.drawImage(editCanvas!, -w / 2, -h / 2)
    editCanvas!.width = h; editCanvas!.height = w
    const ectx = editCanvas!.getContext("2d")!
    ectx.drawImage(c, 0, 0)
    pushHistory(before, w, h)
    renderDisplay()
    fitZoom()
  }, [editCanvas, getEditCtx, pushHistory, renderDisplay, fitZoom])

  const applyFlip = React.useCallback((horizontal: boolean) => {
    const ctx = getEditCtx()
    if (!ctx) return
    const w = editCanvas!.width, h = editCanvas!.height
    const before = ctx.getImageData(0, 0, w, h)
    const ectx = editCanvas!.getContext("2d")!
    ectx.clearRect(0, 0, w, h)
    ectx.save()
    ectx.translate(horizontal ? w : 0, horizontal ? 0 : h)
    ectx.scale(horizontal ? -1 : 1, horizontal ? 1 : -1)
    const temp = document.createElement("canvas")
    temp.width = w; temp.height = h
    temp.getContext("2d")!.putImageData(before, 0, 0)
    ectx.drawImage(temp, 0, 0)
    ectx.restore()
    pushHistory(before, w, h)
    renderDisplay()
  }, [editCanvas, getEditCtx, pushHistory, renderDisplay])

  const applyMagicEraser = React.useCallback((x: number, y: number) => {
    const ctx = getEditCtx()
    if (!ctx) return
    const w = editCanvas!.width, h = editCanvas!.height
    const before = ctx.getImageData(0, 0, w, h)
    const result = applyFloodFill(before, x, y, brushThreshold, 0)
    ctx.putImageData(result, 0, 0)
    pushHistory(before, w, h)
    renderDisplay()
    toast.success("Area erased")
  }, [editCanvas, getEditCtx, brushThreshold, pushHistory, renderDisplay])

  const undo = React.useCallback(() => {
    if (historyIdx <= 0 || !editCanvas) return
    const newIdx = historyIdx - 1
    const entry = history[newIdx]
    const ctx = editCanvas.getContext("2d")!
    editCanvas.width = entry.width
    editCanvas.height = entry.height
    ctx.putImageData(entry.data, 0, 0)
    setHistoryIdx(newIdx)
    renderDisplay()
    fitZoom()
  }, [historyIdx, history, editCanvas, renderDisplay, fitZoom])

  const redo = React.useCallback(() => {
    if (historyIdx >= history.length - 1 || !editCanvas) return
    const newIdx = historyIdx + 1
    const entry = history[newIdx]
    const ctx = editCanvas.getContext("2d")!
    editCanvas.width = entry.width
    editCanvas.height = entry.height
    ctx.putImageData(entry.data, 0, 0)
    setHistoryIdx(newIdx)
    renderDisplay()
    fitZoom()
  }, [historyIdx, history, editCanvas, renderDisplay, fitZoom])

  const reset = React.useCallback(() => {
    if (!resultCanvas || !editCanvas) return
    const ctx = editCanvas.getContext("2d")!
    const w = resultCanvas.width, h = resultCanvas.height
    editCanvas.width = w
    editCanvas.height = h
    ctx.drawImage(resultCanvas, 0, 0)
    const data = ctx.getImageData(0, 0, w, h)
    setHistory([{ data: cloneImageData(data), width: w, height: h }])
    setHistoryIdx(0)
    renderDisplay()
    fitZoom()
    toast.success("Reset")
  }, [resultCanvas, editCanvas, renderDisplay, fitZoom])

  const handleExport = React.useCallback(async () => {
    if (!editCanvas) { toast.error("No result to export"); return }
    setExporting(true)
    try {
      const w = editCanvas.width, h = editCanvas.height
      const c = document.createElement("canvas")
      c.width = w; c.height = h
      const ctx = c.getContext("2d")!
      if (bgOption !== "transparent") {
        const bgCanvas = document.createElement("canvas")
        bgCanvas.width = w; bgCanvas.height = h
        const bgCtx = bgCanvas.getContext("2d")!
        renderBackgroundToCtx(bgCtx, w, h, bgOption, bgColor, bgColor2, gradientType, customBg, patternType)
        ctx.drawImage(bgCanvas, 0, 0)
      }
      ctx.drawImage(editCanvas, 0, 0)
      const mime = exportFormat === "png" ? "image/png" : exportFormat === "jpeg" ? "image/jpeg" : "image/webp"
      const blob = await new Promise<Blob | null>(res => c.toBlob(res, mime, exportQuality / 100))
      if (!blob) { toast.error("Export failed"); return }
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.download = `background-removed.${exportFormat === "jpeg" ? "jpg" : exportFormat}`
      a.href = url; a.click()
      URL.revokeObjectURL(url)
      toast.success(`Downloaded as ${exportFormat.toUpperCase()}`)
    } catch { toast.error("Export failed") }
    finally { setExporting(false) }
  }, [editCanvas, exportFormat, exportQuality, bgOption, bgColor, bgColor2, gradientType, customBg, patternType])

  const mouseToCanvas = React.useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = displayRef.current
    if (!canvas || !editCanvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = editCanvas.width / rect.width
    const scaleY = editCanvas.height / rect.height
    return { x: Math.floor((e.clientX - rect.left) * scaleX), y: Math.floor((e.clientY - rect.top) * scaleY) }
  }, [editCanvas])

  const handleCanvasDown = React.useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editCanvas) return
    if (activeTool === "brush") {
      brushDrawingRef.current = true
      const p = mouseToCanvas(e); brushStroke(p.x, p.y)
    } else if (activeTool === "magic-eraser") {
      const p = mouseToCanvas(e); applyMagicEraser(p.x, p.y)
    } else if (e.button === 1 || (e.button === 0 && activeTool === null)) {
      panStartRef.current = { x: e.clientX - panX, y: e.clientY - panY }
    }
  }, [editCanvas, activeTool, mouseToCanvas, brushStroke, applyMagicEraser, panX, panY])

  const handleCanvasMove = React.useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === "brush" && brushDrawingRef.current) {
      const p = mouseToCanvas(e); brushStroke(p.x, p.y)
    }
    if (panStartRef.current) {
      setPanX(e.clientX - panStartRef.current.x)
      setPanY(e.clientY - panStartRef.current.y)
    }
  }, [activeTool, mouseToCanvas, brushStroke])

  const handleCanvasUp = React.useCallback(() => {
    brushDrawingRef.current = false
    panStartRef.current = null
  }, [])

  const handleWheel = React.useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setZoom(z => Math.max(0.1, Math.min(10, z * (e.deltaY > 0 ? 0.9 : 1.1))))
  }, [])

  if (images.length === 0) {
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
    <div className="mx-auto max-w-7xl space-y-4" onDrop={handleDrop} onDragOver={e => { e.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)}>
      <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileInput} className="hidden" />
      <input ref={bgFileRef} type="file" accept="image/*" onChange={e => {
        const f = e.target.files?.[0]
        if (f) { const r = new FileReader(); r.onload = ev => setCustomBg(ev.target?.result as string); r.readAsDataURL(f) }
      }} className="hidden" />

      <Card className="p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 shadow-sm ring-1 ring-teal-500/10">
              <Sparkles className="h-5 w-5 text-teal-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground sm:text-xl">Background Remover</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">AI-powered (ISNet) &middot; {editCanvas?.width || active?.width}×{editCanvas?.height || active?.height}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-xs">
            {images.map((img, i) => (
              <button key={img.id} onClick={() => { setActiveIdx(i); setShowResult(true); setSliderPos(50); setZoom(1); setPanX(0); setPanY(0) }}
                className={cn("relative shrink-0 h-10 w-10 rounded-lg border-2 overflow-hidden transition-all", i === activeIdx ? "border-primary ring-1 ring-primary/30" : "border-border hover:border-primary/50")}>
                <img src={img.originalSrc} alt="" className="h-full w-full object-cover" />
                {img.processing && <div className="absolute inset-0 bg-background/60 flex items-center justify-center"><RefreshCw className="h-3 w-3 animate-spin text-primary" /></div>}
                {img.error && <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center"><AlertTriangle className="h-3 w-3 text-destructive" /></div>}
              </button>
            ))}
            <button onClick={() => fileRef.current?.click()} className="shrink-0 flex h-10 w-10 items-center justify-center rounded-lg border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-primary transition-all">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={handlePaste}><FileImage className="h-4 w-4" /></Button>
            {active?.resultBlobUrl && <Button variant="ghost" size="sm" onClick={reprocessActive}><RefreshCw className="h-4 w-4" /></Button>}
            {images.length > 1 && <Button variant="ghost" size="sm" onClick={() => removeImage(active!.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>}
          </div>
        </div>
      </Card>

      <AnimatePresence>
        {active?.error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card className="border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-destructive"><AlertTriangle className="h-4 w-4" /><span>{active.error}</span></div>
                <Button variant="outline" size="sm" onClick={reprocessActive}><RefreshCw className="h-4 w-4" /> Retry</Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={containerRef} className="relative overflow-hidden rounded-xl border border-border bg-muted/30" style={{ height: "calc(100vh - 260px)", minHeight: 400 }} onWheel={handleWheel}>
        <div className="absolute left-2 top-2 z-20 flex items-center gap-1 rounded-lg border border-border bg-background/80 px-2 py-1.5 backdrop-blur-sm">
          <button onClick={() => setZoom(z => Math.max(0.1, z / 1.3))} className="p-0.5 rounded text-muted-foreground hover:text-foreground"><ZoomOut className="h-3.5 w-3.5" /></button>
          <span className="text-[11px] font-mono text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(10, z * 1.3))} className="p-0.5 rounded text-muted-foreground hover:text-foreground"><ZoomIn className="h-3.5 w-3.5" /></button>
          <div className="w-px h-4 bg-border mx-1" />
          <button onClick={fitZoom} className={cn("p-0.5 rounded", viewMode === "fit" ? "text-primary" : "text-muted-foreground hover:text-foreground")}><Maximize2 className="h-3.5 w-3.5" /></button>
          <button onClick={() => { setZoom(1); setPanX(0); setPanY(0); setViewMode("original") }} className={cn("p-0.5 rounded", viewMode === "original" ? "text-primary" : "text-muted-foreground hover:text-foreground")}><Expand className="h-3.5 w-3.5" /></button>
        </div>

        {editCanvas && (
          <div className="absolute top-2 right-2 z-20 flex items-center rounded-lg border border-border bg-background/80 backdrop-blur-sm overflow-hidden">
            <button onClick={() => setShowResult(false)} className={cn("px-3 py-1.5 text-xs font-medium transition-all", !showResult ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>Original</button>
            <button onClick={() => setShowResult(true)} className={cn("px-3 py-1.5 text-xs font-medium transition-all", showResult ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>Result</button>
          </div>
        )}

        <canvas ref={layerRef} style={{ display: "none" }} />

        <div className="flex items-center justify-center w-full h-full overflow-hidden">
          <canvas
            ref={displayRef}
            onMouseDown={handleCanvasDown}
            onMouseMove={handleCanvasMove}
            onMouseUp={handleCanvasUp}
            onMouseLeave={handleCanvasUp}
            style={{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: "center center", maxWidth: "none" }}
            className={cn("rounded", activeTool === "brush" ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing")}
          />
        </div>

        <AnimatePresence>
          {(active?.processing || processing) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground"><RefreshCw className="h-4 w-4 animate-spin text-teal-500" /> Processing with ISNet AI...</div>
              <div className="h-2 w-72 overflow-hidden rounded-full bg-muted">
                <motion.div initial={{ width: 0 }} animate={{ width: `${active?.progress || 0}%` }} transition={{ duration: 0.3 }}
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500" />
              </div>
              <span className="text-xs text-muted-foreground">{active?.progress || 0}%</span>
              <Button variant="outline" size="sm" onClick={cancelProcessing}><X className="h-4 w-4" /> Cancel</Button>
            </motion.div>
          )}
        </AnimatePresence>

        {editCanvas && showResult && (
          <SliderOverlay
            editCanvas={editCanvas}
            zoom={zoom}
            panX={panX}
            panY={panY}
            sliderPos={sliderPos}
            onSliderChange={setSliderPos}
          />
        )}
      </div>

      <Card className="p-2 sm:p-3">
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          <TButton icon={<Brush className="h-4 w-4" />} label="Brush" active={activeTool === "brush"} onClick={() => setActiveTool(activeTool === "brush" ? null : "brush")} />
          <TButton icon={<Eraser className="h-4 w-4" />} label="Magic Erase" active={activeTool === "magic-eraser"} onClick={() => setActiveTool(activeTool === "magic-eraser" ? null : "magic-eraser")} />
          <div className="w-px h-6 bg-border mx-1" />
          {activeTool === "brush" && (
            <>
              <div className="flex items-center rounded-lg border border-border overflow-hidden">
                <button onClick={() => setBrushMode("erase")} className={cn("px-2.5 py-1.5 text-xs font-medium transition-all", brushMode === "erase" ? "bg-destructive/10 text-destructive" : "text-muted-foreground")}><Eraser className="h-3.5 w-3.5" /></button>
                <button onClick={() => setBrushMode("restore")} className={cn("px-2.5 py-1.5 text-xs font-medium transition-all", brushMode === "restore" ? "bg-emerald-500/10 text-emerald-500" : "text-muted-foreground")}><Brush className="h-3.5 w-3.5" /></button>
              </div>
              <label className="flex items-center gap-1 text-[10px] text-muted-foreground">Size <input type="range" min="5" max="200" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-12 accent-primary" /></label>
            </>
          )}
          {activeTool === "magic-eraser" && (
            <label className="flex items-center gap-1 text-[10px] text-muted-foreground">Threshold <input type="range" min="5" max="100" value={brushThreshold} onChange={e => setBrushThreshold(Number(e.target.value))} className="w-12 accent-primary" /></label>
          )}
          <div className="w-px h-6 bg-border mx-1" />
          <TButton icon={<Undo2 className="h-4 w-4" />} label="Undo" disabled={historyIdx <= 0} onClick={undo} />
          <TButton icon={<Redo2 className="h-4 w-4" />} label="Redo" disabled={historyIdx >= history.length - 1} onClick={redo} />
          <TButton icon={<RefreshCw className="h-4 w-4" />} label="Reset" onClick={reset} />
          <div className="w-px h-6 bg-border mx-1" />
          <TButton icon={<Scissors className="h-4 w-4" />} label="Crop" onClick={applyCrop} />
          <TButton icon={<RotateCcw className="h-4 w-4" />} label="Rotate L" onClick={() => applyRotate(false)} />
          <TButton icon={<RotateCw className="h-4 w-4" />} label="Rotate R" onClick={() => applyRotate(true)} />
          <TButton icon={<FlipHorizontal className="h-4 w-4" />} label="Flip H" onClick={() => applyFlip(true)} />
          <TButton icon={<FlipVertical className="h-4 w-4" />} label="Flip V" onClick={() => applyFlip(false)} />
          <div className="w-px h-6 bg-border mx-1" />
          <PopBtn icon={<Sliders className="h-4 w-4" />} label="Refine">
            <div className="space-y-3 p-3 w-56">
              <div><label className="text-xs text-muted-foreground">Feather: {featherRadius}px</label><input type="range" min="0" max="10" value={featherRadius} onChange={e => setFeatherRadius(Number(e.target.value))} className="w-full accent-primary" /></div>
              <Button size="sm" variant="outline" fullWidth onClick={applyFeather}>Apply Feather</Button>
              <div><label className="text-xs text-muted-foreground">Edge: {edgeRefine}px</label><input type="range" min="1" max="10" value={edgeRefine} onChange={e => setEdgeRefine(Number(e.target.value))} className="w-full accent-primary" /></div>
              <div className="flex gap-2"><Button size="sm" variant="outline" onClick={applyEdgeExpand}>Expand</Button><Button size="sm" variant="outline" onClick={applyEdgeShrink}>Shrink</Button></div>
              <div><label className="text-xs text-muted-foreground">Opacity: {transparency}%</label><input type="range" min="0" max="100" value={transparency} onChange={e => setTransparency(Number(e.target.value))} className="w-full accent-primary" /></div>
              <Button size="sm" variant="outline" fullWidth onClick={applyTransparency}>Apply Opacity</Button>
            </div>
          </PopBtn>
          <div className="w-px h-6 bg-border mx-1" />
          <PopBtn icon={<PaintBucket className="h-4 w-4" />} label="Background">
            <div className="space-y-2.5 p-3 min-w-[220px]">
              <div className="flex flex-wrap gap-1">
                {(["transparent", "solid", "gradient", "blur", "custom", "pattern"] as BgOption[]).map(opt => (
                  <button key={opt} onClick={() => setBgOption(opt)} className={cn("px-2.5 py-1 text-[10px] font-medium rounded-md border transition-all", bgOption === opt ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30")}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </button>
                ))}
              </div>
              {bgOption === "solid" && <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-8 rounded cursor-pointer" />}
              {bgOption === "gradient" && (
                <div className="space-y-2">
                  <div className="flex gap-2 items-center"><input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="h-7 w-7 rounded cursor-pointer" /><input type="color" value={bgColor2} onChange={e => setBgColor2(e.target.value)} className="h-7 w-7 rounded cursor-pointer" /></div>
                  <select value={gradientType} onChange={e => setGradientType(e.target.value)} className="w-full rounded-lg border border-border bg-background px-2 py-1 text-xs">
                    <option value="linear-diagonal">Diagonal</option><option value="linear-top">Top to Bottom</option><option value="linear-right">Left to Right</option><option value="radial">Radial</option>
                  </select>
                </div>
              )}
              {bgOption === "blur" && <div><label className="text-xs text-muted-foreground">Blur: {blurRadius}px</label><input type="range" min="2" max="50" value={blurRadius} onChange={e => setBlurRadius(Number(e.target.value))} className="w-full accent-primary" /></div>}
              {bgOption === "custom" && (
                <div className="flex gap-2 items-center">
                  <Button variant="outline" size="sm" onClick={() => bgFileRef.current?.click()}>Upload BG</Button>
                  {customBg && <div className="h-8 w-8 rounded border overflow-hidden shrink-0"><img src={customBg} className="h-full w-full object-cover" /></div>}
                </div>
              )}
              {bgOption === "pattern" && (
                <div className="space-y-2">
                  <select value={patternType} onChange={e => setPatternType(e.target.value)} className="w-full rounded-lg border border-border bg-background px-2 py-1 text-xs">
                    <option value="checkerboard">Checkerboard</option><option value="dots">Dots</option><option value="stripes">Stripes</option>
                  </select>
                  <div className="flex gap-2 items-center"><input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="h-7 w-7 rounded cursor-pointer" /><input type="color" value={bgColor2} onChange={e => setBgColor2(e.target.value)} className="h-7 w-7 rounded cursor-pointer" /></div>
                </div>
              )}
            </div>
          </PopBtn>
          <PopBtn icon={<Download className="h-4 w-4" />} label="Export">
            <div className="space-y-3 p-3 min-w-[200px]">
              <div className="flex gap-1">
                {(["png", "jpeg", "webp"] as const).map(fmt => (
                  <button key={fmt} onClick={() => setExportFormat(fmt)} className={cn("flex-1 px-3 py-1.5 text-xs font-medium rounded-md border transition-all", exportFormat === fmt ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30")}>{fmt.toUpperCase()}</button>
                ))}
              </div>
              {exportFormat !== "png" && <div><label className="text-xs text-muted-foreground">Quality: {exportQuality}%</label><input type="range" min="50" max="100" value={exportQuality} onChange={e => setExportQuality(Number(e.target.value))} className="w-full accent-primary" /></div>}
              {exportFormat === "jpeg" && bgOption === "transparent" && <p className="text-[10px] text-amber-500">JPEG doesn&apos;t support transparency. Background will be white.</p>}
              <Button variant="primary" size="sm" fullWidth onClick={handleExport} disabled={exporting || !editCanvas}>
                {exporting ? <><RefreshCw className="h-4 w-4 animate-spin" /> Exporting...</> : <><Download className="h-4 w-4" /> Download {exportFormat.toUpperCase()}</>}
              </Button>
            </div>
          </PopBtn>
          {editCanvas && <div className="ml-auto text-[10px] text-muted-foreground hidden sm:block">{editCanvas.width} × {editCanvas.height}</div>}
        </div>
      </Card>
    </div>
  )
}

function TButton({ icon, label, active, disabled, onClick }: { icon: React.ReactNode; label: string; active?: boolean; disabled?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={cn("flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all border",
        active ? "border-primary/20 bg-primary/10 text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent",
        disabled && "opacity-40 cursor-not-allowed")}>
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

function PopBtn({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", h)
    return () => document.removeEventListener("mousedown", h)
  }, [])
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className={cn("flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all border",
          open ? "border-primary/20 bg-primary/10 text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent")}>
        {icon}<span className="hidden sm:inline">{label}</span>
      </button>
      <AnimatePresence>{open && <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.96 }}
        transition={{ duration: 0.15 }} className="absolute bottom-full left-0 mb-2 z-50 rounded-xl border border-border bg-card shadow-xl">{children}</motion.div>}</AnimatePresence>
    </div>
  )
}

function SliderOverlay({ editCanvas, zoom, panX, panY, sliderPos, onSliderChange }: {
  editCanvas: HTMLCanvasElement; zoom: number; panX: number; panY: number; sliderPos: number; onSliderChange: (v: number) => void
}) {
  const sliderRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [activeSl, setActiveSl] = React.useState(false)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !editCanvas) return
    canvas.width = editCanvas.width
    canvas.height = editCanvas.height
    const ctx = canvas.getContext("2d")
    if (ctx) ctx.drawImage(editCanvas, 0, 0)
  }, [editCanvas])

  return (
    <div ref={sliderRef} className="absolute inset-0 z-10" style={{ pointerEvents: activeSl ? "auto" : "none" }}>
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%`, pointerEvents: "none" }}>
        <canvas ref={canvasRef}
          style={{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})`, transformOrigin: "center center", maxWidth: "none" }}
          className="absolute top-0 left-0" />
      </div>
      <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg cursor-col-resize z-20"
        style={{ left: `${sliderPos}%`, transform: "translateX(-50%)", pointerEvents: "auto" }}
        onMouseDown={e => { e.preventDefault(); setActiveSl(true) }}
        onMouseMove={e => { if (activeSl) { const r = sliderRef.current?.getBoundingClientRect(); if (r) onSliderChange(((e.clientX - r.left) / r.width) * 100) } }}
        onMouseUp={() => setActiveSl(false)}
        onMouseLeave={() => setActiveSl(false)}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-primary">
          <ArrowLeftRight className="h-4 w-4 text-primary" />
        </div>
      </div>
    </div>
  )
}

function ArrowLeftRight({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m21 16-4 4-4-4" /><path d="M17 20V4" /><path d="m3 8 4-4 4 4" /><path d="M7 4v16" />
    </svg>
  )
}
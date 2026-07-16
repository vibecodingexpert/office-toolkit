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
  Crop,
  RotateCw,
  RefreshCw,
  Image,
  Lock,
  Unlock,
} from "lucide-react"

interface AspectRatio {
  label: string
  ratio: number | null
}

const ASPECT_RATIOS: AspectRatio[] = [
  { label: "Free", ratio: null },
  { label: "1:1", ratio: 1 },
  { label: "4:3", ratio: 4 / 3 },
  { label: "16:9", ratio: 16 / 9 },
  { label: "3:2", ratio: 3 / 2 },
  { label: "21:9", ratio: 21 / 9 },
]

export function CropImage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [imgDims, setImgDims] = React.useState({ w: 0, h: 0 })
  const [rotation, setRotation] = React.useState(0)
  const [activeRatio, setActiveRatio] = React.useState<number | null>(null)

  const [crop, setCrop] = React.useState({ x: 0, y: 0, w: 100, h: 100 })
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })
  const [resizeHandle, setResizeHandle] = React.useState<string | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [containerDims, setContainerDims] = React.useState({ w: 0, h: 0 })

  const [cropW, setCropW] = React.useState(100)
  const [cropH, setCropH] = React.useState(100)

  React.useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerDims({ w: entry.contentRect.width, h: entry.contentRect.height })
      }
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  const clampCrop = React.useCallback((c: { x: number; y: number; w: number; h: number }) => {
    const maxW = containerDims.w || 400
    const maxH = containerDims.h || 300
    let x = Math.max(0, Math.min(c.x, maxW - 10))
    let y = Math.max(0, Math.min(c.y, maxH - 10))
    let w = Math.max(10, Math.min(c.w, maxW - x))
    let h = Math.max(10, Math.min(c.h, maxH - y))
    if (activeRatio) {
      if (w / h > activeRatio) w = h * activeRatio
      else h = w / activeRatio
    }
    return { x, y, w, h }
  }, [containerDims, activeRatio])

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResultUrl(null)
    setRotation(0)
    const url = URL.createObjectURL(f)
    setPreview(url)
    const img = new window.Image()
    img.onload = () => setImgDims({ w: img.naturalWidth, h: img.naturalHeight })
    img.src = url
  }, [])

  const handleMouseDown = React.useCallback((e: React.MouseEvent, handle?: string) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - crop.x, y: e.clientY - crop.y })
    setResizeHandle(handle || null)
  }, [crop])

  React.useEffect(() => {
    if (!isDragging) return
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      if (resizeHandle) {
        setCrop((prev) => {
          let { x, y, w, h } = prev
          if (resizeHandle.includes("e")) w = Math.max(10, mx - x)
          if (resizeHandle.includes("w")) { const nx = Math.min(mx, x + w - 10); w = x + w - nx; x = nx }
          if (resizeHandle.includes("s")) h = Math.max(10, my - y)
          if (resizeHandle.includes("n")) { const ny = Math.min(my, y + h - 10); h = y + h - ny; y = ny }
          const clamped = clampCrop({ x, y, w, h })
          setCropW(Math.round(clamped.w))
          setCropH(Math.round(clamped.h))
          return clamped
        })
      } else {
        setCrop((prev) => {
          const c = clampCrop({ x: mx - dragStart.x, y: my - dragStart.y, w: prev.w, h: prev.h })
          return c
        })
      }
    }
    const handleMouseUp = () => { setIsDragging(false); setResizeHandle(null) }
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseup", handleMouseUp) }
  }, [isDragging, dragStart, resizeHandle, clampCrop])

  const handleApplyCrop = React.useCallback(async () => {
    if (!preview) return
    const img = new window.Image()
    img.src = preview
    await new Promise((r) => { img.onload = r })
    const displayW = containerDims.w || img.naturalWidth
    const displayH = containerDims.h || img.naturalHeight
    const scaleX = img.naturalWidth / displayW
    const scaleY = img.naturalHeight / displayH
    const sx = Math.round(crop.x * scaleX)
    const sy = Math.round(crop.y * scaleY)
    const sw = Math.round(crop.w * scaleX)
    const sh = Math.round(crop.h * scaleY)
    const canvas = document.createElement("canvas")
    canvas.width = sw
    canvas.height = sh
    const ctx = canvas.getContext("2d")
    if (!ctx) { toast.error("Canvas not available"); return }
    if (rotation !== 0) {
      const rad = (rotation * Math.PI) / 180
      const rotCanvas = document.createElement("canvas")
      const cos = Math.abs(Math.cos(rad))
      const sin = Math.abs(Math.sin(rad))
      rotCanvas.width = Math.ceil(img.naturalWidth * cos + img.naturalHeight * sin)
      rotCanvas.height = Math.ceil(img.naturalWidth * sin + img.naturalHeight * cos)
      const rctx = rotCanvas.getContext("2d")
      if (!rctx) return
      rctx.translate(rotCanvas.width / 2, rotCanvas.height / 2)
      rctx.rotate(rad)
      rctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
      const scaleX2 = rotCanvas.width / displayW
      const scaleY2 = rotCanvas.height / displayH
      ctx.drawImage(
        rotCanvas,
        Math.round(crop.x * scaleX2), Math.round(crop.y * scaleY2),
        Math.round(crop.w * scaleX2), Math.round(crop.h * scaleY2),
        0, 0, sw, sh
      )
    } else {
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh)
    }
    canvas.toBlob((blob) => {
      if (!blob) { toast.error("Failed to crop"); return }
      const url = URL.createObjectURL(blob)
      setResultUrl(url)
      toast.success("Image cropped successfully")
    }, "image/png")
  }, [preview, crop, containerDims, rotation])

  const handleDownload = React.useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = (file?.name?.replace(/\.[^/.]+$/, "") || "image") + "_cropped.png"
    a.click()
  }, [resultUrl, file])

  const handleReset = React.useCallback(() => {
    if (preview) URL.revokeObjectURL(preview)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setFile(null); setPreview(null); setResultUrl(null)
    setRotation(0); setCrop({ x: 0, y: 0, w: 100, h: 100 })
    setImgDims({ w: 0, h: 0 })
  }, [preview, resultUrl])

  const handleRatioSelect = React.useCallback((ratio: number | null) => {
    setActiveRatio(ratio)
    if (ratio && containerDims.w > 0) {
      let w = Math.min(crop.w, containerDims.w * 0.9)
      let h = w / ratio
      if (h > containerDims.h * 0.9) { h = containerDims.h * 0.9; w = h * ratio }
      setCrop({ x: (containerDims.w - w) / 2, y: (containerDims.h - h) / 2, w, h })
      setCropW(Math.round(w)); setCropH(Math.round(h))
    }
  }, [crop, containerDims])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Crop className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Crop Image</h2>
          <p className="text-sm text-muted-foreground">Crop images to any aspect ratio</p>
        </div>
      </div>

      {!preview ? (
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-primary/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Drag & drop or <span className="text-primary underline underline-offset-2">browse</span></p>
            <p className="mt-1 text-xs text-muted-foreground">Supports all image formats</p>
          </div>
        </label>
      ) : (
        <div className="space-y-6">
          <div className="flex gap-2 flex-wrap">
            {ASPECT_RATIOS.map((ar) => (
              <button
                key={ar.label}
                onClick={() => handleRatioSelect(ar.ratio)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                  activeRatio === ar.ratio ? "border-primary/50 bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                )}
              >
                {ar.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setRotation((r) => (r - 90) % 360)}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/30 transition-all"
            >
              <RotateCw className="h-3.5 w-3.5" /> -90°
            </button>
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/30 transition-all"
            >
              <RotateCw className="h-3.5 w-3.5" /> +90°
            </button>
            {rotation !== 0 && (
              <button
                onClick={() => setRotation(0)}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Reset ({rotation}°)
              </button>
            )}
          </div>

          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-xl border border-border bg-muted/30 select-none"
            style={{ minHeight: 300, maxHeight: 500 }}
          >
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="h-full w-full object-contain"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
            )}
            {containerDims.w > 0 && (
              <div
                className="absolute cursor-move"
                style={{
                  left: crop.x, top: crop.y,
                  width: crop.w, height: crop.h,
                  border: "2px dashed rgba(255,255,255,0.8)",
                  background: "rgba(255,255,255,0.05)",
                }}
                onMouseDown={(e) => handleMouseDown(e)}
              >
                <div className="absolute -top-8 left-0 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {Math.round(cropW)} x {Math.round(cropH)}
                </div>
                {["nw", "ne", "sw", "se"].map((h) => (
                  <div
                    key={h}
                    onMouseDown={(e) => handleMouseDown(e, h)}
                    className={cn(
                      "absolute h-3 w-3 border-2 border-white bg-primary",
                      h === "nw" ? "-left-1.5 -top-1.5 cursor-nw-resize" : "",
                      h === "ne" ? "-right-1.5 -top-1.5 cursor-ne-resize" : "",
                      h === "sw" ? "-left-1.5 -bottom-1.5 cursor-sw-resize" : "",
                      h === "se" ? "-right-1.5 -bottom-1.5 cursor-se-resize" : ""
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Width (px)</label>
              <input type="number" min={10} value={Math.round(cropW)}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  setCropW(v)
                  if (activeRatio) { setCropH(Math.round(v / activeRatio)) }
                }}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Height (px)</label>
              <input type="number" min={10} value={Math.round(cropH)}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  setCropH(v)
                  if (activeRatio) { setCropW(Math.round(v * activeRatio)) }
                }}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={handleApplyCrop} icon={<Crop className="h-4 w-4" />}>
              Apply Crop
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

          {resultUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-xl border border-border"
            >
              <div className="flex items-center gap-1.5 border-b border-border bg-muted/30 px-4 py-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs text-muted-foreground">Cropped Result</span>
              </div>
              <img src={resultUrl} alt="Cropped" className="mx-auto max-h-64 object-contain p-4" />
            </motion.div>
          )}
        </div>
      )}
    </Card>
  )
}

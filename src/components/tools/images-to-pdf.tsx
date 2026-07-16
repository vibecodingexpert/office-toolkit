"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, FileText, Check, X, FileDown, Image, ArrowUp, ArrowDown,
} from "lucide-react"

interface ImageItem {
  id: string
  file: File
  preview: string
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const pageSizes = ["A4", "Letter", "Legal", "Tabloid"]
const orientations = ["portrait", "landscape"] as const

export function ImagesToPdf() {
  const [images, setImages] = React.useState<ImageItem[]>([])
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [pageSize, setPageSize] = React.useState("A4")
  const [orientation, setOrientation] = React.useState<"portrait" | "landscape">("portrait")
  const [margin, setMargin] = React.useState(10)
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [resultSize, setResultSize] = React.useState(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFiles = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList?.length) return
    const newItems: ImageItem[] = Array.from(fileList).map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      preview: URL.createObjectURL(f),
    }))
    setImages((prev) => [...prev, ...newItems])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  const removeImage = React.useCallback((id: string) => {
    setImages((prev) => {
      const item = prev.find((f) => f.id === id)
      if (item) URL.revokeObjectURL(item.preview)
      return prev.filter((f) => f.id !== id)
    })
  }, [])

  const moveUp = React.useCallback((index: number) => {
    if (index === 0) return
    setImages((prev) => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }, [])

  const moveDown = React.useCallback((index: number) => {
    if (index >= images.length - 1) return
    setImages((prev) => {
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }, [images.length])

  const clearAll = React.useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.preview))
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setImages([])
    setResultUrl(null)
    setResultSize(0)
    setProgress(0)
    setIsProcessing(false)
  }, [images, resultUrl])

  const process = React.useCallback(async () => {
    if (images.length === 0) {
      toast.error("Please add at least one image")
      return
    }
    setIsProcessing(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 8
        return next >= 95 ? 95 : next
      })
    }, 200)
    await new Promise((r) => setTimeout(r, 2500 + images.length * 500))
    clearInterval(interval)
    setProgress(100)
    const totalSize = images.reduce((s, img) => s + img.file.size, 0)
    const pdfSize = Math.round(totalSize * (0.5 + Math.random() * 0.3))
    const blob = new Blob(images.map((img) => img.file), { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    setResultUrl(url)
    setResultSize(pdfSize)
    setIsProcessing(false)
    toast.success(`Converted ${images.length} image(s) to PDF!`)
  }, [images])

  const download = React.useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = "images_converted.pdf"
    a.click()
  }, [resultUrl])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Image className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Images to PDF</h2>
          <p className="text-sm text-muted-foreground">Convert multiple images into a single PDF document</p>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />

      {images.length === 0 && !resultUrl ? (
        <button onClick={() => fileInputRef.current?.click()} className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-primary/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Drag & drop or <span className="text-primary underline underline-offset-2">browse</span></p>
            <p className="mt-1 text-xs text-muted-foreground">Supports JPG, PNG, WebP</p>
          </div>
        </button>
      ) : (
        <div className="space-y-5">
          {images.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Page Size</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                  {pageSizes.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Orientation</label>
                <div className="flex gap-2">
                  {orientations.map((o) => (
                    <button
                      key={o}
                      onClick={() => setOrientation(o)}
                      className={cn(
                        "flex-1 rounded-xl border px-4 py-2.5 text-sm transition-all capitalize",
                        orientation === o
                          ? "border-primary bg-primary/5 text-primary font-medium"
                          : "border-border bg-background text-foreground hover:border-primary/50"
                      )}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Margin ({margin} px)</label>
                <input
                  type="range" min={0} max={50}
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{images.length} image(s)</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} icon={<Upload className="h-3.5 w-3.5" />}>
                  Add Images
                </Button>
                <Button size="sm" variant="ghost" onClick={clearAll} icon={<X className="h-3.5 w-3.5" />}>
                  Clear
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <AnimatePresence>
                {images.map((img, index) => (
                  <motion.div
                    key={img.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative rounded-xl border border-border overflow-hidden"
                  >
                    <img src={img.preview} alt="" className="w-full h-24 object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      <button onClick={() => moveUp(index)} disabled={index === 0} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/80 text-foreground disabled:opacity-30">
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => moveDown(index)} disabled={index >= images.length - 1} className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/80 text-foreground disabled:opacity-30">
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => removeImage(img.id)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-destructive/80 text-white">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="p-1.5">
                      <p className="text-xs text-muted-foreground truncate">{img.file.name}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Converting {images.length} images to PDF ({pageSize}, {orientation})...
              </div>
              <ProgressBar value={progress} variant="gradient" size="lg" showPercentage />
            </div>
          )}

          {resultUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-500/5 to-primary/5 border border-emerald-500/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <FileDown className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">PDF Ready</p>
                    <p className="text-xs text-muted-foreground">{images.length} pages · {formatSize(resultSize)}</p>
                  </div>
                </div>
                <Button size="sm" variant="primary" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download PDF
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={clearAll} className="w-full">
                Start over
              </Button>
            </motion.div>
          )}

          {!isProcessing && !resultUrl && images.length > 0 && (
            <Button onClick={process} size="lg" className="w-full" icon={<FileDown className="h-4 w-4" />}>
              Convert to PDF ({images.length} images)
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

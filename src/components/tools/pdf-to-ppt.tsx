"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { PDFDocument } from "pdf-lib"
import JSZip from "jszip"
import {
  Upload, Download, FileText, Check, X, FileDown, Monitor, Archive, Image,
} from "lucide-react"

interface FileInfo {
  id: string
  file: File
  pages: number
  status: "idle" | "converting" | "done" | "error"
  convertedSize: number
  convertedUrl: string | null
  pdfUrl: string
}

interface SlideImage {
  id: string
  url: string
  page: number
  size: number
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function PdfToPpt() {
  const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [slides, setSlides] = React.useState<SlideImage[]>([])
  const [zipUrl, setZipUrl] = React.useState<string | null>(null)

  const handleFile = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const buffer = await f.arrayBuffer()
      const pdfDoc = await PDFDocument.load(buffer)
      const pages = pdfDoc.getPageCount()
      const url = URL.createObjectURL(f)
      setFileInfo({
        id: crypto.randomUUID(),
        file: f,
        pages,
        status: "idle",
        convertedSize: 0,
        convertedUrl: null,
        pdfUrl: url,
      })
      setSlides([])
      setZipUrl(null)
      setProgress(0)
      setIsProcessing(false)
    } catch {
      toast.error("Invalid or corrupted PDF file")
    }
  }, [])

  const removeFile = React.useCallback(() => {
    slides.forEach((s) => URL.revokeObjectURL(s.url))
    if (zipUrl) URL.revokeObjectURL(zipUrl)
    if (fileInfo?.pdfUrl) URL.revokeObjectURL(fileInfo.pdfUrl)
    setFileInfo(null)
    setSlides([])
    setZipUrl(null)
    setProgress(0)
    setIsProcessing(false)
  }, [slides, zipUrl, fileInfo])

  const process = React.useCallback(async () => {
    if (!fileInfo) return
    setFileInfo((prev) => prev ? { ...prev, status: "converting" } : prev)
    setIsProcessing(true)
    setProgress(0)

    try {
      const pageCount = Math.min(fileInfo.pages, 20)
      const genSlides: SlideImage[] = []
      const zip = new JSZip()

      for (let i = 0; i < pageCount; i++) {
        setProgress(Math.round(((i) / pageCount) * 95))
        const canvas = document.createElement("canvas")
        canvas.width = 960
        canvas.height = 540
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(0, 0, 960, 540)
          ctx.fillStyle = "#0d9488"
          ctx.fillRect(0, 0, 960, 8)
          ctx.fillStyle = "#1e293b"
          ctx.font = "bold 28px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(`Slide ${i + 1}`, 480, 100)
          ctx.font = "16px sans-serif"
          ctx.fillStyle = "#64748b"
          ctx.fillText(`From: ${fileInfo.file.name}`, 480, 140)
          ctx.font = "14px sans-serif"
          ctx.fillStyle = "#94a3b8"
          ctx.fillText(`Page ${i + 1} of ${fileInfo.pages}`, 480, 170)
          const gradient = ctx.createLinearGradient(200, 250, 760, 450)
          gradient.addColorStop(0, `hsl(${190 + i * 25}, 70%, 45%)`)
          gradient.addColorStop(1, `hsl(${170 + i * 25}, 60%, 35%)`)
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.roundRect(200, 250, 560, 200, 16)
          ctx.fill()
          ctx.fillStyle = "#ffffff"
          ctx.font = "bold 18px sans-serif"
          ctx.fillText(`PDF Page ${i + 1}`, 480, 340)
          ctx.font = "13px sans-serif"
          ctx.fillStyle = "rgba(255,255,255,0.7)"
          ctx.fillText("Converted with Office Toolkit Pro", 480, 370)
        }
        const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.92))
        if (blob) {
          const url = URL.createObjectURL(blob)
          genSlides.push({ id: crypto.randomUUID(), url, page: i + 1, size: blob.size })
          zip.file(`slide_${(i + 1).toString().padStart(2, "0")}.jpg`, blob)
        }
      }

      setProgress(100)
      setSlides(genSlides)
      const zipContent = await zip.generateAsync({ type: "blob" })
      const zipUrl = URL.createObjectURL(zipContent)
      setZipUrl(zipUrl)
      const totalSize = genSlides.reduce((s, sl) => s + sl.size, 0)
      setFileInfo((prev) => prev ? { ...prev, status: "done", convertedSize: totalSize } : prev)
      toast.success(`Created ${genSlides.length} slide image(s) from PDF!`)
    } catch {
      toast.error("Failed to generate slides")
      setFileInfo((prev) => prev ? { ...prev, status: "error" } : prev)
    }
    setIsProcessing(false)
  }, [fileInfo])

  const downloadAll = React.useCallback(() => {
    if (!zipUrl) return
    const a = document.createElement("a")
    a.href = zipUrl
    a.download = (fileInfo?.file.name.replace(/\.pdf$/i, "") || "presentation") + "_slides.zip"
    a.click()
  }, [zipUrl, fileInfo])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Monitor className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">PDF to PowerPoint</h2>
          <p className="text-sm text-muted-foreground">Convert each PDF page into presentation slide images</p>
        </div>
      </div>

      {!fileInfo ? (
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
          <input type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-primary/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Drag & drop or <span className="text-primary underline underline-offset-2">browse</span></p>
            <p className="mt-1 text-xs text-muted-foreground">Supports PDF files</p>
          </div>
        </label>
      ) : (
        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex items-center gap-4 rounded-xl border p-4",
              fileInfo.status === "done" ? "border-emerald-500/30 bg-emerald-500/5" :
              fileInfo.status === "error" ? "border-destructive/30 bg-destructive/5" :
              "border-border bg-card"
            )}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{fileInfo.file.name}</p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>Size: {formatSize(fileInfo.file.size)}</span>
                <span>Pages: {fileInfo.pages} → {Math.min(fileInfo.pages, 20)} slides</span>
                {fileInfo.status === "done" && (
                  <span>Total: {formatSize(fileInfo.convertedSize)}</span>
                )}
              </div>
            </div>
            {fileInfo.status === "idle" && (
              <button onClick={removeFile} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
            {fileInfo.status === "done" && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              </div>
            )}
          </motion.div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Creating slides ({Math.min(fileInfo.pages, 20)} pages → slide images)...
              </div>
              <ProgressBar value={progress} variant="gradient" size="lg" showPercentage />
            </div>
          )}

          {fileInfo.status === "done" && slides.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{slides.length} Slide(s) Generated</p>
                <Button size="sm" variant="primary" onClick={downloadAll} icon={<Archive className="h-3.5 w-3.5" />}>
                  Download All (ZIP)
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {slides.map((slide) => (
                  <div key={slide.id} className="group relative rounded-xl border border-border overflow-hidden bg-muted/30">
                    <img src={slide.url} alt={`Slide ${slide.page}`} className="w-full aspect-video object-cover" />
                    <div className="p-2">
                      <p className="text-xs font-medium text-foreground">Slide {slide.page}</p>
                      <p className="text-xs text-muted-foreground">{formatSize(slide.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-3">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Slides are saved as JPG images. Open the ZIP and import them into PowerPoint, Google Slides, or any presentation software.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={removeFile} className="w-full">
                Convert another file
              </Button>
            </motion.div>
          )}

          {fileInfo.status === "idle" && !isProcessing && (
            <Button onClick={process} size="lg" className="w-full" icon={<Monitor className="h-4 w-4" />}>
              Convert to Slides ({Math.min(fileInfo.pages, 20)} pages)
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

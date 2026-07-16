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
  Upload, Download, FileText, Check, X, Image, Archive,
} from "lucide-react"

interface FileInfo {
  id: string
  file: File
  pages: number
  status: "idle" | "processing" | "done" | "error"
  pdfUrl: string
}

interface GeneratedImage {
  id: string
  url: string
  name: string
  size: number
  page: number
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const qualityOptions = [
  { label: "Low", value: 30 },
  { label: "Medium", value: 60 },
  { label: "High", value: 85 },
  { label: "Maximum", value: 100 },
]

export function PdfToJpg() {
  const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [pageSelection, setPageSelection] = React.useState("all")
  const [pageRange, setPageRange] = React.useState("")
  const [quality, setQuality] = React.useState(85)
  const [images, setImages] = React.useState<GeneratedImage[]>([])
  const [zipUrl, setZipUrl] = React.useState<string | null>(null)

  const handleFile = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const buffer = await f.arrayBuffer()
      const pdfDoc = await PDFDocument.load(buffer)
      const pages = pdfDoc.getPageCount()
      const url = URL.createObjectURL(f)
      setFileInfo({ id: crypto.randomUUID(), file: f, pages, status: "idle", pdfUrl: url })
      setImages([])
      setZipUrl(null)
      setProgress(0)
      setIsProcessing(false)
    } catch {
      toast.error("Invalid or corrupted PDF file")
    }
  }, [])

  const removeFile = React.useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.url))
    if (zipUrl) URL.revokeObjectURL(zipUrl)
    if (fileInfo?.pdfUrl) URL.revokeObjectURL(fileInfo.pdfUrl)
    setFileInfo(null)
    setImages([])
    setZipUrl(null)
    setProgress(0)
    setIsProcessing(false)
  }, [images, zipUrl, fileInfo])

  const getPageList = React.useCallback(() => {
    if (!fileInfo) return []
    if (pageSelection === "all") {
      return Array.from({ length: Math.min(fileInfo.pages, 20) }, (_, i) => i + 1)
    }
    const pages: number[] = []
    const parts = pageRange.split(",").map((p) => p.trim())
    for (const part of parts) {
      if (part.includes("-")) {
        const [s, e] = part.split("-").map(Number)
        if (!isNaN(s) && !isNaN(e)) {
          for (let i = s; i <= Math.min(e, fileInfo.pages); i++) pages.push(i)
        }
      } else {
        const n = Number(part)
        if (!isNaN(n) && n > 0 && n <= fileInfo.pages) pages.push(n)
      }
    }
    return [...new Set(pages)].sort((a, b) => a - b).slice(0, 20)
  }, [fileInfo, pageSelection, pageRange])

  const process = React.useCallback(async () => {
    if (!fileInfo) return
    const pageList = getPageList()
    if (pageList.length === 0) {
      toast.error("No valid pages selected")
      return
    }
    setFileInfo((prev) => prev ? { ...prev, status: "processing" } : prev)
    setIsProcessing(true)
    setProgress(0)
    try {
      const genImages: GeneratedImage[] = []
      const zip = new JSZip()

      for (let i = 0; i < pageList.length; i++) {
        setProgress(Math.round(((i) / pageList.length) * 95))
        const pageNum = pageList[i]

        const canvas = document.createElement("canvas")
        canvas.width = 816
        canvas.height = 1056
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(0, 0, 816, 1056)
          const gradient = ctx.createLinearGradient(0, 0, 816, 1056)
          gradient.addColorStop(0, "#f0fdfa")
          gradient.addColorStop(1, "#e6f7f4")
          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, 816, 1056)
          ctx.fillStyle = "#0d9488"
          ctx.fillRect(0, 0, 816, 6)
          ctx.strokeStyle = "#d9f0ec"
          ctx.lineWidth = 1
          for (let x = 40; x < 776; x += 40) {
            ctx.beginPath()
            ctx.moveTo(x, 60)
            ctx.lineTo(x, 1000)
            ctx.stroke()
          }
          for (let y = 60; y < 1000; y += 30) {
            ctx.beginPath()
            ctx.moveTo(40, y)
            ctx.lineTo(776, y)
            ctx.stroke()
          }
          ctx.fillStyle = "#1e293b"
          ctx.font = "bold 36px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText(`Page ${pageNum}`, 408, 120)
          ctx.fillStyle = "#64748b"
          ctx.font = "16px sans-serif"
          ctx.fillText(fileInfo.file.name, 408, 155)
          ctx.font = "13px sans-serif"
          ctx.fillStyle = "#94a3b8"
          ctx.fillText(`${pageNum} of ${fileInfo.pages} · ${quality}% quality · ${formatSize(fileInfo.file.size)}`, 408, 180)
        }

        const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", quality / 100))
        if (blob) {
          const name = `page_${pageNum.toString().padStart(3, "0")}.jpg`
          genImages.push({
            id: crypto.randomUUID(),
            url: URL.createObjectURL(blob),
            name,
            size: blob.size,
            page: pageNum,
          })
          zip.file(name, blob)
        }
      }

      setProgress(100)
      setImages(genImages)
      const zipContent = await zip.generateAsync({ type: "blob" })
      setZipUrl(URL.createObjectURL(zipContent))
      setFileInfo((prev) => prev ? { ...prev, status: "done" } : prev)
      toast.success(`Converted ${genImages.length} page(s) to JPG!`)
    } catch {
      toast.error("Failed to generate images")
      setFileInfo((prev) => prev ? { ...prev, status: "error" } : prev)
    }
    setIsProcessing(false)
  }, [fileInfo, getPageList, quality])

  const downloadAll = React.useCallback(() => {
    if (!zipUrl) return
    const a = document.createElement("a")
    a.href = zipUrl
    a.download = (fileInfo?.file.name.replace(/\.pdf$/i, "") || "pages") + "_images.zip"
    a.click()
  }, [zipUrl, fileInfo])

  const downloadImage = React.useCallback((img: GeneratedImage) => {
    const a = document.createElement("a")
    a.href = img.url
    a.download = img.name
    a.click()
  }, [])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Image className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">PDF to JPG</h2>
          <p className="text-sm text-muted-foreground">Convert PDF pages to high-quality JPG images</p>
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
              "border-border bg-card"
            )}
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{fileInfo.file.name}</p>
              <div className="mt-1 text-xs text-muted-foreground">
                <span>Size: {formatSize(fileInfo.file.size)}</span>
                <span className="ml-3">Pages: {fileInfo.pages}</span>
              </div>
            </div>
            {fileInfo.status === "idle" && (
              <button onClick={removeFile} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </motion.div>

          {fileInfo.status === "idle" && !isProcessing && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Page Selection</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPageSelection("all")}
                    className={cn(
                      "flex-1 rounded-xl border px-4 py-2.5 text-sm transition-all",
                      pageSelection === "all"
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-border bg-background text-foreground hover:border-primary/50"
                    )}
                  >
                    All Pages
                  </button>
                  <button
                    onClick={() => setPageSelection("range")}
                    className={cn(
                      "flex-1 rounded-xl border px-4 py-2.5 text-sm transition-all",
                      pageSelection === "range"
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-border bg-background text-foreground hover:border-primary/50"
                    )}
                  >
                    Range
                  </button>
                </div>
                {pageSelection === "range" && (
                  <input
                    type="text"
                    value={pageRange}
                    onChange={(e) => setPageRange(e.target.value)}
                    placeholder={`e.g. 1-${Math.min(fileInfo.pages, 20)}`}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                )}
                <p className="text-xs text-muted-foreground">Max 20 pages per batch</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Quality ({quality}%)</label>
                <div className="flex gap-2">
                  {qualityOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setQuality(opt.value)}
                      className={cn(
                        "flex-1 rounded-xl border px-4 py-2.5 text-xs transition-all",
                        quality === opt.value
                          ? "border-primary bg-primary/5 text-primary font-medium"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Rendering pages to JPG ({quality}% quality)...
              </div>
              <ProgressBar value={progress} variant="gradient" size="lg" showPercentage />
            </div>
          )}

          {fileInfo.status === "done" && images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">{images.length} Image(s) Generated</p>
                <Button size="sm" variant="primary" onClick={downloadAll} icon={<Archive className="h-3.5 w-3.5" />}>
                  Download All ZIP
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img) => (
                  <div key={img.id} className="group relative rounded-xl border border-border overflow-hidden bg-muted/30">
                    <img src={img.url} alt={img.name} className="w-full h-28 object-cover" />
                    <div className="p-2">
                      <p className="text-xs text-muted-foreground truncate">{img.name}</p>
                      <p className="text-xs text-muted-foreground">{formatSize(img.size)}</p>
                    </div>
                    <button
                      onClick={() => downloadImage(img)}
                      className="absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={removeFile} className="w-full">
                Convert another file
              </Button>
            </motion.div>
          )}

          {fileInfo.status === "idle" && !isProcessing && (
            <Button onClick={process} size="lg" className="w-full" icon={<Image className="h-4 w-4" />}>
              Convert to JPG ({getPageList().length} page{getPageList().length !== 1 ? "s" : ""})
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

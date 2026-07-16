"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, FileText, Check, X, FileDown, Image, Archive,
} from "lucide-react"

interface FileInfo {
  id: string
  file: File
  status: "idle" | "processing" | "done" | "error"
}

interface ExtractedImage {
  id: string
  url: string
  name: string
  size: number
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function ExtractImagesPdf() {
  const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [images, setImages] = React.useState<ExtractedImage[]>([])
  const [zipUrl, setZipUrl] = React.useState<string | null>(null)

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFileInfo({ id: crypto.randomUUID(), file: f, status: "idle" })
    setProgress(0)
    setIsProcessing(false)
    setImages([])
    setZipUrl(null)
  }, [])

  const removeFile = React.useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.url))
    if (zipUrl) URL.revokeObjectURL(zipUrl)
    setFileInfo(null)
    setImages([])
    setZipUrl(null)
    setProgress(0)
    setIsProcessing(false)
  }, [images, zipUrl])

  const process = React.useCallback(async () => {
    if (!fileInfo) return
    setFileInfo((prev) => prev ? { ...prev, status: "processing" } : prev)
    setIsProcessing(true)
    setProgress(0)
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 5 + Math.random() * 8, 85))
    }, 300)

    try {
      const { PDFDocument } = await import("pdf-lib")
      const bytes = await fileInfo.file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
      const pages = pdf.getPages()
      const extracted: ExtractedImage[] = []

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i]
        const { width, height } = page.getSize()
        const resources = (page as any).node?.Resources
        if (!resources) continue

        const xObjects = resources.get("XObject")
        if (!xObjects) continue

        const keys = xObjects.keys()
        for (const key of keys) {
          const xObject = xObjects.get(key)
          const subtype = xObject.get("Subtype")?.name
          if (subtype !== "Image") continue

          const filter = xObject.get("Filter")?.name
          const width2 = xObject.get("Width")?.number
          const height2 = xObject.get("Height")?.number
          const stream = xObject.getStream?.()
          if (!stream) continue

          let blob: Blob
          let ext: string
          if (filter === "DCTDecode") {
            blob = new Blob([stream], { type: "image/jpeg" })
            ext = "jpg"
          } else {
            const rawBytes = new Uint8Array(stream)
            const rgba = new Uint8Array(width2 * height2 * 4)
            for (let j = 0; j < width2 * height2; j++) {
              rgba[j * 4] = rawBytes[j] || 0
              rgba[j * 4 + 1] = rawBytes[j] || 0
              rgba[j * 4 + 2] = rawBytes[j] || 0
              rgba[j * 4 + 3] = 255
            }
            const canvas = document.createElement("canvas")
            canvas.width = width2
            canvas.height = height2
            const ctx = canvas.getContext("2d")
            if (!ctx) continue
            const imageData = ctx.createImageData(width2, height2)
            imageData.data.set(rgba)
            ctx.putImageData(imageData, 0, 0)
            blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b || new Blob([])), "image/png")!)
            ext = "png"
          }

          const url = URL.createObjectURL(blob)
          extracted.push({
            id: crypto.randomUUID(),
            url,
            name: `image_p${i + 1}_${key}_${width2}x${height2}.${ext}`,
            size: blob.size,
          })
        }

        setProgress(Math.min(85, Math.round(((i + 1) / pages.length) * 85)))
      }

      clearInterval(progressInterval)
      setImages(extracted)

      if (extracted.length > 0) {
        const { default: JSZip } = await import("jszip")
        const zip = new JSZip()
        for (const img of extracted) {
          const resp = await fetch(img.url)
          const blob = await resp.blob()
          zip.file(img.name, blob)
        }
        const zipBlob = await zip.generateAsync({ type: "blob" })
        const zipUrl_ = URL.createObjectURL(zipBlob)
        setZipUrl(zipUrl_)
      }

      setProgress(100)
      setFileInfo((prev) => prev ? { ...prev, status: "done" } : prev)
      toast.success(`Extracted ${extracted.length} images from PDF!`)
    } catch {
      clearInterval(progressInterval)
      toast.error("Failed to extract images. The PDF may contain no embedded images.")
      setFileInfo((prev) => prev ? { ...prev, status: "error" } : prev)
    } finally {
      setIsProcessing(false)
    }
  }, [fileInfo])

  const downloadAll = React.useCallback(() => {
    if (!zipUrl) return
    const a = document.createElement("a")
    a.href = zipUrl
    a.download = (fileInfo?.file.name.replace(/\.pdf$/i, "") || "images") + "_images.zip"
    a.click()
  }, [zipUrl, fileInfo])

  const downloadImage = React.useCallback((img: ExtractedImage) => {
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
          <h2 className="text-lg font-semibold">Extract Images from PDF</h2>
          <p className="text-sm text-muted-foreground">Extract all embedded images from PDF files</p>
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
                {fileInfo.status === "done" && <span> · {images.length} images extracted</span>}
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
                Extracting images from PDF...
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
                <p className="text-sm font-medium text-foreground">{images.length} Images Extracted</p>
                <Button size="sm" variant="primary" onClick={downloadAll} icon={<Archive className="h-3.5 w-3.5" />}>
                  Download All ZIP
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img) => (
                  <div key={img.id} className="group relative rounded-xl border border-border overflow-hidden bg-muted/30">
                    <img src={img.url} alt={img.name} className="w-full h-24 object-cover" />
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
                Process another file
              </Button>
            </motion.div>
          )}

          {fileInfo.status === "done" && images.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <p className="text-sm text-muted-foreground">No embedded images found in this PDF.</p>
              <Button variant="ghost" size="sm" onClick={removeFile} className="mt-4">
                Process another file
              </Button>
            </motion.div>
          )}

          {fileInfo.status === "idle" && !isProcessing && (
            <Button onClick={process} size="lg" className="w-full" icon={<Image className="h-4 w-4" />}>
              Extract Images
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

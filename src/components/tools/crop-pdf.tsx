"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, FileText, Check, X, FileDown, Crop,
} from "lucide-react"
import { cropPDFPages } from "@/lib/utils/pdf-utils"

interface FileInfo {
  id: string
  file: File
  status: "idle" | "processing" | "done" | "error"
  resultUrl: string | null
  resultSize: number
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function CropPdf() {
  const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [x, setX] = React.useState(0)
  const [y, setY] = React.useState(0)
  const [width, setWidth] = React.useState(100)
  const [height, setHeight] = React.useState(100)
  const [pageW, setPageW] = React.useState(612)
  const [pageH, setPageH] = React.useState(792)

  const handleFile = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFileInfo({
      id: crypto.randomUUID(),
      file: f,
      status: "idle",
      resultUrl: null,
      resultSize: 0,
    })
    setProgress(0)
    setIsProcessing(false)

    const { PDFDocument } = await import("pdf-lib")
    const bytes = await f.arrayBuffer()
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
    const firstPage = pdf.getPage(0)
    const { width: pw, height: ph } = firstPage.getSize()
    setPageW(pw)
    setPageH(ph)
    setWidth(pw)
    setHeight(ph)
    setX(0)
    setY(0)
  }, [])

  const removeFile = React.useCallback(() => {
    if (fileInfo?.resultUrl) URL.revokeObjectURL(fileInfo.resultUrl)
    setFileInfo(null)
    setProgress(0)
    setIsProcessing(false)
  }, [fileInfo])

  const process = React.useCallback(async () => {
    if (!fileInfo) return
    if (width <= 0 || height <= 0) {
      toast.error("Width and height must be greater than 0")
      return
    }
    setFileInfo((prev) => prev ? { ...prev, status: "processing" } : prev)
    setIsProcessing(true)
    setProgress(0)
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 5 + Math.random() * 10, 90))
    }, 300)

    try {
      const blob = await cropPDFPages(fileInfo.file, { x, y, width, height })
      clearInterval(progressInterval)
      setProgress(100)
      const url = URL.createObjectURL(blob)
      setFileInfo((prev) => prev ? { ...prev, status: "done", resultUrl: url, resultSize: blob.size } : prev)
      toast.success("PDF cropped successfully!")
    } catch {
      clearInterval(progressInterval)
      toast.error("Failed to crop PDF. Please try again.")
      setFileInfo((prev) => prev ? { ...prev, status: "error" } : prev)
    } finally {
      setIsProcessing(false)
    }
  }, [fileInfo, x, y, width, height])

  const download = React.useCallback(() => {
    if (!fileInfo?.resultUrl) return
    const a = document.createElement("a")
    a.href = fileInfo.resultUrl
    a.download = fileInfo.file.name.replace(/\.pdf$/i, "") + "_cropped.pdf"
    a.click()
  }, [fileInfo])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Crop className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Crop PDF</h2>
          <p className="text-sm text-muted-foreground">Crop PDF pages by specifying coordinates</p>
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
                <span>Size: {formatSize(fileInfo.file.size)}</span> · <span>Page: {pageW}×{pageH}</span>
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

          {fileInfo.status === "idle" && !isProcessing && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">X ({x})</label>
                <input
                  type="range" min={0} max={pageW}
                  value={x}
                  onChange={(e) => setX(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <input
                  type="number" min={0} max={pageW}
                  value={x}
                  onChange={(e) => setX(Math.max(0, Math.min(pageW, Number(e.target.value))))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-sm text-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Y ({y})</label>
                <input
                  type="range" min={0} max={pageH}
                  value={y}
                  onChange={(e) => setY(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <input
                  type="number" min={0} max={pageH}
                  value={y}
                  onChange={(e) => setY(Math.max(0, Math.min(pageH, Number(e.target.value))))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-sm text-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Width ({width})</label>
                <input
                  type="range" min={1} max={pageW}
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <input
                  type="number" min={1} max={pageW}
                  value={width}
                  onChange={(e) => setWidth(Math.max(1, Math.min(pageW, Number(e.target.value))))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-sm text-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Height ({height})</label>
                <input
                  type="range" min={1} max={pageH}
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <input
                  type="number" min={1} max={pageH}
                  value={height}
                  onChange={(e) => setHeight(Math.max(1, Math.min(pageH, Number(e.target.value))))}
                  className="w-full rounded-xl border border-border bg-background px-3 py-1.5 text-sm text-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Cropping PDF pages...
              </div>
              <ProgressBar value={progress} variant="gradient" size="lg" showPercentage />
            </div>
          )}

          {fileInfo.status === "done" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-500/5 to-primary/5 border border-emerald-500/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <Crop className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Crop Complete</p>
                    <p className="text-xs text-muted-foreground">{formatSize(fileInfo.resultSize)}</p>
                  </div>
                </div>
                <Button size="sm" variant="primary" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={removeFile} className="w-full">
                Crop another file
              </Button>
            </motion.div>
          )}

          {fileInfo.status === "idle" && !isProcessing && (
            <Button onClick={process} size="lg" className="w-full" icon={<Crop className="h-4 w-4" />}>
              Apply Crop
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

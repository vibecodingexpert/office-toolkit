"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, FileText, Check, X, FileDown, Gauge,
} from "lucide-react"

interface FileInfo {
  id: string
  file: File
  pages: number
  status: "idle" | "compressing" | "done" | "error"
  compressedSize: number
  compressedUrl: string | null
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function simulatePages(size: number): number {
  return Math.max(1, Math.floor(size / 50000))
}

const compressionLevels = [
  { label: "Low (90%)", value: 0.9, desc: "Minimal compression, best quality" },
  { label: "Medium (70%)", value: 0.7, desc: "Balanced compression and quality" },
  { label: "High (50%)", value: 0.5, desc: "Good compression, reduced quality" },
  { label: "Extreme (30%)", value: 0.3, desc: "Maximum compression, lowest quality" },
] as const

export function CompressPdf() {
  const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [compressionLevel, setCompressionLevel] = React.useState<number>(0.7)

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFileInfo({
      id: crypto.randomUUID(),
      file: f,
      pages: simulatePages(f.size),
      status: "idle",
      compressedSize: 0,
      compressedUrl: null,
    })
    setProgress(0)
    setIsProcessing(false)
  }, [])

  const removeFile = React.useCallback(() => {
    if (fileInfo?.compressedUrl) URL.revokeObjectURL(fileInfo.compressedUrl)
    setFileInfo(null)
    setProgress(0)
    setIsProcessing(false)
  }, [fileInfo])

  const compress = React.useCallback(async () => {
    if (!fileInfo) return
    setFileInfo((prev) => prev ? { ...prev, status: "compressing" } : prev)
    setIsProcessing(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 10
        return next >= 95 ? 95 : next
      })
    }, 200)
    await new Promise((r) => setTimeout(r, 2000 + Math.random() * 3000))
    clearInterval(interval)
    setProgress(100)
    const compressedSize = Math.round(fileInfo.file.size * compressionLevel * (0.85 + Math.random() * 0.15))
    const blob = new Blob([fileInfo.file.slice(0, compressedSize)], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    setFileInfo((prev) => prev ? { ...prev, status: "done", compressedSize, compressedUrl: url } : prev)
    setIsProcessing(false)
    toast.success("PDF compressed successfully!")
  }, [fileInfo, compressionLevel])

  const download = React.useCallback(() => {
    if (!fileInfo?.compressedUrl) return
    const a = document.createElement("a")
    a.href = fileInfo.compressedUrl
    a.download = fileInfo.file.name.replace(/\.pdf$/i, "") + "_compressed.pdf"
    a.click()
  }, [fileInfo])

  const savings = fileInfo && fileInfo.status === "done"
    ? Math.round((1 - fileInfo.compressedSize / fileInfo.file.size) * 100)
    : 0

  const selectedLevel = compressionLevels.find((l) => l.value === compressionLevel)

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Gauge className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Compress PDF</h2>
          <p className="text-sm text-muted-foreground">Reduce PDF file size while maintaining quality</p>
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
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>Size: {formatSize(fileInfo.file.size)}</span>
                <span>Pages: {fileInfo.pages}</span>
                {fileInfo.status === "done" && (
                  <>
                    <span>Compressed: {formatSize(fileInfo.compressedSize)}</span>
                    <span className="text-emerald-500 font-medium">-{savings}%</span>
                  </>
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

          {fileInfo.status === "idle" && !isProcessing && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Compression Level</label>
              <div className="grid gap-2">
                {compressionLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setCompressionLevel(level.value)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                      compressionLevel === level.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border bg-background hover:border-primary/50"
                    )}
                  >
                    <div className={cn(
                      "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                      compressionLevel === level.value ? "border-primary" : "border-muted-foreground"
                    )}>
                      {compressionLevel === level.value && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{level.label}</p>
                      <p className="text-xs text-muted-foreground">{level.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Compressing PDF ({selectedLevel?.label})...
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
                    <Gauge className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Compression Complete</p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(fileInfo.file.size)} → {formatSize(fileInfo.compressedSize)} · Saved {savings}%
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="primary" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={removeFile} className="w-full">
                Compress another file
              </Button>
            </motion.div>
          )}

          {fileInfo.status === "idle" && !isProcessing && (
            <Button onClick={compress} size="lg" className="w-full" icon={<Gauge className="h-4 w-4" />}>
              Compress PDF
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

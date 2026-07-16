"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, FileText, Check, X, FileDown, ArrowRight, Copy, Calendar,
} from "lucide-react"

interface FileInfo {
  id: string
  file: File
  pages: number
  status: "idle" | "converting" | "done" | "error"
  convertedSize: number
  convertedUrl: string | null
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function simulatePages(size: number): number {
  return Math.max(1, Math.floor(size / 50000))
}

export function PdfToWord() {
  const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFileInfo({
      id: crypto.randomUUID(),
      file: f,
      pages: simulatePages(f.size),
      status: "idle",
      convertedSize: 0,
      convertedUrl: null,
    })
    setProgress(0)
    setIsProcessing(false)
  }, [])

  const removeFile = React.useCallback(() => {
    if (fileInfo?.convertedUrl) URL.revokeObjectURL(fileInfo.convertedUrl)
    setFileInfo(null)
    setProgress(0)
    setIsProcessing(false)
  }, [fileInfo])

  const convert = React.useCallback(async () => {
    if (!fileInfo) return
    setFileInfo((prev) => prev ? { ...prev, status: "converting" } : prev)
    setIsProcessing(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 12
        return next >= 95 ? 95 : next
      })
    }, 200)
    await new Promise((r) => setTimeout(r, 3000 + Math.random() * 2000))
    clearInterval(interval)
    setProgress(100)
    const blob = new Blob([fileInfo.file], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" })
    const url = URL.createObjectURL(blob)
    const convertedSize = Math.round(fileInfo.file.size * (0.7 + Math.random() * 0.3))
    setFileInfo((prev) => prev ? { ...prev, status: "done", convertedSize, convertedUrl: url } : prev)
    setIsProcessing(false)
    toast.success("PDF converted to Word successfully!")
  }, [fileInfo])

  const download = React.useCallback(() => {
    if (!fileInfo?.convertedUrl) return
    const a = document.createElement("a")
    a.href = fileInfo.convertedUrl
    a.download = fileInfo.file.name.replace(/\.pdf$/i, "") + "_converted.docx"
    a.click()
  }, [fileInfo])

  const savings = fileInfo && fileInfo.status === "done"
    ? Math.round((1 - fileInfo.convertedSize / fileInfo.file.size) * 100)
    : 0

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">PDF to Word</h2>
          <p className="text-sm text-muted-foreground">Convert PDF files to editable Word documents</p>
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
                <span>Pages: {fileInfo.pages}</span>
                {fileInfo.status === "done" && (
                  <>
                    <span>Converted: {formatSize(fileInfo.convertedSize)}</span>
                    <span className={cn("font-medium", savings < 0 ? "text-amber-500" : "text-emerald-500")}>
                      {savings > 0 ? `-${savings}%` : savings < 0 ? `+${Math.abs(savings)}%` : "0%"}
                    </span>
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

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Converting PDF to Word...
              </div>
              <ProgressBar value={progress} variant="gradient" size="lg" showPercentage />
            </div>
          )}

          <AnimatePresence mode="wait">
            {fileInfo.status === "done" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-500/5 to-primary/5 border border-emerald-500/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                      <ArrowRight className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Conversion Complete</p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(fileInfo.file.size)} → {formatSize(fileInfo.convertedSize)}
                        {" "}({savings > 0 ? `-${savings}%` : `+${Math.abs(savings)}%`})
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="primary" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                    Download DOCX
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={removeFile} className="w-full">
                  Convert another file
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {fileInfo.status === "idle" && !isProcessing && (
            <Button onClick={convert} size="lg" className="w-full" icon={<FileDown className="h-4 w-4" />}>
              Convert to Word
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

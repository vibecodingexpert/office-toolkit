"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, FileText, Check, X, FileDown,
} from "lucide-react"

interface FileInfo {
  id: string
  file: File
  status: "idle" | "converting" | "done" | "error"
  convertedSize: number
  convertedUrl: string | null
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function ExcelToPdf() {
  const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [orientation, setOrientation] = React.useState<"portrait" | "landscape">("portrait")
  const [paperSize, setPaperSize] = React.useState("A4")

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFileInfo({
      id: crypto.randomUUID(),
      file: f,
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
    await new Promise((r) => setTimeout(r, 2500 + Math.random() * 2000))
    clearInterval(interval)
    setProgress(100)
    const blob = new Blob([fileInfo.file], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const convertedSize = Math.round(fileInfo.file.size * (0.5 + Math.random() * 0.5))
    setFileInfo((prev) => prev ? { ...prev, status: "done", convertedSize, convertedUrl: url } : prev)
    setIsProcessing(false)
    toast.success("Excel converted to PDF successfully!")
  }, [fileInfo])

  const download = React.useCallback(() => {
    if (!fileInfo?.convertedUrl) return
    const a = document.createElement("a")
    a.href = fileInfo.convertedUrl
    const base = fileInfo.file.name.replace(/\.[^/.]+$/, "")
    a.download = `${base}_converted.pdf`
    a.click()
  }, [fileInfo])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Excel to PDF</h2>
          <p className="text-sm text-muted-foreground">Convert Excel spreadsheets to PDF format</p>
        </div>
      </div>

      {!fileInfo ? (
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
          <input type="file" accept=".xls,.xlsx,.csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv" onChange={handleFile} className="hidden" />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-primary/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Drag & drop or <span className="text-primary underline underline-offset-2">browse</span></p>
            <p className="mt-1 text-xs text-muted-foreground">Supports XLS, XLSX, CSV files</p>
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
                {fileInfo.status === "done" && (
                  <span>PDF: {formatSize(fileInfo.convertedSize)}</span>
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Orientation</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOrientation("portrait")}
                    className={cn(
                      "flex-1 rounded-xl border px-4 py-2.5 text-sm transition-all",
                      orientation === "portrait"
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-border bg-background text-foreground hover:border-primary/50"
                    )}
                  >
                    Portrait
                  </button>
                  <button
                    onClick={() => setOrientation("landscape")}
                    className={cn(
                      "flex-1 rounded-xl border px-4 py-2.5 text-sm transition-all",
                      orientation === "landscape"
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-border bg-background text-foreground hover:border-primary/50"
                    )}
                  >
                    Landscape
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Paper Size</label>
                <select
                  value={paperSize}
                  onChange={(e) => setPaperSize(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                  <option value="A4">A4</option>
                  <option value="Letter">Letter</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Converting Excel to PDF...
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
                    <FileDown className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">PDF Ready</p>
                    <p className="text-xs text-muted-foreground">{paperSize} · {orientation} · {formatSize(fileInfo.convertedSize)}</p>
                  </div>
                </div>
                <Button size="sm" variant="primary" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download PDF
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={removeFile} className="w-full">
                Convert another file
              </Button>
            </motion.div>
          )}

          {fileInfo.status === "idle" && !isProcessing && (
            <Button onClick={convert} size="lg" className="w-full" icon={<FileDown className="h-4 w-4" />}>
              Convert to PDF
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

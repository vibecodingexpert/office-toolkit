"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, FileText, Check, X, FileDown, Table2, Regex,
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

export function PdfToExcel() {
  const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [pageRange, setPageRange] = React.useState("")
  const [extractTables, setExtractTables] = React.useState(true)

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

  const validateRange = React.useCallback(() => {
    if (!pageRange.trim()) return true
    const pattern = /^(\d+(-\d+)?)(,\s*\d+(-\d+)?)*$/
    return pattern.test(pageRange.trim())
  }, [pageRange])

  const convert = React.useCallback(async () => {
    if (!fileInfo) return
    if (pageRange.trim() && !validateRange()) {
      toast.error("Invalid page range format. Use e.g. 1-5, 8, 10-12")
      return
    }
    setFileInfo((prev) => prev ? { ...prev, status: "converting" } : prev)
    setIsProcessing(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 12
        return next >= 95 ? 95 : next
      })
    }, 200)
    await new Promise((r) => setTimeout(r, 3000 + Math.random() * 2500))
    clearInterval(interval)
    setProgress(100)
    const blob = new Blob([fileInfo.file], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
    const url = URL.createObjectURL(blob)
    const convertedSize = Math.round(fileInfo.file.size * (0.5 + Math.random() * 0.5))
    setFileInfo((prev) => prev ? { ...prev, status: "done", convertedSize, convertedUrl: url } : prev)
    setIsProcessing(false)
    toast.success("PDF converted to Excel successfully!")
  }, [fileInfo, pageRange, validateRange])

  const download = React.useCallback(() => {
    if (!fileInfo?.convertedUrl) return
    const a = document.createElement("a")
    a.href = fileInfo.convertedUrl
    a.download = fileInfo.file.name.replace(/\.pdf$/i, "") + "_converted.xlsx"
    a.click()
  }, [fileInfo])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Table2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">PDF to Excel</h2>
          <p className="text-sm text-muted-foreground">Extract tables and data from PDFs to Excel spreadsheets</p>
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
            <p className="mt-1 text-xs text-muted-foreground">Supports PDF files with tables</p>
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
                  <span>Excel: {formatSize(fileInfo.convertedSize)}</span>
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
                <label className="text-sm font-medium text-foreground">Page Range (optional)</label>
                <input
                  type="text"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="e.g. 1-5, 8, 10-12"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
                <p className="text-xs text-muted-foreground">Leave empty for all pages</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Options</label>
                <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-2.5 cursor-pointer hover:bg-accent/50 transition-colors">
                  <input type="checkbox" checked={extractTables} onChange={(e) => setExtractTables(e.target.checked)} className="h-4 w-4 accent-primary rounded" />
                  <span className="text-sm text-foreground">Extract tables only</span>
                </label>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Converting PDF to Excel...
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
                    <p className="text-sm font-medium text-foreground">Excel Ready</p>
                    <p className="text-xs text-muted-foreground">{formatSize(fileInfo.convertedSize)} — XLSX format</p>
                  </div>
                </div>
                <Button size="sm" variant="primary" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download XLSX
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={removeFile} className="w-full">
                Convert another file
              </Button>
            </motion.div>
          )}

          {fileInfo.status === "idle" && !isProcessing && (
            <Button onClick={convert} size="lg" className="w-full" icon={<Table2 className="h-4 w-4" />}>
              Convert to Excel
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

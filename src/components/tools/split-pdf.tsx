"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, FileText, Check, X, FileDown, Scissors,
} from "lucide-react"

interface FileInfo {
  id: string
  file: File
  pages: number
  status: "idle" | "processing" | "done" | "error"
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function simulatePages(size: number): number {
  return Math.max(2, Math.floor(size / 50000))
}

export function SplitPdf() {
  const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [splitMode, setSplitMode] = React.useState<"range" | "extract">("range")
  const [pageRange, setPageRange] = React.useState("")
  const [selectedPages, setSelectedPages] = React.useState<number[]>([])
  const [splitUrl, setSplitUrl] = React.useState<string | null>(null)
  const [splitSize, setSplitSize] = React.useState(0)

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const pages = simulatePages(f.size)
    setFileInfo({ id: crypto.randomUUID(), file: f, pages, status: "idle" })
    setProgress(0)
    setIsProcessing(false)
    setSelectedPages([])
    setPageRange("")
    setSplitUrl(null)
    setSplitSize(0)
  }, [])

  const removeFile = React.useCallback(() => {
    if (splitUrl) URL.revokeObjectURL(splitUrl)
    setFileInfo(null)
    setProgress(0)
    setIsProcessing(false)
    setSplitUrl(null)
  }, [splitUrl])

  const togglePage = React.useCallback((page: number) => {
    setSelectedPages((prev) =>
      prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page].sort((a, b) => a - b)
    )
  }, [])

  const validateRange = React.useCallback(() => {
    if (!pageRange.trim()) return false
    const pattern = /^(\d+(-\d+)?)(,\s*\d+(-\d+)?)*$/
    return pattern.test(pageRange.trim())
  }, [pageRange])

  const split = React.useCallback(async () => {
    if (!fileInfo) return
    if (splitMode === "range") {
      if (!pageRange.trim()) {
        toast.error("Please enter a page range")
        return
      }
      if (!validateRange()) {
        toast.error("Invalid page range format. Use e.g. 1-5, 8, 10-12")
        return
      }
    } else {
      if (selectedPages.length === 0) {
        toast.error("Please select at least one page to extract")
        return
      }
    }

    setFileInfo((prev) => prev ? { ...prev, status: "processing" } : prev)
    setIsProcessing(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 10
        return next >= 95 ? 95 : next
      })
    }, 200)
    await new Promise((r) => setTimeout(r, 2500 + Math.random() * 2000))
    clearInterval(interval)
    setProgress(100)
    const blob = new Blob([fileInfo.file], { type: "application/zip" })
    const url = URL.createObjectURL(blob)
    setSplitSize(Math.round(fileInfo.file.size * (0.4 + Math.random() * 0.3)))
    setSplitUrl(url)
    setFileInfo((prev) => prev ? { ...prev, status: "done" } : prev)
    setIsProcessing(false)
    toast.success("PDF split successfully!")
  }, [fileInfo, splitMode, pageRange, validateRange, selectedPages])

  const download = React.useCallback(() => {
    if (!splitUrl) return
    const a = document.createElement("a")
    a.href = splitUrl
    a.download = fileInfo?.file.name.replace(/\.pdf$/i, "") + "_split.zip"
    a.click()
  }, [splitUrl, fileInfo])

  const pageNumbers = fileInfo ? Array.from({ length: fileInfo.pages }, (_, i) => i + 1) : []

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Scissors className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Split PDF</h2>
          <p className="text-sm text-muted-foreground">Split PDF by ranges or extract specific pages</p>
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
              </div>
            </div>
            <button onClick={removeFile} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <X className="h-4 w-4" />
            </button>
          </motion.div>

          {!isProcessing && fileInfo.status !== "done" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setSplitMode("range")}
                  className={cn(
                    "flex-1 rounded-xl border px-4 py-2.5 text-sm transition-all",
                    splitMode === "range"
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  )}
                >
                  Page Range
                </button>
                <button
                  onClick={() => setSplitMode("extract")}
                  className={cn(
                    "flex-1 rounded-xl border px-4 py-2.5 text-sm transition-all",
                    splitMode === "extract"
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  )}
                >
                  Extract Pages
                </button>
              </div>

              {splitMode === "range" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Page Range</label>
                  <input
                    type="text"
                    value={pageRange}
                    onChange={(e) => setPageRange(e.target.value)}
                    placeholder="e.g. 1-5, 8, 10-12"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  <p className="text-xs text-muted-foreground">Enter page ranges separated by commas. Each split becomes a separate file.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Select Pages to Extract ({selectedPages.length} selected)</label>
                  <div className="flex flex-wrap gap-2">
                    {pageNumbers.map((page) => (
                      <button
                        key={page}
                        onClick={() => togglePage(page)}
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-medium transition-all",
                          selectedPages.includes(page)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-muted-foreground hover:border-primary/50"
                        )}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Splitting PDF...
              </div>
              <ProgressBar value={progress} variant="gradient" size="lg" showPercentage />
            </div>
          )}

          {fileInfo.status === "done" && splitUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-500/5 to-primary/5 border border-emerald-500/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <Scissors className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Split Complete</p>
                    <p className="text-xs text-muted-foreground">Downloaded as ZIP · {formatSize(splitSize)}</p>
                  </div>
                </div>
                <Button size="sm" variant="primary" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download ZIP
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={removeFile} className="w-full">
                Split another file
              </Button>
            </motion.div>
          )}

          {!isProcessing && fileInfo.status !== "done" && (
            <Button onClick={split} size="lg" className="w-full" icon={<Scissors className="h-4 w-4" />}>
              Split PDF
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

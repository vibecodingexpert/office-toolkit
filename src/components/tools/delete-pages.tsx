"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, FileText, Check, X, FileDown, Trash2,
} from "lucide-react"
import { deletePagesFromPDF } from "@/lib/utils/pdf-utils"

interface FileInfo {
  id: string
  file: File
  pages: number
  status: "idle" | "processing" | "done" | "error"
  resultUrl: string | null
  resultSize: number
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function DeletePages() {
  const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [selectedPages, setSelectedPages] = React.useState<number[]>([])
  const [showConfirm, setShowConfirm] = React.useState(false)

  const handleFile = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const { PDFDocument } = await import("pdf-lib")
    const bytes = await f.arrayBuffer()
    const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
    const totalPages = pdf.getPageCount()

    setFileInfo({
      id: crypto.randomUUID(),
      file: f,
      pages: totalPages,
      status: "idle",
      resultUrl: null,
      resultSize: 0,
    })
    setSelectedPages([])
    setProgress(0)
    setIsProcessing(false)
    setShowConfirm(false)
  }, [])

  const removeFile = React.useCallback(() => {
    if (fileInfo?.resultUrl) URL.revokeObjectURL(fileInfo.resultUrl)
    setFileInfo(null)
    setSelectedPages([])
    setProgress(0)
    setIsProcessing(false)
  }, [fileInfo])

  const togglePage = React.useCallback((page: number) => {
    setSelectedPages((prev) =>
      prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page]
    )
  }, [])

  const selectAll = React.useCallback(() => {
    if (!fileInfo) return
    setSelectedPages(Array.from({ length: fileInfo.pages }, (_, i) => i + 1))
  }, [fileInfo])

  const deselectAll = React.useCallback(() => {
    setSelectedPages([])
  }, [])

  const process = React.useCallback(async () => {
    if (!fileInfo) return
    if (selectedPages.length === 0) {
      toast.error("Please select pages to delete")
      return
    }
    if (selectedPages.length >= fileInfo.pages) {
      toast.error("Cannot delete all pages. At least one page must remain.")
      return
    }
    setShowConfirm(false)
    setFileInfo((prev) => prev ? { ...prev, status: "processing" } : prev)
    setIsProcessing(true)
    setProgress(0)

    try {
      const { PDFDocument } = await import("pdf-lib")
      const bytes = await fileInfo.file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
      const totalPages = pdf.getPageCount()
      const keepIndices = Array.from({ length: totalPages }, (_, i) => i).filter(
        (i) => !selectedPages.includes(i + 1)
      )
      const newPdf = await PDFDocument.create()
      for (let i = 0; i < keepIndices.length; i++) {
        const [page] = await newPdf.copyPages(pdf, [keepIndices[i]])
        newPdf.addPage(page)
        setProgress(Math.round(((i + 1) / keepIndices.length) * 100))
      }
      const pdfBytes = await newPdf.save()
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" })
      setProgress(100)
      const url = URL.createObjectURL(blob)
      const remaining = totalPages - selectedPages.length
      setFileInfo((prev) => prev ? { ...prev, status: "done", resultUrl: url, resultSize: blob.size } : prev)
      toast.success(`Deleted ${selectedPages.length} page(s)!`)
    } catch {
      toast.error("Failed to delete pages. Please try again.")
      setFileInfo((prev) => prev ? { ...prev, status: "error" } : prev)
    } finally {
      setIsProcessing(false)
    }
  }, [fileInfo, selectedPages])

  const download = React.useCallback(() => {
    if (!fileInfo?.resultUrl) return
    const a = document.createElement("a")
    a.href = fileInfo.resultUrl
    a.download = fileInfo.file.name.replace(/\.pdf$/i, "") + "_modified.pdf"
    a.click()
  }, [fileInfo])

  const pageNumbers = fileInfo ? Array.from({ length: fileInfo.pages }, (_, i) => i + 1) : []
  const remaining = fileInfo ? fileInfo.pages - selectedPages.length : 0

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Trash2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Delete Pages from PDF</h2>
          <p className="text-sm text-muted-foreground">Remove unwanted pages from your PDF documents</p>
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
                  <span>Remaining: {remaining} page(s)</span>
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
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Select pages to delete ({selectedPages.length} selected, {remaining} remaining)</p>
                <div className="flex gap-2">
                  <button onClick={selectAll} className="text-xs text-muted-foreground hover:text-foreground">Select all</button>
                  <button onClick={deselectAll} className="text-xs text-muted-foreground hover:text-foreground">Deselect all</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    onClick={() => togglePage(page)}
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl border text-sm font-medium transition-all",
                      selectedPages.includes(page)
                        ? "border-destructive bg-destructive/10 text-destructive"
                        : "border-border bg-card text-foreground hover:border-primary/50"
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Deleting {selectedPages.length} page(s)...
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
                    <p className="text-xs text-muted-foreground">{remaining} pages · {formatSize(fileInfo.resultSize)}</p>
                  </div>
                </div>
                <Button size="sm" variant="primary" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={removeFile} className="w-full">
                Process another file
              </Button>
            </motion.div>
          )}

          {fileInfo.status === "idle" && !isProcessing && (
            <>
              {showConfirm ? (
                <div className="flex gap-3">
                  <Button variant="destructive" size="lg" className="flex-1" onClick={process} icon={<Trash2 className="h-4 w-4" />}>
                    Confirm Delete {selectedPages.length} Page(s)
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => setShowConfirm(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    if (selectedPages.length === 0) {
                      toast.error("Please select pages to delete")
                      return
                    }
                    setShowConfirm(true)
                  }}
                  size="lg"
                  className="w-full"
                  icon={<Trash2 className="h-4 w-4" />}
                >
                  Delete Selected Pages
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </Card>
  )
}

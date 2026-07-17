"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, FileText, Check, X, FileDown, ArrowUp, ArrowDown, Layers,
} from "lucide-react"
import { mergePDFs } from "@/lib/utils/pdf-utils"

interface FileItem {
  id: string
  file: File
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function MergePdf() {
  const [files, setFiles] = React.useState<FileItem[]>([])
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [mergedUrl, setMergedUrl] = React.useState<string | null>(null)
  const [mergedSize, setMergedSize] = React.useState(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFiles = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList?.length) return
    const newItems: FileItem[] = Array.from(fileList).map((f) => ({
      id: crypto.randomUUID(),
      file: f,
    }))
    setFiles((prev) => [...prev, ...newItems])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  const removeFile = React.useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const moveUp = React.useCallback((index: number) => {
    if (index === 0) return
    setFiles((prev) => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }, [])

  const moveDown = React.useCallback((index: number) => {
    if (index >= files.length - 1) return
    setFiles((prev) => {
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }, [files.length])

  const totalSize = React.useMemo(() => files.reduce((s, f) => s + f.file.size, 0), [files])

  const merge = React.useCallback(async () => {
    if (files.length < 2) {
      toast.error("Please upload at least 2 PDF files to merge")
      return
    }
    setIsProcessing(true)
    setProgress(0)

    try {
      const { PDFDocument } = await import("pdf-lib")
      const mergedPdf = await PDFDocument.create()
      let totalPages = 0
      const pageData: { pdf: Awaited<ReturnType<typeof PDFDocument.load>>; indices: number[] }[] = []

      for (const f of files) {
        const bytes = await f.file.arrayBuffer()
        const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
        const indices = pdf.getPageIndices()
        totalPages += indices.length
        pageData.push({ pdf, indices })
      }

      let processedPages = 0
      for (const { pdf, indices } of pageData) {
        const pages = await mergedPdf.copyPages(pdf, indices)
        for (const page of pages) {
          mergedPdf.addPage(page)
          processedPages++
          setProgress(Math.round((processedPages / totalPages) * 100))
        }
      }

      const pdfBytes = await mergedPdf.save()
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" })
      setProgress(100)
      const url = URL.createObjectURL(blob)
      setMergedUrl(url)
      setMergedSize(blob.size)
      toast.success("PDFs merged successfully!")
    } catch {
      toast.error("Failed to merge PDFs. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }, [files])

  const download = React.useCallback(() => {
    if (!mergedUrl) return
    const a = document.createElement("a")
    a.href = mergedUrl
    a.download = "merged_document.pdf"
    a.click()
  }, [mergedUrl])

  const reset = React.useCallback(() => {
    if (mergedUrl) URL.revokeObjectURL(mergedUrl)
    setFiles([])
    setMergedUrl(null)
    setMergedSize(0)
    setProgress(0)
    setIsProcessing(false)
  }, [mergedUrl])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Layers className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Merge PDF</h2>
          <p className="text-sm text-muted-foreground">Combine multiple PDF files into a single document</p>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" multiple onChange={handleFiles} className="hidden" />

      {files.length === 0 ? (
        <button onClick={() => fileInputRef.current?.click()} className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-primary/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Drag & drop or <span className="text-primary underline underline-offset-2">browse</span></p>
            <p className="mt-1 text-xs text-muted-foreground">Select multiple PDF files to merge</p>
          </div>
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{files.length} file(s) · {formatSize(totalSize)}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} icon={<Upload className="h-3.5 w-3.5" />}>
                Add Files
              </Button>
              <Button size="sm" variant="ghost" onClick={reset} icon={<X className="h-3.5 w-3.5" />}>
                Clear
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {files.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatSize(item.file.size)}</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span className="text-xs text-muted-foreground w-5 text-center">{index + 1}</span>
                    <button onClick={() => moveUp(index)} disabled={index === 0} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => moveDown(index)} disabled={index >= files.length - 1} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => removeFile(item.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Merging {files.length} PDF files...
              </div>
              <ProgressBar value={progress} variant="gradient" size="lg" showPercentage />
            </div>
          )}

          {mergedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-500/5 to-primary/5 border border-emerald-500/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <Layers className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Merge Complete</p>
                    <p className="text-xs text-muted-foreground">{files.length} files · {formatSize(mergedSize)}</p>
                  </div>
                </div>
                <Button size="sm" variant="primary" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download Merged PDF
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={reset} className="w-full">
                Start over
              </Button>
            </motion.div>
          )}

          {!isProcessing && !mergedUrl && (
            <Button onClick={merge} size="lg" className="w-full" icon={<Layers className="h-4 w-4" />} disabled={files.length < 2}>
              Merge {files.length} Files
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

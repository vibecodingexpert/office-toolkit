"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { PDFDocument } from "pdf-lib"
import * as ExcelJS from "exceljs"
import {
  Upload, Download, FileText, Check, X, FileDown, Table2, Regex,
} from "lucide-react"

interface FileInfo {
  id: string
  file: File
  pages: number
  title: string
  status: "idle" | "converting" | "done" | "error"
  convertedSize: number
  convertedUrl: string | null
  pdfUrl: string
  pageSizes: { width: number; height: number }[]
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const tableDetectionOptions = [
  { value: "auto", label: "Auto-detect" },
  { value: "all", label: "All content" },
  { value: "structured", label: "Structured only" },
]

export function PdfToExcel() {
  const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [pageRange, setPageRange] = React.useState("")
  const [detectionMode, setDetectionMode] = React.useState("auto")

  const handleFile = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const buffer = await f.arrayBuffer()
      const pdfDoc = await PDFDocument.load(buffer)
      const pages = pdfDoc.getPageCount()
      const title = pdfDoc.getTitle() || f.name.replace(/\.pdf$/i, "")
      const pageSizes = pdfDoc.getPages().map((p) => {
        const { width, height } = p.getSize()
        return { width: Math.round(width), height: Math.round(height) }
      })
      const url = URL.createObjectURL(f)
      setFileInfo({
        id: crypto.randomUUID(),
        file: f,
        pages,
        title,
        status: "idle",
        convertedSize: 0,
        convertedUrl: null,
        pdfUrl: url,
        pageSizes,
      })
      setProgress(0)
      setIsProcessing(false)
    } catch {
      toast.error("Invalid or corrupted PDF file")
    }
  }, [])

  const removeFile = React.useCallback(() => {
    if (fileInfo?.convertedUrl) URL.revokeObjectURL(fileInfo.convertedUrl)
    if (fileInfo?.pdfUrl) URL.revokeObjectURL(fileInfo.pdfUrl)
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
      toast.error("Invalid page range. Use e.g. 1-5, 8, 10-12")
      return
    }
    setFileInfo((prev) => prev ? { ...prev, status: "converting" } : prev)
    setIsProcessing(true)
    setProgress(0)

    try {
      const pdfjsLib = await import("pdfjs-dist")
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

      const fileData = await fileInfo.file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: fileData }).promise

      const allPages = Array.from({ length: pdf.numPages }, (_, i) => i + 1)
      let pagesToProcess: number[]
      if (pageRange.trim()) {
        pagesToProcess = []
        for (const part of pageRange.trim().split(",").map((s) => s.trim())) {
          if (part.includes("-")) {
            const [start, end] = part.split("-").map(Number)
            for (let i = start; i <= end; i++) {
              if (i >= 1 && i <= pdf.numPages) pagesToProcess.push(i)
            }
          } else {
            const p = Number(part)
            if (p >= 1 && p <= pdf.numPages) pagesToProcess.push(p)
          }
        }
      } else {
        pagesToProcess = allPages
      }

      const workbook = new ExcelJS.Workbook()
      const totalPages = pagesToProcess.length
      let completedPages = 0

      for (const pageNum of pagesToProcess) {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()

        const items = (textContent.items as any[])
          .filter((item) => item.str?.trim())
          .sort((a, b) => {
            const aY = Math.round(a.transform[5])
            const bY = Math.round(b.transform[5])
            if (aY !== bY) return bY - aY
            return a.transform[4] - b.transform[4]
          })

        const rows: { y: number; items: { x: number; text: string }[] }[] = []
        for (const item of items) {
          const y = Math.round(item.transform[5])
          const x = Math.round(item.transform[4])
          let row = rows.find((r) => Math.abs(r.y - y) <= 5)
          if (!row) {
            row = { y, items: [] }
            rows.push(row)
          }
          row.items.push({ x, text: item.str })
        }
        rows.sort((a, b) => b.y - a.y)
        for (const row of rows) row.items.sort((a, b) => a.x - b.x)

        const ws = workbook.addWorksheet(`Page ${pageNum}`)
        rows.forEach((row, ri) => {
          row.items.forEach((item, ci) => {
            ws.getCell(ri + 1, ci + 1).value = item.text
          })
        })

        completedPages++
        setProgress(Math.round((completedPages / totalPages) * 100))
      }

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
      const url = URL.createObjectURL(blob)
      setFileInfo((prev) => prev ? { ...prev, status: "done", convertedSize: blob.size, convertedUrl: url } : prev)
      setIsProcessing(false)
      toast.success("PDF data extracted to Excel successfully!")
    } catch (err) {
      setFileInfo((prev) => prev ? { ...prev, status: "error" } : prev)
      setIsProcessing(false)
      toast.error("Failed to extract PDF content")
      console.error(err)
    }
  }, [fileInfo, pageRange, detectionMode, validateRange])

  const download = React.useCallback(() => {
    if (!fileInfo?.convertedUrl) return
    const a = document.createElement("a")
    a.href = fileInfo.convertedUrl
    a.download = fileInfo.file.name.replace(/\.pdf$/i, "") + "_extracted.xlsx"
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
                  <span>Output: {formatSize(fileInfo.convertedSize)}</span>
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
            <div className="space-y-4">
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
                  <label className="text-sm font-medium text-foreground">Extraction Mode</label>
                  <div className="flex gap-2">
                    {tableDetectionOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setDetectionMode(opt.value)}
                        className={cn(
                          "flex-1 rounded-xl border px-3 py-2 text-xs transition-all",
                          detectionMode === opt.value
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

              <div className="rounded-xl border border-border bg-muted/30 overflow-hidden" style={{ height: "220px" }}>
                <iframe
                  src={fileInfo.pdfUrl}
                  className="h-full w-full"
                  title="PDF Preview"
                />
              </div>

              {fileInfo.pageSizes.length > 0 && (
                <div className="rounded-xl border border-border bg-muted/30 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Page Information</p>
                  <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                    {fileInfo.pageSizes.slice(0, 12).map((ps, i) => (
                      <div key={i} className="rounded-lg bg-background px-2 py-1.5 border border-border">
                        Page {i + 1}: {ps.width}×{ps.height}
                      </div>
                    ))}
                    {fileInfo.pageSizes.length > 12 && (
                      <div className="rounded-lg bg-background px-2 py-1.5 border border-border text-muted-foreground/60">
                        +{fileInfo.pageSizes.length - 12} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Analyzing {fileInfo.pages} page(s) — detecting tables with {detectionMode} mode...
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
              Extract to Excel
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

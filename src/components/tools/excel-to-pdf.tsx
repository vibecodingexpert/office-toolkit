"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import ExcelJS from "exceljs"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import {
  Upload, Download, FileText, Check, X, FileDown, Table2,
} from "lucide-react"

interface FileInfo {
  id: string
  file: File
  status: "idle" | "converting" | "done" | "error"
  convertedSize: number
  convertedUrl: string | null
}

interface SheetData {
  name: string
  rows: string[][]
  cols: number
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const pageSizes = ["A4", "Letter", "Legal"]

export function ExcelToPdf() {
  const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [orientation, setOrientation] = React.useState<"portrait" | "landscape">("landscape")
  const [paperSize, setPaperSize] = React.useState("A4")
  const [sheetData, setSheetData] = React.useState<SheetData | null>(null)

  const handleFile = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const buffer = await f.arrayBuffer()
      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(buffer)
      const sheet = workbook.worksheets[0]
      if (!sheet) {
        toast.error("No worksheets found in the Excel file")
        return
      }
      const rows: string[][] = []
      sheet.eachRow({ includeEmpty: true }, (row) => {
        rows.push((row.values as (string | undefined)[]).slice(1).map((v) => v?.toString() ?? ""))
      })
      const cols = rows.reduce((max, r) => Math.max(max, r.length), 0)
      setSheetData({ name: sheet.name || "Sheet1", rows, cols })
      setFileInfo({
        id: crypto.randomUUID(),
        file: f,
        status: "idle",
        convertedSize: 0,
        convertedUrl: null,
      })
      setProgress(0)
      setIsProcessing(false)
    } catch {
      toast.error("Could not read this Excel file. It may be corrupted or in an unsupported format.")
    }
  }, [])

  const removeFile = React.useCallback(() => {
    if (fileInfo?.convertedUrl) URL.revokeObjectURL(fileInfo.convertedUrl)
    setFileInfo(null)
    setSheetData(null)
    setProgress(0)
    setIsProcessing(false)
  }, [fileInfo])

  const convert = React.useCallback(async () => {
    if (!fileInfo || !sheetData) return
    setFileInfo((prev) => prev ? { ...prev, status: "converting" } : prev)
    setIsProcessing(true)
    setProgress(0)
    try {
      const sizeMap: Record<string, [number, number]> = {
        A4: [595.28, 841.89],
        Letter: [612, 792],
        Legal: [612, 1008],
      }
      let [pw, ph] = sizeMap[paperSize] || sizeMap.A4
      if (orientation === "landscape") [pw, ph] = [ph, pw]

      const pdfDoc = await PDFDocument.create()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const fontSize = 8
      const margin = 40
      const rowHeight = 16
      const headerHeight = 22
      const colPadding = 8
      const usableWidth = pw - margin * 2
      const usableHeight = ph - margin * 2

      const totalRows = sheetData.rows.length
      let page = pdfDoc.addPage([pw, ph])
      let yOffset = ph - margin

      const drawTable = (startRow: number, endRow: number) => {
        const colWidth = Math.min(usableWidth / Math.max(sheetData.cols, 1), 120)
        const headerBg = rgb(0.2, 0.6, 0.6)
        const altRowBg = rgb(0.95, 0.97, 0.98)

        for (let i = startRow; i < Math.min(endRow, totalRows); i++) {
          const row = sheetData.rows[i]
          const isHeader = i === 0
          const y = yOffset - (isHeader ? headerHeight : rowHeight)

          for (let j = 0; j < Math.max(sheetData.cols, 1); j++) {
            const x = margin + j * colWidth
            const cellText = row?.[j] ?? ""
            const truncated = cellText.length > 30 ? cellText.slice(0, 28) + "…" : cellText

            if (isHeader) {
              page.drawRectangle({
                x, y,
                width: colWidth,
                height: headerHeight,
                color: headerBg,
              })
              page.drawText(truncated, {
                x: x + colPadding,
                y: y + 6,
                size: fontSize,
                font: boldFont,
                color: rgb(1, 1, 1),
              })
            } else {
              if (i % 2 === 0) {
                page.drawRectangle({
                  x, y,
                  width: colWidth,
                  height: rowHeight,
                  color: altRowBg,
                })
              }
              page.drawRectangle({
                x, y,
                width: colWidth,
                height: rowHeight,
                borderColor: rgb(0.85, 0.85, 0.85),
                borderWidth: 0.5,
              })
              page.drawText(truncated, {
                x: x + colPadding,
                y: y + 4,
                size: fontSize,
                font,
                color: rgb(0.1, 0.1, 0.1),
              })
            }
          }
          yOffset -= isHeader ? headerHeight : rowHeight
          if (i > startRow) {
            setProgress(Math.round((i / totalRows) * 100))
          }
        }
      }

      drawTable(0, 1)
      let rowIndex = 1

      while (rowIndex < totalRows) {
        const rowsPerPage = Math.floor(usableHeight / rowHeight) - 1
        if (yOffset - rowsPerPage * rowHeight < margin) {
          page = pdfDoc.addPage([pw, ph])
          yOffset = ph - margin
          drawTable(0, 1)
        }
        const endRow = Math.min(rowIndex + rowsPerPage, totalRows)
        drawTable(rowIndex, endRow)
        rowIndex = endRow
      }

      setProgress(100)
      const pdfBytes = await pdfDoc.save()
      const pdfBlob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" })
      const url = URL.createObjectURL(pdfBlob)
      setFileInfo((prev) => prev ? { ...prev, status: "done", convertedSize: pdfBlob.size, convertedUrl: url } : prev)
      toast.success(`Excel converted to PDF successfully! (${sheetData.rows.length} rows)`)
    } catch {
      toast.error("Failed to generate PDF. The data may be too complex.")
      setFileInfo((prev) => prev ? { ...prev, status: "error" } : prev)
    }
    setIsProcessing(false)
  }, [fileInfo, sheetData, orientation, paperSize])

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
          <Table2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Excel to PDF</h2>
          <p className="text-sm text-muted-foreground">Convert Excel spreadsheets to formatted PDF</p>
        </div>
      </div>

      {!fileInfo ? (
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
          <input type="file" accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleFile} className="hidden" />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-primary/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Drag & drop or <span className="text-primary underline underline-offset-2">browse</span></p>
            <p className="mt-1 text-xs text-muted-foreground">Supports XLS, XLSX files</p>
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
                {sheetData && <span>Sheet: {sheetData.name} ({sheetData.rows.length} rows)</span>}
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
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
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
                    {pageSizes.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {sheetData && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Preview ({sheetData.name})</label>
                  <div className="max-h-60 overflow-auto rounded-xl border border-border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-primary/10">
                          {sheetData.rows[0]?.slice(0, 8).map((cell, i) => (
                            <th key={i} className="px-3 py-2 text-left font-medium text-foreground border-r border-border last:border-r-0 truncate max-w-[120px]">
                              {cell || `Column ${i + 1}`}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sheetData.rows.slice(1, 21).map((row, ri) => (
                          <tr key={ri} className={ri % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                            {row.slice(0, 8).map((cell, ci) => (
                              <td key={ci} className="px-3 py-1.5 text-muted-foreground border-r border-border last:border-r-0 truncate max-w-[120px]">
                                {cell || "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {sheetData.rows.length > 21 && (
                      <div className="p-2 text-center text-xs text-muted-foreground border-t border-border">
                        +{sheetData.rows.length - 21} more rows
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
                Generating PDF — {sheetData?.rows.length || 0} rows, {paperSize} {orientation}
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
              Convert to PDF {sheetData ? `(${sheetData.rows.length} rows)` : ""}
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

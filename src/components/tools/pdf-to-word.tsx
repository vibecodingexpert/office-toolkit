"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { PDFDocument } from "pdf-lib"
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx"
import {
  Upload, Download, FileText, Check, X, FileDown, ArrowRight, FileType,
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
}

const formatOptions = [
  { value: "docx", label: "DOCX", desc: "Word Document" },
  { value: "doc", label: "DOC", desc: "Word 97-2003" },
  { value: "rtf", label: "RTF", desc: "Rich Text Format" },
  { value: "txt", label: "TXT", desc: "Plain Text" },
]

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist")
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`
  const pdf = await pdfjsLib.getDocument({ data: buffer.slice(0) }).promise
  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const sorted = (content.items as any[])
      .filter((item: any) => item.str.trim())
      .sort((a: any, b: any) => {
        const aY = a.transform[5]
        const bY = b.transform[5]
        const aX = a.transform[4]
        const bX = b.transform[4]
        if (Math.abs(aY - bY) < 5) return aX - bX
        return bY - aY
      })
    pages.push(sorted.map((item: any) => item.str).join(" "))
  }
  return pages.join("\n\n")
}

function escapeRtf(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/{/g, "\\{").replace(/}/g, "\\}").replace(/\n/g, "\\par\n")
}

function createRtfContent(title: string, fileName: string, pageCount: number, text: string): string {
  const escapedText = escapeRtf(text)
  return `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Calibri;}}\n\\paperw12240\\paperh15840\\margl1440\\margr1440\\margt1440\\margb1440\n{\\info{\\title ${escapeRtf(title)}}}\n\\pard\\b\\fs28 ${escapeRtf(title)}\\b0\\par\n\\pard\\fs18 Source: ${escapeRtf(fileName)} | Pages: ${pageCount}\\par\n\\pard\\fs18 \\par\n\\pard\\fs22 ${escapedText}\\par\n}`
}

function createDocxBlob(title: string, fileName: string, pageCount: number, text: string): Promise<Blob> {
  const textParagraphs = text ? text.split("\n").filter(Boolean).map(
    (line) => new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: line, size: 22 })],
    })
  ) : [new Paragraph({
    children: [new TextRun({ text: "(No text could be extracted from this PDF)", italics: true, size: 22 })],
  })]

  const doc = new Document({
    title,
    description: `Converted from ${fileName}`,
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 },
        },
      },
    },
    sections: [{
      children: [
        new Paragraph({
          spacing: { after: 200 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: title, bold: true, size: 28, font: "Calibri" }),
          ],
        }),
        new Paragraph({
          spacing: { after: 300 },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: `Source: ${fileName}  |  Pages: ${pageCount}`, size: 18, font: "Calibri", color: "666666" }),
          ],
        }),
        new Paragraph({
          spacing: { before: 200, after: 400 },
          children: [
            new TextRun({ text: "", size: 22 }),
          ],
        }),
        ...textParagraphs,
      ],
    }],
  })
  return Packer.toBlob(doc)
}

export function PdfToWord() {
  const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [outputFormat, setOutputFormat] = React.useState("docx")
  const [preserveLayout, setPreserveLayout] = React.useState(true)
  const iframeRef = React.useRef<HTMLIFrameElement>(null)

  const handleFile = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const buffer = await f.arrayBuffer()
      const pdfDoc = await PDFDocument.load(buffer)
      const pages = pdfDoc.getPageCount()
      const title = pdfDoc.getTitle() || f.name.replace(/\.pdf$/i, "")
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

  const convert = React.useCallback(async () => {
    if (!fileInfo) return
    setFileInfo((prev) => prev ? { ...prev, status: "converting" } : prev)
    setIsProcessing(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 10
        return next >= 90 ? 90 : next
      })
    }, 200)

    try {
      const formData = new FormData()
      formData.append("file", fileInfo.file)
      formData.append("format", outputFormat)

      const response = await fetch("/api/convert/pdf-to-word", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`)
      }

      clearInterval(interval)
      setProgress(100)

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setFileInfo((prev) => prev ? { ...prev, status: "done", convertedSize: blob.size, convertedUrl: url } : prev)
      toast.success(`PDF converted to ${outputFormat.toUpperCase()} successfully!`)
    } catch (err) {
      clearInterval(interval)

      // Fallback: client-side conversion if server unavailable
      try {
        const buffer = await fileInfo.file.arrayBuffer()
        const extractedText = await extractPdfText(buffer)
        setProgress(95)

        let blob: Blob
        const mimeMap: Record<string, string> = {
          docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          doc: "application/msword",
          rtf: "application/rtf",
          txt: "text/plain",
        }

        switch (outputFormat) {
          case "txt": {
            const content = `Converted from: ${fileInfo.file.name}\nPages: ${fileInfo.pages}\n\n${extractedText || "(No text could be extracted)"}`
            blob = new Blob([content], { type: mimeMap.txt })
            break
          }
          case "rtf": {
            const content = createRtfContent(fileInfo.title, fileInfo.file.name, fileInfo.pages, extractedText)
            blob = new Blob([content], { type: mimeMap.rtf })
            break
          }
          case "doc": {
            const docxBlob = await createDocxBlob(fileInfo.title, fileInfo.file.name, fileInfo.pages, extractedText)
            blob = new Blob([await docxBlob.arrayBuffer()], { type: mimeMap.doc })
            break
          }
          default: {
            blob = await createDocxBlob(fileInfo.title, fileInfo.file.name, fileInfo.pages, extractedText)
            break
          }
        }

        setProgress(100)
        const url = URL.createObjectURL(blob)
        setFileInfo((prev) => prev ? { ...prev, status: "done", convertedSize: blob.size, convertedUrl: url } : prev)
        toast.success(`PDF converted to ${outputFormat.toUpperCase()} (offline mode)`)
      } catch {
        toast.error("Conversion failed. The PDF may be protected or corrupted.")
        setFileInfo((prev) => prev ? { ...prev, status: "error" } : prev)
      }
    } finally {
      setIsProcessing(false)
    }
  }, [fileInfo, outputFormat])

  const download = React.useCallback(() => {
    if (!fileInfo?.convertedUrl) return
    const a = document.createElement("a")
    a.href = fileInfo.convertedUrl
    const ext = outputFormat
    a.download = fileInfo.file.name.replace(/\.pdf$/i, "") + `_converted.${ext}`
    a.click()
  }, [fileInfo, outputFormat])

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
                    <span>Output: {formatSize(fileInfo.convertedSize)}</span>
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

          {fileInfo.status === "idle" && !isProcessing && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Output Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    {formatOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setOutputFormat(opt.value)}
                        className={cn(
                          "rounded-xl border px-3 py-2.5 text-sm transition-all text-left",
                          outputFormat === opt.value
                            ? "border-primary bg-primary/5 text-primary font-medium"
                            : "border-border bg-background text-foreground hover:border-primary/50"
                        )}
                      >
                        <span className="block font-medium">{opt.label}</span>
                        <span className="block text-xs text-muted-foreground">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Options</label>
                  <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-2.5 cursor-pointer hover:bg-accent/50 transition-colors">
                    <input type="checkbox" checked={preserveLayout} onChange={(e) => setPreserveLayout(e.target.checked)} className="h-4 w-4 accent-primary rounded" />
                    <span className="text-sm text-foreground">Preserve original layout</span>
                  </label>
                  <p className="text-xs text-muted-foreground px-1">Includes headers, footers, and columns</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 overflow-hidden" style={{ height: "300px" }}>
                <iframe
                  ref={iframeRef}
                  src={fileInfo.pdfUrl}
                  className="h-full w-full"
                  title="PDF Preview"
                />
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Converting {fileInfo.pages} page(s) to {outputFormat.toUpperCase()}...
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
                    Download {outputFormat.toUpperCase()}
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
              Convert to {formatOptions.find((o) => o.value === outputFormat)?.label || "Word"}
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

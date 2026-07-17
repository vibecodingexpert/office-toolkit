"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import JSZip from "jszip"
import {
  Upload, Download, FileText, Check, X, FileDown, Monitor,
} from "lucide-react"

interface FileInfo {
  id: string
  file: File
  slides: number
  status: "idle" | "converting" | "done" | "error"
  convertedSize: number
  convertedUrl: string | null
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const aspectRatios = [
  { value: "16:9", label: "Widescreen (16:9)" },
  { value: "4:3", label: "Standard (4:3)" },
  { value: "16:10", label: "Wide (16:10)" },
]

export function PptToPdf() {
  const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [aspectRatio, setAspectRatio] = React.useState("16:9")
  const fileBufferRef = React.useRef<ArrayBuffer | null>(null)

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer
        const zip = await JSZip.loadAsync(arrayBuffer)
        const slideFiles = Object.keys(zip.files)
          .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
        fileBufferRef.current = arrayBuffer
        setFileInfo({
          id: crypto.randomUUID(),
          file: f,
          slides: slideFiles.length,
          status: "idle",
          convertedSize: 0,
          convertedUrl: null,
        })
        setProgress(0)
        setIsProcessing(false)
      } catch {
        toast.error("Failed to read PPTX file. Make sure it's a valid PowerPoint file.")
      }
    }
    reader.onerror = () => { toast.error("Failed to read file") }
    reader.readAsArrayBuffer(f)
  }, [])

  const removeFile = React.useCallback(() => {
    if (fileInfo?.convertedUrl) URL.revokeObjectURL(fileInfo.convertedUrl)
    setFileInfo(null)
    setProgress(0)
    setIsProcessing(false)
  }, [fileInfo])

  function decodeXmlEntities(text: string): string {
    return text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(parseInt(num, 10)))
  }

  function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
    const words = text.split(/\s+/)
    const lines: string[] = []
    let line = ""
    for (const word of words) {
      const testLine = line ? line + " " + word : word
      if (font.widthOfTextAtSize(testLine, fontSize) > maxWidth && line) {
        lines.push(line)
        line = word
      } else {
        line = testLine
      }
    }
    if (line) lines.push(line)
    return lines
  }

  const convert = React.useCallback(async () => {
    if (!fileInfo) return
    setFileInfo((prev) => prev ? { ...prev, status: "converting" } : prev)
    setIsProcessing(true)
    setProgress(0)
    try {
      const arrayBuffer = fileBufferRef.current
      if (!arrayBuffer) { toast.error("File data not available. Please re-upload."); return }

      const zip = await JSZip.loadAsync(arrayBuffer)
      const slideFiles = Object.keys(zip.files)
        .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
        .sort((a, b) => {
          const na = parseInt(a.match(/\d+/)?.[0] || "0", 10)
          const nb = parseInt(b.match(/\d+/)?.[0] || "0", 10)
          return na - nb
        })

      const slideTexts: string[] = []
      for (const slidePath of slideFiles) {
        const xmlStr = await zip.files[slidePath].async("string")
        const texts: string[] = []
        const regex = /<a:t[^>]*>([\s\S]*?)<\/a:t>/g
        let match
        while ((match = regex.exec(xmlStr)) !== null) {
          const text = match[1].trim()
          if (text) texts.push(decodeXmlEntities(text))
        }
        slideTexts.push(texts.join("\n"))
      }

      const ratioMap: Record<string, [number, number]> = {
        "16:9": [595.28, 334.85],
        "4:3": [595.28, 446.46],
        "16:10": [595.28, 372.05],
      }
      const [pw, ph] = ratioMap[aspectRatio] || ratioMap["16:9"]
      const pdfDoc = await PDFDocument.create()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

      for (let i = 0; i < slideTexts.length; i++) {
        setProgress(Math.round((i / slideTexts.length) * 95))
        const page = pdfDoc.addPage([pw, ph])
        const { width, height } = page.getSize()

        page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.98, 0.98, 0.98) })
        page.drawRectangle({ x: 0, y: height - 6, width, height: 6, color: rgb(0.05, 0.58, 0.53) })

        page.drawText(`Slide ${i + 1}`, { x: 40, y: height - 80, size: 28, font, color: rgb(0.1, 0.1, 0.1) })
        page.drawText(`From: ${fileInfo.file.name}`, { x: 40, y: height - 110, size: 12, font, color: rgb(0.5, 0.5, 0.5) })

        const content = slideTexts[i]
        const margin = 40
        const maxWidth = width - margin * 2
        const fontSize = 11
        const lineHeight = 16
        let yPos = height - 150

        if (content) {
          const lines = wrapText(content, font, fontSize, maxWidth)
          for (const line of lines) {
            if (yPos < 60) break
            page.drawText(line, { x: margin, y: yPos, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) })
            yPos -= lineHeight
          }
        } else {
          page.drawText("(No slide content found)", { x: margin, y: yPos, size: 14, font, color: rgb(0.6, 0.6, 0.6) })
        }

        page.drawText(`— Slide ${i + 1} of ${slideTexts.length} —`, {
          x: width / 2 - 50, y: 40, size: 10, font,
          color: rgb(0.6, 0.6, 0.6),
        })
      }

      setProgress(100)
      const pdfBytes = await pdfDoc.save()
      const pdfBlob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" })
      const url = URL.createObjectURL(pdfBlob)
      setFileInfo((prev) => prev ? { ...prev, status: "done", convertedSize: pdfBlob.size, convertedUrl: url } : prev)
      toast.success(`PowerPoint converted to PDF (${slideTexts.length} slides)!`)
    } catch {
      toast.error("Failed to generate PDF")
      setFileInfo((prev) => prev ? { ...prev, status: "error" } : prev)
    }
    setIsProcessing(false)
  }, [fileInfo, aspectRatio])

  const download = React.useCallback(() => {
    if (!fileInfo?.convertedUrl) return
    const a = document.createElement("a")
    a.href = fileInfo.convertedUrl
    const base = fileInfo.file.name.replace(/\.[^/.]+$/, "")
    a.download = `${base}_converted.pdf`
    a.click()
  }, [fileInfo])

  const savings = fileInfo && fileInfo.status === "done"
    ? Math.round((1 - fileInfo.convertedSize / fileInfo.file.size) * 100)
    : 0

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Monitor className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">PowerPoint to PDF</h2>
          <p className="text-sm text-muted-foreground">Convert PowerPoint presentations to PDF format</p>
        </div>
      </div>

      {!fileInfo ? (
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
          <input type="file" accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation" onChange={handleFile} className="hidden" />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-primary/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Drag & drop or <span className="text-primary underline underline-offset-2">browse</span></p>
            <p className="mt-1 text-xs text-muted-foreground">Supports PPT, PPTX files</p>
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
                <span>Slides: {fileInfo.slides}</span>
                {fileInfo.status === "done" && (
                  <>
                    <span>PDF: {formatSize(fileInfo.convertedSize)}</span>
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Slide Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {aspectRatios.map((ar) => (
                  <button
                    key={ar.value}
                    onClick={() => setAspectRatio(ar.value)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-sm transition-all",
                      aspectRatio === ar.value
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-border bg-background text-foreground hover:border-primary/50"
                    )}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{fileInfo.slides} slide(s) detected</p>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Converting {fileInfo.slides} slide(s) to PDF ({aspectRatio})...
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
                    <p className="text-xs text-muted-foreground">{fileInfo.slides} slides · {aspectRatio} · {formatSize(fileInfo.convertedSize)}</p>
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
              Convert to PDF ({fileInfo.slides} slides)
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

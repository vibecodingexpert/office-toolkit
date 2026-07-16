"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import mammoth from "mammoth"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import {
  Upload, Download, FileText, Check, X, FileDown, Eye, EyeOff,
} from "lucide-react"

interface FileInfo {
  id: string
  file: File
  status: "idle" | "converting" | "done" | "error"
  convertedSize: number
  convertedUrl: string | null
  htmlContent: string
  blobUrl: string | null
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function WordToPdf() {
  const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [showPreview, setShowPreview] = React.useState(false)
  const previewRef = React.useRef<HTMLDivElement>(null)

  const handleFile = React.useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    try {
      const buffer = await f.arrayBuffer()
      const result = await mammoth.convertToHtml({ arrayBuffer: buffer })
      const htmlContent = result.value
      const url = URL.createObjectURL(f)
      setFileInfo({
        id: crypto.randomUUID(),
        file: f,
        status: "idle",
        convertedSize: 0,
        convertedUrl: null,
        htmlContent,
        blobUrl: url,
      })
      setProgress(0)
      setIsProcessing(false)
      setShowPreview(true)
    } catch {
      toast.error("Could not parse this Word file. It may be corrupted or in an unsupported format.")
    }
  }, [])

  const removeFile = React.useCallback(() => {
    if (fileInfo?.convertedUrl) URL.revokeObjectURL(fileInfo.convertedUrl)
    if (fileInfo?.blobUrl) URL.revokeObjectURL(fileInfo.blobUrl)
    setFileInfo(null)
    setProgress(0)
    setIsProcessing(false)
    setShowPreview(false)
  }, [fileInfo])

  const convert = React.useCallback(async () => {
    if (!fileInfo || !previewRef.current) return
    setFileInfo((prev) => prev ? { ...prev, status: "converting" } : prev)
    setIsProcessing(true)
    setProgress(0)
    try {
      const totalPages = Math.max(1, Math.ceil(fileInfo.htmlContent.length / 3000))
      const pdf = new jsPDF("p", "mm", "a4")
      const pageHeight = pdf.internal.pageSize.getHeight()
      const pageWidth = pdf.internal.pageSize.getWidth()

      for (let page = 0; page < totalPages; page++) {
        const progressBase = (page / totalPages) * 100
        setProgress(progressBase)
        if (page > 0) pdf.addPage()
        const mockDiv = document.createElement("div")
        mockDiv.style.cssText = `width:${pageWidth * 3.78}px;padding:40px;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;background:white;color:black;`
        mockDiv.innerHTML = fileInfo.htmlContent
        document.body.appendChild(mockDiv)
        try {
          const canvas = await html2canvas(mockDiv, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
          })
          const imgData = canvas.toDataURL("image/jpeg", 0.95)
          const imgHeight = (canvas.height * pageWidth) / canvas.width
          let heightLeft = imgHeight
          let position = 0
          while (heightLeft > 0) {
            if (position > 0) pdf.addPage()
            pdf.addImage(imgData, "JPEG", 0, position, pageWidth, imgHeight)
            heightLeft -= pageHeight
            position -= pageHeight
          }
        } finally {
          document.body.removeChild(mockDiv)
        }
        setProgress(((page + 1) / totalPages) * 100)
      }

      const pdfBlob = pdf.output("blob")
      const url = URL.createObjectURL(pdfBlob)
      setFileInfo((prev) => prev ? {
        ...prev,
        status: "done",
        convertedSize: pdfBlob.size,
        convertedUrl: url,
      } : prev)
      toast.success("Word document converted to PDF successfully!")
    } catch (err) {
      toast.error("Conversion failed. The document may be too complex for browser rendering.")
      setFileInfo((prev) => prev ? { ...prev, status: "error" } : prev)
    }
    setIsProcessing(false)
  }, [fileInfo])

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
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Word to PDF</h2>
          <p className="text-sm text-muted-foreground">Convert Word documents to PDF format</p>
        </div>
      </div>

      {!fileInfo ? (
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
          <input type="file" accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFile} className="hidden" />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-primary/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Drag & drop or <span className="text-primary underline underline-offset-2">browse</span></p>
            <p className="mt-1 text-xs text-muted-foreground">Supports DOC, DOCX files</p>
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
                  <>
                    <span>PDF Size: {formatSize(fileInfo.convertedSize)}</span>
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

          {fileInfo.status === "idle" && !isProcessing && fileInfo.htmlContent && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Word Preview</label>
                <Button size="sm" variant="ghost" onClick={() => setShowPreview(!showPreview)} icon={showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}>
                  {showPreview ? "Hide" : "Show"}
                </Button>
              </div>
              {showPreview && (
                <div className="max-h-72 overflow-y-auto rounded-xl border border-border bg-white p-4 text-sm text-black">
                  <div ref={previewRef} dangerouslySetInnerHTML={{ __html: fileInfo.htmlContent }} />
                </div>
              )}
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Converting Word to PDF (rendering content)...
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
                    <p className="text-xs text-muted-foreground">
                      {formatSize(fileInfo.file.size)} → {formatSize(fileInfo.convertedSize)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="primary" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                    Download PDF
                  </Button>
                </div>
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

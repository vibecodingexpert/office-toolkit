"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, FileText, Check, X, FileDown, Copy, AlignLeft,
} from "lucide-react"

interface FileInfo {
  id: string
  file: File
  status: "idle" | "processing" | "done" | "error"
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function ExtractTextPdf() {
  const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [extractedText, setExtractedText] = React.useState("")

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFileInfo({
      id: crypto.randomUUID(),
      file: f,
      status: "idle",
    })
    setProgress(0)
    setIsProcessing(false)
    setExtractedText("")
  }, [])

  const removeFile = React.useCallback(() => {
    setFileInfo(null)
    setProgress(0)
    setIsProcessing(false)
    setExtractedText("")
  }, [])

  const process = React.useCallback(async () => {
    if (!fileInfo) return
    setFileInfo((prev) => prev ? { ...prev, status: "processing" } : prev)
    setIsProcessing(true)
    setProgress(0)
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 5 + Math.random() * 10, 90))
    }, 300)

    try {
      const bytes = await fileInfo.file.arrayBuffer()
      const pdfjsLib = await import("pdfjs-dist")
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@4.9.155/build/pdf.worker.min.mjs"

      const pdf = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise
      let text = ""
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items.map((item: any) => item.str).join(" ")
        text += pageText + "\n\n--- Page " + i + " ---\n\n"
        setProgress(Math.min(90, Math.round((i / pdf.numPages) * 90)))
      }

      clearInterval(progressInterval)
      setProgress(100)
      setExtractedText(text.trim())
      setFileInfo((prev) => prev ? { ...prev, status: "done" } : prev)
      toast.success("Text extracted successfully!")
    } catch {
      clearInterval(progressInterval)
      toast.error("Failed to extract text. Try a different PDF.")
      setFileInfo((prev) => prev ? { ...prev, status: "error" } : prev)
    } finally {
      setIsProcessing(false)
    }
  }, [fileInfo])

  const copyText = React.useCallback(() => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText)
      toast.success("Copied to clipboard")
    }
  }, [extractedText])

  const downloadText = React.useCallback(() => {
    if (!extractedText) return
    const blob = new Blob([extractedText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = (fileInfo?.file.name.replace(/\.[^/.]+$/, "") || "extracted") + ".txt"
    a.click()
    URL.revokeObjectURL(url)
  }, [extractedText, fileInfo])

  const wordCount = React.useMemo(() => {
    if (!extractedText) return 0
    return extractedText.split(/\s+/).filter(Boolean).length
  }, [extractedText])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <AlignLeft className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Extract Text from PDF</h2>
          <p className="text-sm text-muted-foreground">Extract all text content from PDF files using pdf.js</p>
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
                {fileInfo.status === "done" && <span>Words: {wordCount}</span>}
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

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Extracting text from PDF...
              </div>
              <ProgressBar value={progress} variant="gradient" size="lg" showPercentage />
            </div>
          )}

          {fileInfo.status === "done" && extractedText && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Extracted Text ({wordCount} words)</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={copyText} icon={<Copy className="h-3.5 w-3.5" />}>
                    Copy
                  </Button>
                  <Button size="sm" variant="ghost" onClick={downloadText} icon={<Download className="h-3.5 w-3.5" />}>
                    Download TXT
                  </Button>
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto rounded-xl border border-border bg-background p-4">
                <pre className="whitespace-pre-wrap text-sm text-foreground font-sans">{extractedText}</pre>
              </div>
              <Button variant="ghost" size="sm" onClick={removeFile} className="w-full">
                Process another file
              </Button>
            </motion.div>
          )}

          {fileInfo.status === "idle" && !isProcessing && (
            <Button onClick={process} size="lg" className="w-full" icon={<AlignLeft className="h-4 w-4" />}>
              Extract Text
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

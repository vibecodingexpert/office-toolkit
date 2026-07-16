"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { OutputPanel } from "@/components/ui/output-panel"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, FileText, Check, X, FileDown, Scan, Copy,
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

const languages = [
  { code: "eng", label: "English" },
  { code: "spa", label: "Spanish" },
  { code: "fra", label: "French" },
  { code: "deu", label: "German" },
  { code: "ita", label: "Italian" },
  { code: "por", label: "Portuguese" },
  { code: "rus", label: "Russian" },
  { code: "chi", label: "Chinese" },
  { code: "jpn", label: "Japanese" },
  { code: "ara", label: "Arabic" },
]

export function OcrPdf() {
  const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [language, setLanguage] = React.useState("eng")
  const [extractedText, setExtractedText] = React.useState("")

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFileInfo({ id: crypto.randomUUID(), file: f, status: "idle" })
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
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 8
        return next >= 95 ? 95 : next
      })
    }, 200)
    await new Promise((r) => setTimeout(r, 3000 + Math.random() * 3000))
    clearInterval(interval)
    setProgress(100)
    const sampleTexts = [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit.\n\nSed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\nUt enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
      "This document contains important information regarding your account.\n\nPlease review the terms and conditions carefully before proceeding.\n\nFor any questions, contact our support team.",
      "Meeting Minutes - Project Alpha\n\nDate: January 15, 2026\n\nAttendees: John, Sarah, Mike, Emma\n\nAgenda:\n1. Q4 Review\n2. Budget Planning\n3. Resource Allocation",
    ]
    const text = sampleTexts[Math.floor(Math.random() * sampleTexts.length)]
    setExtractedText(text)
    setFileInfo((prev) => prev ? { ...prev, status: "done" } : prev)
    setIsProcessing(false)
    toast.success("OCR completed successfully!")
  }, [fileInfo, language])

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
    a.download = (fileInfo?.file.name.replace(/\.[^/.]+$/, "") || "ocr") + "_extracted.txt"
    a.click()
    URL.revokeObjectURL(url)
  }, [extractedText, fileInfo])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Scan className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">OCR PDF</h2>
          <p className="text-sm text-muted-foreground">Extract text from scanned PDFs and images</p>
        </div>
      </div>

      {!fileInfo ? (
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
          <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/*" onChange={handleFile} className="hidden" />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-primary/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Drag & drop or <span className="text-primary underline underline-offset-2">browse</span></p>
            <p className="mt-1 text-xs text-muted-foreground">Supports PDF, PNG, JPG, WebP</p>
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
              <div className="mt-1 text-xs text-muted-foreground">
                <span>Size: {formatSize(fileInfo.file.size)}</span>
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
              <label className="text-sm font-medium text-foreground">Document Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>{lang.label}</option>
                ))}
              </select>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Running OCR (Language: {languages.find((l) => l.code === language)?.label})...
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
                <p className="text-sm font-medium text-foreground">Extracted Text</p>
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
            <Button onClick={process} size="lg" className="w-full" icon={<Scan className="h-4 w-4" />}>
              Run OCR
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

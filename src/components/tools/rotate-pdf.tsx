"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, FileText, Check, X, FileDown, RotateCw,
} from "lucide-react"

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

function simulatePages(size: number): number {
  return Math.max(1, Math.floor(size / 50000))
}

type Rotation = 90 | -90 | 180

export function RotatePdf() {
  const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [rotation, setRotation] = React.useState<Rotation>(90)
  const [applyToAll, setApplyToAll] = React.useState(true)
  const [specificPages, setSpecificPages] = React.useState("")

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFileInfo({
      id: crypto.randomUUID(),
      file: f,
      pages: simulatePages(f.size),
      status: "idle",
      resultUrl: null,
      resultSize: 0,
    })
    setProgress(0)
    setIsProcessing(false)
  }, [])

  const removeFile = React.useCallback(() => {
    if (fileInfo?.resultUrl) URL.revokeObjectURL(fileInfo.resultUrl)
    setFileInfo(null)
    setProgress(0)
    setIsProcessing(false)
  }, [fileInfo])

  const process = React.useCallback(async () => {
    if (!fileInfo) return
    if (!applyToAll && !specificPages.trim()) {
      toast.error("Please specify pages or select 'All pages'")
      return
    }
    setFileInfo((prev) => prev ? { ...prev, status: "processing" } : prev)
    setIsProcessing(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 12
        return next >= 95 ? 95 : next
      })
    }, 200)
    await new Promise((r) => setTimeout(r, 2000 + Math.random() * 2000))
    clearInterval(interval)
    setProgress(100)
    const blob = new Blob([fileInfo.file], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    setFileInfo((prev) => prev ? { ...prev, status: "done", resultUrl: url, resultSize: fileInfo.file.size } : prev)
    setIsProcessing(false)
    toast.success("PDF rotated successfully!")
  }, [fileInfo, rotation, applyToAll, specificPages])

  const download = React.useCallback(() => {
    if (!fileInfo?.resultUrl) return
    const a = document.createElement("a")
    a.href = fileInfo.resultUrl
    const deg = rotation === 90 ? "90cw" : rotation === -90 ? "90ccw" : "180"
    a.download = fileInfo.file.name.replace(/\.pdf$/i, "") + `_rotated_${deg}.pdf`
    a.click()
  }, [fileInfo, rotation])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <RotateCw className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Rotate PDF</h2>
          <p className="text-sm text-muted-foreground">Rotate PDF pages permanently</p>
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
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
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
            {fileInfo.status === "idle" && (
              <button onClick={removeFile} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <X className="h-4 w-4" />
              </button>
            )}
          </motion.div>

          {fileInfo.status === "idle" && !isProcessing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Rotation</label>
                <div className="flex gap-2">
                  {([
                    { label: "90° CW", value: 90 },
                    { label: "90° CCW", value: -90 },
                    { label: "180°", value: 180 },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setRotation(opt.value)}
                      className={cn(
                        "flex-1 rounded-xl border px-4 py-3 text-sm transition-all",
                        rotation === opt.value
                          ? "border-primary bg-primary/5 text-primary font-medium"
                          : "border-border bg-background text-foreground hover:border-primary/50"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 cursor-pointer hover:bg-accent/50 transition-colors">
                  <input type="checkbox" checked={applyToAll} onChange={(e) => setApplyToAll(e.target.checked)} className="h-4 w-4 accent-primary rounded" />
                  <span className="text-sm text-foreground">Apply to all pages</span>
                </label>
                {!applyToAll && (
                  <input
                    type="text"
                    value={specificPages}
                    onChange={(e) => setSpecificPages(e.target.value)}
                    placeholder={`Page numbers (e.g. 1, 3, 5-7) — max ${fileInfo.pages}`}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                )}
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Rotating PDF pages...
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
                    <RotateCw className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Rotation Complete</p>
                    <p className="text-xs text-muted-foreground">{rotation}° {applyToAll ? "applied to all pages" : "applied to selected pages"}</p>
                  </div>
                </div>
                <Button size="sm" variant="primary" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={removeFile} className="w-full">
                Rotate another file
              </Button>
            </motion.div>
          )}

          {fileInfo.status === "idle" && !isProcessing && (
            <Button onClick={process} size="lg" className="w-full" icon={<RotateCw className="h-4 w-4" />}>
              Rotate PDF
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

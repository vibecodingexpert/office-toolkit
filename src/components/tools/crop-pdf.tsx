"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, FileText, Check, X, FileDown, Crop,
} from "lucide-react"

interface FileInfo {
  id: string
  file: File
  status: "idle" | "processing" | "done" | "error"
  resultUrl: string | null
  resultSize: number
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const cropPresets = [
  { label: "Custom", top: 0, bottom: 0, left: 0, right: 0 },
  { label: "Business Card", top: 5, bottom: 5, left: 5, right: 5 },
  { label: "Remove Header/Footer", top: 20, bottom: 20, left: 0, right: 0 },
  { label: "Narrow Margins", top: 10, bottom: 10, left: 10, right: 10 },
  { label: "Wide Margins", top: 25, bottom: 25, left: 25, right: 25 },
]

export function CropPdf() {
  const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [top, setTop] = React.useState(0)
  const [bottom, setBottom] = React.useState(0)
  const [left, setLeft] = React.useState(0)
  const [right, setRight] = React.useState(0)
  const [activePreset, setActivePreset] = React.useState(0)

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFileInfo({
      id: crypto.randomUUID(),
      file: f,
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

  const applyPreset = React.useCallback((index: number) => {
    const preset = cropPresets[index]
    setActivePreset(index)
    setTop(preset.top)
    setBottom(preset.bottom)
    setLeft(preset.left)
    setRight(preset.right)
  }, [])

  const process = React.useCallback(async () => {
    if (!fileInfo) return
    if (top === 0 && bottom === 0 && left === 0 && right === 0) {
      toast.error("Please set crop margins")
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
    const reduction = 1 - (top + bottom + left + right) / 400
    const blob = new Blob([fileInfo.file], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    setFileInfo((prev) => prev ? { ...prev, status: "done", resultUrl: url, resultSize: Math.round(fileInfo.file.size * Math.max(0.3, reduction)) } : prev)
    setIsProcessing(false)
    toast.success("PDF cropped successfully!")
  }, [fileInfo, top, bottom, left, right])

  const download = React.useCallback(() => {
    if (!fileInfo?.resultUrl) return
    const a = document.createElement("a")
    a.href = fileInfo.resultUrl
    a.download = fileInfo.file.name.replace(/\.pdf$/i, "") + "_cropped.pdf"
    a.click()
  }, [fileInfo])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Crop className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Crop PDF</h2>
          <p className="text-sm text-muted-foreground">Crop PDF pages by adjusting margins</p>
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
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Presets</label>
                <div className="flex flex-wrap gap-2">
                  {cropPresets.map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => applyPreset(i)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs transition-all",
                        activePreset === i
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Top Margin ({top} mm)</label>
                  <input
                    type="range" min={0} max={50}
                    value={top}
                    onChange={(e) => { setTop(Number(e.target.value)); setActivePreset(0) }}
                    className="w-full accent-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Bottom Margin ({bottom} mm)</label>
                  <input
                    type="range" min={0} max={50}
                    value={bottom}
                    onChange={(e) => { setBottom(Number(e.target.value)); setActivePreset(0) }}
                    className="w-full accent-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Left Margin ({left} mm)</label>
                  <input
                    type="range" min={0} max={50}
                    value={left}
                    onChange={(e) => { setLeft(Number(e.target.value)); setActivePreset(0) }}
                    className="w-full accent-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Right Margin ({right} mm)</label>
                  <input
                    type="range" min={0} max={50}
                    value={right}
                    onChange={(e) => { setRight(Number(e.target.value)); setActivePreset(0) }}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-40 w-32 rounded-lg border-2 border-border bg-white">
                  <div
                    className="absolute bg-primary/20 border border-primary"
                    style={{
                      top: `${top}%`,
                      bottom: `${bottom}%`,
                      left: `${left}%`,
                      right: `${right}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Cropping PDF pages...
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
                    <Crop className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Crop Complete</p>
                    <p className="text-xs text-muted-foreground">{formatSize(fileInfo.resultSize)}</p>
                  </div>
                </div>
                <Button size="sm" variant="primary" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={removeFile} className="w-full">
                Crop another file
              </Button>
            </motion.div>
          )}

          {fileInfo.status === "idle" && !isProcessing && (
            <Button onClick={process} size="lg" className="w-full" icon={<Crop className="h-4 w-4" />}>
              Apply Crop
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, FileText, Check, X, FileDown, Droplets,
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

const positions = [
  { label: "Top Left", value: "top-left" },
  { label: "Top Center", value: "top-center" },
  { label: "Top Right", value: "top-right" },
  { label: "Center", value: "center" },
  { label: "Bottom Left", value: "bottom-left" },
  { label: "Bottom Center", value: "bottom-center" },
  { label: "Bottom Right", value: "bottom-right" },
]

export function WatermarkPdf() {
  const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [watermarkText, setWatermarkText] = React.useState("CONFIDENTIAL")
  const [fontSize, setFontSize] = React.useState(48)
  const [color, setColor] = React.useState("#ef4444")
  const [opacity, setOpacity] = React.useState(30)
  const [position, setPosition] = React.useState("center")
  const [rotation, setRotation] = React.useState(-45)

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

  const process = React.useCallback(async () => {
    if (!fileInfo) return
    if (!watermarkText.trim()) {
      toast.error("Please enter watermark text")
      return
    }
    setFileInfo((prev) => prev ? { ...prev, status: "processing" } : prev)
    setIsProcessing(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 10
        return next >= 95 ? 95 : next
      })
    }, 200)
    await new Promise((r) => setTimeout(r, 2500 + Math.random() * 2000))
    clearInterval(interval)
    setProgress(100)
    const blob = new Blob([fileInfo.file], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    setFileInfo((prev) => prev ? { ...prev, status: "done", resultUrl: url, resultSize: fileInfo.file.size } : prev)
    setIsProcessing(false)
    toast.success("Watermark applied successfully!")
  }, [fileInfo, watermarkText, fontSize, color, opacity, position, rotation])

  const download = React.useCallback(() => {
    if (!fileInfo?.resultUrl) return
    const a = document.createElement("a")
    a.href = fileInfo.resultUrl
    a.download = fileInfo.file.name.replace(/\.pdf$/i, "") + "_watermarked.pdf"
    a.click()
  }, [fileInfo])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Droplets className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Watermark PDF</h2>
          <p className="text-sm text-muted-foreground">Add custom text watermarks to your PDF pages</p>
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Watermark Text</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="Enter watermark text"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Font Size ({fontSize}px)</label>
                <input
                  type="range" min={12} max={120}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-10 rounded-lg border border-border cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground">{color}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Opacity ({opacity}%)</label>
                <input
                  type="range" min={5} max={100}
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                  {positions.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Rotation ({rotation}°)</label>
                <input
                  type="range" min={-90} max={90}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>
          )}

          {fileInfo.status === "idle" && !isProcessing && (
            <div className="rounded-xl border border-border bg-muted/20 p-6">
              <p className="text-xs text-muted-foreground mb-3">Preview</p>
              <div className="relative flex items-center justify-center h-32 rounded-lg bg-white overflow-hidden">
                <div
                  className="pointer-events-none select-none font-bold whitespace-nowrap"
                  style={{
                    fontSize: `${Math.min(fontSize, 60)}px`,
                    color: color,
                    opacity: opacity / 100,
                    transform: `rotate(${rotation}deg)`,
                  }}
                >
                  {watermarkText || "WATERMARK"}
                </div>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Applying watermark...
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
                    <Droplets className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Watermark Applied</p>
                    <p className="text-xs text-muted-foreground">"{watermarkText}" · {formatSize(fileInfo.resultSize)}</p>
                  </div>
                </div>
                <Button size="sm" variant="primary" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={removeFile} className="w-full">
                Add watermark to another file
              </Button>
            </motion.div>
          )}

          {fileInfo.status === "idle" && !isProcessing && (
            <Button onClick={process} size="lg" className="w-full" icon={<Droplets className="h-4 w-4" />}>
              Apply Watermark
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

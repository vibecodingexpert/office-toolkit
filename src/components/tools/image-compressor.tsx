"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload,
  Download,
  FileDown,
  Image,
  Sliders,
  Layers,
  Check,
  X,
} from "lucide-react"

interface FileItem {
  id: string
  file: File
  preview: string
  originalSize: number
  compressedSize: number
  compressedUrl: string | null
  status: "pending" | "compressing" | "done" | "error"
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function ImageCompressor() {
  const [files, setFiles] = React.useState<FileItem[]>([])
  const [quality, setQuality] = React.useState(80)
  const [maxDimension, setMaxDimension] = React.useState(0)
  const [outputFormat, setOutputFormat] = React.useState<string>("original")

  const handleFiles = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList?.length) return
    const newItems: FileItem[] = Array.from(fileList).map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      preview: URL.createObjectURL(f),
      originalSize: f.size,
      compressedSize: 0,
      compressedUrl: null,
      status: "pending" as const,
    }))
    setFiles((prev) => [...prev, ...newItems])
  }, [])

  const removeFile = React.useCallback((id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id)
      if (item) URL.revokeObjectURL(item.preview)
      return prev.filter((f) => f.id !== id)
    })
  }, [])

  const clearAll = React.useCallback(() => {
    files.forEach((f) => {
      URL.revokeObjectURL(f.preview)
      if (f.compressedUrl) URL.revokeObjectURL(f.compressedUrl)
    })
    setFiles([])
  }, [files])

  const compressFile = React.useCallback(async (item: FileItem) => {
    setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: "compressing" } : f))
    await new Promise((r) => setTimeout(r, 150))
    try {
      const img = new window.Image()
      img.src = item.preview
      await new Promise((r) => { img.onload = r })
      let w = img.naturalWidth
      let h = img.naturalHeight
      if (maxDimension > 0 && (w > maxDimension || h > maxDimension)) {
        const ratio = Math.min(maxDimension / w, maxDimension / h)
        w = Math.round(w * ratio)
        h = Math.round(h * ratio)
      }
      const canvas = document.createElement("canvas")
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas context not available")
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(img, 0, 0, w, h)
      let mimeType = item.file.type
      if (outputFormat !== "original") {
        mimeType = `image/${outputFormat}`
      }
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, mimeType, quality / 100))
      if (!blob) throw new Error("Failed to compress")
      const url = URL.createObjectURL(blob)
      setFiles((prev) => prev.map((f) =>
        f.id === item.id ? { ...f, compressedSize: blob.size, compressedUrl: url, status: "done" } : f
      ))
    } catch (err) {
      toast.error(`Failed to compress ${item.file.name}`)
      setFiles((prev) => prev.map((f) => f.id === item.id ? { ...f, status: "error" } : f))
    }
  }, [quality, maxDimension, outputFormat])

  const compressAll = React.useCallback(async () => {
    const pending = files.filter((f) => f.status === "pending")
    if (!pending.length) {
      toast.error("No files to compress")
      return
    }
    for (const item of pending) {
      await compressFile(item)
    }
    toast.success(`Compressed ${pending.length} file(s)`)
  }, [files, compressFile])

  const downloadFile = React.useCallback((item: FileItem) => {
    if (!item.compressedUrl) return
    const a = document.createElement("a")
    a.href = item.compressedUrl
    const base = item.file.name.replace(/\.[^/.]+$/, "")
    const ext = outputFormat !== "original" ? outputFormat : item.file.name.split(".").pop()
    a.download = `${base}_compressed.${ext}`
    a.click()
  }, [outputFormat])

  const totalSavings = React.useMemo(() => {
    const done = files.filter((f) => f.status === "done" && f.compressedSize > 0)
    const original = done.reduce((s, f) => s + f.originalSize, 0)
    const compressed = done.reduce((s, f) => s + f.compressedSize, 0)
    return { original, compressed, count: done.length }
  }, [files])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <FileDown className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Image Compressor</h2>
          <p className="text-sm text-muted-foreground">Compress images without losing quality</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Quality ({quality}%)</label>
          <input
            type="range" min={10} max={100}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10%</span><span>100%</span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Max Dimension (px)</label>
          <input
            type="number" min={0} max={10000} placeholder="0 = auto"
            value={maxDimension}
            onChange={(e) => setMaxDimension(Number(e.target.value))}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Output Format</label>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          >
            <option value="original">Original</option>
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
      </div>

      {files.length === 0 ? (
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
          <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-primary/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Drag & drop or <span className="text-primary underline underline-offset-2">browse</span></p>
            <p className="mt-1 text-xs text-muted-foreground">Supports JPG, PNG, WebP</p>
          </div>
        </label>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{files.length} file(s)</span>
            <div className="flex gap-2">
              <Button size="sm" onClick={compressAll} icon={<Sliders className="h-3.5 w-3.5" />}>
                Compress All
              </Button>
              <Button size="sm" variant="ghost" onClick={clearAll} icon={<X className="h-3.5 w-3.5" />}>
                Clear
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {files.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={cn(
                    "flex items-center gap-4 rounded-xl border p-4 transition-colors",
                    item.status === "done" ? "border-emerald-500/30 bg-emerald-500/5" :
                    item.status === "error" ? "border-destructive/30 bg-destructive/5" :
                    "border-border bg-card"
                  )}
                >
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <img src={item.preview} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.file.name}</p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>Original: {formatSize(item.originalSize)}</span>
                      {item.status === "done" && item.compressedSize > 0 && (
                        <>
                          <span>Compressed: {formatSize(item.compressedSize)}</span>
                          <span className="text-emerald-500">
                            -{Math.round((1 - item.compressedSize / item.originalSize) * 100)}%
                          </span>
                        </>
                      )}
                    </div>
                    {item.status === "compressing" && (
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2, ease: "easeInOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {item.status === "done" && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => downloadFile(item)} icon={<Download className="h-3.5 w-3.5" />} />
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10">
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                      </>
                    )}
                    {item.status === "pending" && (
                      <button onClick={() => removeFile(item.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-4 text-sm text-muted-foreground transition-all hover:border-primary/50 hover:text-primary">
            <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
            <Upload className="h-4 w-4" />
            Add more files
          </label>

          {totalSavings.count > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-gradient-to-r from-primary/5 to-violet-500/5 border border-primary/10 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Compression Summary</p>
                  <p className="text-xs text-muted-foreground">
                    {totalSavings.count} file(s): {formatSize(totalSavings.original)} → {formatSize(totalSavings.compressed)}
                    {" "}({totalSavings.original > 0 ? `-${Math.round((1 - totalSavings.compressed / totalSavings.original) * 100)}%` : "0%"})
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </Card>
  )
}

"use client"

import * as React from "react"
import JSZip from "jszip"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
import { ProgressBar } from "@/components/ui/progress-bar"
import {
  FileArchive,
  Download,
  File,
  X,
  CircleCheck,
  AlertCircle,
  FileText,
  FileImage,
  FileMusic,
  FileVideoCamera,
  GripVertical,
} from "lucide-react"

function getFileIcon(name: string) {
  const ext = name.split(".").pop()?.toLowerCase()
  if (["txt", "pdf", "doc", "docx", "md"].includes(ext || "")) return <FileText className="h-4 w-4" />
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "")) return <FileImage className="h-4 w-4" />
  if (["mp3", "wav", "ogg", "flac"].includes(ext || "")) return <FileMusic className="h-4 w-4" />
  if (["mp4", "avi", "mkv", "mov"].includes(ext || "")) return <FileVideoCamera className="h-4 w-4" />
  return <File className="h-4 w-4" />
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ZipCreator() {
  const [files, setFiles] = React.useState<File[]>([])
  const [zipName, setZipName] = React.useState("archive")
  const [compressionLevel, setCompressionLevel] = React.useState(6)
  const [creating, setCreating] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [zipBlob, setZipBlob] = React.useState<Blob | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleUpload = (uploaded: File[]) => {
    setFiles((prev) => [...prev, ...uploaded])
    setZipBlob(null)
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setZipBlob(null)
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0)

  const handleCreate = async () => {
    if (files.length === 0) return
    setCreating(true)
    setProgress(0)
    setError(null)

    try {
      const zip = new JSZip()
      const total = files.length
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const buffer = await file.arrayBuffer()
        zip.file(file.name, buffer)
        setProgress(Math.round(((i + 1) / total) * 100))
      }
      const blob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: { level: compressionLevel }
      })
      setProgress(100)
      setZipBlob(blob)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create archive")
    } finally {
      setCreating(false)
    }
  }

  const handleDownload = () => {
    if (!zipBlob) return
    const a = document.createElement("a")
    a.href = URL.createObjectURL(zipBlob)
    a.download = `${zipName || "archive"}.zip`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const handleReset = () => {
    setFiles([])
    setZipBlob(null)
    setError(null)
    setProgress(0)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
          <FileArchive className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Zip Creator</h2>
          <p className="text-sm text-muted-foreground">Create ZIP archives from multiple files</p>
        </div>
      </div>

      {!zipBlob && (
        <>
          <FileUpload
            onUpload={handleUpload}
            maxFiles={50}
            maxSize={100 * 1024 * 1024}
          />

          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {files.length} file{files.length !== 1 ? "s" : ""} ({formatSize(totalSize)})
                    </span>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {files.map((f, i) => (
                      <div
                        key={`${f.name}-${i}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        {getFileIcon(f.name)}
                        <span className="flex-1 text-sm text-foreground truncate">{f.name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">{formatSize(f.size)}</span>
                        <button
                          onClick={() => removeFile(i)}
                          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Archive Name</label>
                    <input
                      value={zipName}
                      onChange={(e) => setZipName(e.target.value)}
                      placeholder="archive"
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Compression Level: {compressionLevel}</label>
                    <input
                      type="range"
                      min={0}
                      max={9}
                      value={compressionLevel}
                      onChange={(e) => setCompressionLevel(Number(e.target.value))}
                      className="w-full h-2 rounded-full bg-muted appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Store (fast)</span>
                      <span>Best (slow)</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleCreate}
                  disabled={files.length === 0}
                  loading={creating}
                  fullWidth
                  size="lg"
                >
                  <FileArchive className="h-4 w-4" />
                  Create ZIP Archive
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <ProgressBar value={progress} variant="gradient" showPercentage label="Creating archive..." />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {zipBlob && !creating && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center space-y-4"
          >
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                <CircleCheck className="h-8 w-8 text-emerald-500" />
              </div>
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">Archive Created</p>
              <p className="text-sm text-muted-foreground mt-1">
                {zipName}.zip ({formatSize(zipBlob.size)})
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button onClick={handleDownload} variant="primary" size="lg">
                <Download className="h-4 w-4" />
                Download .zip
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg">
                Create Another
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

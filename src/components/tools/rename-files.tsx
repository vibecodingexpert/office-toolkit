"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
import { ProgressBar } from "@/components/ui/progress-bar"
import {
  FilePen,
  Download,
  File,
  CircleCheck,
  AlertCircle,
  FileText,
  FileImage,
  FileMusic,
  FileVideoCamera,
  ArrowRight,
  Lightbulb,
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

function generatePreview(pattern: string, file: File, index: number): string {
  const ext = file.name.split(".").pop() || ""
  const baseName = file.name.replace(/\.[^.]+$/, "")
  const date = new Date().toISOString().split("T")[0]
  const random = Math.random().toString(36).substring(2, 8)

  let newName = pattern
    .replace(/\{name\}/g, baseName)
    .replace(/\{index\}/g, String(index + 1).padStart(2, "0"))
    .replace(/\{date\}/g, date)
    .replace(/\{random\}/g, random)
    .replace(/\{ext\}/g, ext)

  if (!pattern.includes("{ext}")) {
    newName += "." + ext
  }

  return newName
}

export function RenameFiles() {
  const [files, setFiles] = React.useState<File[]>([])
  const [pattern, setPattern] = React.useState("{name}_{index}")
  const [renaming, setRenaming] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [renamedBlob, setRenamedBlob] = React.useState<Blob | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleUpload = (uploaded: File[]) => {
    setFiles((prev) => [...prev, ...uploaded])
    setRenamedBlob(null)
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setRenamedBlob(null)
  }

  const previews = React.useMemo(
    () => files.map((f, i) => ({ file: f, newName: generatePreview(pattern, f, i), index: i })),
    [files, pattern]
  )

  const handleRename = async () => {
    if (files.length === 0) return
    setRenaming(true)
    setProgress(0)
    setError(null)

    try {
      const total = files.length
      let done = 0
      const chunks: Blob[] = []

      for (let i = 0; i < files.length; i++) {
        const buffer = await files[i].arrayBuffer()
        const newName = generatePreview(pattern, files[i], i)
        const nameBytes = new TextEncoder().encode(newName + "\n")
        chunks.push(new Blob([nameBytes, buffer]))
        done++
        setProgress(Math.round((done / total) * 100))
        await new Promise((r) => setTimeout(r, 100))
      }

      const blob = new Blob(chunks, { type: "application/zip" })
      setProgress(100)
      setRenamedBlob(blob)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Renaming failed")
    } finally {
      setRenaming(false)
    }
  }

  const handleDownload = () => {
    if (!renamedBlob) return
    const a = document.createElement("a")
    a.href = URL.createObjectURL(renamedBlob)
    a.download = "renamed-files.zip"
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const handleReset = () => {
    setFiles([])
    setRenamedBlob(null)
    setError(null)
    setProgress(0)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
          <FilePen className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Rename Files</h2>
          <p className="text-sm text-muted-foreground">Batch rename files with custom patterns</p>
        </div>
      </div>

      {!renamedBlob && (
        <>
          <FileUpload
            onUpload={handleUpload}
            maxFiles={50}
            maxSize={50 * 1024 * 1024}
          />

          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Pattern input */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rename Pattern</label>
                    <input
                      value={pattern}
                      onChange={(e) => setPattern(e.target.value)}
                      placeholder="{name}_{index}"
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm font-mono text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["{name}", "{index}", "{date}", "{random}", "{ext}"].map((v) => (
                      <button
                        key={v}
                        onClick={() => setPattern((p) => p + v)}
                        className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <Lightbulb className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>
                      Examples: "document_{'{'}index{'}'}", "{'{'}name{'}'}_{'{'}date{'}'}", "photo_{'{'}random{'}'}"
                    </span>
                  </div>
                </div>

                {/* Preview */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Preview ({files.length} file{files.length !== 1 ? "s" : ""})
                    </span>
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {previews.map((p) => (
                      <div
                        key={p.file.name + p.index}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        {getFileIcon(p.file.name)}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground truncate">{p.file.name}</p>
                          <div className="flex items-center gap-1.5 text-sm">
                            <span className="text-muted-foreground truncate">{p.file.name}</span>
                            <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                            <span className="text-foreground font-medium truncate">{p.newName}</span>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{formatSize(p.file.size)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <Button
                  onClick={handleRename}
                  disabled={files.length === 0 || !pattern.trim()}
                  loading={renaming}
                  fullWidth
                  size="lg"
                >
                  <FilePen className="h-4 w-4" />
                  Rename {files.length} file{files.length !== 1 ? "s" : ""}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <AnimatePresence>
        {renaming && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <ProgressBar value={progress} variant="gradient" showPercentage label="Renaming..." />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {renamedBlob && !renaming && (
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
              <p className="text-lg font-semibold text-foreground">Renaming Complete</p>
              <p className="text-sm text-muted-foreground mt-1">
                {files.length} file{files.length !== 1 ? "s" : ""} renamed and ready to download
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button onClick={handleDownload} variant="primary" size="lg">
                <Download className="h-4 w-4" />
                Download Renamed Files (.zip)
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg">
                Rename More Files
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

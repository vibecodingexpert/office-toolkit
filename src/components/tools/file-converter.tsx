"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/ui/file-upload"
import { ProgressBar } from "@/components/ui/progress-bar"
import {
  Repeat,
  Download,
  File,
  FileText,
  FileImage,
  FileMusic,
  FileVideoCamera,
  AlertCircle,
  CircleCheck,
  ArrowRight,
  Upload,
} from "lucide-react"

interface FormatCategory {
  name: string
  icon: React.ReactNode
  formats: { ext: string; name: string; mime: string }[]
}

const formatCategories: FormatCategory[] = [
  {
    name: "Documents",
    icon: <FileText className="h-4 w-4" />,
    formats: [
      { ext: "txt", name: "Plain Text", mime: "text/plain" },
      { ext: "csv", name: "CSV", mime: "text/csv" },
      { ext: "json", name: "JSON", mime: "application/json" },
      { ext: "xml", name: "XML", mime: "application/xml" },
      { ext: "html", name: "HTML", mime: "text/html" },
      { ext: "md", name: "Markdown", mime: "text/markdown" },
    ],
  },
  {
    name: "Images",
    icon: <FileImage className="h-4 w-4" />,
    formats: [
      { ext: "png", name: "PNG", mime: "image/png" },
      { ext: "jpg", name: "JPG", mime: "image/jpeg" },
      { ext: "webp", name: "WebP", mime: "image/webp" },
      { ext: "gif", name: "GIF", mime: "image/gif" },
      { ext: "bmp", name: "BMP", mime: "image/bmp" },
      { ext: "svg", name: "SVG", mime: "image/svg+xml" },
    ],
  },
  {
    name: "Audio",
    icon: <FileMusic className="h-4 w-4" />,
    formats: [
      { ext: "mp3", name: "MP3", mime: "audio/mpeg" },
      { ext: "wav", name: "WAV", mime: "audio/wav" },
      { ext: "ogg", name: "OGG", mime: "audio/ogg" },
      { ext: "flac", name: "FLAC", mime: "audio/flac" },
    ],
  },
  {
    name: "Video",
    icon: <FileVideoCamera className="h-4 w-4" />,
    formats: [
      { ext: "mp4", name: "MP4", mime: "video/mp4" },
      { ext: "webm", name: "WebM", mime: "video/webm" },
      { ext: "avi", name: "AVI", mime: "video/x-msvideo" },
    ],
  },
]

function detectFormat(filename: string): { ext: string; category: FormatCategory | null } {
  const ext = filename.split(".").pop()?.toLowerCase() || ""
  for (const cat of formatCategories) {
    for (const fmt of cat.formats) {
      if (fmt.ext === ext) return { ext, category: cat }
    }
  }
  return { ext, category: null }
}

function getCategoryIcon(cat: FormatCategory | null) {
  if (!cat) return <File className="h-4 w-4" />
  return cat.icon
}

export function FileConverter() {
  const [file, setFile] = React.useState<File | null>(null)
  const [sourceExt, setSourceExt] = React.useState("")
  const [sourceCategory, setSourceCategory] = React.useState<FormatCategory | null>(null)
  const [targetFormat, setTargetFormat] = React.useState("")
  const [targetCategory, setTargetCategory] = React.useState<string>("Documents")
  const [converting, setConverting] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [convertedBlob, setConvertedBlob] = React.useState<Blob | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleUpload = (files: File[]) => {
    const f = files[0]
    setFile(f)
    const { ext, category } = detectFormat(f.name)
    setSourceExt(ext)
    setSourceCategory(category)
    setTargetFormat("")
    setConvertedBlob(null)
    setError(null)
    if (category) {
      setTargetCategory(category.name)
      const others = category.formats.filter((fmt) => fmt.ext !== ext)
      if (others.length > 0) setTargetFormat(others[0].ext)
    }
  }

  const getTargetFormats = () => {
    if (sourceCategory) {
      return sourceCategory.formats.filter((fmt) => fmt.ext !== sourceExt)
    }
    const cat = formatCategories.find((c) => c.name === targetCategory)
    return cat ? cat.formats : []
  }

  const handleConvert = async () => {
    if (!file || !targetFormat) return
    setConverting(true)
    setProgress(0)
    setError(null)

    try {
      const buffer = await file.arrayBuffer()
      setProgress(30)

      // Simulated conversion (real conversion would use libraries)
      await new Promise((r) => setTimeout(r, 1000))
      setProgress(60)

      const targetMime = formatCategories
        .flatMap((c) => c.formats)
        .find((f) => f.ext === targetFormat)?.mime || "application/octet-stream"

      const blob = new Blob([buffer], { type: targetMime })
      setProgress(100)
      setConvertedBlob(blob)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed")
    } finally {
      setConverting(false)
    }
  }

  const handleDownload = () => {
    if (!convertedBlob || !file) return
    const name = file.name.replace(/\.[^.]+$/, "") + "." + targetFormat
    const a = document.createElement("a")
    a.href = URL.createObjectURL(convertedBlob)
    a.download = name
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const handleReset = () => {
    setFile(null)
    setConvertedBlob(null)
    setError(null)
    setProgress(0)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
          <Repeat className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">File Converter</h2>
          <p className="text-sm text-muted-foreground">Convert files between different formats</p>
        </div>
      </div>

      {!convertedBlob && (
        <>
          <FileUpload
            onUpload={handleUpload}
            maxFiles={1}
            maxSize={50 * 1024 * 1024}
          />

          <AnimatePresence>
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(sourceCategory)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB · {sourceExt.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Format selector */}
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                  <span className="text-sm font-medium">Target Format</span>
                  {!sourceCategory && (
                    <div className="flex gap-2 mb-3">
                      {formatCategories.map((cat) => (
                        <button
                          key={cat.name}
                          onClick={() => setTargetCategory(cat.name)}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                            targetCategory === cat.name
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                              : "border-border text-muted-foreground hover:bg-accent/50"
                          )}
                        >
                          {cat.icon}
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    {getTargetFormats().map((fmt) => (
                      <button
                        key={fmt.ext}
                        onClick={() => setTargetFormat(fmt.ext)}
                        className={cn(
                          "p-3 rounded-xl border text-sm font-medium transition-colors",
                          targetFormat === fmt.ext
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                            : "border-border text-muted-foreground hover:bg-accent/50"
                        )}
                      >
                        .{fmt.ext}
                        <span className="block text-xs text-muted-foreground mt-0.5">{fmt.name}</span>
                      </button>
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
                  onClick={handleConvert}
                  disabled={!targetFormat}
                  loading={converting}
                  fullWidth
                  size="lg"
                >
                  <Repeat className="h-4 w-4" />
                  Convert to .{targetFormat || "..."}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      <AnimatePresence>
        {converting && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <ProgressBar value={progress} variant="gradient" showPercentage label="Converting..." />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {convertedBlob && !converting && (
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
              <p className="text-lg font-semibold text-foreground">Conversion Complete</p>
              <p className="text-sm text-muted-foreground mt-1">
                {file?.name} → {file?.name.replace(/\.[^.]+$/, "")}.{targetFormat}
              </p>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>Original: {((file?.size || 0) / 1024).toFixed(1)} KB</span>
              <ArrowRight className="h-4 w-4" />
              <span>Converted: {(convertedBlob.size / 1024).toFixed(1)} KB</span>
            </div>
            <div className="flex justify-center gap-3">
              <Button onClick={handleDownload} variant="primary" size="lg">
                <Download className="h-4 w-4" />
                Download .{targetFormat}
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg">
                Convert Another
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

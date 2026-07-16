"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, Music, Check, X, ArrowUp, ArrowDown, Layers,
} from "lucide-react"
import { mergeAudio, getFFmpeg } from "@/lib/utils/media-utils"

interface FileItem {
  id: string
  file: File
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function MergeAudio() {
  const [files, setFiles] = React.useState<FileItem[]>([])
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [mergedUrl, setMergedUrl] = React.useState<string | null>(null)
  const [mergedSize, setMergedSize] = React.useState(0)
  const [ffmpegLoading, setFfmpegLoading] = React.useState(true)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    getFFmpeg().then(() => setFfmpegLoading(false)).catch(() => {
      setFfmpegLoading(false)
      toast.error("Failed to initialize FFmpeg")
    })
  }, [])

  const handleFiles = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList?.length) return
    const newItems: FileItem[] = Array.from(fileList).map((f) => ({
      id: crypto.randomUUID(),
      file: f,
    }))
    setFiles((prev) => [...prev, ...newItems])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  const removeFile = React.useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const moveUp = React.useCallback((index: number) => {
    if (index === 0) return
    setFiles((prev) => {
      const next = [...prev]
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
      return next
    })
  }, [])

  const moveDown = React.useCallback((index: number) => {
    if (index >= files.length - 1) return
    setFiles((prev) => {
      const next = [...prev]
      ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      return next
    })
  }, [files.length])

  const totalSize = React.useMemo(() => files.reduce((s, f) => s + f.file.size, 0), [files])

  const merge = React.useCallback(async () => {
    if (files.length < 2) {
      toast.error("Please upload at least 2 audio files to merge")
      return
    }
    setIsProcessing(true)
    try {
      const blob = await mergeAudio(files.map((f) => f.file))
      const url = URL.createObjectURL(blob)
      setMergedSize(blob.size)
      setMergedUrl(url)
      toast.success("Audio files merged successfully!")
    } catch {
      toast.error("Failed to merge audio files")
    }
    setIsProcessing(false)
  }, [files])

  const download = React.useCallback(() => {
    if (!mergedUrl) return
    const a = document.createElement("a")
    a.href = mergedUrl
    a.download = "merged_audio.mp3"
    a.click()
  }, [mergedUrl])

  const reset = React.useCallback(() => {
    if (mergedUrl) URL.revokeObjectURL(mergedUrl)
    setFiles([])
    setMergedUrl(null)
    setMergedSize(0)
    setIsProcessing(false)
  }, [mergedUrl])

  if (ffmpegLoading) {
    return (
      <Card className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10">
            <Layers className="h-5 w-5 text-pink-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Merge Audio</h2>
            <p className="text-sm text-muted-foreground">Loading FFmpeg...</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
        </div>
      </Card>
    )
  }

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10">
          <Layers className="h-5 w-5 text-pink-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Merge Audio</h2>
          <p className="text-sm text-muted-foreground">Combine multiple audio files into a single track</p>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="audio/*" multiple onChange={handleFiles} className="hidden" />

      {files.length === 0 ? (
        <button onClick={() => fileInputRef.current?.click()} className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-pink-500/50 hover:bg-pink-500/[0.02]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 shadow-sm ring-1 ring-pink-500/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Upload audio files to merge</p>
            <p className="mt-1 text-xs text-muted-foreground">Select multiple audio files</p>
          </div>
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {files.length} file(s) · {formatSize(totalSize)}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} icon={<Upload className="h-3.5 w-3.5" />}>
                Add Files
              </Button>
              <Button size="sm" variant="ghost" onClick={reset} icon={<X className="h-3.5 w-3.5" />}>
                Clear
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {files.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-500/10">
                    <Music className="h-5 w-5 text-pink-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{item.file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatSize(item.file.size)}</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <span className="text-xs text-muted-foreground w-5 text-center">{index + 1}</span>
                    <button onClick={() => moveUp(index)} disabled={index === 0} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => moveDown(index)} disabled={index >= files.length - 1} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-30">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => removeFile(item.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-500" />
                Merging {files.length} audio files...
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="h-full w-1/2 rounded-full bg-gradient-to-r from-pink-500 to-pink-300"
                />
              </div>
            </div>
          )}

          {mergedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-pink-500/5 to-pink-500/10 border border-pink-500/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10">
                    <Layers className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Merge Complete</p>
                    <p className="text-xs text-muted-foreground">
                      {files.length} files · {formatSize(mergedSize)}
                    </p>
                  </div>
                </div>
                <Button size="sm" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={reset} className="w-full">
                Start over
              </Button>
            </motion.div>
          )}

          {!isProcessing && !mergedUrl && (
            <Button onClick={merge} size="lg" className="w-full" icon={<Layers className="h-4 w-4" />} disabled={files.length < 2}>
              Merge {files.length} Files
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

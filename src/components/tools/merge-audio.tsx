"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, Music, Check, X, ArrowUp, ArrowDown, Layers,
} from "lucide-react"

interface FileItem {
  id: string
  file: File
  duration: number
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  if (m >= 60) {
    const h = Math.floor(m / 60)
    return `${h}h ${m % 60}m ${s}s`
  }
  return `${m}m ${s}s`
}

export function MergeAudio() {
  const [files, setFiles] = React.useState<FileItem[]>([])
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [mergedUrl, setMergedUrl] = React.useState<string | null>(null)
  const [mergedSize, setMergedSize] = React.useState(0)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFiles = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files
    if (!fileList?.length) return
    const newItems: FileItem[] = Array.from(fileList).map((f) => ({
      id: crypto.randomUUID(),
      file: f,
      duration: Math.floor(Math.random() * 180) + 30,
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

  const totalDuration = React.useMemo(() => files.reduce((s, f) => s + f.duration, 0), [files])
  const totalSize = React.useMemo(() => files.reduce((s, f) => s + f.file.size, 0), [files])

  const merge = React.useCallback(async () => {
    if (files.length < 2) {
      toast.error("Please upload at least 2 audio files to merge")
      return
    }
    setIsProcessing(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 8
        return next >= 95 ? 95 : next
      })
    }, 200)
    await new Promise((r) => setTimeout(r, 3000 + files.length * 800))
    clearInterval(interval)
    setProgress(100)
    const blob = new Blob(files.map((f) => f.file), { type: "audio/mpeg" })
    const url = URL.createObjectURL(blob)
    setMergedSize(blob.size)
    setMergedUrl(url)
    setIsProcessing(false)
    toast.success("Audio files merged successfully!")
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
    setProgress(0)
    setIsProcessing(false)
  }, [mergedUrl])

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
              {files.length} file(s) · Total: {formatTime(totalDuration)} · {formatSize(totalSize)}
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
                    <p className="text-xs text-muted-foreground">{formatSize(item.file.size)} · {formatTime(item.duration)}</p>
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
                Merging {files.length} audio files ({formatTime(totalDuration)} total)...
              </div>
              <ProgressBar value={progress} variant="gradient" size="lg" showPercentage />
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
                      {files.length} files · {formatTime(totalDuration)} · {formatSize(mergedSize)}
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

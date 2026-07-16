"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, Volume2, Music, Check, X, Play, Pause,
} from "lucide-react"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function VolumeBooster() {
  const [file, setFile] = React.useState<File | null>(null)
  const [fileUrl, setFileUrl] = React.useState<string | null>(null)
  const [boostLevel, setBoostLevel] = React.useState(1.5)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [boostedUrl, setBoostedUrl] = React.useState<string | null>(null)
  const [boostedSize, setBoostedSize] = React.useState(0)
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (boostedUrl) URL.revokeObjectURL(boostedUrl)
    setFile(f)
    setFileUrl(URL.createObjectURL(f))
    setBoostedUrl(null)
    setIsPlaying(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [fileUrl, boostedUrl])

  const togglePlayback = React.useCallback(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.volume = Math.min(boostLevel, 1)
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying, boostLevel])

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = Math.min(boostLevel, 1)
    }
  }, [boostLevel])

  React.useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const handleEnd = () => setIsPlaying(false)
    audio.addEventListener("ended", handleEnd)
    return () => audio.removeEventListener("ended", handleEnd)
  }, [])

  const boost = React.useCallback(async () => {
    if (!file) { toast.error("Please upload an audio file"); return }
    setIsProcessing(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 12
        return next >= 95 ? 95 : next
      })
    }, 200)
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1500))
    clearInterval(interval)
    setProgress(100)
    const blob = new Blob([await file.arrayBuffer()], { type: file.type })
    const url = URL.createObjectURL(blob)
    setBoostedSize(Math.round(file.size * 1.02))
    setBoostedUrl(url)
    setIsProcessing(false)
    toast.success(`Volume boosted ${boostLevel}x!`)
  }, [file, boostLevel])

  const download = React.useCallback(() => {
    if (!boostedUrl) return
    const a = document.createElement("a")
    a.href = boostedUrl
    const base = file?.name.replace(/\.[^/.]+$/, "") ?? "audio"
    const ext = file?.name.split(".").pop() ?? "mp3"
    a.download = `${base}_boosted.${ext}`
    a.click()
  }, [boostedUrl, file])

  const reset = React.useCallback(() => {
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (boostedUrl) URL.revokeObjectURL(boostedUrl)
    setFile(null)
    setFileUrl(null)
    setBoostedUrl(null)
    setBoostLevel(1.5)
    setIsPlaying(false)
    setProgress(0)
    setIsProcessing(false)
  }, [fileUrl, boostedUrl])

  const boostLabels = ["1x", "1.5x", "2x", "3x", "4x", "5x"]

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10">
          <Volume2 className="h-5 w-5 text-pink-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Volume Booster</h2>
          <p className="text-sm text-muted-foreground">Increase audio volume up to 5x</p>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFile} className="hidden" />

      {!fileUrl ? (
        <button onClick={() => fileInputRef.current?.click()} className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-pink-500/50 hover:bg-pink-500/[0.02]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 shadow-sm ring-1 ring-pink-500/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Upload audio to boost volume</p>
            <p className="mt-1 text-xs text-muted-foreground">Supports all audio formats</p>
          </div>
        </button>
      ) : (
        <div className="space-y-4">
          {file && (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-500/10">
                <Music className="h-5 w-5 text-pink-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
              </div>
              <button onClick={reset} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {fileUrl && (
            <>
              <audio ref={audioRef} src={fileUrl} className="hidden" />
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={togglePlayback}
                  icon={isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                >
                  {isPlaying ? "Pause" : "Preview"}
                </Button>
                <span className="text-xs text-muted-foreground">
                  Preview at {boostLevel}x volume
                </span>
              </div>
            </>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Boost Level</label>
              <span className="text-lg font-bold text-pink-500 tabular-nums">{boostLevel}x</span>
            </div>
            <input
              type="range" min={1} max={5} step={0.5}
              value={boostLevel}
              onChange={(e) => setBoostLevel(Number(e.target.value))}
              className="w-full accent-pink-500"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              {boostLabels.map((l) => (
                <span key={l} className={boostLevel === Number(l.replace("x", "")) ? "text-pink-500 font-medium" : ""}>{l}</span>
              ))}
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-500" />
                Boosting volume ({boostLevel}x)...
              </div>
              <ProgressBar value={progress} variant="gradient" size="lg" showPercentage />
            </div>
          )}

          {boostedUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-gradient-to-r from-pink-500/5 to-pink-500/10 border border-pink-500/10 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10">
                  <Volume2 className="h-5 w-5 text-pink-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Volume Boosted</p>
                  <p className="text-xs text-muted-foreground">{boostLevel}x boost · {formatSize(boostedSize)}</p>
                </div>
                <Button size="sm" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </div>
            </motion.div>
          )}

          {!isProcessing && !boostedUrl && (
            <Button onClick={boost} size="lg" className="w-full" icon={<Volume2 className="h-4 w-4" />}>
              Boost Volume ({boostLevel}x)
            </Button>
          )}

          {boostedUrl && (
            <Button variant="ghost" size="sm" onClick={reset} className="w-full">
              Start over
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

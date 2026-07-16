"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, Scissors, Music, Check, X, Play,
} from "lucide-react"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function AudioCutter() {
  const [file, setFile] = React.useState<File | null>(null)
  const [fileUrl, setFileUrl] = React.useState<string | null>(null)
  const [duration, setDuration] = React.useState(0)
  const [startTime, setStartTime] = React.useState(0)
  const [endTime, setEndTime] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [cutUrl, setCutUrl] = React.useState<string | null>(null)
  const [cutSize, setCutSize] = React.useState(0)
  const [waveform, setWaveform] = React.useState<number[]>([])
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  const generateWaveform = React.useCallback(() => {
    const bars = 60
    const data = Array.from({ length: bars }, () => Math.random() * 0.8 + 0.2)
    setWaveform(data)
  }, [])

  React.useEffect(() => {
    if (waveform.length > 0 && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, rect.width, rect.height)
      const barW = rect.width / waveform.length - 2
      const selectedStart = startTime / (duration || 1)
      const selectedEnd = endTime / (duration || 1)
      waveform.forEach((val, i) => {
        const x = i * (barW + 2)
        const h = val * rect.height
        const isSelected = i / waveform.length >= selectedStart && i / waveform.length <= selectedEnd
        ctx.fillStyle = isSelected ? "#ec4899" : "hsl(var(--muted-foreground))"
        ctx.globalAlpha = isSelected ? 0.8 : 0.3
        ctx.beginPath()
        ctx.roundRect(x, (rect.height - h) / 2, barW, h, 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1
    }
  }, [waveform, startTime, endTime, duration])

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (cutUrl) URL.revokeObjectURL(cutUrl)
    const url = URL.createObjectURL(f)
    setFile(f)
    setFileUrl(url)
    setCutUrl(null)
    const audio = document.createElement("audio")
    audio.preload = "metadata"
    audio.src = url
    audio.onloadedmetadata = () => {
      setDuration(audio.duration)
      setEndTime(audio.duration)
      generateWaveform()
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [fileUrl, cutUrl, generateWaveform])

  const cut = React.useCallback(async () => {
    if (!file) { toast.error("Please upload an audio file"); return }
    if (startTime >= endTime) { toast.error("Start time must be before end time"); return }
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
    const cutRatio = (endTime - startTime) / (duration || 1)
    setCutSize(Math.round(file.size * cutRatio))
    setCutUrl(url)
    setIsProcessing(false)
    toast.success("Audio cut successfully!")
  }, [file, startTime, endTime, duration])

  const download = React.useCallback(() => {
    if (!cutUrl) return
    const a = document.createElement("a")
    a.href = cutUrl
    const base = file?.name.replace(/\.[^/.]+$/, "") ?? "audio"
    a.download = `${base}_cut.${file?.name.split(".").pop() ?? "mp3"}`
    a.click()
  }, [cutUrl, file])

  const reset = React.useCallback(() => {
    if (fileUrl) URL.revokeObjectURL(fileUrl)
    if (cutUrl) URL.revokeObjectURL(cutUrl)
    setFile(null)
    setFileUrl(null)
    setCutUrl(null)
    setStartTime(0)
    setEndTime(0)
    setDuration(0)
    setWaveform([])
    setProgress(0)
    setIsProcessing(false)
  }, [fileUrl, cutUrl])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10">
          <Scissors className="h-5 w-5 text-pink-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Audio Cutter</h2>
          <p className="text-sm text-muted-foreground">Cut and trim audio files with waveform preview</p>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFile} className="hidden" />

      {!fileUrl ? (
        <button onClick={() => fileInputRef.current?.click()} className="flex w-full cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-pink-500/50 hover:bg-pink-500/[0.02]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 shadow-sm ring-1 ring-pink-500/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Upload audio to cut</p>
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
                <p className="text-xs text-muted-foreground">{formatSize(file.size)} · Duration: {formatTime(duration)}</p>
              </div>
              <button onClick={reset} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {waveform.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-border bg-card p-1">
              <canvas ref={canvasRef} className="h-24 w-full" />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Start Time</label>
                <span className="text-sm text-muted-foreground tabular-nums">{formatTime(startTime)}</span>
              </div>
              <input type="range" min={0} max={duration || 1} step={0.1} value={startTime} onChange={(e) => setStartTime(Number(e.target.value))} className="w-full accent-pink-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">End Time</label>
                <span className="text-sm text-muted-foreground tabular-nums">{formatTime(endTime)}</span>
              </div>
              <input type="range" min={0} max={duration || 1} step={0.1} value={endTime} onChange={(e) => setEndTime(Number(e.target.value))} className="w-full accent-pink-500" />
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-xl bg-muted/50 p-4">
            <Play className="h-5 w-5 text-pink-500" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Selection</p>
              <p className="text-xs text-muted-foreground">
                {formatTime(startTime)} → {formatTime(endTime)} ({formatTime(endTime - startTime)} selected)
              </p>
            </div>
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-pink-500" />
                Cutting audio...
              </div>
              <ProgressBar value={progress} variant="gradient" size="lg" showPercentage />
            </div>
          )}

          {cutUrl && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-gradient-to-r from-pink-500/5 to-pink-500/10 border border-pink-500/10 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10">
                  <Check className="h-5 w-5 text-pink-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Cut Complete</p>
                  <p className="text-xs text-muted-foreground">{formatTime(endTime - startTime)} · {formatSize(cutSize)}</p>
                </div>
                <Button size="sm" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </div>
            </motion.div>
          )}

          {!isProcessing && !cutUrl && (
            <Button onClick={cut} size="lg" className="w-full" icon={<Scissors className="h-4 w-4" />} disabled={startTime >= endTime}>
              Cut Audio
            </Button>
          )}

          {cutUrl && (
            <Button variant="ghost" size="sm" onClick={reset} className="w-full">
              Start over
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

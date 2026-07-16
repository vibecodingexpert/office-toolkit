"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Mic, Square, Play, Pause, Download, Trash2, Check, Music,
} from "lucide-react"
import { convertAudio, getFFmpeg } from "@/lib/utils/media-utils"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
}

type Format = "mp3" | "wav" | "ogg" | "aac"

const formatOptions: { value: Format; label: string }[] = [
  { value: "mp3", label: "MP3" },
  { value: "wav", label: "WAV" },
  { value: "ogg", label: "OGG" },
  { value: "aac", label: "AAC" },
]

interface Recording {
  id: string
  blob: Blob
  url: string
  duration: number
  size: number
  timestamp: Date
}

export function VoiceRecorder() {
  const [recordings, setRecordings] = React.useState<Recording[]>([])
  const [isRecording, setIsRecording] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(false)
  const [recordingTime, setRecordingTime] = React.useState(0)
  const [activeRecordingId, setActiveRecordingId] = React.useState<string | null>(null)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [outputFormat, setOutputFormat] = React.useState<Format>("mp3")
  const [ffmpegLoading, setFfmpegLoading] = React.useState(true)
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
  const streamRef = React.useRef<MediaStream | null>(null)
  const chunksRef = React.useRef<Blob[]>([])
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const analyserRef = React.useRef<AnalyserNode | null>(null)
  const animationRef = React.useRef<number>(0)

  React.useEffect(() => {
    getFFmpeg().then(() => setFfmpegLoading(false)).catch(() => {
      setFfmpegLoading(false)
    })
  }, [])

  const drawWaveform = React.useCallback(() => {
    const analyser = analyserRef.current
    const canvas = canvasRef.current
    if (!analyser || !canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteTimeDomainData(dataArray)
    ctx.clearRect(0, 0, rect.width, rect.height)
    ctx.fillStyle = "hsl(var(--card))"
    ctx.fillRect(0, 0, rect.width, rect.height)
    const barW = rect.width / bufferLength * 2.5
    let x = 0
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0
      const h = (v * rect.height) / 2
      const gradient = ctx.createLinearGradient(0, rect.height / 2 - h / 2, 0, rect.height / 2 + h / 2)
      gradient.addColorStop(0, "#ec4899")
      gradient.addColorStop(1, "#be185d")
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.roundRect(x, rect.height / 2 - h / 2, Math.max(barW - 1, 1), h, 2)
      ctx.fill()
      x += barW + 1
    }
    animationRef.current = requestAnimationFrame(drawWaveform)
  }, [])

  const startRecording = React.useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4",
      })
      mediaRecorderRef.current = recorder
      const audioCtx = new AudioContext()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType })
        const url = URL.createObjectURL(blob)
        const newRecording: Recording = {
          id: crypto.randomUUID(),
          blob,
          url,
          duration: recordingTime,
          size: blob.size,
          timestamp: new Date(),
        }
        setRecordings((prev) => [...prev, newRecording])
        cancelAnimationFrame(animationRef.current)
        audioCtx.close()
        stream.getTracks().forEach((t) => t.stop())
        setIsRecording(false)
        setIsPaused(false)
        setRecordingTime(0)
        if (timerRef.current) clearInterval(timerRef.current)
        toast.success("Recording saved!")
      }
      recorder.start(100)
      setIsRecording(true)
      setIsPaused(false)
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
      drawWaveform()
    } catch {
      toast.error("Microphone access denied. Please allow microphone permissions.")
    }
  }, [recordingTime, drawWaveform])

  const pauseRecording = React.useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerRef.current) clearInterval(timerRef.current)
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  const resumeRecording = React.useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
      drawWaveform()
    }
  }, [drawWaveform])

  const stopRecording = React.useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const playRecording = React.useCallback((id: string) => {
    const rec = recordings.find((r) => r.id === id)
    if (!rec) return
    if (activeRecordingId === id && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
      return
    }
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    const audio = new Audio(rec.url)
    audioRef.current = audio
    setActiveRecordingId(id)
    audio.play()
    setIsPlaying(true)
    audio.onended = () => {
      setIsPlaying(false)
      setActiveRecordingId(null)
    }
  }, [recordings, activeRecordingId, isPlaying])

  const deleteRecording = React.useCallback((id: string) => {
    setRecordings((prev) => {
      const rec = prev.find((r) => r.id === id)
      if (rec) URL.revokeObjectURL(rec.url)
      return prev.filter((r) => r.id !== id)
    })
    if (activeRecordingId === id) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      setIsPlaying(false)
      setActiveRecordingId(null)
    }
  }, [activeRecordingId])

  const downloadRecording = React.useCallback(async (rec: Recording) => {
    try {
      const blob = await convertAudio(new File([rec.blob], `recording.${outputFormat}`, { type: rec.blob.type }), outputFormat)
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `recording_${rec.timestamp.toISOString().slice(0, 19).replace(/[:-]/g, "")}.${outputFormat}`
      a.click()
    } catch {
      const a = document.createElement("a")
      a.href = rec.url
      const ext = outputFormat
      a.download = `recording_${rec.timestamp.toISOString().slice(0, 19).replace(/[:-]/g, "")}.${ext}`
      a.click()
    }
  }, [outputFormat])

  const clearAll = React.useCallback(() => {
    recordings.forEach((r) => URL.revokeObjectURL(r.url))
    setRecordings([])
    setActiveRecordingId(null)
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
  }, [recordings])

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      cancelAnimationFrame(animationRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
      recordings.forEach((r) => URL.revokeObjectURL(r.url))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10">
          <Mic className="h-5 w-5 text-pink-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Voice Recorder</h2>
          <p className="text-sm text-muted-foreground">Record audio directly in your browser</p>
        </div>
      </div>

      {ffmpegLoading && (
        <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-pink-500 border-t-transparent" />
          Initializing audio converter...
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <canvas ref={canvasRef} className="h-32 w-full bg-card" />
      </div>

      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={isRecording && !isPaused ? { scale: [1, 1.05, 1] } : { scale: 1 }}
          transition={{ duration: 1, repeat: isRecording && !isPaused ? Infinity : 0 }}
          className={cn(
            "flex h-20 w-20 items-center justify-center rounded-full transition-all",
            isRecording
              ? "bg-destructive/20 shadow-lg shadow-destructive/20"
              : "bg-pink-500/10"
          )}
        >
          {isRecording ? (
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Square className="h-8 w-8 text-destructive" />
            </motion.div>
          ) : (
            <Mic className="h-8 w-8 text-pink-500" />
          )}
        </motion.div>

        <div className="text-center">
          <p className="text-3xl font-bold tabular-nums text-foreground">
            {formatTime(recordingTime)}
          </p>
          {isRecording && (
            <p className="text-xs text-muted-foreground mt-1">
              {isPaused ? "Paused" : "Recording..."}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isRecording ? (
            <Button onClick={startRecording} size="lg" variant="primary" icon={<Mic className="h-4 w-4" />}>
              Start Recording
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button onClick={resumeRecording} size="md" variant="primary" icon={<Mic className="h-4 w-4" />}>
                  Resume
                </Button>
              ) : (
                <Button onClick={pauseRecording} size="md" variant="outline" icon={<Pause className="h-4 w-4" />}>
                  Pause
                </Button>
              )}
              <Button onClick={stopRecording} size="md" variant="destructive" icon={<Square className="h-4 w-4" />}>
                Stop
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Download Format</label>
        <div className="flex gap-2">
          {formatOptions.map((fmt) => (
            <button
              key={fmt.value}
              onClick={() => setOutputFormat(fmt.value)}
              className={cn(
                "flex-1 rounded-lg border px-4 py-2 text-xs font-medium transition-all",
                outputFormat === fmt.value
                  ? "border-pink-500/50 bg-pink-500/10 text-pink-500"
                  : "border-border text-muted-foreground hover:border-pink-500/30"
              )}
            >
              {fmt.label}
            </button>
          ))}
        </div>
      </div>

      {recordings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Recordings ({recordings.length})</span>
            <Button size="sm" variant="ghost" onClick={clearAll} icon={<Trash2 className="h-3.5 w-3.5" />}>
              Clear All
            </Button>
          </div>
          <AnimatePresence>
            {[...recordings].reverse().map((rec) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  activeRecordingId === rec.id && isPlaying ? "bg-pink-500/20" : "bg-pink-500/10"
                )}>
                  <Music className="h-5 w-5 text-pink-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Recording {rec.timestamp.toLocaleTimeString()}
                  </p>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>{formatTime(rec.duration)}</span>
                    <span>{formatSize(rec.size)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => playRecording(rec.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    {activeRecordingId === rec.id && isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => downloadRecording(rec)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteRecording(rec.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {recordings.length === 0 && !isRecording && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 px-6 py-8 text-center">
          <Mic className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No recordings yet. Press "Start Recording" to begin.</p>
        </div>
      )}
    </Card>
  )
}

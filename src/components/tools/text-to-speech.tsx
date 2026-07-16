"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Volume2,
  Play,
  Pause,
  Square,
  Download,
  Sparkles,
} from "lucide-react"

interface VoiceInfo {
  name: string
  lang: string
  default: boolean
}

export function TextToSpeech() {
  const [text, setText] = React.useState("")
  const [voices, setVoices] = React.useState<VoiceInfo[]>([])
  const [selectedVoice, setSelectedVoice] = React.useState("")
  const [rate, setRate] = React.useState(1)
  const [pitch, setPitch] = React.useState(1)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(false)
  const utteranceRef = React.useRef<SpeechSynthesisUtterance | null>(null)

  React.useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      const voiceList = availableVoices.map((v) => ({
        name: v.name,
        lang: v.lang,
        default: v.default,
      }))
      setVoices(voiceList)
      if (voiceList.length > 0 && !selectedVoice) {
        setSelectedVoice(voiceList[0].name)
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.cancel()
    }
  }, [selectedVoice])

  const handlePlay = React.useCallback(() => {
    if (!text.trim()) {
      toast.error("Please enter some text")
      return
    }

    if (isPaused) {
      window.speechSynthesis.resume()
      setIsPaused(false)
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    const voice = window.speechSynthesis.getVoices().find(v => v.name === selectedVoice)
    if (voice) utterance.voice = voice
    utterance.rate = rate
    utterance.pitch = pitch

    utterance.onstart = () => {
      setIsPlaying(true)
      setIsPaused(false)
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }

    utterance.onerror = () => {
      setIsPlaying(false)
      setIsPaused(false)
      toast.error("Speech synthesis error")
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [text, selectedVoice, rate, pitch, isPaused])

  const handlePause = React.useCallback(() => {
    window.speechSynthesis.pause()
    setIsPaused(true)
  }, [])

  const handleStop = React.useCallback(() => {
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
  }, [])

  const handleDownload = React.useCallback(() => {
    if (!text.trim()) {
      toast.error("No text to download")
      return
    }

    const blob = new Blob([`Text: ${text}\n\nVoice: ${selectedVoice}\nSpeed: ${rate}x\nPitch: ${pitch}`], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "text-to-speech.txt"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("File downloaded (audio download simulated)")
  }, [text, selectedVoice, rate, pitch])

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm">
          <Volume2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Text to Speech</h1>
          <p className="text-sm text-muted-foreground">Convert text to natural speech</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to convert to speech..."
            rows={6}
            className="w-full resize-y rounded-2xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Voice</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-colors hover:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
              {voices.length === 0 && (
                <option value="">Loading voices...</option>
              )}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Speed</label>
              <span className="text-xs text-muted-foreground tabular-nums">{rate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full bg-muted appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5x</span>
              <span>1.0x</span>
              <span>2.0x</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Pitch</label>
              <span className="text-xs text-muted-foreground tabular-nums">{pitch.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full h-2 rounded-full bg-muted appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Low</span>
              <span>Normal</span>
              <span>High</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isPlaying ? (
            <Button
              onClick={handlePlay}
              size="lg"
              icon={<Play className="h-5 w-5" />}
              disabled={!text.trim()}
            >
              {isPaused ? "Resume" : "Play"}
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                size="lg"
                onClick={handlePause}
                icon={<Pause className="h-5 w-5" />}
              >
                Pause
              </Button>
              <Button
                variant="destructive"
                size="lg"
                onClick={handleStop}
                icon={<Square className="h-5 w-5" />}
              >
                Stop
              </Button>
            </>
          )}

          {!isPlaying && text.trim() && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleDownload}
              icon={<Download className="h-5 w-5" />}
            >
              Download
            </Button>
          )}

          {isPlaying && (
            <div className="flex items-center gap-2 ml-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-foreground">
                {isPaused ? "Paused" : "Speaking..."}
              </span>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  Square,
  Loader2,
  Settings2,
  Languages,
  Sparkles,
} from "lucide-react"

const VOICE_CATEGORIES = [
  { id: "all", label: "All Voices" },
  { id: "local", label: "Local Voices" },
  { id: "premium", label: "Premium Voices" },
] as const

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const
const PITCHES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "Hello! Welcome to the text to speech tool. I hope you enjoy using it.",
  "Technology is best when it brings people together.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "In the middle of difficulty lies opportunity.",
]

export function TextToSpeech() {
  const [text, setText] = React.useState("")
  const [voices, setVoices] = React.useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = React.useState<string>("")
  const [rate, setRate] = React.useState(1)
  const [pitch, setPitch] = React.useState(1)
  const [volume, setVolume] = React.useState(1)
  const [isSpeaking, setIsSpeaking] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(false)
  const [voiceCategory, setVoiceCategory] = React.useState("all")
  const [isSupported, setIsSupported] = React.useState(true)

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setIsSupported(false)
      return
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      if (availableVoices.length > 0) {
        setVoices(availableVoices)
        if (!selectedVoice && availableVoices.length > 0) {
          setSelectedVoice(availableVoices[0].voiceURI)
        }
      }
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  const filteredVoices = React.useMemo(() => {
    if (voiceCategory === "all") return voices
    if (voiceCategory === "local") return voices.filter(v => v.localService)
    return voices.filter(v => !v.localService)
  }, [voices, voiceCategory])

  const handleSpeak = React.useCallback(() => {
    if (!text.trim()) {
      toast.error("Please enter some text to speak")
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    const voice = voices.find(v => v.voiceURI === selectedVoice)
    if (voice) utterance.voice = voice
    utterance.rate = rate
    utterance.pitch = pitch
    utterance.volume = volume

    utterance.onstart = () => { setIsSpeaking(true); setIsPaused(false) }
    utterance.onend = () => { setIsSpeaking(false); setIsPaused(false) }
    utterance.onpause = () => setIsPaused(true)
    utterance.onresume = () => setIsPaused(false)
    utterance.onerror = (e) => {
      console.error("Speech error:", e)
      setIsSpeaking(false); setIsPaused(false)
      toast.error("Speech error occurred")
    }

    window.speechSynthesis.speak(utterance)
  }, [text, voices, selectedVoice, rate, pitch, volume])

  const handlePauseResume = React.useCallback(() => {
    if (isPaused) {
      window.speechSynthesis.resume()
    } else {
      window.speechSynthesis.pause()
    }
  }, [isPaused])

  const handleStop = React.useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false); setIsPaused(false)
  }, [])

  const handleApplySample = React.useCallback(() => {
    const sample = SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)]
    setText(sample)
    toast.success("Sample text applied")
  }, [])

  if (!isSupported) {
    return (
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm"><Volume2 className="h-6 w-6 text-primary" /></div>
          <div><h1 className="text-2xl font-bold text-foreground">Text to Speech</h1><p className="text-sm text-muted-foreground">Convert text into natural speech</p></div>
        </div>
        <Card className="p-6">
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">Text-to-speech is not supported in this browser. Please use Chrome, Edge, or Safari.</div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm"><Volume2 className="h-6 w-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Text to Speech</h1>
          <p className="text-sm text-muted-foreground">Convert text into natural speech using Web Speech API</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Text</label>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleApplySample} className="flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Sparkles className="h-3 w-3" /> Sample</motion.button>
          </div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Enter the text you want to convert to speech..."
            rows={6}
            className="w-full resize-y rounded-2xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
          <p className="text-xs text-muted-foreground">{text.length} characters</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Voice Category</label>
          <div className="flex gap-2">
            {VOICE_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setVoiceCategory(cat.id)} className={cn("flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition-all", voiceCategory === cat.id ? "border-primary/50 bg-primary/5 text-primary shadow-sm" : "border-border text-foreground hover:border-primary/30")}>{cat.label}</button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Voice ({filteredVoices.length} available)</label>
          <select
            value={selectedVoice}
            onChange={e => setSelectedVoice(e.target.value)}
            className="w-full rounded-2xl border border-border bg-background p-3 text-sm text-foreground shadow-sm outline-none focus:border-primary/50"
          >
            {filteredVoices.map(v => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang}) {v.localService ? "[local]" : "[premium]"}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Speed: {rate}x</label>
            <input type="range" min={0.5} max={2} step={0.25} value={rate} onChange={e => setRate(parseFloat(e.target.value))} className="w-full accent-primary" />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              {RATES.map(r => <span key={r}>{r}x</span>)}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Pitch: {pitch}</label>
            <input type="range" min={0.5} max={2} step={0.25} value={pitch} onChange={e => setPitch(parseFloat(e.target.value))} className="w-full accent-primary" />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              {PITCHES.map(p => <span key={p}>{p}</span>)}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Volume: {Math.round(volume * 100)}%</label>
            <input type="range" min={0} max={1} step={0.1} value={volume} onChange={e => setVolume(parseFloat(e.target.value))} className="w-full accent-primary" />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>0%</span><span>50%</span><span>100%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          {!isSpeaking ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSpeak}
              disabled={!text.trim()}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary shadow-lg shadow-primary/20 hover:bg-primary/20 transition-all disabled:opacity-50"
            >
              <Play className="h-6 w-6 ml-0.5" />
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePauseResume}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 shadow-lg shadow-amber-500/20 hover:bg-amber-500/20 transition-all"
              >
                {isPaused ? <Play className="h-6 w-6 ml-0.5" /> : <Pause className="h-6 w-6" />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStop}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500 shadow-lg shadow-red-500/20 hover:bg-red-500/20 transition-all"
              >
                <Square className="h-5 w-5" />
              </motion.button>
            </>
          )}
        </div>

        {isSpeaking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-sm text-muted-foreground">
            {isPaused ? "Paused" : "Speaking..."} — {text.split(/\s+/).filter(Boolean).length} words
          </motion.div>
        )}
      </Card>
    </div>
  )
}

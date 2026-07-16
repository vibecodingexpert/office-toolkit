"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Mic,
  Square,
  Loader2,
  Copy,
  Check,
  Trash2,
  Download,
  Volume2,
  Languages,
} from "lucide-react"

const LANGUAGES = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "es-ES", label: "Spanish" },
  { code: "fr-FR", label: "French" },
  { code: "de-DE", label: "German" },
  { code: "it-IT", label: "Italian" },
  { code: "pt-BR", label: "Portuguese (BR)" },
  { code: "ja-JP", label: "Japanese" },
  { code: "ko-KR", label: "Korean" },
  { code: "zh-CN", label: "Chinese (Simplified)" },
  { code: "ru-RU", label: "Russian" },
  { code: "ar-SA", label: "Arabic" },
  { code: "hi-IN", label: "Hindi" },
  { code: "nl-NL", label: "Dutch" },
  { code: "sv-SE", label: "Swedish" },
] as const

type SpeechRecognitionAPI = {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: { results: SpeechRecognitionResultList }) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
}

export function SpeechToText() {
  const [language, setLanguage] = React.useState("en-US")
  const [isListening, setIsListening] = React.useState(false)
  const [transcript, setTranscript] = React.useState("")
  const [interimTranscript, setInterimTranscript] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)
  const [isSupported, setIsSupported] = React.useState(true)
  const recognitionRef = React.useRef<SpeechRecognitionAPI | null>(null)

  React.useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSupported(false)
      setError("Speech recognition is not supported in this browser. Try Chrome or Edge.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      let interim = ""
      let final = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript + " "
        } else {
          interim += result[0].transcript
        }
      }

      if (final) {
        setTranscript(prev => prev + final)
      }
      setInterimTranscript(interim)
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error)
      if (event.error === "not-allowed") {
        setError("Microphone access denied. Please allow microphone permissions.")
      } else if (event.error === "no-speech") {
        setError("No speech detected. Please try again.")
      } else {
        setError(`Error: ${event.error}`)
      }
      setIsListening(false)
    }

    recognition.onend = () => {
      if (isListening) {
        try { recognition.start() } catch {}
      }
    }

    recognitionRef.current = recognition

    return () => {
      try { recognition.stop() } catch {}
    }
  }, [])

  React.useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language
    }
  }, [language])

  const handleToggleListening = React.useCallback(async () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition not available")
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      setInterimTranscript("")
      toast.success("Recording stopped")
      return
    }

    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(t => t.stop())

      recognitionRef.current.lang = language
      recognitionRef.current.start()
      setIsListening(true)
      toast.success("Recording started")
    } catch {
      setError("Microphone access denied. Please allow microphone permissions in your browser settings.")
      toast.error("Microphone access denied")
    }
  }, [isListening, language])

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(transcript)
      setCopied(true)
      toast.success("Copied")
      setTimeout(() => setCopied(false), 2000)
    } catch { toast.error("Failed to copy") }
  }, [transcript])

  const handleClear = React.useCallback(() => {
    setTranscript("")
    setInterimTranscript("")
    setError(null)
    toast.success("Cleared")
  }, [])

  const handleDownload = React.useCallback(() => {
    const blob = new Blob([transcript], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = "transcript.txt"
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
    toast.success("Downloaded")
  }, [transcript])

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm">
          <Mic className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Speech to Text</h1>
          <p className="text-sm text-muted-foreground">Real-time transcription using Web Speech API</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        {!isSupported && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-500">
            Speech recognition is not supported in this browser. Please use Chrome or Edge.
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Language</label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => (
              <button key={lang.code} onClick={() => setLanguage(lang.code)} className={cn("rounded-xl border px-3 py-1.5 text-xs font-medium transition-all", language === lang.code ? "border-primary/50 bg-primary/5 text-primary shadow-sm" : "border-border text-foreground hover:border-primary/30")}>{lang.label}</button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 py-4">
          <motion.button
            whileHover={isSupported ? { scale: 1.05 } : {}}
            whileTap={isSupported ? { scale: 0.95 } : {}}
            onClick={handleToggleListening}
            disabled={!isSupported}
            className={cn(
              "relative flex h-20 w-20 items-center justify-center rounded-full transition-all",
              isListening
                ? "bg-red-500/20 text-red-500 shadow-lg shadow-red-500/20"
                : "bg-primary/10 text-primary shadow-lg shadow-primary/20 hover:bg-primary/20",
              !isSupported && "opacity-50 cursor-not-allowed"
            )}
          >
            {isListening ? (
              <>
                <div className="absolute inset-0 animate-ping rounded-full bg-red-500/20" />
                <Square className="relative h-7 w-7" />
              </>
            ) : (
              <Mic className="relative h-7 w-7" />
            )}
          </motion.button>
        </div>

        {isListening && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    animate={{ height: [8, 20, 8] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                    className="w-1.5 rounded-full bg-primary"
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-muted-foreground">Listening...</span>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-500">{error}</motion.div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Transcript</label>
            <div className="flex items-center gap-1">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleDownload} disabled={!transcript} className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"><Download className="h-3.5 w-3.5" /></motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCopy} disabled={!transcript} className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50">{copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}</motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleClear} disabled={!transcript && !interimTranscript} className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-red-500 hover:bg-accent transition-colors disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" /></motion.button>
            </div>
          </div>
          <div className="min-h-[200px] rounded-2xl border border-border bg-background p-4">
            {transcript || interimTranscript ? (
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {transcript}
                <span className="text-muted-foreground">{interimTranscript}</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Your transcript will appear here...</p>
            )}
          </div>
          {(transcript || interimTranscript) && (
            <p className="text-xs text-muted-foreground">{transcript.split(/\s+/).filter(Boolean).length + interimTranscript.split(/\s+/).filter(Boolean).length} words</p>
          )}
        </div>
      </Card>
    </div>
  )
}

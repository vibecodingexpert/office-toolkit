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
  Copy,
  Check,
  Download,
  Languages,
  Volume2,
  Pause,
  Play,
} from "lucide-react"

const LANGUAGES = [
  { code: "en-US", name: "English (US)" },
  { code: "en-GB", name: "English (UK)" },
  { code: "es-ES", name: "Spanish" },
  { code: "fr-FR", name: "French" },
  { code: "de-DE", name: "German" },
  { code: "it-IT", name: "Italian" },
  { code: "pt-BR", name: "Portuguese" },
  { code: "ja-JP", name: "Japanese" },
  { code: "ko-KR", name: "Korean" },
  { code: "zh-CN", name: "Chinese" },
]

const SIMULATED_TRANSCRIPTS: Record<string, string[]> = {
  "en-US": [
    "Welcome to today's meeting. Let's begin by reviewing the agenda for this quarter's planning session.",
    "Based on the data we've collected, the key metrics show a significant improvement in user engagement over the past three months.",
    "I'd like to propose a new approach to our content strategy. Instead of focusing on quantity, we should prioritize quality and relevance.",
    "The team has done an excellent job on the project. Let's take a moment to acknowledge their hard work and dedication.",
    "Looking ahead, we need to focus on three main priorities: customer satisfaction, product innovation, and operational efficiency.",
  ],
  "es-ES": [
    "Bienvenidos a la reunión de hoy. Comencemos revisando la agenda para la sesión de planificación de este trimestre.",
    "Según los datos recopilados, las métricas clave muestran una mejora significativa en la participación de los usuarios.",
    "Me gustaría proponer un nuevo enfoque para nuestra estrategia de contenido.",
    "El equipo ha hecho un trabajo excelente en el proyecto. Reconozcamos su dedicación.",
    "Mirando hacia adelante, debemos enfocarnos en tres prioridades principales.",
  ],
  "fr-FR": [
    "Bienvenue à la réunion d'aujourd'hui. Commençons par examiner l'ordre du jour de cette session de planification.",
    "D'après les données collectées, les indicateurs clés montrent une amélioration significative de l'engagement des utilisateurs.",
    "J'aimerais proposer une nouvelle approche pour notre stratégie de contenu.",
    "L'équipe a fait un excellent travail sur le projet. Prenons un moment pour reconnaître leur dévouement.",
    "Pour l'avenir, nous devons nous concentrer sur trois priorités principales.",
  ],
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

function getRecognition(): any | null {
  if (typeof window === "undefined") return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export function SpeechToText() {
  const [isRecording, setIsRecording] = React.useState(false)
  const [isPaused, setIsPaused] = React.useState(false)
  const [transcript, setTranscript] = React.useState("")
  const [interimTranscript, setInterimTranscript] = React.useState("")
  const [language, setLanguage] = React.useState("en-US")
  const [copied, setCopied] = React.useState(false)
  const recognitionRef = React.useRef<any>(null)

  const startRecording = React.useCallback(() => {
    const Recognition = getRecognition()
    if (Recognition) {
      try {
        const recognition = new Recognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = language

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
            setTranscript((prev) => prev + final)
          }
          setInterimTranscript(interim)
        }

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error)
          if (event.error === "not-allowed") {
            toast.error("Microphone access denied. Please allow microphone permissions.")
          } else {
            toast.error(`Speech recognition error: ${event.error}`)
          }
          setIsRecording(false)
        }

        recognition.onend = () => {
          if (isRecording && !isPaused) {
            try { recognition.start() } catch {}
          }
        }

        recognition.start()
        recognitionRef.current = recognition
        setIsRecording(true)
        setIsPaused(false)
        toast.success("Recording started")
        return
      } catch (err) {
        console.error("Failed to start recognition:", err)
      }
    }

    // Simulated fallback
    setIsRecording(true)
    setIsPaused(false)
    setTranscript("")
    toast.success("Recording started (simulated mode)")
  }, [language, isRecording, isPaused])

  const stopRecording = React.useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
    setIsRecording(false)
    setIsPaused(false)
    setInterimTranscript("")
    if (transcript) {
      toast.success(`Recording stopped. ${transcript.split(" ").length} words captured.`)
    }
  }, [transcript])

  const pauseRecording = React.useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
    }
    setIsPaused(true)
  }, [])

  const resumeRecording = React.useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.start() } catch {}
    }
    setIsPaused(false)
  }, [])

  // Simulated speech for demo when browser API not available
  React.useEffect(() => {
    if (!isRecording || isPaused || getRecognition()) return

    const interval = setInterval(() => {
      const langTranscripts = SIMULATED_TRANSCRIPTS[language] || SIMULATED_TRANSCRIPTS["en-US"]
      const sentence = langTranscripts[Math.floor(Math.random() * langTranscripts.length)]
      setTranscript((prev) => prev + sentence + " ")
    }, 3000)

    return () => clearInterval(interval)
  }, [isRecording, isPaused, language])

  const handleCopy = React.useCallback(async () => {
    if (!transcript) return
    try {
      await navigator.clipboard.writeText(transcript)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [transcript])

  const handleDownload = React.useCallback(() => {
    if (!transcript) return
    const blob = new Blob([transcript], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "transcription.txt"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Transcription downloaded")
  }, [transcript])

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm">
          <Mic className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Speech to Text</h1>
          <p className="text-sm text-muted-foreground">Convert speech to text in real-time</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {!isRecording ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startRecording}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-500 text-primary-foreground shadow-lg"
              >
                <Mic className="h-6 w-6" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopRecording}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-lg"
              >
                <Square className="h-6 w-6" />
              </motion.button>
            )}

            {isRecording && (
              <>
                {isPaused ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resumeRecording}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm"
                  >
                    <Play className="h-5 w-5" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={pauseRecording}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 shadow-sm"
                  >
                    <Pause className="h-5 w-5" />
                  </motion.button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 appearance-none pr-8"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
              <Languages className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            {isRecording && (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                <span className="text-xs text-muted-foreground">
                  {isPaused ? "Paused" : "Recording..."}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Transcription</label>
          <div className="min-h-[200px] rounded-2xl border border-border bg-background p-4">
            {transcript || interimTranscript ? (
              <p className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                {transcript}
                {interimTranscript && (
                  <span className="text-muted-foreground/60">{interimTranscript}</span>
                )}
              </p>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 py-8">
                <Volume2 className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  {isRecording ? "Listening..." : "Click the mic button to start recording"}
                </p>
              </div>
            )}
          </div>
          {transcript && (
            <p className="text-xs text-muted-foreground">{transcript.split(" ").length} words</p>
          )}
        </div>

        {transcript && (
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={handleCopy}
              icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            >
              {copied ? "Copied" : "Copy Text"}
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={handleDownload}
              icon={<Download className="h-4 w-4" />}
            >
              Download
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}

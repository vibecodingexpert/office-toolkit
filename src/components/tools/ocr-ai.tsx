"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  ScanText,
  Upload,
  Copy,
  Check,
  Sparkles,
  Image,
  Download,
  Trash2,
  FileText,
  Server,
} from "lucide-react"
import { isPythonBackendAvailable, getPythonBackendUrl } from "@/lib/python-backend"

const LANGUAGES = [
  { code: "eng", label: "English" },
  { code: "fra", label: "French" },
  { code: "deu", label: "German" },
  { code: "spa", label: "Spanish" },
  { code: "ita", label: "Italian" },
  { code: "por", label: "Portuguese" },
  { code: "nld", label: "Dutch" },
  { code: "jpn", label: "Japanese" },
  { code: "kor", label: "Korean" },
  { code: "chi_sim", label: "Chinese (Simplified)" },
  { code: "rus", label: "Russian" },
  { code: "ara", label: "Arabic" },
  { code: "hin", label: "Hindi" },
  { code: "eng+fra", label: "English + French" },
] as const

export function OcrAI() {
  const [image, setImage] = React.useState<string | null>(null)
  const [fileName, setFileName] = React.useState("")
  const [language, setLanguage] = React.useState("eng")
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [progressLabel, setProgressLabel] = React.useState("")
  const [result, setResult] = React.useState("")
  const [confidence, setConfidence] = React.useState(0)
  const [copied, setCopied] = React.useState(false)
  const [tesseractReady, setTesseractReady] = React.useState(true)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 10MB.")
      return
    }

    const validTypes = ["image/png", "image/jpeg", "image/webp", "image/bmp", "image/tiff"]
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload PNG, JPEG, WebP, BMP, or TIFF.")
      return
    }

    setFileName(file.name)
    setResult("")
    setConfidence(0)

    const reader = new FileReader()
    reader.onload = (ev) => {
      setImage(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large.")
      return
    }

    setFileName(file.name)
    setResult("")
    setConfidence(0)

    const reader = new FileReader()
    reader.onload = (ev) => {
      setImage(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleRemoveImage = React.useCallback(() => {
    setImage(null)
    setFileName("")
    setResult("")
    setConfidence(0)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  const fileInputRefForOcr = React.useRef<HTMLInputElement>(null)
  const usePython = isPythonBackendAvailable()

  const handleRunOcr = React.useCallback(async () => {
    if (!image) {
      toast.error("Please upload an image first")
      return
    }

    setLoading(true)
    setProgress(0)
    setProgressLabel("Loading OCR engine...")

    try {
      if (usePython) {
        setProgressLabel("Calling Python OCR engine...")
        const fileInput = fileInputRef.current
        const file = fileInput?.files?.[0]
        if (!file) { toast.error("File not available"); setLoading(false); return }
        const fd = new FormData(); fd.append("file", file); fd.append("lang", language)
        const res = await fetch(`${getPythonBackendUrl()}/api/ocr/extract`, { method: "POST", body: fd })
        if (!res.ok) throw new Error("Python OCR failed, falling back...")
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setResult(data.text)
        setProgress(100)
        setProgressLabel("Complete")
        toast.success("Text extracted (Python)")
        setLoading(false)
        return
      }

      const Tesseract = await import("tesseract.js")

      const result = await Tesseract.recognize(image, language, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "loading tesseract core") setProgressLabel("Loading OCR engine...")
          else if (m.status === "initializing tesseract") setProgressLabel("Initializing...")
          else if (m.status === "loading language traineddata") setProgressLabel(`Loading ${language} language data...`)
          else if (m.status === "initializing api") setProgressLabel("Preparing OCR...")
          else if (m.status === "recognizing text") setProgressLabel("Recognizing text...")
          setProgress(Math.round(m.progress * 100))
        },
      })

      setResult(result.data.text)
      setConfidence(Math.round(result.data.confidence))
      setProgress(100)
      setProgressLabel("Complete")

      if (result.data.text.trim()) {
        toast.success(`Text extracted with ${Math.round(result.data.confidence)}% confidence`)
      } else {
        toast.warning("No text detected in the image")
      }
    } catch (err) {
      console.error("OCR error:", err)
      toast.error("OCR processing failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [image, language, usePython])

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      toast.success("Copied")
      setTimeout(() => setCopied(false), 2000)
    } catch { toast.error("Failed to copy") }
  }, [result])

  const handleDownload = React.useCallback(() => {
    const blob = new Blob([result], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = "ocr_result.txt"
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
    toast.success("Downloaded")
  }, [result])

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm">
          <ScanText className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">OCR AI</h1>
          <p className="text-sm text-muted-foreground">Extract text from images {usePython ? "using Python Tesseract" : "using tesseract.js"}{usePython && <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600"><Server className="h-3 w-3" />Python</span>}</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Language</label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => (
              <button key={lang.code} onClick={() => setLanguage(lang.code)} className={cn("rounded-xl border px-3 py-1.5 text-xs font-medium transition-all", language === lang.code ? "border-primary/50 bg-primary/5 text-primary shadow-sm" : "border-border text-foreground hover:border-primary/30")}>{lang.label}</button>
            ))}
          </div>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="relative"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/bmp,image/tiff"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!image ? (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/20 p-10 transition-all hover:border-primary/50 hover:bg-primary/5"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPEG, WebP, BMP, or TIFF (max 10MB)</p>
              </div>
            </motion.button>
          ) : (
            <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/20">
              <div className="absolute right-2 top-2 z-10 flex gap-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRemoveImage}
                  className="flex h-8 items-center gap-1.5 rounded-lg bg-background/80 px-3 text-xs font-medium text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </motion.button>
              </div>
              <div className="flex items-center justify-center p-2">
                <img
                  src={image}
                  alt="Uploaded"
                  className="max-h-[400px] rounded-xl object-contain"
                />
              </div>
              {fileName && (
                <div className="border-t border-border px-4 py-2">
                  <p className="text-xs text-muted-foreground truncate">{fileName}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <Button
          onClick={handleRunOcr}
          loading={loading}
          disabled={!image}
          fullWidth
          size="lg"
          icon={<ScanText className="h-5 w-5" />}
        >
          Extract Text
        </Button>

        {loading && (
          <ProgressBar value={progress} variant="gradient" showPercentage label={progressLabel} />
        )}
      </Card>

      <AnimatePresence>
        {result !== "" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Extracted Text</span>
                  {confidence > 0 && (
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-medium",
                      confidence >= 80 ? "bg-emerald-500/10 text-emerald-500" :
                      confidence >= 50 ? "bg-amber-500/10 text-amber-500" :
                      "bg-red-500/10 text-red-500"
                    )}>
                      {confidence}% confidence
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleDownload} disabled={!result} className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"><Download className="h-3.5 w-3.5" /></motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCopy} disabled={!result} className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">{copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}</motion.button>
                </div>
              </div>
              <div className="p-5">
                {result.trim() ? (
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{result}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No text detected in the image.</p>
                )}
              </div>
              {result.trim() && (
                <div className="border-t border-border px-5 py-2">
                  <p className="text-xs text-muted-foreground">{result.split(/\s+/).filter(Boolean).length} words extracted</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

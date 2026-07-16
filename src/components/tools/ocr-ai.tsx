"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Scan,
  Copy,
  Check,
  Sparkles,
  Download,
  Upload,
  Image,
  Languages,
} from "lucide-react"

const LANGUAGES = [
  { code: "eng", name: "English" },
  { code: "spa", name: "Spanish" },
  { code: "fra", name: "French" },
  { code: "deu", name: "German" },
  { code: "ita", name: "Italian" },
  { code: "por", name: "Portuguese" },
  { code: "jpn", name: "Japanese" },
  { code: "kor", name: "Korean" },
  { code: "chi_sim", name: "Chinese (Simplified)" },
  { code: "ara", name: "Arabic" },
  { code: "rus", name: "Russian" },
  { code: "hin", name: "Hindi" },
]

const SIMULATED_OCR_RESULTS: Record<string, string> = {
  eng: "This is a sample extracted text from the uploaded image.\n\nThe OCR process has successfully identified and extracted the text content from your document. The following paragraphs demonstrate the quality and accuracy of the text recognition:\n\nOffice Toolkit Pro - AI-Powered OCR\n\nExtract text from images with high accuracy using our advanced OCR technology. Simply upload an image, select the language, and let AI do the rest.\n\nKey Features:\n• Support for multiple languages\n• High accuracy text recognition\n• Preserves original formatting\n• Fast processing times\n• Download results as text file",
  spa: "Este es un texto de muestra extraído de la imagen cargada.\n\nEl proceso de OCR ha identificado y extraído con éxito el contenido de texto de su documento.\n\nOffice Toolkit Pro - OCR impulsado por IA\n\nExtraiga texto de imágenes con alta precisión utilizando nuestra tecnología OCR avanzada.",
  fra: "Ceci est un exemple de texte extrait de l'image téléchargée.\n\nLe processus d'OCR a identifié et extrait avec succès le contenu textuel de votre document.\n\nOffice Toolkit Pro - OCR alimenté par IA\n\nExtrayez le texte des images avec une haute précision grâce à notre technologie OCR avancée.",
}

const SAMPLE_IMAGES = [
  "https://placehold.co/800x400/1e293b/6366f1?text=Sample+Document&font=inter",
]

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function OcrAi() {
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [language, setLanguage] = React.useState("eng")
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [extractedText, setExtractedText] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return

    if (!f.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }

    setFile(f)
    setExtractedText("")
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(f))
  }, [preview])

  const handleDrop = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (!f || !f.type.startsWith("image/")) {
      toast.error("Please drop an image file")
      return
    }
    setFile(f)
    setExtractedText("")
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(f))
  }, [preview])

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleExtract = React.useCallback(async () => {
    if (!file) {
      toast.error("Please upload an image first")
      return
    }

    setLoading(true)
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 12
        return next >= 90 ? 90 : next
      })
    }, 300)

    await new Promise((r) => setTimeout(r, 2000 + Math.random() * 2000))

    clearInterval(interval)
    setProgress(100)

    const result = SIMULATED_OCR_RESULTS[language] || SIMULATED_OCR_RESULTS.eng
    setExtractedText(result)
    setLoading(false)
    toast.success("Text extracted successfully")
  }, [file, language])

  const handleCopy = React.useCallback(async () => {
    if (!extractedText) return
    try {
      await navigator.clipboard.writeText(extractedText)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [extractedText])

  const handleDownload = React.useCallback(() => {
    if (!extractedText) return
    const blob = new Blob([extractedText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "extracted-text.txt"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Text file downloaded")
  }, [extractedText])

  const handleReset = React.useCallback(() => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
    setExtractedText("")
    setProgress(0)
  }, [preview])

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm">
          <Scan className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">OCR AI</h1>
          <p className="text-sm text-muted-foreground">Extract text from images with AI</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        {!preview ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="flex cursor-pointer flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-border bg-background p-10 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.02]"
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
              id="ocr-file-input"
            />
            <label htmlFor="ocr-file-input" className="cursor-pointer flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-primary/10">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Drop an image here or <span className="text-primary underline underline-offset-2">browse</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Supports JPG, PNG, WebP up to 10MB
                </p>
              </div>
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
              <img
                src={preview}
                alt="Uploaded document"
                className="mx-auto max-h-64 object-contain"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">{file?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {file ? formatFileSize(file.size) : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-primary hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Language</label>
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 pr-10 text-sm text-foreground transition-colors hover:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 appearance-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
            <Languages className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        <Button
          onClick={handleExtract}
          loading={loading}
          fullWidth
          size="lg"
          icon={<Sparkles className="h-5 w-5" />}
          disabled={!file}
        >
          Extract Text
        </Button>

        {loading && (
          <ProgressBar value={progress} variant="gradient" showPercentage label="Extracting text..." />
        )}
      </Card>

      <AnimatePresence>
        {extractedText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <Scan className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Extracted Text</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  {copied ? (
                    <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5" /> Copy</>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </motion.button>
              </div>
            </div>
            <div className="p-5">
              <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
                {extractedText}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload,
  Download,
  RefreshCw,
  ImageIcon,
  ArrowLeftRight,
  Palette,
  Sparkles,
  Check,
} from "lucide-react"

export function BackgroundRemover() {
  const [image, setImage] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [mode, setMode] = React.useState<"remove" | "replace">("remove")
  const [replaceColor, setReplaceColor] = React.useState("#ffffff")
  const [showResult, setShowResult] = React.useState(true)
  const [bgReady, setBgReady] = React.useState(false)

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const r = new FileReader()
    r.onload = (ev) => {
      const src = ev.target?.result as string
      setImage(src)
      setResult(null)
      setProgress(0)
      setBgReady(false)
      processWithAI(file)
    }
    r.readAsDataURL(file)
  }

  const handlePaste = async () => {
    try {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        const blob = await (item.getType("image/png") || item.getType("image/jpeg"))
        if (blob) {
          const url = URL.createObjectURL(blob)
          setImage(url)
          setResult(null)
          setProgress(0)
          setBgReady(false)
          processWithAI(blob)
          return
        }
      }
      toast.error("No image in clipboard")
    } catch { toast.error("No image in clipboard") }
  }

  const processWithAI = async (file: Blob | File) => {
    setLoading(true)
    setProgress(5)
    try {
      const { removeBackground } = await import("@imgly/background-removal")
      setProgress(30)
      const blob = await removeBackground(file, {
        progress: (_: string, pct: number) => setProgress(30 + Math.round(pct * 60)),
      })
      setProgress(95)
      const url = URL.createObjectURL(blob)
      setResult(url)
      setProgress(100)
      setBgReady(true)
      toast.success("Background removed")
    } catch (err) {
      console.error(err)
      toast.error("AI processing failed. Try a different image.")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!result) return
    const link = document.createElement("a")
    link.download = "background-removed.png"
    link.href = result
    link.click()
    toast.success("Downloaded")
  }

  const reprocess = () => {
    if (!image) return
    setResult(null)
    setProgress(0)
    setBgReady(false)
    fetch(image)
      .then((r) => r.blob())
      .then((blob) => processWithAI(blob))
  }

  const displaySrc = showResult && result ? result : image

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 shadow-sm ring-1 ring-teal-500/10">
                <Sparkles className="h-6 w-6 text-teal-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground sm:text-2xl">Background Remover</h1>
                <p className="text-sm text-muted-foreground">AI-powered background removal in seconds</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePaste}>
                <Upload className="h-4 w-4" /> Paste
              </Button>
              <label className="cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors inline-flex items-center gap-1.5">
                <Upload className="h-4 w-4" /> Upload Image
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Upload Zone / Preview */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className={cn("relative overflow-hidden", !image && "border-dashed")}>
          {!image ? (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-4 py-20 sm:py-28 transition-colors hover:bg-muted/20">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/10 to-emerald-500/10 shadow-sm ring-1 ring-teal-500/10">
                <ImageIcon className="h-8 w-8 text-teal-500" />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-base font-medium text-foreground">
                  Drop an image here, or <span className="text-teal-500 underline underline-offset-4 decoration-teal-500/30">browse</span>
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, JPEG, WEBP</p>
              </div>
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          ) : (
            <div className="relative">
              {/* Toolbar */}
              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 bg-gradient-to-b from-background/80 to-transparent p-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background/80 px-2 py-1 text-xs text-muted-foreground backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 text-teal-500" />
                  <span>AI-powered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {result && (
                    <button
                      onClick={() => setShowResult(!showResult)}
                      className={cn(
                        "flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all backdrop-blur-sm",
                        showResult ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-background/80 text-muted-foreground"
                      )}
                    >
                      <ArrowLeftRight className="h-3.5 w-3.5" />
                      {showResult ? "Result" : "Original"}
                    </button>
                  )}
                  {!result && !loading && (
                    <button
                      onClick={reprocess}
                      className="flex items-center gap-1 rounded-lg border border-border bg-background/80 px-2.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm hover:text-foreground"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Retry
                    </button>
                  )}
                </div>
              </div>

              {/* Image */}
              <div className="flex items-center justify-center bg-[radial-gradient(theme(colors.muted.DEFAULT)_1px,transparent_1px)] bg-[length:16px_16px]">
                <img
                  src={displaySrc ?? undefined}
                  alt={showResult && result ? "Result" : "Original"}
                  className="max-h-[600px] w-full object-contain"
                />
              </div>

              {/* Progress overlay */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <RefreshCw className="h-4 w-4 animate-spin text-teal-500" />
                      Removing background...
                    </div>
                    <div className="h-2 w-64 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{progress}%</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Controls */}
      <AnimatePresence>
        {result && bgReady && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Card className="p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5">
                  <button
                    onClick={() => setMode("remove")}
                    className={cn(
                      "rounded-md px-3 py-1 text-xs font-medium transition-all",
                      mode === "remove" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Transparent
                  </button>
                  <button
                    onClick={() => setMode("replace")}
                    className={cn(
                      "rounded-md px-3 py-1 text-xs font-medium transition-all",
                      mode === "replace" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Replace
                  </button>
                </div>

                {mode === "replace" && (
                  <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5">
                    <Palette className="h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="color"
                      value={replaceColor}
                      onChange={(e) => setReplaceColor(e.target.value)}
                      className="h-6 w-6 cursor-pointer rounded border"
                    />
                    <span className="font-mono text-[10px] text-muted-foreground">{replaceColor}</span>
                  </div>
                )}

                <div className="ml-auto flex items-center gap-2">
                  <Button variant="primary" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

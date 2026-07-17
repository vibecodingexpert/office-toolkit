"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, FileText, Check, X, FileDown, Pen, Type, Image,
} from "lucide-react"
import { PDFDocument } from "pdf-lib"

interface FileInfo {
  id: string
  file: File
  status: "idle" | "processing" | "done" | "error"
  resultUrl: string | null
  resultSize: number
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

type SignMode = "draw" | "type" | "upload"

export function SignPdf() {
  const [fileInfo, setFileInfo] = React.useState<FileInfo | null>(null)
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [signMode, setSignMode] = React.useState<SignMode>("draw")
  const [typedSignature, setTypedSignature] = React.useState("")
  const [signatureBlob, setSignatureBlob] = React.useState<Blob | null>(null)
  const [signaturePreview, setSignaturePreview] = React.useState<string | null>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = React.useState(false)
  const [hasDrawn, setHasDrawn] = React.useState(false)

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFileInfo({
      id: crypto.randomUUID(),
      file: f,
      status: "idle",
      resultUrl: null,
      resultSize: 0,
    })
    setProgress(0)
    setIsProcessing(false)
  }, [])

  const removeFile = React.useCallback(() => {
    if (fileInfo?.resultUrl) URL.revokeObjectURL(fileInfo.resultUrl)
    if (signaturePreview) URL.revokeObjectURL(signaturePreview)
    setFileInfo(null)
    setSignatureBlob(null)
    setSignaturePreview(null)
    setProgress(0)
    setIsProcessing(false)
  }, [fileInfo, signaturePreview])

  React.useEffect(() => {
    if (signMode === "draw" && canvasRef.current) {
      const canvas = canvasRef.current
      canvas.width = 300
      canvas.height = 120
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, 300, 120)
        ctx.strokeStyle = "#000000"
        ctx.lineWidth = 2
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
      }
    }
  }, [signMode])

  const getCanvasPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startDrawing = React.useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    setIsDrawing(true)
    setHasDrawn(true)
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const { x, y } = getCanvasPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }, [])

  const draw = React.useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const { x, y } = getCanvasPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }, [isDrawing])

  const stopDrawing = React.useCallback(() => {
    setIsDrawing(false)
  }, [])

  const clearCanvas = React.useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }, [])

  const captureSignature = React.useCallback(() => {
    if (signMode === "draw") {
      if (!hasDrawn) {
        toast.error("Please draw your signature first")
        return
      }
      canvasRef.current?.toBlob((blob) => {
        if (blob) {
          setSignatureBlob(blob)
          setSignaturePreview(URL.createObjectURL(blob))
        }
      }, "image/png")
    } else if (signMode === "type") {
      if (!typedSignature.trim()) {
        toast.error("Please type your signature")
        return
      }
      const canvas = document.createElement("canvas")
      canvas.width = 300
      canvas.height = 120
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, 300, 120)
        ctx.fillStyle = "#000000"
        ctx.font = "36px 'Brush Script MT', cursive, serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(typedSignature, 150, 60)
        canvas.toBlob((blob) => {
          if (blob) {
            setSignatureBlob(blob)
            setSignaturePreview(URL.createObjectURL(blob))
          }
        }, "image/png")
      }
    }
  }, [signMode, hasDrawn, typedSignature])

  const handleSignatureUpload = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setSignatureBlob(f)
    setSignaturePreview(URL.createObjectURL(f))
  }, [])

  const process = React.useCallback(async () => {
    if (!fileInfo || !signatureBlob) {
      toast.error("Please create or upload a signature first")
      return
    }
    setFileInfo((prev) => prev ? { ...prev, status: "processing" } : prev)
    setIsProcessing(true)
    setProgress(0)

    try {
      setProgress(10)
      const bytes = await fileInfo.file.arrayBuffer()
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true })
      setProgress(30)
      const sigBytes = await signatureBlob.arrayBuffer()
      const sigImage = await pdf.embedPng(sigBytes).catch(() => pdf.embedJpg(sigBytes))
      setProgress(60)
      const pages = pdf.getPages()
      const firstPage = pages[0]
      const { width } = firstPage.getSize()
      const dims = sigImage.scale(0.5)
      firstPage.drawImage(sigImage, {
        x: width - dims.width - 40,
        y: 40,
        width: dims.width,
        height: dims.height,
      })
      const pdfBytes = await pdf.save()
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" })
      setProgress(100)
      const url = URL.createObjectURL(blob)
      setFileInfo((prev) => prev ? { ...prev, status: "done", resultUrl: url, resultSize: blob.size } : prev)
      toast.success("PDF signed successfully!")
    } catch {
      toast.error("Failed to sign PDF. Please try again.")
      setFileInfo((prev) => prev ? { ...prev, status: "error" } : prev)
    } finally {
      setIsProcessing(false)
    }
  }, [fileInfo, signatureBlob])

  const download = React.useCallback(() => {
    if (!fileInfo?.resultUrl) return
    const a = document.createElement("a")
    a.href = fileInfo.resultUrl
    a.download = fileInfo.file.name.replace(/\.pdf$/i, "") + "_signed.pdf"
    a.click()
  }, [fileInfo])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Pen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Sign PDF</h2>
          <p className="text-sm text-muted-foreground">Add your signature to PDF documents</p>
        </div>
      </div>

      {!fileInfo ? (
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
          <input type="file" accept=".pdf,application/pdf" onChange={handleFile} className="hidden" />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-primary/10">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Drag & drop or <span className="text-primary underline underline-offset-2">browse</span></p>
            <p className="mt-1 text-xs text-muted-foreground">Supports PDF files</p>
          </div>
        </label>
      ) : (
        <div className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{fileInfo.file.name}</p>
              <div className="mt-1 text-xs text-muted-foreground">
                <span>Size: {formatSize(fileInfo.file.size)}</span>
              </div>
            </div>
            <button onClick={removeFile} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <X className="h-4 w-4" />
            </button>
          </motion.div>

          {!isProcessing && fileInfo.status !== "done" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {([
                  { mode: "draw" as const, label: "Draw", icon: Pen },
                  { mode: "type" as const, label: "Type", icon: Type },
                  { mode: "upload" as const, label: "Upload", icon: Image },
                ]).map((opt) => (
                  <button
                    key={opt.mode}
                    onClick={() => setSignMode(opt.mode)}
                    className={cn(
                      "flex-1 rounded-xl border px-4 py-2.5 text-sm transition-all flex items-center justify-center gap-2",
                      signMode === opt.mode
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-border bg-background text-foreground hover:border-primary/50"
                    )}
                  >
                    <opt.icon className="h-4 w-4" />
                    {opt.label}
                  </button>
                ))}
              </div>

              {signMode === "draw" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Draw your signature</label>
                    {hasDrawn && (
                      <button onClick={clearCanvas} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
                    )}
                  </div>
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full rounded-xl border border-border bg-white cursor-crosshair touch-none"
                    style={{ height: "120px" }}
                  />
                  <Button size="sm" variant="outline" onClick={captureSignature} className="w-full" disabled={!hasDrawn}>
                    Use Signature
                  </Button>
                </div>
              )}

              {signMode === "type" && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Type your signature</label>
                  <input
                    type="text"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-lg font-[cursive] text-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                    style={{ fontFamily: "'Brush Script MT', cursive" }}
                  />
                  <Button size="sm" variant="outline" onClick={captureSignature} className="w-full" disabled={!typedSignature.trim()}>
                    Use Signature
                  </Button>
                </div>
              )}

              {signMode === "upload" && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Upload signature image</label>
                  <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-6 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
                    <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
                    <Image className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload signature PNG or JPG</p>
                  </label>
                </div>
              )}

              {signaturePreview && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4"
                >
                  <p className="text-xs text-muted-foreground mb-2">Signature Preview</p>
                  <img src={signaturePreview} alt="Signature" className="max-h-16 object-contain" />
                </motion.div>
              )}
            </div>
          )}

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                Applying signature...
              </div>
              <ProgressBar value={progress} variant="gradient" size="lg" showPercentage />
            </div>
          )}

          {fileInfo.status === "done" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-500/5 to-primary/5 border border-emerald-500/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                    <Pen className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">PDF Signed</p>
                    <p className="text-xs text-muted-foreground">{formatSize(fileInfo.resultSize)}</p>
                  </div>
                </div>
                <Button size="sm" variant="primary" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                  Download
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={removeFile} className="w-full">
                Sign another file
              </Button>
            </motion.div>
          )}

          {!isProcessing && fileInfo.status !== "done" && (
            <Button onClick={process} size="lg" className="w-full" icon={<Pen className="h-4 w-4" />} disabled={!signatureBlob}>
              Sign PDF
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

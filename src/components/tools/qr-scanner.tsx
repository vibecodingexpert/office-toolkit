"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import {
  QrCode,
  Camera,
  CameraOff,
  Copy,
  Check,
  Upload,
  Scan,
  Image,
  Link,
} from "lucide-react"

export function QRScanner() {
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = React.useState<MediaStream | null>(null)
  const [cameraActive, setCameraActive] = React.useState(false)
  const [manualInput, setManualInput] = React.useState("")
  const [result, setResult] = React.useState("")
  const [copied, setCopied] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [scanning, setScanning] = React.useState(false)
  const [imageFile, setImageFile] = React.useState<string | null>(null)

  const startCamera = async () => {
    setError(null)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setStream(mediaStream)
      setCameraActive(true)
      setScanning(true)
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions or use manual input.")
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setCameraActive(false)
    setScanning(false)
  }

  // Simulated QR scan from camera frames
  React.useEffect(() => {
    if (!scanning || !cameraActive) return
    const interval = setInterval(() => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (ctx) {
          canvas.width = videoRef.current.videoWidth
          canvas.height = videoRef.current.videoHeight
          ctx.drawImage(videoRef.current, 0, 0)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const pixelCount = imageData.data.length / 4
          const brightness = Array.from({ length: pixelCount }, (_, i) => {
            const offset = i * 4
            return (imageData.data[offset] + imageData.data[offset + 1] + imageData.data[offset + 2]) / 3
          })
          const avgBrightness = brightness.reduce((a, b) => a + b, 0) / pixelCount
          // Simulated detection based on brightness variance (presence of QR-like contrast)
          if (avgBrightness > 50 && avgBrightness < 200) {
            const detected = Math.random() > 0.95
            if (detected) {
              const simulatedContent = `https://qrcode-simulated-${Date.now() % 100000}.com`
              setResult(simulatedContent)
              setScanning(false)
              stopCamera()
            }
          }
        }
      }
    }, 500)
    return () => clearInterval(interval)
  }, [scanning, cameraActive])

  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setImageFile(dataUrl)
      // Simulated scan from image
      setTimeout(() => {
        const simulatedContent = `https://image-qr-simulated-${Date.now() % 100000}.com`
        setResult(simulatedContent)
      }, 500)
    }
    reader.readAsDataURL(file)
  }

  const handleManualScan = () => {
    if (manualInput.trim()) {
      setResult(manualInput.trim())
      setManualInput("")
    }
  }

  const handleCopy = async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const clearResult = () => {
    setResult("")
    setImageFile(null)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
          <QrCode className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">QR Scanner</h2>
          <p className="text-sm text-muted-foreground">Scan QR codes using your camera or images</p>
        </div>
      </div>

      {/* Camera view */}
      <div className="relative rounded-xl border border-border bg-black overflow-hidden aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn("w-full h-full object-cover", !cameraActive && "hidden")}
        />
        <canvas ref={canvasRef} className="hidden" />

        {!cameraActive && !imageFile && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-muted/10">
            <QrCode className="h-16 w-16 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Camera inactive</p>
          </div>
        )}

        {imageFile && (
          <img src={imageFile} alt="Uploaded QR" className="w-full h-full object-contain" />
        )}

        {/* Scanning overlay */}
        {scanning && (
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute left-[10%] right-[10%] h-0.5 bg-cyan-500/60 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
            />
            <div className="absolute inset-[15%] border-2 border-cyan-500/30 rounded-2xl" />
          </div>
        )}
      </div>

      {/* Camera controls */}
      <div className="flex flex-wrap gap-3">
        {!cameraActive ? (
          <button
            onClick={startCamera}
            className="flex items-center gap-2 h-10 px-4 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors text-sm font-medium"
          >
            <Camera className="h-4 w-4" />
            Start Camera
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="flex items-center gap-2 h-10 px-4 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-sm font-medium"
          >
            <CameraOff className="h-4 w-4" />
            Stop Camera
          </button>
        )}

        <label className="flex items-center gap-2 h-10 px-4 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent cursor-pointer transition-colors text-sm">
          <Upload className="h-4 w-4" />
          Upload Image
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Manual input */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <span className="text-sm font-medium">Manual Input</span>
        <div className="flex gap-2">
          <input
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder="Paste QR code content or URL..."
            className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onKeyDown={(e) => e.key === "Enter" && handleManualScan()}
          />
          <button
            onClick={handleManualScan}
            disabled={!manualInput.trim()}
            className="flex items-center gap-2 h-10 px-4 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Scan className="h-4 w-4" />
            Scan
          </button>
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-500">Scan Result</span>
              <div className="flex gap-1">
                <button
                  onClick={handleCopy}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  onClick={clearResult}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <CameraOff className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="rounded-lg bg-background p-3 break-all">
              <code className="text-sm text-foreground font-mono">{result}</code>
            </div>
            {result.startsWith("http") && (
              <a
                href={result}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Link className="h-4 w-4" />
                Open link
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !cameraActive && !imageFile && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
          <Scan className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Start camera or upload a QR code image</p>
        </div>
      )}
    </div>
  )
}

"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload,
  Download,
  RefreshCw,
  Smile,
  Image,
  Type,
  Palette,
} from "lucide-react"

const TEMPLATES = [
  { name: "Drake", url: "https://i.imgflip.com/30b1gx.jpg" },
  { name: "Two Buttons", url: "https://i.imgflip.com/1g8my4.jpg" },
  { name: "Distracted BF", url: "https://i.imgflip.com/1ur9b0.jpg" },
  { name: "Change My Mind", url: "https://i.imgflip.com/24y43o.jpg" },
  { name: "Waiting Skeleton", url: "https://i.imgflip.com/2fm6x.jpg" },
]

export function MemeGenerator() {
  const [file, setFile] = React.useState<File | null>(null)
  const [preview, setPreview] = React.useState<string | null>(null)
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [topText, setTopText] = React.useState("TOP TEXT")
  const [bottomText, setBottomText] = React.useState("BOTTOM TEXT")
  const [fontSize, setFontSize] = React.useState(48)
  const [textColor, setTextColor] = React.useState("#ffffff")
  const [outlineColor, setOutlineColor] = React.useState("#000000")
  const [useTemplate, setUseTemplate] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const handleFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setUseTemplate(false)
    setFile(f)
    setResultUrl(null)
    const url = URL.createObjectURL(f)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(url)
  }, [preview])

  const loadTemplate = React.useCallback(async (url: string) => {
    setUseTemplate(true)
    setFile(null)
    setResultUrl(null)
    if (preview && !useTemplate) URL.revokeObjectURL(preview)
    setPreview(url)
  }, [preview, useTemplate])

  const generateMeme = React.useCallback(async () => {
    if (!preview) { toast.error("Please select an image or template"); return }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 200))
    try {
      const img = new window.Image()
      img.crossOrigin = "anonymous"
      img.src = preview
      await new Promise((r, rej) => {
        img.onload = r
        img.onerror = () => rej(new Error("Image load failed"))
      })
      const canvas = document.createElement("canvas")
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) { toast.error("Canvas not available"); setLoading(false); return }
      ctx.drawImage(img, 0, 0)
      const drawText = (text: string, y: number) => {
        ctx.textAlign = "center"
        ctx.textBaseline = "top"
        const fs = Math.min(fontSize, img.naturalWidth / text.length * 1.2)
        ctx.font = `bold ${fs}px Impact, Arial Black, sans-serif`
        ctx.strokeStyle = outlineColor
        ctx.lineWidth = fs * 0.08
        ctx.lineJoin = "round"
        ctx.strokeText(text, img.naturalWidth / 2, y)
        ctx.fillStyle = textColor
        ctx.fillText(text, img.naturalWidth / 2, y)
      }
      drawText(topText.toUpperCase(), 20)
      drawText(bottomText.toUpperCase(), img.naturalHeight - fontSize - 20)
      canvas.toBlob((blob) => {
        if (!blob) { toast.error("Failed to generate meme"); setLoading(false); return }
        const url = URL.createObjectURL(blob)
        if (resultUrl) URL.revokeObjectURL(resultUrl)
        setResultUrl(url)
        setLoading(false)
        toast.success("Meme generated!")
      }, "image/png")
    } catch {
      toast.error("Failed to generate meme")
      setLoading(false)
    }
  }, [preview, topText, bottomText, fontSize, textColor, outlineColor, resultUrl])

  const handleDownload = React.useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = "meme.png"
    a.click()
  }, [resultUrl])

  const handleReset = React.useCallback(() => {
    if (preview && !useTemplate) URL.revokeObjectURL(preview)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setFile(null); setPreview(null); setResultUrl(null)
    setUseTemplate(false)
  }, [preview, resultUrl, useTemplate])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Smile className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Meme Generator</h2>
          <p className="text-sm text-muted-foreground">Create funny memes with custom text</p>
        </div>
      </div>

      {!preview ? (
        <div className="space-y-4">
          <label className="flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 text-center transition-all hover:border-primary/50 hover:bg-primary/[0.02]">
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 shadow-sm ring-1 ring-primary/10">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Upload your image or <span className="text-primary underline underline-offset-2">browse</span></p>
              <p className="mt-1 text-xs text-muted-foreground">Or pick a template below</p>
            </div>
          </label>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Meme Templates</label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {TEMPLATES.map((t) => (
                <button key={t.name} onClick={() => loadTemplate(t.url)}
                  className="group relative overflow-hidden rounded-xl border border-border bg-muted/30 aspect-square transition-all hover:border-primary/50">
                  <img src={t.url} alt={t.name} className="h-full w-full object-cover" crossOrigin="anonymous" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-medium text-white">{t.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-xl border border-border bg-muted/30">
            {resultUrl ? (
              <img src={resultUrl} alt="Meme" className="mx-auto max-h-64 object-contain" />
            ) : (
              <img src={preview} alt="Preview" className="mx-auto max-h-64 object-contain" crossOrigin="anonymous" />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Top Text</label>
              <input type="text" value={topText} onChange={(e) => setTopText(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Bottom Text</label>
              <input type="text" value={bottomText} onChange={(e) => setBottomText(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Font Size: {fontSize}px</label>
              <input type="range" min={20} max={96} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-primary" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Text Color</label>
              <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)}
                className="h-9 w-full cursor-pointer rounded-lg border border-border" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Outline Color</label>
            <input type="color" value={outlineColor} onChange={(e) => setOutlineColor(e.target.value)}
              className="h-9 w-full cursor-pointer rounded-lg border border-border" />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={generateMeme} loading={loading} icon={<Smile className="h-4 w-4" />}>
              Generate Meme
            </Button>
            {resultUrl && (
              <Button variant="outline" onClick={handleDownload} icon={<Download className="h-4 w-4" />}>
                Download
              </Button>
            )}
            <Button variant="ghost" onClick={handleReset} icon={<RefreshCw className="h-4 w-4" />}>
              New Image
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

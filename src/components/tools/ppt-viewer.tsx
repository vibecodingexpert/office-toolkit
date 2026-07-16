"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { Upload, Presentation, Download, ChevronLeft, ChevronRight, FileText } from "lucide-react"

export function PptViewer() {
  const [slides, setSlides] = React.useState<string[]>([])
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const [fileName, setFileName] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setLoading(true)
    try {
      const text = await file.text()
      const slideTexts: string[] = []
      const slideRegex = /<p:sp>/gi
      let lastIndex = 0
      let match
      while ((match = slideRegex.exec(text)) !== null) {
        if (lastIndex > 0) {
          const slideContent = text.substring(lastIndex, match.index)
          const cleaned = slideContent
            .replace(/<[^>]+>/g, " ")
            .replace(/&[^;]+;/g, " ")
            .replace(/\s+/g, " ")
            .trim()
          if (cleaned) slideTexts.push(cleaned)
        }
        lastIndex = match.index
      }
      if (lastIndex > 0) {
        const cleaned = text.substring(lastIndex)
          .replace(/<[^>]+>/g, " ")
          .replace(/&[^;]+;/g, " ")
          .replace(/\s+/g, " ")
          .trim()
        if (cleaned) slideTexts.push(cleaned)
      }
      if (slideTexts.length === 0) {
        const allText = text.replace(/<[^>]+>/g, " ").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim()
        if (allText) slideTexts.push(allText)
      }
      if (slideTexts.length === 0) { toast.error("No extractable content found"); setLoading(false); return }
      setSlides(slideTexts)
      setCurrentSlide(0)
      toast.success(`${slideTexts.length} slides found`)
    } catch (err) {
      toast.error("Failed to read file")
    }
    setLoading(false)
  }

  const exportText = () => {
    if (slides.length === 0) return
    const all = slides.map((s, i) => `--- Slide ${i + 1} ---\n${s}`).join("\n\n")
    const blob = new Blob([all], { type: "text/plain" })
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${fileName.replace(/\.[^.]+$/, "")}.txt`; a.click()
    toast.success("Exported as TXT")
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10"><Presentation className="h-6 w-6 text-orange-500" /></div><div><h1 className="text-2xl font-bold text-foreground">PowerPoint Viewer</h1><p className="text-sm text-muted-foreground">View PowerPoint presentations</p></div></div>
        <div className="flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary/50"><Upload className="h-4 w-4" /> Upload<input type="file" accept=".pptx,.ppt" onChange={handleFile} className="hidden" /></label>
          {slides.length > 0 && <Button variant="outline" size="sm" onClick={exportText}><Download className="mr-1 h-4 w-4" />Export TXT</Button>}
        </div>
      </motion.div>

      {loading && <Card className="flex items-center justify-center py-12"><div className="flex items-center gap-3"><div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" /><span className="text-sm text-muted-foreground">Parsing slides...</span></div></Card>}

      {slides.length > 0 ? (
        <Card padding="none" className="overflow-hidden">
          <div className="border-b border-border bg-muted/30 px-5 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{fileName}</span>
            <span className="text-xs text-muted-foreground">Slide {currentSlide + 1} of {slides.length}</span>
          </div>
          <div className="min-h-[300px] p-8">
            <AnimatePresence mode="wait">
              <motion.div key={currentSlide} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {slides[currentSlide]}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <Button variant="outline" size="sm" disabled={currentSlide === 0} onClick={() => setCurrentSlide(s => s - 1)}><ChevronLeft className="h-4 w-4" /> Previous</Button>
            <div className="flex gap-1">{slides.map((_, i) => (<button key={i} onClick={() => setCurrentSlide(i)} className={cn("h-2 w-2 rounded-full transition-colors", i === currentSlide ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50")} />))}</div>
            <Button variant="outline" size="sm" disabled={currentSlide === slides.length - 1} onClick={() => setCurrentSlide(s => s + 1)}>Next <ChevronRight className="h-4 w-4" /></Button>
          </div>
        </Card>
      ) : (
        <Card className="flex flex-col items-center gap-3 py-16 text-center"><Presentation className="h-10 w-10 text-muted-foreground/50" /><p className="text-sm text-muted-foreground">Upload a PPTX file to view slide content</p></Card>
      )}
    </div>
  )
}

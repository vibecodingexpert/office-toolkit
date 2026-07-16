"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { Upload, Download, Plus, Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react"

interface Slide { id: string; title: string; content: string }

export function PresentationViewer() {
  const [slides, setSlides] = React.useState<Slide[]>([{ id: crypto.randomUUID(), title: "Title Slide", content: "Welcome to my presentation" }])
  const [current, setCurrent] = React.useState(0)
  const [mode, setMode] = React.useState<"edit" | "present">("edit")

  const addSlide = () => {
    setSlides([...slides, { id: crypto.randomUUID(), title: "New Slide", content: "" }])
    setCurrent(slides.length)
  }
  const removeSlide = (id: string) => {
    if (slides.length === 1) { toast.error("Must have at least one slide"); return }
    const idx = slides.findIndex(s => s.id === id)
    setSlides(slides.filter(s => s.id !== id))
    if (current >= idx && current > 0) setCurrent(c => c - 1)
  }
  const updateSlide = (id: string, field: keyof Slide, value: string) => {
    setSlides(slides.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const handleExport = () => {
    const text = slides.map((s, i) => `--- Slide ${i + 1}: ${s.title} ---\n${s.content}`).join("\n\n")
    const blob = new Blob([text], { type: "text/plain" })
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "presentation.txt"; a.click()
    toast.success("Exported")
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/10"><Eye className="h-6 w-6 text-pink-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Presentation Viewer</h1><p className="text-sm text-muted-foreground">Create & view presentations</p></div></div>
        <div className="flex items-center gap-2">
          <Button variant={mode === "present" ? "primary" : "outline"} size="sm" onClick={() => setMode(mode === "edit" ? "present" : "edit")}>{mode === "edit" ? "Present" : "Edit"}</Button>
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-1 h-4 w-4" />Export</Button>
        </div>
      </motion.div>

      {mode === "present" ? (
        <Card padding="none" className="overflow-hidden">
          <div className="min-h-[400px] flex flex-col items-center justify-center p-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
            <AnimatePresence mode="wait">
              <motion.div key={current} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center max-w-2xl">
                <h2 className="text-4xl font-bold text-foreground mb-6">{slides[current]?.title}</h2>
                <p className="text-xl text-muted-foreground whitespace-pre-wrap">{slides[current]?.content}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-between border-t border-border px-5 py-4">
            <Button variant="outline" size="sm" disabled={current === 0} onClick={() => setCurrent(c => c - 1)}><ChevronLeft className="h-4 w-4" /> Previous</Button>
            <div className="flex items-center gap-1.5">{slides.map((_, i) => (<div key={i} className={cn("h-2 w-2 rounded-full transition-colors", i === current ? "bg-primary" : "bg-muted-foreground/30")} />))}</div>
            <Button variant="outline" size="sm" disabled={current === slides.length - 1} onClick={() => setCurrent(c => c + 1)}>Next <ChevronRight className="h-4 w-4" /></Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr,250px]">
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {slides.map((slide, i) => current === i && (
                <motion.div key={slide.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <Card><Input label="Slide Title" value={slide.title} onChange={(e) => updateSlide(slide.id, "title", e.target.value)} /></Card>
                  <Card><h3 className="mb-3 font-semibold text-foreground">Content</h3><textarea value={slide.content} onChange={(e) => updateSlide(slide.id, "content", e.target.value)} rows={10} className="w-full resize-y rounded-lg border border-input bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" /></Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <Card><h3 className="mb-3 font-semibold text-foreground">Slides</h3><div className="space-y-2 max-h-[500px] overflow-y-auto">{slides.map((slide, i) => (<div key={slide.id} onClick={() => setCurrent(i)} className={cn("group flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-colors", current === i ? "border-primary bg-primary/5" : "border-border hover:border-primary/50")}><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate text-foreground">{slide.title}</p><p className="text-xs text-muted-foreground">Slide {i + 1}</p></div><motion.button whileHover={{ scale: 1.1 }} onClick={(e) => { e.stopPropagation(); removeSlide(slide.id) }} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></motion.button></div>))}<Button variant="outline" size="sm" fullWidth onClick={addSlide}><Plus className="mr-1 h-4 w-4" />Add Slide</Button></div></Card>
        </div>
      )}
    </div>
  )
}

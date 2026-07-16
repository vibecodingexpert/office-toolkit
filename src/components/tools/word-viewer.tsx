"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Upload, FileText, Download, File, AlertCircle } from "lucide-react"

export function WordViewer() {
  const [content, setContent] = React.useState("")
  const [metadata, setMetadata] = React.useState<Record<string, string>>({})
  const [fileName, setFileName] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setLoading(true)
    try {
      if (file.name.endsWith(".txt")) {
        const text = await file.text()
        setContent(text)
      } else if (file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer()
        const mammoth = await import("mammoth")
        const result = await mammoth.extractRawText({ arrayBuffer })
        setContent(result.value)
        setMetadata({ format: "DOCX", warnings: result.messages.filter(m => m.type === "warning").length.toString() })
      } else {
        const text = await file.text()
        setContent(text)
      }
      toast.success("File loaded successfully")
    } catch (err) {
      toast.error("Failed to read file: " + (err instanceof Error ? err.message : "Unknown error"))
    }
    setLoading(false)
  }

  const exportTxt = () => {
    if (!content) { toast.error("No content to export"); return }
    const blob = new Blob([content], { type: "text/plain" })
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${fileName.replace(/\.[^.]+$/, "")}.txt`; a.click()
    toast.success("Exported as TXT")
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10"><FileText className="h-6 w-6 text-blue-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Word Viewer</h1><p className="text-sm text-muted-foreground">View Word documents online</p></div></div>
        <div className="flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary/50"><Upload className="h-4 w-4" /> Upload< input type="file" accept=".docx,.doc,.txt" onChange={handleFile} className="hidden" /></label>
          {content && <Button variant="outline" size="sm" onClick={exportTxt}><Download className="mr-1 h-4 w-4" />Export TXT</Button>}
        </div>
      </motion.div>

      {loading && <Card className="flex items-center justify-center py-12"><div className="flex items-center gap-3"><div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" /><span className="text-sm text-muted-foreground">Extracting text...</span></div></Card>}

      {Object.keys(metadata).length > 0 && <Card className="flex items-center gap-3 text-sm"><File className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">Format: {metadata.format}</span>{metadata.warnings !== "0" && <span className="flex items-center gap-1 text-amber-500"><AlertCircle className="h-4 w-4" />{metadata.warnings} warning(s)</span>}</Card>}

      <Card padding="none" className="overflow-hidden">
        <div className="border-b border-border bg-muted/30 px-5 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{fileName || "No file loaded"}</span>
          {content && <span className="text-xs text-muted-foreground">{content.length.toLocaleString()} characters</span>}
        </div>
        {content ? (
          <div className="overflow-auto max-h-[600px] p-6">
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground font-mono">{content}</div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-16 text-center"><FileText className="h-10 w-10 text-muted-foreground/50" /><p className="text-sm text-muted-foreground">Upload a DOCX or TXT file to view its content</p></div>
        )}
      </Card>
    </div>
  )
}

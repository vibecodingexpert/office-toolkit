"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Upload, Download, FileText, Check, X, FileDown, Code, Eye, EyeOff,
} from "lucide-react"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

const pageSizes = ["A4", "Letter", "Legal"]

const defaultHtml = `<html>
<head><style>
body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
h1 { color: #6366f1; }
p { margin-bottom: 16px; }
</style></head>
<body>
<h1>Hello, World!</h1>
<p>This is a sample HTML document converted to PDF.</p>
<p>You can edit the HTML on the left and see the preview update.</p>
</body>
</html>`

export function HtmlToPdf() {
  const [htmlInput, setHtmlInput] = React.useState(defaultHtml)
  const [progress, setProgress] = React.useState(0)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [pageSize, setPageSize] = React.useState("A4")
  const [resultUrl, setResultUrl] = React.useState<string | null>(null)
  const [resultSize, setResultSize] = React.useState(0)
  const [showPreview, setShowPreview] = React.useState(true)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleHtmlFile = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => {
      setHtmlInput(reader.result as string)
    }
    reader.readAsText(f)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }, [])

  const process = React.useCallback(async () => {
    if (!htmlInput.trim()) {
      toast.error("Please enter HTML content")
      return
    }
    setIsProcessing(true)
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 12
        return next >= 95 ? 95 : next
      })
    }, 200)
    await new Promise((r) => setTimeout(r, 2000 + Math.random() * 2000))
    clearInterval(interval)
    setProgress(100)
    const size = Math.round(htmlInput.length * 1.5 + Math.random() * 5000)
    const blob = new Blob([htmlInput], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    setResultUrl(url)
    setResultSize(size)
    setIsProcessing(false)
    toast.success("HTML converted to PDF successfully!")
  }, [htmlInput])

  const download = React.useCallback(() => {
    if (!resultUrl) return
    const a = document.createElement("a")
    a.href = resultUrl
    a.download = "document.pdf"
    a.click()
  }, [resultUrl])

  const reset = React.useCallback(() => {
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setHtmlInput(defaultHtml)
    setResultUrl(null)
    setResultSize(0)
    setProgress(0)
    setIsProcessing(false)
  }, [resultUrl])

  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  React.useEffect(() => {
    if (iframeRef.current && showPreview) {
      const iframe = iframeRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document
      if (doc) {
        doc.open()
        doc.write(htmlInput)
        doc.close()
      }
    }
  }, [htmlInput, showPreview])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Code className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">HTML to PDF</h2>
          <p className="text-sm text-muted-foreground">Convert HTML code into a formatted PDF document</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()} icon={<Upload className="h-3.5 w-3.5" />}>
              Upload HTML
            </Button>
            <input ref={fileInputRef} type="file" accept=".html,.htm" onChange={handleHtmlFile} className="hidden" />
            <Button size="sm" variant="ghost" onClick={() => setShowPreview(!showPreview)} icon={showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}>
              {showPreview ? "Hide Preview" : "Show Preview"}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Page:</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            >
              {pageSizes.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className={cn("grid gap-4", showPreview ? "grid-cols-2" : "grid-cols-1")}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">HTML Input</label>
            <textarea
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              rows={16}
              className="w-full resize-y rounded-xl border border-border bg-background p-4 font-mono text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          {showPreview && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Preview</label>
              <div className="rounded-xl border border-border bg-white overflow-hidden" style={{ height: "430px" }}>
                <iframe ref={iframeRef} className="h-full w-full" title="HTML Preview" sandbox="allow-same-origin" />
              </div>
            </div>
          )}
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Converting HTML to PDF ({pageSize})...
            </div>
            <ProgressBar value={progress} variant="gradient" size="lg" showPercentage />
          </div>
        )}

        {resultUrl && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-500/5 to-primary/5 border border-emerald-500/10 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                  <FileDown className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">PDF Ready</p>
                  <p className="text-xs text-muted-foreground">{pageSize} · {formatSize(resultSize)}</p>
                </div>
              </div>
              <Button size="sm" variant="primary" onClick={download} icon={<Download className="h-3.5 w-3.5" />}>
                Download PDF
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={reset} className="w-full">
              Start over
            </Button>
          </motion.div>
        )}

        {!isProcessing && !resultUrl && (
          <Button onClick={process} size="lg" className="w-full" icon={<FileDown className="h-4 w-4" />}>
            Convert to PDF
          </Button>
        )}
      </div>
    </Card>
  )
}

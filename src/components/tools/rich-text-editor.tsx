"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { Copy, Check, FilePen, RotateCcw } from "lucide-react"

const TEXT_COLORS = [
  { label: "Default", value: "inherit" },
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Yellow", value: "#eab308" },
  { label: "Green", value: "#22c55e" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Purple", value: "#a855f7" },
  { label: "Pink", value: "#ec4899" },
  { label: "Gray", value: "#6b7280" },
]

export function RichTextEditor() {
  const [copied, setCopied] = React.useState(false)
  const [htmlOutput, setHtmlOutput] = React.useState("")
  const [showSource, setShowSource] = React.useState(false)
  const editorRef = React.useRef<HTMLDivElement>(null)

  const exec = React.useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) editorRef.current.focus()
  }, [])

  const handleHeading = React.useCallback(() => {
    const selection = window.getSelection()
    const parent = selection?.focusNode?.parentElement
    const isHeading = parent?.closest("h1,h2,h3,h4,h5,h6")

    if (isHeading) {
      exec("formatBlock", "<p>")
    } else {
      exec("formatBlock", "<h2>")
    }
  }, [exec])

  const handleLink = React.useCallback(() => {
    const url = prompt("Enter URL:", "https://")
    if (url) {
      exec("createLink", url)
    }
  }, [exec])

  const handleColor = React.useCallback(
    (color: string) => {
      exec("foreColor", color)
    },
    [exec]
  )

  const handleExportHtml = React.useCallback(() => {
    const html = editorRef.current?.innerHTML || ""
    setHtmlOutput(html)
    setShowSource(true)
    toast.success("HTML exported")
  }, [])

  const handleExportText = React.useCallback(() => {
    const text = editorRef.current?.textContent || ""
    setHtmlOutput(text)
    setShowSource(true)
    toast.success("Plain text exported")
  }, [])

  const handleCopyHtml = React.useCallback(async () => {
    const html = editorRef.current?.innerHTML || ""
    if (!html) return
    try {
      await navigator.clipboard.writeText(html)
      setCopied(true)
      toast.success("HTML copied")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [])

  const handleClear = React.useCallback(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = ""
    }
    setHtmlOutput("")
    setShowSource(false)
  }, [])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <FilePen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Rich Text Editor</h2>
          <p className="text-sm text-muted-foreground">
            Create and format rich text documents
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-border bg-muted/20">
        <button
          onClick={() => exec("bold")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Bold"
        >
          B
        </button>
        <button
          onClick={() => exec("italic")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm italic text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Italic"
        >
          I
        </button>
        <button
          onClick={() => exec("underline")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm underline text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Underline"
        >
          U
        </button>
        <span className="w-px h-6 bg-border mx-1" />
        <button
          onClick={handleHeading}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Heading"
        >
          H
        </button>
        <button
          onClick={() => exec("insertUnorderedList")}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Bullet List"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
        </button>
        <button
          onClick={handleLink}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Insert Link"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </button>
        <span className="w-px h-6 bg-border mx-1" />
        <div className="flex items-center gap-1">
          {["red", "orange", "yellow", "green", "blue", "purple", "pink", "gray"].map((color) => (
            <button
              key={color}
              onClick={() => handleColor(TEXT_COLORS.find((c) => c.label.toLowerCase() === color)?.value || color)}
              className="h-6 w-6 rounded-lg border border-border transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
              title={`${color} text`}
            />
          ))}
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="min-h-[300px] w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground shadow-sm focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 overflow-auto"
        dangerouslySetInnerHTML={{
          __html: "<h2>Welcome to Rich Text Editor</h2><p>Start typing here...</p>",
        }}
      />

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleExportHtml} icon={<Code className="h-4 w-4" />}>
          Export HTML
        </Button>
        <Button variant="outline" onClick={handleExportText} icon={<FilePen className="h-4 w-4" />}>
          Export Plain Text
        </Button>
        <Button variant="secondary" onClick={handleCopyHtml} icon={copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}>
          {copied ? "Copied" : "Copy HTML"}
        </Button>
        <Button variant="ghost" onClick={handleClear} icon={<RotateCcw className="h-4 w-4" />}>
          Clear
        </Button>
      </div>

      {showSource && htmlOutput && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <label className="text-sm font-medium text-foreground">Source Output</label>
          <div className="rounded-xl border border-border bg-muted/30 p-4 overflow-auto max-h-48">
            <pre className="whitespace-pre-wrap break-all text-sm font-mono text-foreground">
              {htmlOutput}
            </pre>
          </div>
        </motion.div>
      )}

      <style jsx global>{`
        [contenteditable] h1 { font-size: 1.75rem; font-weight: 700; margin: 0.5rem 0; }
        [contenteditable] h2 { font-size: 1.4rem; font-weight: 600; margin: 0.4rem 0; }
        [contenteditable] h3 { font-size: 1.15rem; font-weight: 600; margin: 0.3rem 0; }
        [contenteditable] p { margin: 0.3rem 0; line-height: 1.6; }
        [contenteditable] ul, [contenteditable] ol { padding-left: 1.5rem; margin: 0.3rem 0; }
        [contenteditable] li { margin: 0.15rem 0; }
        [contenteditable] a { color: hsl(var(--primary)); text-decoration: underline; }
        [contenteditable]:focus { outline: none; }
      `}</style>
    </Card>
  )
}

function Code({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}

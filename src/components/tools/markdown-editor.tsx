"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Bold,
  Italic,
  Heading,
  List,
  Code,
  Link,
  Copy,
  Check,
  Download,
  FilePen,
  RotateCcw,
  Image,
  Table,
  Eye,
  EyeOff,
  Hash,
} from "lucide-react"

function markdownToHtml(md: string): string {
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  html = html
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/```(\w*)\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%"/>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match.replace(/\n/g, "")}</ul>`)
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/(?:<li>.*<\/li>\n?)+/g, (match, offset, str) => {
      if (str[offset - 1] !== "u") return `<ol>${match.replace(/\n/g, "")}</ol>`
      return match
    })
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split("|").filter(Boolean).map((c) => c.trim())
      if (cells.every((c) => /^-{3,}$/.test(c))) return '<hr class="table-sep"/>'
      return `<td>${cells.join("</td><td>")}</td>`
    })
    .replace(/((?:<td>.*<\/td>\n?)+)/g, "<tr>$1</tr>")
    .replace(/((?:<tr>.*<\/tr>\n?)+)/g, "<table>$1</table>")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br/>")

  html = `<p>${html}</p>`
  html = html.replace(/<p><\/p>/g, "")
  html = html.replace(/<\/ul><p>/g, "</ul>").replace(/<\/ol><p>/g, "</ol>")
  html = html.replace(/<p><ul>/g, "<ul>").replace(/<p><ol>/g, "<ol>")
  html = html.replace(/<\/ul><br\/>/g, "</ul>").replace(/<\/ol><br\/>/g, "</ol>")
  html = html.replace(/<p><table>/g, "<table>").replace(/<\/table><br\/>/g, "</table>").replace(/<\/table><p>/g, "</table>")
  html = html.replace(/<p><h1>/g, "<h1>").replace(/<p><h2>/g, "<h2>").replace(/<p><h3>/g, "<h3>")
  html = html.replace(/<\/h1><br\/>/g, "</h1>").replace(/<\/h2><br\/>/g, "</h2>").replace(/<\/h3><br\/>/g, "</h3>")
  html = html.replace(/<p><pre>/g, "<pre>").replace(/<\/pre><br\/>/g, "</pre>").replace(/<\/pre><p>/g, "</pre>")
  html = html.replace(/<p><img/g, "<img").replace(/"\/><br\/>/g, '"/>')

  return html
}

const toolbarButtons = [
  { id: "bold", icon: Bold, label: "Bold", syntax: "**", wrap: true },
  { id: "italic", icon: Italic, label: "Italic", syntax: "*", wrap: true },
  { id: "heading", icon: Heading, label: "Heading", syntax: "## ", wrap: false },
  { id: "list", icon: List, label: "List", syntax: "- ", wrap: false },
  { id: "code", icon: Code, label: "Code", syntax: "`", wrap: true },
  { id: "link", icon: Link, label: "Link", syntax: "[text](url)", wrap: false },
  { id: "image", icon: Image, label: "Image", syntax: "![alt](url)", wrap: false },
  { id: "table", icon: Table, label: "Table", syntax: "| Col 1 | Col 2 |\n|-------|-------|\n| Cell 1 | Cell 2 |", wrap: false },
]

export function MarkdownEditor() {
  const [input, setInput] = React.useState("# Welcome to Markdown Editor\n\nStart typing **markdown** on the left to see the *preview* on the right.\n\n## Features\n- Headings\n- Bold & Italic\n- Lists\n- Code blocks\n- Links & Images\n- Tables\n- And more...")
  const [copiedMd, setCopiedMd] = React.useState(false)
  const [copiedHtml, setCopiedHtml] = React.useState(false)
  const [showPreview, setShowPreview] = React.useState(true)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const htmlOutput = React.useMemo(() => markdownToHtml(input), [input])
  const words = input.trim() ? input.trim().split(/\s+/).length : 0
  const chars = input.length
  const charsNoSpace = input.replace(/\s/g, "").length

  const insertSyntax = React.useCallback(
    (syntax: string, wrap: boolean, label: string) => {
      const textarea = textareaRef.current
      if (!textarea) return
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const selected = input.substring(start, end)

      let newText = input
      if (wrap) {
        if (selected) {
          newText = input.substring(0, start) + syntax + selected + syntax + input.substring(end)
        } else {
          newText = input.substring(0, start) + syntax + label + syntax + input.substring(end)
        }
      } else {
        if (selected) {
          newText = input.substring(0, start) + syntax + input.substring(end)
        } else {
          newText = input.substring(0, start) + syntax + input.substring(end)
        }
      }
      setInput(newText)
      setTimeout(() => {
        textarea.focus()
        const cursorPos = start + syntax.length + (wrap && !selected ? label.length : 0)
        textarea.setSelectionRange(cursorPos, cursorPos)
      }, 0)
    },
    [input]
  )

  const handleCopyMarkdown = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(input)
      setCopiedMd(true)
      toast.success("Markdown copied")
      setTimeout(() => setCopiedMd(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [input])

  const handleCopyHtml = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(htmlOutput)
      setCopiedHtml(true)
      toast.success("HTML copied")
      setTimeout(() => setCopiedHtml(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [htmlOutput])

  const handleDownload = React.useCallback(
    (format: "md" | "html") => {
      const content = format === "md" ? input : htmlOutput
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `document.${format}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Downloaded as .${format}`)
    },
    [input, htmlOutput]
  )

  const handleClear = React.useCallback(() => {
    setInput("")
  }, [])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <FilePen className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Markdown Editor</h2>
          <p className="text-sm text-muted-foreground">
            Write and preview Markdown in real-time
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {toolbarButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => insertSyntax(btn.syntax, btn.wrap, btn.label)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title={btn.label}
            >
              <btn.icon className="h-4 w-4" />
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showPreview ? "Hide Preview" : "Show Preview"}
        </button>
      </div>

      <div className={cn("grid gap-4", showPreview ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Markdown</label>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your markdown here..."
            rows={16}
            className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm font-mono transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        {showPreview && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Preview</label>
            <div
              className="prose prose-sm dark:prose-invert max-w-none min-h-[300px] w-full resize-y rounded-xl border border-border bg-background p-4 shadow-sm overflow-auto"
              style={{ height: "auto" }}
            >
              <div
                dangerouslySetInnerHTML={{ __html: htmlOutput }}
                className="markdown-preview"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Hash className="h-3 w-3" />
            {words} words
          </span>
          <span>{chars} chars</span>
          <span>{charsNoSpace} chars (no space)</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleCopyMarkdown} icon={copiedMd ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}>
          {copiedMd ? "Copied MD" : "Copy MD"}
        </Button>
        <Button variant="outline" onClick={handleCopyHtml} icon={copiedHtml ? <Check className="h-4 w-4 text-emerald-500" /> : <Code className="h-4 w-4" />}>
          {copiedHtml ? "Copied HTML" : "Copy HTML"}
        </Button>
        <Button variant="secondary" onClick={() => handleDownload("md")} icon={<Download className="h-4 w-4" />}>
          Download .md
        </Button>
        <Button variant="secondary" onClick={() => handleDownload("html")} icon={<Download className="h-4 w-4" />}>
          Download .html
        </Button>
        {input && (
          <Button variant="ghost" onClick={handleClear} icon={<RotateCcw className="h-4 w-4" />}>
            Clear
          </Button>
        )}
      </div>

      <style jsx global>{`
        .markdown-preview h1 { font-size: 1.75rem; font-weight: 700; margin: 1rem 0 0.5rem; line-height: 1.2; }
        .markdown-preview h2 { font-size: 1.4rem; font-weight: 600; margin: 0.9rem 0 0.4rem; line-height: 1.25; }
        .markdown-preview h3 { font-size: 1.15rem; font-weight: 600; margin: 0.8rem 0 0.3rem; }
        .markdown-preview p { margin: 0.4rem 0; line-height: 1.6; }
        .markdown-preview strong { font-weight: 700; }
        .markdown-preview em { font-style: italic; }
        .markdown-preview code { background: hsl(var(--muted)); padding: 0.15rem 0.35rem; border-radius: 4px; font-size: 0.875em; font-family: monospace; }
        .markdown-preview pre { background: hsl(var(--muted)); padding: 1rem; border-radius: 8px; overflow-x: auto; margin: 0.5rem 0; }
        .markdown-preview pre code { background: none; padding: 0; border-radius: 0; }
        .markdown-preview ul, .markdown-preview ol { padding-left: 1.5rem; margin: 0.4rem 0; }
        .markdown-preview li { margin: 0.2rem 0; line-height: 1.5; }
        .markdown-preview a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 2px; }
        .markdown-preview a:hover { opacity: 0.85; }
        .markdown-preview img { max-width: 100%; border-radius: 8px; margin: 0.5rem 0; }
        .markdown-preview table { border-collapse: collapse; width: 100%; margin: 0.5rem 0; font-size: 0.875rem; }
        .markdown-preview td { border: 1px solid hsl(var(--border)); padding: 0.4rem 0.6rem; }
        .markdown-preview hr { border: none; border-top: 1px solid hsl(var(--border)); margin: 1rem 0; }
        .markdown-preview blockquote { border-left: 3px solid hsl(var(--primary)); padding-left: 1rem; margin: 0.5rem 0; color: hsl(var(--muted-foreground)); }
      `}</style>
    </Card>
  )
}

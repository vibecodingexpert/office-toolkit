"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Sparkles, RotateCcw } from "lucide-react"

const LANGUAGES = [
  { id: "javascript", name: "JavaScript", extensions: [".js", ".jsx", ".mjs"] },
  { id: "typescript", name: "TypeScript", extensions: [".ts", ".tsx"] },
  { id: "html", name: "HTML", extensions: [".html", ".htm"] },
  { id: "css", name: "CSS", extensions: [".css", ".scss", ".less"] },
  { id: "json", name: "JSON", extensions: [".json"] },
  { id: "xml", name: "XML", extensions: [".xml", ".svg"] },
]

function indentLines(lines: string[], indentSize: number = 2): string {
  const indent = " ".repeat(indentSize)
  let depth = 0
  const result: string[] = []

  for (let line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const opens = (trimmed.match(/[\[{\(]/g) || []).length
    const closes = (trimmed.match(/[\]}\)]/g) || []).length

    if (closes > opens) depth -= closes - opens

    result.push(indent.repeat(Math.max(0, depth)) + trimmed)

    if (opens > closes) depth += opens - closes
  }

  return result.join("\n")
}

function beautifyCode(code: string, language: string): string {
  switch (language) {
    case "json": {
      try {
        return JSON.stringify(JSON.parse(code), null, 2)
      } catch {
        throw new Error("Invalid JSON")
      }
    }
    case "html": {
      const lines = code
        .replace(/>\s*</g, ">\n<")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
      return indentLines(lines, 2)
    }
    case "css": {
      let formatted = code
        .replace(/\s*{\s*/g, " {\n  ")
        .replace(/\s*;\s*/g, ";\n  ")
        .replace(/\s*}\s*/g, "\n}\n")
        .replace(/,\s*/g, ", ")
        .replace(/\/\*[\s\S]*?\*\//g, (m) => "\n" + m.trim() + "\n")
      const lines = formatted.split("\n").map((l) => l.trim())
      return indentLines(lines, 2)
    }
    case "xml": {
      const lines = code
        .replace(/>\s*</g, ">\n<")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
      return indentLines(lines, 2)
    }
    default: {
      let formatted = code
        .replace(/\s*{\s*/g, " {\n  ")
        .replace(/;\s*/g, ";\n  ")
        .replace(/\s*}\s*/g, "\n}\n\n")
        .replace(/,\s*/g, ", ")
        .replace(/\s*;\s*$/gm, ";")
      const lines = formatted.split("\n").map((l) => l.trim())
      return indentLines(lines, 2)
    }
  }
}

export function Beautify() {
  const [input, setInput] = React.useState("")
  const [output, setOutput] = React.useState("")
  const [language, setLanguage] = React.useState("javascript")
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleBeautify = React.useCallback(() => {
    if (!input.trim()) {
      toast.error("Please enter code to beautify")
      return
    }
    setLoading(true)
    setError("")
    setTimeout(() => {
      try {
        const result = beautifyCode(input, language)
        setOutput(result)
        setLoading(false)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to beautify code")
        setLoading(false)
      }
    }, 200)
  }, [input, language])

  const handleCopy = React.useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [output])

  const handleClear = React.useCallback(() => {
    setInput("")
    setOutput("")
    setError("")
  }, [])

  const syntaxClass = React.useMemo(() => {
    switch (language) {
      case "json": return "text-amber-400"
      case "html": return "text-orange-400"
      case "css": return "text-pink-400"
      case "xml": return "text-purple-400"
      case "typescript": return "text-blue-400"
      default: return "text-yellow-400"
    }
  }, [language])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Beautify Code</h2>
          <p className="text-sm text-muted-foreground">
            Format and beautify source code in multiple languages
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Language</label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => { setLanguage(lang.id); setOutput(""); setError("") }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                language === lang.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Code Input</label>
        <textarea
          value={input}
          onChange={(e) => { setInput(e.target.value); setError("") }}
          placeholder={`Paste your ${LANGUAGES.find((l) => l.id === language)?.name} code here...`}
          rows={7}
          className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm font-mono transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleBeautify} loading={loading} icon={<Sparkles className="h-4 w-4" />}>
          Beautify
        </Button>
        {(input || output) && (
          <Button variant="ghost" onClick={handleClear} icon={<RotateCcw className="h-4 w-4" />}>
            Clear
          </Button>
        )}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive"
        >
          {error}
        </motion.p>
      )}

      {output && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Formatted Output</label>
            <button
              onClick={handleCopy}
              className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="rounded-xl border border-border bg-zinc-950 dark:bg-zinc-900 p-4 overflow-auto max-h-96">
            <pre className={`whitespace-pre-wrap text-sm font-mono ${syntaxClass} leading-relaxed`}>
              {output}
            </pre>
          </div>
        </motion.div>
      )}
    </Card>
  )
}

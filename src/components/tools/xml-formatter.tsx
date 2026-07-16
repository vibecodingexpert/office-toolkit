"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Braces, RotateCcw, ListIndentIncrease, Shrink } from "lucide-react"

function formatXml(xml: string): string {
  const trimmed = xml.trim()
  let formatted = ""
  let indent = ""
  let inTag = false
  let inString = false
  let stringChar = ""

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i]

    if (inString) {
      formatted += char
      if (char === stringChar) inString = false
      continue
    }

    if (char === '"' || char === "'") {
      inString = true
      stringChar = char
      formatted += char
      continue
    }

    if (char === "<") {
      inTag = true
      const next = trimmed.slice(i, i + 4)
      if (next === "<?xml") {
        formatted += char
        continue
      }
      if (next.startsWith("</")) {
        indent = indent.slice(2)
        formatted += "\n" + indent + char
      } else if (next.startsWith("<!")) {
        formatted += char
      } else if (next.endsWith("/>") || trimmed[i + 1] === "/") {
        formatted += "\n" + indent + char
      } else {
        formatted += "\n" + indent + char
        indent += "  "
      }
      continue
    }

    if (char === ">" && inTag) {
      formatted += char
      inTag = false
      if (trimmed[i - 1] === "/") {
        indent = indent.slice(2)
      }
      continue
    }

    if (char === "/" && trimmed[i - 1] === "<") {
      indent = indent.slice(2)
      formatted += char
      continue
    }

    formatted += char
  }

  return formatted.trim()
}

function minifyXml(xml: string): string {
  return xml
    .replace(/>\s+</g, "><")
    .replace(/\s+/g, " ")
    .replace(/>\s+/g, ">")
    .replace(/\s+</g, "<")
    .trim()
}

function highlightXml(text: string): React.ReactNode {
  const tokens: { value: string; color: string }[] = []
  const regex = /(&lt;|<)(\/?)([\w:-]+)([\s\S]*?)(\/?)(&gt;|>)|(&amp;lt;|&amp;gt;|&amp;amp;|&amp;quot;|&amp;apos;)|([^<&]+)/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      tokens.push({ value: match[1], color: "text-blue-500" })
      tokens.push({ value: match[2] || "", color: "text-blue-500" })
      tokens.push({ value: match[3], color: "text-violet-600 dark:text-violet-400 font-semibold" })

      const attrs = match[4] || ""
      const attrRegex = /(\s+)([\w:-]+)(\s*=\s*)(["'].*?["'])/g
      let attrMatch: RegExpExecArray | null
      let lastIdx = 0

      while ((attrMatch = attrRegex.exec(attrs)) !== null) {
        if (attrMatch.index > lastIdx) {
          tokens.push({ value: attrs.slice(lastIdx, attrMatch.index), color: "text-foreground" })
        }
        tokens.push({ value: attrMatch[1], color: "text-foreground" })
        tokens.push({ value: attrMatch[2], color: "text-amber-600 dark:text-amber-400" })
        tokens.push({ value: attrMatch[3], color: "text-muted-foreground" })
        tokens.push({ value: attrMatch[4], color: "text-emerald-600 dark:text-emerald-400" })
        lastIdx = attrMatch.index + attrMatch[0].length
      }

      if (lastIdx < attrs.length) {
        tokens.push({ value: attrs.slice(lastIdx), color: "text-foreground" })
      }

      tokens.push({ value: match[5] || "", color: "text-blue-500" })
      tokens.push({ value: match[6], color: "text-blue-500" })
    } else if (match[7]) {
      tokens.push({ value: match[7], color: "text-muted-foreground" })
    } else if (match[8]) {
      tokens.push({ value: match[8], color: "text-foreground" })
    }
  }

  return tokens.map((t, i) => (
    <span key={i} className={t.color}>
      {t.value}
    </span>
  ))
}

function isValidXml(xml: string): { valid: boolean; message: string } {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, "text/xml")
    const errors = doc.getElementsByTagName("parsererror")
    if (errors.length > 0) {
      return { valid: false, message: errors[0].textContent || "Invalid XML" }
    }
    return { valid: true, message: "Valid XML" }
  } catch {
    return { valid: false, message: "Failed to parse XML" }
  }
}

export function XmlFormatter() {
  const [input, setInput] = React.useState("")
  const [output, setOutput] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [isFormatted, setIsFormatted] = React.useState(true)

  const processXml = React.useCallback(
    (action: "format" | "minify") => {
      if (!input.trim()) {
        toast.error("Please enter XML")
        return
      }
      setLoading(true)
      setError(null)
      setTimeout(() => {
        try {
          const validation = isValidXml(input)
          if (!validation.valid) {
            setError(validation.message)
            setOutput("")
            toast.error(validation.message)
            setLoading(false)
            return
          }

          setIsFormatted(action === "format")
          const result = action === "format" ? formatXml(input) : minifyXml(input)
          setOutput(result)
          toast.success(action === "format" ? "XML formatted" : "XML minified")
          setLoading(false)
        } catch (err) {
          const message = err instanceof Error ? err.message : "Failed to process XML"
          setError(message)
          setOutput("")
          toast.error(message)
          setLoading(false)
        }
      }, 200)
    },
    [input]
  )

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
    setError(null)
  }, [])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Braces className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">XML Formatter</h2>
          <p className="text-sm text-muted-foreground">
            Format, minify, and beautify XML data
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">XML Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your XML here..."
          rows={8}
          className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm font-mono transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => processXml("format")} loading={loading} icon={<ListIndentIncrease className="h-4 w-4" />}>
          Format
        </Button>
        <Button variant="outline" onClick={() => processXml("minify")} icon={<Shrink className="h-4 w-4" />}>
          Minify
        </Button>
        {input && (
          <Button variant="ghost" onClick={handleClear} icon={<RotateCcw className="h-4 w-4" />}>
            Clear
          </Button>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive font-mono"
        >
          {error}
        </motion.div>
      )}

      {output && !error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              {isFormatted ? "Formatted" : "Minified"} Output
            </label>
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
          <div className="rounded-xl border border-border bg-muted/30 p-4 overflow-auto max-h-96">
            <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
              {highlightXml(output)}
            </pre>
          </div>
        </motion.div>
      )}
    </Card>
  )
}

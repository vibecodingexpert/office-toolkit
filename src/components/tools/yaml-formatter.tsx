"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Braces, RotateCcw, FileCheck } from "lucide-react"

function formatYaml(yaml: string): string {
  const lines = yaml.split("\n")
  const formatted: string[] = []
  let inBlock = false

  for (let line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) {
      formatted.push(line)
      continue
    }

    if (trimmed.endsWith("|") || trimmed.endsWith(">")) {
      inBlock = true
      formatted.push(line)
      continue
    }

    if (inBlock) {
      formatted.push(line)
      if (!trimmed || !line.startsWith("  ")) inBlock = false
      continue
    }

    if (trimmed.includes(": ") || trimmed.endsWith(":")) {
      const indent = line.match(/^\s*/)?.[0] || ""
      const [key, ...rest] = trimmed.split(": ")
      const value = rest.join(": ")
      if (value) {
        formatted.push(`${indent}${key}: ${value}`)
      } else {
        formatted.push(`${indent}${key}:`)
      }
    } else if (trimmed.startsWith("- ")) {
      const indent = line.match(/^\s*/)?.[0] || ""
      formatted.push(`${indent}- ${trimmed.slice(2)}`)
    } else {
      formatted.push(line)
    }
  }

  return formatted.join("\n")
}

function highlightYaml(text: string): React.ReactNode {
  const tokens: { value: string; color: string }[] = []

  const lines = text.split("\n")
  for (const line of lines) {
    const keyMatch = line.match(/^(\s*)([\w-]+)(:)(\s*)(.*)$/)
    if (keyMatch) {
      const [, indent, key, colon, space, value] = keyMatch
      tokens.push({ value: indent, color: "text-foreground" })
      tokens.push({ value: key, color: "text-blue-600 dark:text-blue-400" })
      tokens.push({ value: ":", color: "text-muted-foreground" })
      tokens.push({ value: space, color: "text-foreground" })

      if (value.startsWith("#")) {
        tokens.push({ value: value, color: "text-muted-foreground italic" })
      } else if (value === "true" || value === "false") {
        tokens.push({ value: value, color: "text-violet-600 dark:text-violet-400" })
      } else if (/^-?\d+(\.\d+)?$/.test(value)) {
        tokens.push({ value: value, color: "text-amber-600 dark:text-amber-400" })
      } else if (value.startsWith('"') || value.startsWith("'")) {
        tokens.push({ value: value, color: "text-emerald-600 dark:text-emerald-400" })
      } else if (value.startsWith("- ")) {
        tokens.push({ value: "- ", color: "text-muted-foreground" })
        tokens.push({ value: value.slice(2), color: "text-foreground" })
      } else {
        tokens.push({ value: value, color: "text-emerald-600 dark:text-emerald-400" })
      }
    } else if (line.trim().startsWith("#")) {
      tokens.push({ value: line, color: "text-muted-foreground italic" })
    } else {
      tokens.push({ value: line, color: "text-foreground" })
    }
    tokens.push({ value: "\n", color: "text-foreground" })
  }

  return tokens.map((t, i) => (
    <span key={i} className={t.color}>
      {t.value}
    </span>
  ))
}

function validateYaml(yaml: string): { valid: boolean; message: string } {
  try {
    const lines = yaml.split("\n")
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue

      if (trimmed.startsWith("- ") || trimmed.startsWith("-")) {
        continue
      }

      if (trimmed.includes(":") && !trimmed.endsWith(":")) {
        const idx = trimmed.indexOf(":")
        const value = trimmed.slice(idx + 1).trim()
        if (value === "") continue
        continue
      }

      if (trimmed.endsWith(":")) {
        continue
      }

      if (trimmed.startsWith("|") || trimmed.startsWith(">")) {
        continue
      }

      const validLine = /^(\s*(-\s+)?[\w"'][\w\s"'-]*:.*)$/.test(trimmed)
      if (!validLine && trimmed.length > 0) {
        if (!trimmed.includes(":")) {
          return { valid: false, message: `Line ${i + 1}: Expected key:value pair` }
        }
      }
    }
    return { valid: true, message: "Valid YAML" }
  } catch {
    return { valid: false, message: "Invalid YAML syntax" }
  }
}

export function YamlFormatter() {
  const [input, setInput] = React.useState("")
  const [output, setOutput] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const handleFormat = React.useCallback(() => {
    if (!input.trim()) {
      toast.error("Please enter YAML")
      return
    }
    setLoading(true)
    setError(null)
    setTimeout(() => {
      const validation = validateYaml(input)
      if (!validation.valid) {
        setError(validation.message)
        setOutput("")
        toast.error(validation.message)
        setLoading(false)
        return
      }
      try {
        const formatted = formatYaml(input)
        setOutput(formatted)
        toast.success("YAML formatted")
        setLoading(false)
      } catch {
        setError("Failed to format YAML")
        toast.error("Failed to format YAML")
        setLoading(false)
      }
    }, 200)
  }, [input])

  const handleValidate = React.useCallback(() => {
    if (!input.trim()) {
      toast.error("Please enter YAML")
      return
    }
    const validation = validateYaml(input)
    if (validation.valid) {
      toast.success(validation.message)
      setError(null)
    } else {
      setError(validation.message)
      toast.error(validation.message)
    }
  }, [input])

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
          <h2 className="text-lg font-semibold">YAML Formatter</h2>
          <p className="text-sm text-muted-foreground">
            Format, validate, and beautify YAML files
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">YAML Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your YAML here..."
          rows={8}
          className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm font-mono transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleFormat} loading={loading} icon={<Braces className="h-4 w-4" />}>
          Format
        </Button>
        <Button variant="secondary" onClick={handleValidate} icon={<FileCheck className="h-4 w-4" />}>
          Validate
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
            <label className="text-sm font-medium text-foreground">Formatted YAML</label>
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
              {highlightYaml(output)}
            </pre>
          </div>
        </motion.div>
      )}
    </Card>
  )
}

"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Braces, Code2, FileCheck, RotateCcw } from "lucide-react"

function highlightJson(text: string): React.ReactNode {
  const tokens: { value: string; color: string }[] = []
  const regex =
    /("(?:\\.|[^"\\])*")\s*:|("(?:\\.|[^"\\])*")|(true|false|null)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\],])|(\s+)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        value: text.slice(lastIndex, match.index),
        color: "text-foreground",
      })
    }
    if (match[1]) {
      tokens.push({ value: match[1], color: "text-blue-600 dark:text-blue-400" })
      tokens.push({ value: ":", color: "text-muted-foreground" })
    } else if (match[2]) {
      tokens.push({
        value: match[2],
        color: "text-emerald-600 dark:text-emerald-400",
      })
    } else if (match[3]) {
      tokens.push({
        value: match[3],
        color: "text-violet-600 dark:text-violet-400",
      })
    } else if (match[4]) {
      tokens.push({
        value: match[4],
        color: "text-amber-600 dark:text-amber-400",
      })
    } else if (match[5]) {
      tokens.push({ value: match[5], color: "text-muted-foreground" })
    } else if (match[6]) {
      tokens.push({ value: match[6], color: "text-foreground" })
    }
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    tokens.push({
      value: text.slice(lastIndex),
      color: "text-foreground",
    })
  }

  return tokens.map((token, i) => (
    <span key={i} className={token.color}>
      {token.value}
    </span>
  ))
}

export function JsonFormatter() {
  const [input, setInput] = React.useState("")
  const [output, setOutput] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [isFormatted, setIsFormatted] = React.useState(true)

  const processJson = React.useCallback(
    (action: "format" | "minify" | "validate") => {
      if (!input.trim()) {
        toast.error("Please enter JSON")
        return
      }
      setLoading(true)
      setError(null)
      setTimeout(() => {
        try {
          const parsed = JSON.parse(input)
          setIsFormatted(action !== "minify")
          if (action === "validate") {
            setOutput("✓ Valid JSON")
            toast.success("Valid JSON")
          } else {
            setOutput(
              action === "format"
                ? JSON.stringify(parsed, null, 2)
                : JSON.stringify(parsed)
            )
          }
          setLoading(false)
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Invalid JSON"
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
          <h2 className="text-lg font-semibold">JSON Formatter</h2>
          <p className="text-sm text-muted-foreground">
            Format, minify, and validate JSON data
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">JSON Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your JSON here..."
          rows={6}
          className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm font-mono transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => processJson("format")}
          loading={loading}
          icon={<Code2 className="h-4 w-4" />}
        >
          Format
        </Button>
        <Button
          variant="outline"
          onClick={() => processJson("minify")}
          icon={<Braces className="h-4 w-4" />}
        >
          Minify
        </Button>
        <Button
          variant="secondary"
          onClick={() => processJson("validate")}
          icon={<FileCheck className="h-4 w-4" />}
        >
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
            <label className="text-sm font-medium text-foreground">
              {output === "✓ Valid JSON" ? "Validation Result" : isFormatted ? "Formatted" : "Minified"} Output
            </label>
            {output !== "✓ Valid JSON" && (
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
            )}
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4 overflow-auto max-h-96">
            {output === "✓ Valid JSON" ? (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <FileCheck className="h-5 w-5" />
                <span className="text-sm font-medium">Valid JSON</span>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap break-all text-sm font-mono">
                {isFormatted ? highlightJson(output) : output}
              </pre>
            )}
          </div>
        </motion.div>
      )}
    </Card>
  )
}

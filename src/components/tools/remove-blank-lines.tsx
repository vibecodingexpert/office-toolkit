"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Download, RemoveFormatting, RotateCcw } from "lucide-react"

function removeBlankLines(text: string, trimLines: boolean): string {
  return text
    .split("\n")
    .filter((line) => {
      const processed = trimLines ? line.trim() : line
      return processed.length > 0
    })
    .join("\n")
}

function countBlankLines(text: string): number {
  return text.split("\n").filter((line) => line.trim().length === 0).length
}

export function RemoveBlankLines() {
  const [input, setInput] = React.useState("")
  const [output, setOutput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [stats, setStats] = React.useState<{ before: number; after: number; removed: number } | null>(null)
  const [trimLines, setTrimLines] = React.useState(true)

  const handleRemove = React.useCallback(() => {
    if (!input.trim()) {
      toast.error("Please enter text")
      return
    }
    setLoading(true)
    setTimeout(() => {
      const blankCount = countBlankLines(input)
      const result = removeBlankLines(input, trimLines)
      const beforeLines = input.split("\n").length
      const afterLines = result.split("\n").length
      setOutput(result)
      setStats({ before: beforeLines, after: afterLines, removed: blankCount })
      setLoading(false)
      toast.success(`Removed ${blankCount} blank line(s)`)
    }, 200)
  }, [input, trimLines])

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

  const handleDownload = React.useCallback(() => {
    if (!output) return
    const blob = new Blob([output], { type: "text/plain;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "no-blank-lines.txt"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Downloaded")
  }, [output])

  const handleClear = React.useCallback(() => {
    setInput("")
    setOutput("")
    setStats(null)
  }, [])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <RemoveFormatting className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Remove Blank Lines</h2>
          <p className="text-sm text-muted-foreground">
            Remove empty lines from your text
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Text Input</label>
          {input && (
            <span className="text-xs text-muted-foreground">{input.split("\n").length} lines</span>
          )}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste text with blank lines..."
          rows={8}
          className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm font-mono transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 cursor-pointer hover:bg-accent transition-colors text-sm w-fit">
        <input
          type="checkbox"
          checked={trimLines}
          onChange={() => setTrimLines(!trimLines)}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
        />
        <span className="text-foreground">Trim whitespace from lines before checking</span>
      </label>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleRemove} loading={loading} icon={<RemoveFormatting className="h-4 w-4" />}>
          Remove Blank Lines
        </Button>
        {output && (
          <>
            <Button variant="outline" onClick={handleCopy} icon={copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}>
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="secondary" onClick={handleDownload} icon={<Download className="h-4 w-4" />}>
              Download
            </Button>
            <Button variant="ghost" onClick={handleClear} icon={<RotateCcw className="h-4 w-4" />}>
              Clear
            </Button>
          </>
        )}
      </div>

      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2"
        >
          <Badge variant="secondary">Before: {stats.before} lines</Badge>
          <Badge variant="secondary">After: {stats.after} lines</Badge>
          <Badge variant="destructive">Removed: {stats.removed} lines</Badge>
        </motion.div>
      )}

      {output && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <label className="text-sm font-medium text-foreground">Result</label>
          <div className="rounded-xl border border-border bg-muted/30 p-4 overflow-auto max-h-60">
            <pre className="whitespace-pre-wrap break-all text-sm text-foreground">
              {output}
            </pre>
          </div>
        </motion.div>
      )}
    </Card>
  )
}

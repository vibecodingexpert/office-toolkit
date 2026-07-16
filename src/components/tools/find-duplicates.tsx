"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Search, RotateCcw, Trash2, Layers } from "lucide-react"

interface DuplicateGroup {
  line: string
  count: number
  indices: number[]
}

function findDuplicateLines(text: string): DuplicateGroup[] {
  const lines = text.split("\n")
  const seen: Record<string, number[]> = {}

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed) return
    if (!seen[trimmed]) seen[trimmed] = []
    seen[trimmed].push(idx)
  })

  return Object.entries(seen)
    .filter(([, indices]) => indices.length > 1)
    .map(([line, indices]) => ({ line, count: indices.length, indices }))
    .sort((a, b) => b.count - a.count)
}

function removeDuplicates(text: string): string {
  const lines = text.split("\n")
  const seen = new Set<string>()
  const result: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      result.push(line)
      continue
    }
    if (!seen.has(trimmed)) {
      seen.add(trimmed)
      result.push(line)
    }
  }

  return result.join("\n")
}

export function FindDuplicates() {
  const [input, setInput] = React.useState("")
  const [duplicates, setDuplicates] = React.useState<DuplicateGroup[]>([])
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [dedupedOutput, setDedupedOutput] = React.useState("")
  const [hasProcessed, setHasProcessed] = React.useState(false)

  const handleFind = React.useCallback(() => {
    if (!input.trim()) {
      toast.error("Please enter text")
      return
    }
    setLoading(true)
    setTimeout(() => {
      const result = findDuplicateLines(input)
      setDuplicates(result)
      setHasProcessed(true)
      setDedupedOutput("")
      setLoading(false)
      if (result.length === 0) {
        toast.success("No duplicates found")
      } else {
        toast.success(`Found ${result.length} duplicate group(s)`)
      }
    }, 200)
  }, [input])

  const handleRemove = React.useCallback(() => {
    if (!input.trim()) return
    const result = removeDuplicates(input)
    setDedupedOutput(result)
    const origCount = input.split("\n").filter(Boolean).length
    const newCount = result.split("\n").filter(Boolean).length
    toast.success(`Removed ${origCount - newCount} duplicate line(s)`)
  }, [input])

  const handleCopy = React.useCallback(async () => {
    const text = dedupedOutput || input
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [dedupedOutput, input])

  const handleClear = React.useCallback(() => {
    setInput("")
    setDuplicates([])
    setDedupedOutput("")
    setHasProcessed(false)
  }, [])

  const totalLines = input.split("\n").filter(Boolean).length
  const duplicateCount = duplicates.reduce((sum, d) => sum + d.count - 1, 0)

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Search className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Find Duplicate Lines</h2>
          <p className="text-sm text-muted-foreground">
            Find and remove duplicate lines in your text
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Text Input (one item per line)</label>
          {input && (
            <span className="text-xs text-muted-foreground">{totalLines} lines</span>
          )}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your text here, one item per line..."
          rows={8}
          className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm font-mono transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleFind} loading={loading} icon={<Layers className="h-4 w-4" />}>
          Find Duplicates
        </Button>
        {hasProcessed && duplicates.length > 0 && (
          <Button variant="secondary" onClick={handleRemove} icon={<Trash2 className="h-4 w-4" />}>
            Remove Duplicates
          </Button>
        )}
        {hasProcessed && (duplicates.length > 0 || dedupedOutput) && (
          <Button variant="outline" onClick={handleCopy} icon={copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}>
            {copied ? "Copied" : "Copy"}
          </Button>
        )}
        {input && (
          <Button variant="ghost" onClick={handleClear} icon={<RotateCcw className="h-4 w-4" />}>
            Clear
          </Button>
        )}
      </div>

      {hasProcessed && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Results</span>
            {duplicates.length > 0 && (
              <>
                <Badge variant="destructive">{duplicateCount} duplicate lines</Badge>
                <Badge variant="secondary">{duplicates.length} groups</Badge>
              </>
            )}
            {duplicates.length === 0 && (
              <Badge variant="success" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">No duplicates</Badge>
            )}
          </div>
        </div>
      )}

      {duplicates.length > 0 && !dedupedOutput && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          {duplicates.slice(0, 20).map((group, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-2"
            >
              <span className="text-sm font-mono text-foreground truncate flex-1">
                {group.line}
              </span>
              <Badge variant="destructive" className="shrink-0 ml-2">
                ×{group.count}
              </Badge>
            </div>
          ))}
          {duplicates.length > 20 && (
            <p className="text-xs text-muted-foreground">
              ...and {duplicates.length - 20} more groups
            </p>
          )}
        </motion.div>
      )}

      {dedupedOutput && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <label className="text-sm font-medium text-foreground">Deduplicated Output</label>
          <div className="rounded-xl border border-border bg-muted/30 p-4 overflow-auto max-h-48">
            <pre className="whitespace-pre-wrap break-all text-sm text-foreground">
              {dedupedOutput}
            </pre>
          </div>
        </motion.div>
      )}
    </Card>
  )
}

"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { Copy, Check, RefreshCw, Hash, Trash2 } from "lucide-react"

const { v4: uuidv4 } = require("uuid")

function generateUuid(): string {
  return uuidv4()
}

function generateBatch(count: number): string[] {
  return Array.from({ length }, () => generateUuid())
}

export function UuidGenerator() {
  const [currentUuid, setCurrentUuid] = React.useState(generateUuid())
  const [history, setHistory] = React.useState<string[]>([])
  const [copied, setCopied] = React.useState(false)
  const [bulkCount, setBulkCount] = React.useState<number>(1)
  const [bulkResult, setBulkResult] = React.useState<string[] | null>(null)
  const [loading, setLoading] = React.useState(false)

  const generateNew = React.useCallback(() => {
    setLoading(true)
    setTimeout(() => {
      const newUuid = generateUuid()
      setCurrentUuid(newUuid)
      setHistory((prev) => [newUuid, ...prev].slice(0, 10))
      setBulkResult(null)
      setLoading(false)
    }, 150)
  }, [])

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentUuid)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [currentUuid])

  const handleBulkGenerate = React.useCallback(() => {
    setLoading(true)
    setTimeout(() => {
      const uuids = generateBatch(bulkCount)
      setBulkResult(uuids)
      setHistory((prev) => [...uuids.slice(0, 5), ...prev].slice(0, 10))
      setLoading(false)
    }, 200)
  }, [bulkCount])

  const handleCopyBulk = React.useCallback(async () => {
    if (!bulkResult) return
    try {
      await navigator.clipboard.writeText(bulkResult.join("\n"))
      toast.success("Copied all UUIDs")
    } catch {
      toast.error("Failed to copy")
    }
  }, [bulkResult])

  const clearHistory = React.useCallback(() => {
    setHistory([])
  }, [])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Hash className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">UUID Generator</h2>
          <p className="text-sm text-muted-foreground">
            Generate UUID v4 identifiers
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between gap-4">
          <code className="select-all text-sm font-mono text-foreground break-all">
            {currentUuid}
          </code>
          <div className="flex shrink-0 gap-1">
            <button
              onClick={handleCopy}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={generateNew}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={generateNew} loading={loading} icon={<RefreshCw className="h-4 w-4" />}>
          Generate New
        </Button>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Bulk Generate</label>
        <div className="flex flex-wrap items-center gap-2">
          {[1, 5, 10, 50].map((n) => (
            <button
              key={n}
              onClick={() => setBulkCount(n)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                bulkCount === n
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {n}
            </button>
          ))}
          <Button size="sm" variant="outline" onClick={handleBulkGenerate} loading={loading}>
            Generate {bulkCount} UUID{bulkCount > 1 ? "s" : ""}
          </Button>
        </div>
      </div>

      {bulkResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Generated {bulkResult.length} UUIDs
            </span>
            <button
              onClick={handleCopyBulk}
              className="flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Copy className="h-3 w-3" />
              Copy All
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto rounded-xl border border-border bg-muted/30 p-3 space-y-1">
            {bulkResult.map((uuid, i) => (
              <pre key={i} className="text-xs font-mono text-foreground">
                {uuid}
              </pre>
            ))}
          </div>
        </motion.div>
      )}

      {history.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">History (last 10)</span>
            <button
              onClick={clearHistory}
              className="flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto rounded-xl border border-border bg-muted/30 p-3 space-y-1">
            {history.map((uuid, i) => (
              <div key={i} className="flex items-center justify-between gap-2 group">
                <code className="text-xs font-mono text-muted-foreground truncate">
                  {uuid}
                </code>
                <button
                  onClick={async () => {
                    await navigator.clipboard.writeText(uuid)
                    toast.success("Copied")
                  }}
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "@/components/ui/file-upload"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Download, Braces, Table, RotateCcw } from "lucide-react"

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n")
  if (lines.length < 2) throw new Error("CSV must have headers and at least one data row")

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""))

  const parseRow = (row: string): string[] => {
    const values: string[] = []
    let current = ""
    let inQuotes = false
    for (const char of row) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        values.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
    values.push(current.trim())
    return values
  }

  return lines.slice(1).map((line) => {
    if (!line.trim()) return null
    const values = parseRow(line)
    const row: Record<string, string> = {}
    headers.forEach((h, i) => {
      row[h] = (values[i] || "").replace(/^"|"$/g, "")
    })
    return row
  }).filter(Boolean) as Record<string, string>[]
}

export function CsvToJson() {
  const [input, setInput] = React.useState("")
  const [jsonOutput, setJsonOutput] = React.useState("")
  const [parsedData, setParsedData] = React.useState<Record<string, string>[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [useFileUpload, setUseFileUpload] = React.useState(true)

  const handleConvert = React.useCallback(() => {
    const source = useFileUpload ? null : input
    if (!useFileUpload && !input.trim()) {
      toast.error("Please paste CSV data")
      return
    }
    setLoading(true)
    setError(null)
    setTimeout(() => {
      try {
        const data = parseCsv(input)
        const formatted = JSON.stringify(data, null, 2)
        setJsonOutput(formatted)
        setParsedData(data)
        toast.success("Converted successfully")
        setLoading(false)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to parse CSV"
        setError(message)
        setJsonOutput("")
        setParsedData([])
        toast.error(message)
        setLoading(false)
      }
    }, 200)
  }, [input, useFileUpload])

  const handleCopy = React.useCallback(async () => {
    if (!jsonOutput) return
    try {
      await navigator.clipboard.writeText(jsonOutput)
      setCopied(true)
      toast.success("JSON copied")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [jsonOutput])

  const handleDownload = React.useCallback(() => {
    if (!jsonOutput) return
    const blob = new Blob([jsonOutput], { type: "application/json;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "data.json"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("JSON downloaded")
  }, [jsonOutput])

  const handleClear = React.useCallback(() => {
    setInput("")
    setJsonOutput("")
    setError(null)
    setParsedData([])
  }, [])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Table className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">CSV to JSON</h2>
          <p className="text-sm text-muted-foreground">
            Convert CSV data to JSON format
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={useFileUpload ? "primary" : "outline"}
          size="sm"
          onClick={() => setUseFileUpload(true)}
        >
          Upload File
        </Button>
        <Button
          variant={!useFileUpload ? "primary" : "outline"}
          size="sm"
          onClick={() => setUseFileUpload(false)}
        >
          Paste Text
        </Button>
      </div>

      {useFileUpload ? (
        <FileUpload
          accept={{
            "text/csv": [".csv"],
            "text/plain": [".txt"],
          }}
          onUpload={(files) => {
            const file = files[0]
            if (file) {
              const reader = new FileReader()
              reader.onload = (e) => {
                const text = e.target?.result as string
                setInput(text)
                setUseFileUpload(false)
              }
              reader.readAsText(file)
            }
          }}
          maxFiles={1}
        />
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">CSV Input</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="name,age,city&#10;John Doe,30,New York&#10;Jane Smith,25,London"
            rows={6}
            className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm font-mono transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleConvert} loading={loading} icon={<Braces className="h-4 w-4" />}>
          Convert to JSON
        </Button>
        {jsonOutput && (
          <>
            <Button variant="outline" onClick={handleCopy} icon={copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}>
              {copied ? "Copied" : "Copy JSON"}
            </Button>
            <Button variant="secondary" onClick={handleDownload} icon={<Download className="h-4 w-4" />}>
              Download JSON
            </Button>
            <Button variant="ghost" onClick={handleClear} icon={<RotateCcw className="h-4 w-4" />}>
              Clear
            </Button>
          </>
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

      {parsedData.length > 0 && !error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <Braces className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">JSON Output</span>
            <Badge variant="secondary" className="text-xs">{parsedData.length} items</Badge>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4 overflow-auto max-h-96">
            <pre className="whitespace-pre-wrap break-all text-sm font-mono">
              {(() => {
                const tokens: { value: string; color: string }[] = []
                const regex = /("(?:\\.|[^"\\])*")\s*:|("(?:\\.|[^"\\])*")|(true|false|null)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}[\],])|(\s+)/g
                let lastIndex = 0
                let match: RegExpExecArray | null
                while ((match = regex.exec(jsonOutput)) !== null) {
                  if (match.index > lastIndex) {
                    tokens.push({ value: jsonOutput.slice(lastIndex, match.index), color: "text-foreground" })
                  }
                  if (match[1]) {
                    tokens.push({ value: match[1], color: "text-blue-600 dark:text-blue-400" })
                    tokens.push({ value: ":", color: "text-muted-foreground" })
                  } else if (match[2]) {
                    tokens.push({ value: match[2], color: "text-emerald-600 dark:text-emerald-400" })
                  } else if (match[3]) {
                    tokens.push({ value: match[3], color: "text-violet-600 dark:text-violet-400" })
                  } else if (match[4]) {
                    tokens.push({ value: match[4], color: "text-amber-600 dark:text-amber-400" })
                  } else if (match[5]) {
                    tokens.push({ value: match[5], color: "text-muted-foreground" })
                  } else if (match[6]) {
                    tokens.push({ value: match[6], color: "text-foreground" })
                  }
                  lastIndex = match.index + match[0].length
                }
                if (lastIndex < jsonOutput.length) {
                  tokens.push({ value: jsonOutput.slice(lastIndex), color: "text-foreground" })
                }
                return tokens.map((t, i) => <span key={i} className={t.color}>{t.value}</span>)
              })()}
            </pre>
          </div>
        </motion.div>
      )}
    </Card>
  )
}

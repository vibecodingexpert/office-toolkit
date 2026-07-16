"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Download, Braces, Table, RotateCcw } from "lucide-react"

function jsonToCsv(json: string): string {
  const data = JSON.parse(json)
  const items = Array.isArray(data) ? data : [data]
  if (items.length === 0) return ""

  const headers = Array.from(
    new Set(items.flatMap((item: Record<string, unknown>) => Object.keys(item || {})))
  )

  const escapeCsv = (val: unknown): string => {
    if (val === null || val === undefined) return ""
    const str = String(val)
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const headerRow = headers.map(escapeCsv).join(",")
  const dataRows = items.map((item: Record<string, unknown>) =>
    headers.map((h) => escapeCsv(item?.[h])).join(",")
  )

  return [headerRow, ...dataRows].join("\n")
}

export function JsonToCsv() {
  const [input, setInput] = React.useState(
    JSON.stringify([
      { name: "John Doe", age: 30, city: "New York" },
      { name: "Jane Smith", age: 25, city: "London" },
    ], null, 2)
  )
  const [csvOutput, setCsvOutput] = React.useState("")
  const [parsedData, setParsedData] = React.useState<Record<string, unknown>[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const handleConvert = React.useCallback(() => {
    if (!input.trim()) {
      toast.error("Please enter JSON")
      return
    }
    setLoading(true)
    setError(null)
    setTimeout(() => {
      try {
        const csv = jsonToCsv(input)
        setCsvOutput(csv)
        const data = JSON.parse(input)
        const items = Array.isArray(data) ? data : [data]
        setParsedData(items as Record<string, unknown>[])
        toast.success("Converted successfully")
        setLoading(false)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Invalid JSON"
        setError(message)
        setCsvOutput("")
        setParsedData([])
        toast.error(message)
        setLoading(false)
      }
    }, 200)
  }, [input])

  const handleCopy = React.useCallback(async () => {
    if (!csvOutput) return
    try {
      await navigator.clipboard.writeText(csvOutput)
      setCopied(true)
      toast.success("CSV copied")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [csvOutput])

  const handleDownload = React.useCallback(() => {
    if (!csvOutput) return
    const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "data.csv"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("CSV downloaded")
  }, [csvOutput])

  const handleClear = React.useCallback(() => {
    setInput("")
    setCsvOutput("")
    setError(null)
    setParsedData([])
  }, [])

  const headers = parsedData.length > 0
    ? Array.from(new Set(parsedData.flatMap((item) => Object.keys(item))))
    : []

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Braces className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">JSON to CSV</h2>
          <p className="text-sm text-muted-foreground">
            Convert JSON data to CSV format
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">JSON Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='[{"key": "value"}]'
          rows={6}
          className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm font-mono transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleConvert} loading={loading} icon={<Table className="h-4 w-4" />}>
          Convert to CSV
        </Button>
        {csvOutput && (
          <>
            <Button variant="outline" onClick={handleCopy} icon={copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}>
              {copied ? "Copied" : "Copy CSV"}
            </Button>
            <Button variant="secondary" onClick={handleDownload} icon={<Download className="h-4 w-4" />}>
              Download CSV
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
            <Table className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Preview</span>
            <Badge variant="secondary" className="text-xs">{parsedData.length} rows</Badge>
          </div>
          <div className="rounded-xl border border-border overflow-auto max-h-72">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {headers.map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {parsedData.slice(0, 50).map((row, i) => (
                  <tr key={i} className="hover:bg-muted/20 transition-colors">
                    {headers.map((h) => (
                      <td key={h} className="px-4 py-2 text-sm text-foreground whitespace-nowrap">
                        {String(row[h] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedData.length > 50 && (
              <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border">
                Showing 50 of {parsedData.length} rows
              </div>
            )}
          </div>
        </motion.div>
      )}
    </Card>
  )
}

"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Download, SprayCan, RotateCcw, Filter } from "lucide-react"

interface CleaningOptions {
  removeExtraSpaces: boolean
  removeSpecialChars: boolean
  removeNumbers: boolean
  trimLines: boolean
  removeHtmlTags: boolean
  normalizeUnicode: boolean
}

interface CleaningSummary {
  originalLength: number
  cleanedLength: number
  spacesRemoved: number
  specialCharsRemoved: number
  numbersRemoved: number
  linesTrimmed: number
  tagsRemoved: number
}

function cleanText(text: string, options: CleaningOptions): { result: string; summary: CleaningSummary } {
  const summary: CleaningSummary = {
    originalLength: text.length,
    cleanedLength: 0,
    spacesRemoved: 0,
    specialCharsRemoved: 0,
    numbersRemoved: 0,
    linesTrimmed: 0,
    tagsRemoved: 0,
  }

  let result = text

  if (options.removeHtmlTags) {
    const before = result.length
    result = result.replace(/<[^>]*>/g, "")
    summary.tagsRemoved = before - result.length
  }

  if (options.removeNumbers) {
    const before = result.length
    result = result.replace(/[0-9]/g, "")
    summary.numbersRemoved = before - result.length
  }

  if (options.removeSpecialChars) {
    const before = result.length
    result = result.replace(/[^\w\s]/g, "")
    summary.specialCharsRemoved = before - result.length
  }

  if (options.normalizeUnicode) {
    result = result.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
  }

  if (options.trimLines) {
    const before = result.length
    result = result
      .split("\n")
      .map((line) => {
        const trimmed = line.trim()
        if (trimmed !== line) summary.linesTrimmed++
        return trimmed
      })
      .join("\n")
  }

  if (options.removeExtraSpaces) {
    const before = result.length
    result = result.replace(/  +/g, " ").replace(/^\s+|\s+$/gm, "").replace(/\n{3,}/g, "\n\n")
    summary.spacesRemoved = before - result.length
  }

  summary.cleanedLength = result.length
  return { result, summary }
}

export function TextCleaner() {
  const [input, setInput] = React.useState("")
  const [output, setOutput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [summary, setSummary] = React.useState<CleaningSummary | null>(null)
  const [options, setOptions] = React.useState<CleaningOptions>({
    removeExtraSpaces: true,
    removeSpecialChars: false,
    removeNumbers: false,
    trimLines: true,
    removeHtmlTags: false,
    normalizeUnicode: false,
  })

  const toggleOption = (key: keyof CleaningOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleClean = React.useCallback(() => {
    if (!input.trim()) {
      toast.error("Please enter text to clean")
      return
    }
    setLoading(true)
    setTimeout(() => {
      const { result, summary: s } = cleanText(input, options)
      setOutput(result)
      setSummary(s)
      setLoading(false)
      toast.success("Text cleaned")
    }, 200)
  }, [input, options])

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
    a.download = "cleaned.txt"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Downloaded")
  }, [output])

  const handleClear = React.useCallback(() => {
    setInput("")
    setOutput("")
    setSummary(null)
  }, [])

  const optionLabels: Record<keyof CleaningOptions, string> = {
    removeExtraSpaces: "Remove Extra Spaces",
    removeSpecialChars: "Remove Special Characters",
    removeNumbers: "Remove Numbers",
    trimLines: "Trim Lines",
    removeHtmlTags: "Remove HTML Tags",
    normalizeUnicode: "Normalize Unicode",
  }

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <SprayCan className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Text Cleaner</h2>
          <p className="text-sm text-muted-foreground">
            Clean and format text with various options
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Text Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste text to clean..."
          rows={6}
          className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Cleaning Options</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(Object.keys(options) as (keyof CleaningOptions)[]).map((key) => (
            <label
              key={key}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 cursor-pointer hover:bg-accent transition-colors text-sm"
            >
              <input
                type="checkbox"
                checked={options[key]}
                onChange={() => toggleOption(key)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
              />
              <span className="text-foreground">{optionLabels[key]}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleClean} loading={loading} icon={<Filter className="h-4 w-4" />}>
          Clean Text
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

      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Cleaning Summary</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {summary.spacesRemoved > 0 && (
              <Badge variant="secondary">Spaces removed: {summary.spacesRemoved}</Badge>
            )}
            {summary.specialCharsRemoved > 0 && (
              <Badge variant="secondary">Special chars removed: {summary.specialCharsRemoved}</Badge>
            )}
            {summary.numbersRemoved > 0 && (
              <Badge variant="secondary">Numbers removed: {summary.numbersRemoved}</Badge>
            )}
            {summary.linesTrimmed > 0 && (
              <Badge variant="secondary">Lines trimmed: {summary.linesTrimmed}</Badge>
            )}
            {summary.tagsRemoved > 0 && (
              <Badge variant="secondary">HTML tags removed: {summary.tagsRemoved}</Badge>
            )}
            <Badge variant="default">
              {summary.originalLength} → {summary.cleanedLength} chars
            </Badge>
          </div>
        </motion.div>
      )}

      {output && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <label className="text-sm font-medium text-foreground">Cleaned Output</label>
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

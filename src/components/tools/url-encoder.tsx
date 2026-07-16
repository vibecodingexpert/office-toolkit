"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Link, RotateCcw } from "lucide-react"

export function UrlEncoder() {
  const [input, setInput] = React.useState("")
  const [output, setOutput] = React.useState("")
  const [mode, setMode] = React.useState<"encode" | "decode">("encode")
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleProcess = React.useCallback(() => {
    if (!input.trim()) {
      toast.error("Please enter text to process")
      return
    }
    setLoading(true)
    setError(null)
    setTimeout(() => {
      try {
        const result =
          mode === "encode"
            ? encodeURIComponent(input)
            : decodeURIComponent(input)
        setOutput(result)
        setLoading(false)
      } catch {
        setError(
          mode === "decode"
            ? "Invalid URL-encoded string"
            : "Failed to encode text"
        )
        toast.error(
          mode === "decode"
            ? "Invalid URL-encoded string"
            : "Failed to encode text"
        )
        setLoading(false)
      }
    }, 200)
  }, [input, mode])

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

  const toggleMode = React.useCallback(() => {
    setMode((prev) => (prev === "encode" ? "decode" : "encode"))
    setOutput("")
    setError(null)
  }, [])

  const handleClear = React.useCallback(() => {
    setInput("")
    setOutput("")
    setError(null)
  }, [])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Link className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">URL Encoder / Decoder</h2>
          <p className="text-sm text-muted-foreground">
            Encode or decode URL-encoded strings
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex rounded-xl bg-muted p-1">
          <button
            onClick={() => { setMode("encode"); setOutput(""); setError(null) }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              mode === "encode"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => { setMode("decode"); setOutput(""); setError(null) }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              mode === "decode"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Decode
          </button>
        </div>
        <span className="text-xs text-muted-foreground">
          {mode === "encode"
            ? "Convert text to URL-safe format"
            : "Convert URL-encoded text back to normal"}
        </span>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {mode === "encode" ? "Text to Encode" : "URL-Encoded Text to Decode"}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "encode"
              ? "Enter text to URL encode..."
              : "Enter URL-encoded string..."
          }
          rows={5}
          className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleProcess}
          loading={loading}
          icon={<Link className="h-4 w-4" />}
        >
          {mode === "encode" ? "Encode" : "Decode"}
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
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {error}
        </motion.div>
      )}

      {output && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              {mode === "encode" ? "Encoded" : "Decoded"} Output
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
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <pre className="whitespace-pre-wrap break-all text-sm text-foreground">
              {output}
            </pre>
          </div>
        </motion.div>
      )}
    </Card>
  )
}

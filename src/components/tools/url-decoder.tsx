"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Link, RotateCcw, ArrowLeftRight } from "lucide-react"

export function UrlDecoder() {
  const [input, setInput] = React.useState("")
  const [output, setOutput] = React.useState("")
  const [mode, setMode] = React.useState<"encode" | "decode">("decode")
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const handleProcess = React.useCallback(() => {
    if (!input.trim()) {
      toast.error("Please enter a URL to process")
      return
    }
    setLoading(true)
    setTimeout(() => {
      try {
        const result = mode === "encode"
          ? encodeURIComponent(input)
          : decodeURIComponent(input)
        setOutput(result)
        setLoading(false)
      } catch {
        toast.error(`Failed to ${mode} URL`)
        setLoading(false)
      }
    }, 150)
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

  const handleClear = React.useCallback(() => {
    setInput("")
    setOutput("")
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

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setMode("encode"); setOutput("") }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "encode"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          Encode
        </button>
        <button
          onClick={() => { setMode("decode"); setOutput("") }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            mode === "decode"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          Decode
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          {mode === "encode" ? "Text to Encode" : "URL-encoded Input"}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "encode"
              ? "https://example.com/?q=hello world"
              : "https%3A%2F%2Fexample.com%2F%3Fq%3Dhello%20world"
          }
          rows={4}
          className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm font-mono transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleProcess}
          loading={loading}
          icon={<ArrowLeftRight className="h-4 w-4" />}
        >
          {mode === "encode" ? "Encode" : "Decode"}
        </Button>
        {input && (
          <Button variant="ghost" onClick={handleClear} icon={<RotateCcw className="h-4 w-4" />}>
            Clear
          </Button>
        )}
      </div>

      {output && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              {mode === "encode" ? "Encoded Output" : "Decoded Output"}
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
          <div className="rounded-xl border border-border bg-muted/30 p-4 overflow-auto max-h-32 break-all">
            <pre className="whitespace-pre-wrap break-all text-sm text-foreground font-mono">
              {output}
            </pre>
          </div>
        </motion.div>
      )}
    </Card>
  )
}

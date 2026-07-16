"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Terminal, Plus, Trash2, RotateCcw } from "lucide-react"

interface Header {
  key: string
  value: string
}

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const

const METHOD_COLORS: Record<string, string> = {
  GET: "text-emerald-600 dark:text-emerald-400",
  POST: "text-blue-600 dark:text-blue-400",
  PUT: "text-amber-600 dark:text-amber-400",
  DELETE: "text-red-600 dark:text-red-400",
  PATCH: "text-violet-600 dark:text-violet-400",
}

export function CurlGenerator() {
  const [method, setMethod] = React.useState<string>("GET")
  const [url, setUrl] = React.useState("")
  const [headers, setHeaders] = React.useState<Header[]>([{ key: "", value: "" }])
  const [body, setBody] = React.useState("")
  const [output, setOutput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const addHeader = React.useCallback(() => {
    setHeaders((prev) => [...prev, { key: "", value: "" }])
  }, [])

  const removeHeader = React.useCallback((index: number) => {
    setHeaders((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const updateHeader = React.useCallback(
    (index: number, field: "key" | "value", value: string) => {
      setHeaders((prev) =>
        prev.map((h, i) => (i === index ? { ...h, [field]: value } : h))
      )
    },
    []
  )

  const handleGenerate = React.useCallback(() => {
    if (!url.trim()) {
      toast.error("Please enter a URL")
      return
    }
    setLoading(true)
    setTimeout(() => {
      try {
        let curl = `curl -X ${method}`
        curl += ` \\\n  "${url.trim()}"`

        const validHeaders = headers.filter((h) => h.key.trim())
        for (const h of validHeaders) {
          curl += ` \\\n  -H "${h.key.trim()}: ${h.value.trim()}"`
        }

        if ((method === "POST" || method === "PUT" || method === "PATCH") && body.trim()) {
          curl += ` \\\n  -d '${body.trim()}'`
        }

        setOutput(curl)
        setLoading(false)
      } catch {
        toast.error("Failed to generate curl command")
        setLoading(false)
      }
    }, 200)
  }, [method, url, headers, body])

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
    setUrl("")
    setHeaders([{ key: "", value: "" }])
    setBody("")
    setOutput("")
  }, [])

  const showBody = method === "POST" || method === "PUT" || method === "PATCH"

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Terminal className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">cURL Generator</h2>
          <p className="text-sm text-muted-foreground">
            Generate cURL commands with an interactive builder
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">HTTP Method</label>
        <div className="flex flex-wrap gap-2">
          {METHODS.map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`rounded-lg px-4 py-2 text-sm font-mono font-bold transition-colors ${
                method === m
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <Input
        label="URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://api.example.com/endpoint"
        icon={<Terminal className="h-4 w-4" />}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Headers</label>
          <button
            onClick={addHeader}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Header
          </button>
        </div>
        <div className="space-y-2">
          {headers.map((header, index) => (
            <div key={index} className="flex gap-2 items-start">
              <input
                value={header.key}
                onChange={(e) => updateHeader(index, "key", e.target.value)}
                placeholder="Header name"
                className="flex-1 h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                value={header.value}
                onChange={(e) => updateHeader(index, "value", e.target.value)}
                placeholder="Value"
                className="flex-1 h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                onClick={() => removeHeader(index)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                disabled={headers.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {showBody && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Request Body</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder='{"key": "value"}'
            rows={4}
            className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm font-mono transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleGenerate}
          loading={loading}
          icon={<Terminal className="h-4 w-4" />}
        >
          Generate cURL
        </Button>
        {(url || output) && (
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
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-foreground">cURL Command</label>
              <span className={`text-xs font-mono font-bold ${METHOD_COLORS[method]}`}>
                {method}
              </span>
            </div>
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
          <div className="rounded-xl border border-border bg-zinc-950 dark:bg-zinc-900 p-4 overflow-auto max-h-96">
            <pre className="whitespace-pre-wrap break-all text-sm font-mono text-green-400 leading-relaxed">
              {output}
            </pre>
          </div>
        </motion.div>
      )}
    </Card>
  )
}

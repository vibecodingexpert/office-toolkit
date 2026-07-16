"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { Copy, Check, RotateCcw, KeyRound } from "lucide-react"

interface JwtParts {
  header: string
  payload: string
  signature: string
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = React.useState(false)
  const handleCopy = async () => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(`${label} copied`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }
  return (
    <button
      onClick={handleCopy}
      className="flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-500" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          Copy
        </>
      )}
    </button>
  )
}

export function JwtDecoder() {
  const [input, setInput] = React.useState("")
  const [decoded, setDecoded] = React.useState<JwtParts | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleDecode = React.useCallback(() => {
    if (!input.trim()) {
      toast.error("Please enter a JWT token")
      return
    }
    setLoading(true)
    setError(null)
    setTimeout(() => {
      try {
        const parts = input.trim().split(".")
        if (parts.length !== 3) {
          throw new Error("Invalid JWT: must have 3 parts")
        }
        const header = JSON.stringify(
          JSON.parse(atob(parts[0])),
          null,
          2
        )
        const payload = JSON.stringify(
          JSON.parse(atob(parts[1])),
          null,
          2
        )
        setDecoded({ header, payload, signature: parts[2] })
        setLoading(false)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Invalid JWT token"
        setError(message)
        toast.error(message)
        setLoading(false)
      }
    }, 200)
  }, [input])

  const handleClear = React.useCallback(() => {
    setInput("")
    setDecoded(null)
    setError(null)
  }, [])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <KeyRound className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">JWT Decoder</h2>
          <p className="text-sm text-muted-foreground">
            Decode JSON Web Tokens and inspect their contents
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">JWT Token</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your JWT token here..."
          rows={4}
          className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30 font-mono"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleDecode} loading={loading} icon={<KeyRound className="h-4 w-4" />}>
          Decode
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

      {decoded && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Header</span>
              <CopyButton text={decoded.header} label="Header" />
            </div>
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
              <pre className="whitespace-pre-wrap break-all text-sm text-foreground">
                {decoded.header}
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Payload</span>
              <CopyButton text={decoded.payload} label="Payload" />
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <pre className="whitespace-pre-wrap break-all text-sm text-foreground">
                {decoded.payload}
              </pre>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Signature</span>
              <CopyButton text={decoded.signature} label="Signature" />
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
              <pre className="whitespace-pre-wrap break-all text-sm text-foreground font-mono">
                {decoded.signature}
              </pre>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  )
}

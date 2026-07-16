"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import {
  Key,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Download,
  Plus,
} from "lucide-react"

function generateSecret(length: number, format: "hex" | "base64" | "alphanumeric"): string {
  const bytes = new Uint8Array(Math.ceil(length * 1.5))
  crypto.getRandomValues(bytes)

  if (format === "hex") {
    return Array.from(bytes.slice(0, Math.ceil(length / 2)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, length)
  }

  if (format === "base64") {
    let binary = ""
    bytes.forEach((b) => { binary += String.fromCharCode(b) })
    return btoa(binary).replace(/[+/=]/g, "").slice(0, length)
  }

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length]
  }
  return result
}

export function SecretGenerator() {
  const [secrets, setSecrets] = React.useState<string[]>([])
  const [length, setLength] = React.useState<16 | 32 | 64 | 128>(32)
  const [format, setFormat] = React.useState<"hex" | "base64" | "alphanumeric">("hex")
  const [count, setCount] = React.useState(1)
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null)
  const [visible, setVisible] = React.useState(false)

  const generate = React.useCallback(() => {
    const generated: string[] = []
    for (let i = 0; i < count; i++) {
      generated.push(generateSecret(length, format))
    }
    setSecrets(generated)
  }, [length, format, count])

  React.useEffect(() => { generate() }, [])

  const handleCopy = async (secret: string, index: number) => {
    try {
      await navigator.clipboard.writeText(secret)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch {}
  }

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(secrets.join("\n"))
    } catch {}
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
          <Key className="h-5 w-5 text-cyan-500" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Secret Generator</h2>
          <p className="text-sm text-muted-foreground">Generate cryptographic secret keys</p>
        </div>
      </div>

      {/* Options */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Key Length</label>
          <div className="grid grid-cols-4 gap-3">
            {([16, 32, 64, 128] as const).map((n) => (
              <button
                key={n}
                onClick={() => setLength(n)}
                className={cn(
                  "p-3 rounded-xl border text-sm font-medium transition-colors",
                  length === n
                    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-500"
                    : "border-border text-muted-foreground hover:bg-accent/50"
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Format</label>
          <div className="grid grid-cols-3 gap-3">
            {(["hex", "base64", "alphanumeric"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={cn(
                  "p-3 rounded-xl border text-sm font-medium capitalize transition-colors",
                  format === f
                    ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-500"
                    : "border-border text-muted-foreground hover:bg-accent/50"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Number of Keys: {count}</label>
          <input
            type="range"
            min={1}
            max={10}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full h-2 rounded-full bg-muted appearance-none cursor-pointer accent-cyan-500"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>
      </div>

      {/* Generated secrets */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Generated Keys</span>
          <div className="flex gap-2">
            <button
              onClick={() => setVisible(!visible)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {visible ? "Hide" : "Show"}
            </button>
            <button
              onClick={copyAll}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy all
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <AnimatePresence mode="wait">
            {secrets.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-8 text-sm text-muted-foreground"
              >
                Click generate to create secrets
              </motion.div>
            ) : (
              secrets.map((secret, i) => (
                <motion.div
                  key={`${secret}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 hover:border-primary/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    {visible ? (
                      <code className="select-all text-sm font-mono text-foreground break-all">{secret}</code>
                    ) : (
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(secret.length, 32) }).map((_, j) => (
                          <span key={j} className="inline-block w-2 h-4 rounded-sm bg-muted-foreground/30" />
                        ))}
                        {secret.length > 32 && (
                          <span className="text-sm text-muted-foreground">...</span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => handleCopy(secret, i)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      {copiedIndex === i ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={generate}
          className="flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 transition-colors text-sm font-medium"
        >
          <RefreshCw className="h-4 w-4" />
          Regenerate Keys
        </button>
      </div>
    </div>
  )
}

"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Key, RotateCcw, Unlock, Lock } from "lucide-react"

function base64url(str: string): string {
  return btoa(str).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_")
}

function base64urlDecode(str: string): string {
  try {
    return atob(str.replace(/-/g, "+").replace(/_/g, "/"))
  } catch {
    return ""
  }
}

async function hmacSha256(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message))
  const bytes = Array.from(new Uint8Array(sig))
  const binary = bytes.map((b) => String.fromCharCode(b)).join("")
  return base64url(binary)
}

function decodeJwt(token: string): { header: string; payload: string; signature: string } | null {
  const parts = token.split(".")
  if (parts.length !== 3) return null
  return {
    header: base64urlDecode(parts[0]),
    payload: base64urlDecode(parts[1]),
    signature: parts[2],
  }
}

export function JwtGenerator() {
  const [headerJson, setHeaderJson] = React.useState(JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2))
  const [payloadJson, setPayloadJson] = React.useState(JSON.stringify({ sub: "1234567890", name: "John Doe", iat: Math.floor(Date.now() / 1000) }, null, 2))
  const [secret, setSecret] = React.useState("my-secret-key")
  const [output, setOutput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const [decodeToken, setDecodeToken] = React.useState("")
  const [decodedResult, setDecodedResult] = React.useState<{ header: string; payload: string; signature: string } | null>(null)

  const handleGenerate = React.useCallback(async () => {
    try {
      JSON.parse(headerJson)
      JSON.parse(payloadJson)
    } catch {
      toast.error("Invalid JSON in header or payload")
      return
    }
    if (!secret.trim()) {
      toast.error("Please enter a secret key")
      return
    }
    setLoading(true)
    try {
      const header = base64url(headerJson)
      const payload = base64url(payloadJson)
      const message = `${header}.${payload}`
      const signature = await hmacSha256(message, secret)
      setOutput(`${message}.${signature}`)
      setLoading(false)
    } catch {
      toast.error("Failed to generate JWT")
      setLoading(false)
    }
  }, [headerJson, payloadJson, secret])

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

  const handleDecode = React.useCallback(() => {
    if (!decodeToken.trim()) {
      toast.error("Please enter a JWT token to decode")
      return
    }
    const result = decodeJwt(decodeToken.trim())
    if (!result) {
      toast.error("Invalid JWT token format")
      setDecodedResult(null)
      return
    }
    setDecodedResult(result)
  }, [decodeToken])

  const handleClear = React.useCallback(() => {
    setOutput("")
  }, [])

  const prettyPrint = (str: string) => {
    try {
      return JSON.stringify(JSON.parse(str), null, 2)
    } catch {
      return str
    }
  }

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Key className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">JWT Generator</h2>
          <p className="text-sm text-muted-foreground">
            Generate and decode JSON Web Tokens
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Header (JSON)</label>
          <textarea
            value={headerJson}
            onChange={(e) => setHeaderJson(e.target.value)}
            rows={4}
            className="w-full resize-y rounded-xl border border-border bg-background p-3 text-xs text-foreground placeholder-muted-foreground shadow-sm font-mono transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Payload (JSON)</label>
          <textarea
            value={payloadJson}
            onChange={(e) => setPayloadJson(e.target.value)}
            rows={4}
            className="w-full resize-y rounded-xl border border-border bg-background p-3 text-xs text-foreground placeholder-muted-foreground shadow-sm font-mono transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
      </div>

      <Input
        label="Secret Key"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
        placeholder="Enter your secret key"
        icon={<Key className="h-4 w-4" />}
      />

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleGenerate} loading={loading} icon={<Lock className="h-4 w-4" />}>
          Generate JWT
        </Button>
        {output && (
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
            <label className="text-sm font-medium text-foreground">Generated JWT</label>
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
          <div className="rounded-xl border border-border bg-zinc-950 dark:bg-zinc-900 p-4 overflow-auto max-h-32 break-all">
            <pre className="whitespace-pre-wrap break-all text-sm font-mono text-green-400 leading-relaxed">
              {output}
            </pre>
          </div>
        </motion.div>
      )}

      <hr className="border-border" />

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Unlock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Decode JWT</h3>
            <p className="text-xs text-muted-foreground">
              Paste a JWT token to decode its header and payload
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <textarea
            value={decodeToken}
            onChange={(e) => setDecodeToken(e.target.value)}
            placeholder="Paste JWT token here..."
            rows={2}
            className="w-full resize-y rounded-xl border border-border bg-background p-3 text-xs text-foreground placeholder-muted-foreground shadow-sm font-mono transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <Button variant="secondary" onClick={handleDecode} icon={<Unlock className="h-4 w-4" />}>
          Decode
        </Button>

        {decodedResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Header</label>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <pre className="whitespace-pre-wrap text-xs font-mono text-foreground">
                  {prettyPrint(decodedResult.header)}
                </pre>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Payload</label>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <pre className="whitespace-pre-wrap text-xs font-mono text-foreground">
                  {prettyPrint(decodedResult.payload)}
                </pre>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Signature</label>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <pre className="whitespace-pre-wrap break-all text-xs font-mono text-muted-foreground">
                  {decodedResult.signature}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </Card>
  )
}

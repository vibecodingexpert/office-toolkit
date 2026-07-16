"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Fingerprint, RotateCcw } from "lucide-react"

type HashType = "MD5" | "SHA1" | "SHA256" | "SHA512"

async function hashString(algorithm: string, text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest(algorithm, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

const hashAlgorithms: HashType[] = ["MD5", "SHA1", "SHA256", "SHA512"]

export function HashGenerator() {
  const [input, setInput] = React.useState("")
  const [selectedType, setSelectedType] = React.useState<HashType>("SHA256")
  const [output, setOutput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const handleGenerate = React.useCallback(async () => {
    if (!input.trim()) {
      toast.error("Please enter text to hash")
      return
    }
    setLoading(true)
    try {
      const algorithmMap: Record<HashType, string> = {
        MD5: "MD5",
        SHA1: "SHA-1",
        SHA256: "SHA-256",
        SHA512: "SHA-512",
      }
      const hash = await hashString(algorithmMap[selectedType], input)
      setOutput(hash)
      setLoading(false)
    } catch {
      toast.error("Failed to generate hash")
      setLoading(false)
    }
  }, [input, selectedType])

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
          <Fingerprint className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Hash Generator</h2>
          <p className="text-sm text-muted-foreground">
            Generate cryptographic hashes from text
          </p>
        </div>
      </div>

      <Input
        label="Text Input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter text to hash..."
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Hash Algorithm</label>
        <div className="flex flex-wrap gap-2">
          {hashAlgorithms.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                selectedType === type
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleGenerate} loading={loading} icon={<Fingerprint className="h-4 w-4" />}>
          Generate Hash
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
            <div>
              <span className="text-sm font-medium text-foreground">{selectedType} Hash</span>
              <span className="ml-2 text-xs text-muted-foreground">
                ({output.length * 4} bits)
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
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <pre className="whitespace-pre-wrap break-all text-sm font-mono text-foreground">
              {output}
            </pre>
          </div>
        </motion.div>
      )}
    </Card>
  )
}

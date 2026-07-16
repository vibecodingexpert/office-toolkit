"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Shuffle, RotateCcw } from "lucide-react"

type RandomType = "number" | "string" | "boolean" | "array" | "mixed"

const CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;':\",./<>?"

function generateNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateString(length: number): string {
  let result = ""
  for (let i = 0; i < length; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)]
  }
  return result
}

function generateMixed(length: number): string {
  const pool = CHARS + SYMBOLS
  let result = ""
  for (let i = 0; i < length; i++) {
    result += pool[Math.floor(Math.random() * pool.length)]
  }
  return result
}

export function RandomGenerator() {
  const [type, setType] = React.useState<RandomType>("number")
  const [minVal, setMinVal] = React.useState(1)
  const [maxVal, setMaxVal] = React.useState(100)
  const [stringLength, setStringLength] = React.useState(10)
  const [count, setCount] = React.useState(5)
  const [output, setOutput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const handleGenerate = React.useCallback(() => {
    setLoading(true)
    setTimeout(() => {
      try {
        const results: string[] = []
        for (let i = 0; i < count; i++) {
          switch (type) {
            case "number":
              results.push(String(generateNumber(minVal, maxVal)))
              break
            case "string":
              results.push(generateString(stringLength))
              break
            case "boolean":
              results.push(Math.random() > 0.5 ? "true" : "false")
              break
            case "array":
              results.push(JSON.stringify(
                Array.from({ length: stringLength }, () => generateNumber(minVal, maxVal))
              ))
              break
            case "mixed":
              results.push(generateMixed(stringLength))
              break
          }
        }
        setOutput(results.join("\n"))
        setLoading(false)
      } catch {
        toast.error("Failed to generate random values")
        setLoading(false)
      }
    }, 150)
  }, [type, minVal, maxVal, stringLength, count])

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

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Shuffle className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Random Generator</h2>
          <p className="text-sm text-muted-foreground">
            Generate random numbers, strings, and more
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Type</label>
        <div className="flex flex-wrap gap-2">
          {(["number", "string", "boolean", "array", "mixed"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                type === t
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(type === "number" || type === "array") && (
          <>
            <Input
              label="Min Value"
              type="number"
              value={minVal}
              onChange={(e) => setMinVal(Number(e.target.value))}
            />
            <Input
              label="Max Value"
              type="number"
              value={maxVal}
              onChange={(e) => setMaxVal(Number(e.target.value))}
            />
          </>
        )}
        {(type === "string" || type === "array" || type === "mixed") && (
          <Input
            label={type === "array" ? "Array Length" : "String Length"}
            type="number"
            value={stringLength}
            onChange={(e) => setStringLength(Math.min(1000, Math.max(1, Number(e.target.value))))}
          />
        )}
        <Input
          label="Count (1-100)"
          type="number"
          value={count}
          onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value))))}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleGenerate} loading={loading} icon={<Shuffle className="h-4 w-4" />}>
          Generate
        </Button>
      </div>

      {output && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Generated Values
              <span className="ml-2 text-xs text-muted-foreground">
                ({output.split("\n").length} items)
              </span>
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
          <div className="rounded-xl border border-border bg-muted/30 p-4 overflow-auto max-h-64">
            <pre className="whitespace-pre-wrap text-sm font-mono text-foreground">
              {output}
            </pre>
          </div>
        </motion.div>
      )}
    </Card>
  )
}

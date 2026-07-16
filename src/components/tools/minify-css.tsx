"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Minimize2, RotateCcw } from "lucide-react"

function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s*([{}:;,])\s*/g, "$1")
    .replace(/;\s*}/g, "}")
    .replace(/\s+/g, " ")
    .replace(/\n/g, "")
    .replace(/\r/g, "")
    .trim()
}

export function MinifyCss() {
  const [input, setInput] = React.useState("")
  const [output, setOutput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const originalSize = new Blob([input]).size
  const minifiedSize = new Blob([output]).size
  const savings = originalSize > 0 ? ((originalSize - minifiedSize) / originalSize * 100).toFixed(1) : 0

  const handleMinify = React.useCallback(() => {
    if (!input.trim()) {
      toast.error("Please enter CSS to minify")
      return
    }
    setLoading(true)
    setTimeout(() => {
      try {
        const result = minifyCss(input)
        setOutput(result)
        setLoading(false)
      } catch {
        toast.error("Failed to minify CSS")
        setLoading(false)
      }
    }, 200)
  }, [input])

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
          <Minimize2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Minify CSS</h2>
          <p className="text-sm text-muted-foreground">
            Minimize2 CSS by removing whitespace and comments
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">CSS Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder=".container { width: 100%; padding: 20px; }"
          rows={7}
          className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm font-mono transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleMinify} loading={loading} icon={<Minimize2 className="h-4 w-4" />}>
          Minify
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
          className="space-y-4"
        >
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
              <div className="text-lg font-bold text-foreground">
                {originalSize.toLocaleString()} B
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Original</div>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
              <div className="text-lg font-bold text-emerald-500">
                {minifiedSize.toLocaleString()} B
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Minified</div>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
              <div className="text-lg font-bold text-primary">{savings}%</div>
              <div className="mt-1 text-xs text-muted-foreground">Saved</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">Minified Output</label>
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
          <div className="rounded-xl border border-border bg-zinc-950 dark:bg-zinc-900 p-4 overflow-auto max-h-64">
            <pre className="whitespace-pre-wrap break-all text-sm font-mono text-yellow-400 leading-relaxed">
              {output}
            </pre>
          </div>
        </motion.div>
      )}
    </Card>
  )
}

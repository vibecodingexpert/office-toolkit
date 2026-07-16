"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Link, RotateCcw } from "lucide-react"

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function SlugGenerator() {
  const [input, setInput] = React.useState("")
  const [slug, setSlug] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  const handleChange = React.useCallback((value: string) => {
    setInput(value)
    setSlug(generateSlug(value))
  }, [])

  const handleClear = React.useCallback(() => {
    setInput("")
    setSlug("")
  }, [])

  const handleCopy = React.useCallback(async () => {
    if (!slug) return
    try {
      await navigator.clipboard.writeText(slug)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [slug])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Link className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Slug Generator</h2>
          <p className="text-sm text-muted-foreground">
            Generate URL-friendly slugs from any text
          </p>
        </div>
      </div>

      <Input
        label="Input Text"
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="e.g., My Awesome Blog Post Title!"
        icon={<Link className="h-4 w-4" />}
      />

      <div className="flex flex-wrap gap-3">
        {input && (
          <Button variant="ghost" onClick={handleClear} icon={<RotateCcw className="h-4 w-4" />}>
            Clear
          </Button>
        )}
      </div>

      {slug && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Slug Preview</label>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-4 py-3">
              <span className="text-xs text-muted-foreground font-mono">/</span>
              <span className="text-sm font-mono text-foreground break-all flex-1">
                {slug}
              </span>
              <button
                onClick={handleCopy}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
              <div className="text-lg font-bold text-foreground">{slug.length}</div>
              <div className="mt-1 text-xs text-muted-foreground">Characters</div>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
              <div className="text-lg font-bold text-foreground">
                {slug.split("-").length}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Words</div>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
              <div className="text-lg font-bold text-foreground">
                {slug.split("-").length > 0 ? slug.split("-").length - 1 : 0}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Hyphens</div>
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  )
}

"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { Copy, Check, CaseSensitive, RotateCcw, Trash2 } from "lucide-react"

type CaseType =
  | "uppercase"
  | "lowercase"
  | "title"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab"
  | "constant"

const caseOptions: { id: CaseType; label: string; example: string }[] = [
  { id: "uppercase", label: "UPPERCASE", example: "HELLO WORLD" },
  { id: "lowercase", label: "lowercase", example: "hello world" },
  { id: "title", label: "Title Case", example: "Hello World" },
  { id: "camel", label: "camelCase", example: "helloWorld" },
  { id: "pascal", label: "PascalCase", example: "HelloWorld" },
  { id: "snake", label: "snake_case", example: "hello_world" },
  { id: "kebab", label: "kebab-case", example: "hello-world" },
  { id: "constant", label: "CONSTANT_CASE", example: "HELLO_WORLD" },
]

function convertCase(text: string, type: CaseType): string {
  const words = text.match(/[a-zA-Z0-9]+/g) || []

  switch (type) {
    case "uppercase":
      return text.toUpperCase()
    case "lowercase":
      return text.toLowerCase()
    case "title":
      return text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    case "camel":
      return words
        .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
        .join("")
    case "pascal":
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("")
    case "snake":
      return words.join("_").toLowerCase()
    case "kebab":
      return words.join("-").toLowerCase()
    case "constant":
      return words.join("_").toUpperCase()
  }
}

export function CaseConverter() {
  const [input, setInput] = React.useState("")
  const [activeCase, setActiveCase] = React.useState<CaseType | null>(null)
  const [output, setOutput] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  const handleConvert = React.useCallback(
    (type: CaseType) => {
      if (!input.trim()) {
        toast.error("Please enter text to convert")
        return
      }
      const result = convertCase(input, type)
      setOutput(result)
      setActiveCase(type)
    },
    [input]
  )

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
    setActiveCase(null)
  }, [])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <CaseSensitive className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Case Converter</h2>
          <p className="text-sm text-muted-foreground">
            Convert text between different letter cases
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Text Input</label>
        <textarea
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            if (activeCase) {
              setOutput(convertCase(e.target.value, activeCase))
            }
          }}
          placeholder="Type or paste text to convert..."
          rows={4}
          className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {caseOptions.map((option) => (
          <Button
            key={option.id}
            variant={activeCase === option.id ? "primary" : "outline"}
            size="sm"
            onClick={() => handleConvert(option.id)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {output && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Converted ({caseOptions.find((c) => c.id === activeCase)?.label})
            </label>
            <div className="flex gap-2">
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
              <button
                onClick={handleClear}
                className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4 overflow-auto">
            <pre className="whitespace-pre-wrap break-all text-sm text-foreground font-mono">
              {output}
            </pre>
          </div>
        </motion.div>
      )}
    </Card>
  )
}

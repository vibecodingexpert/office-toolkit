"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { Copy, Check, FileDiff, RotateCcw } from "lucide-react"

interface DiffLine {
  type: "equal" | "added" | "removed"
  leftNum: number | null
  rightNum: number | null
  text: string
}

function computeDiff(left: string, right: string): DiffLine[] {
  const leftLines = left.split("\n")
  const rightLines = right.split("\n")

  const dp: number[][] = Array.from({ length: leftLines.length + 1 }, () =>
    Array(rightLines.length + 1).fill(0)
  )

  for (let i = 1; i <= leftLines.length; i++) {
    for (let j = 1; j <= rightLines.length; j++) {
      if (leftLines[i - 1] === rightLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  const result: DiffLine[] = []
  let i = leftLines.length
  let j = rightLines.length
  const temp: DiffLine[] = []

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
      temp.push({
        type: "equal",
        leftNum: i,
        rightNum: j,
        text: leftLines[i - 1],
      })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      temp.push({
        type: "added",
        leftNum: null,
        rightNum: j,
        text: rightLines[j - 1],
      })
      j--
    } else if (i > 0) {
      temp.push({
        type: "removed",
        leftNum: i,
        rightNum: null,
        text: leftLines[i - 1],
      })
      i--
    }
  }

  return temp.reverse()
}

function DiffLineRow({ line }: { line: DiffLine }) {
  const bgColor =
    line.type === "added"
      ? "bg-emerald-500/10 border-l-emerald-500"
      : line.type === "removed"
      ? "bg-destructive/10 border-l-destructive"
      : "border-l-transparent"

  const textColor =
    line.type === "added"
      ? "text-emerald-700 dark:text-emerald-300"
      : line.type === "removed"
      ? "text-red-700 dark:text-red-300"
      : "text-foreground"

  return (
    <div
      className={`flex border-l-2 ${bgColor} transition-colors`}
    >
      <div className="flex w-20 shrink-0 border-r border-border bg-muted/50 text-xs text-muted-foreground font-mono">
        <span className="w-10 text-right pr-2 py-0.5 select-none">
          {line.leftNum ?? ""}
        </span>
        <span className="w-10 text-right pr-2 py-0.5 select-none">
          {line.rightNum ?? ""}
        </span>
      </div>
      <pre className={`flex-1 px-3 py-0.5 text-sm font-mono whitespace-pre-wrap break-all ${textColor}`}>
        {line.type === "added" ? "+ " : line.type === "removed" ? "- " : "  "}
        {line.text}
      </pre>
    </div>
  )
}

export function DiffChecker() {
  const [leftText, setLeftText] = React.useState("")
  const [rightText, setRightText] = React.useState("")
  const [diffResult, setDiffResult] = React.useState<DiffLine[]>([])
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [hasCompared, setHasCompared] = React.useState(false)

  const handleCompare = React.useCallback(() => {
    if (!leftText && !rightText) {
      toast.error("Please enter text in both fields")
      return
    }
    setLoading(true)
    setTimeout(() => {
      const result = computeDiff(leftText, rightText)
      setDiffResult(result)
      setHasCompared(true)
      setLoading(false)
    }, 200)
  }, [leftText, rightText])

  const handleCopy = React.useCallback(async () => {
    if (diffResult.length === 0) return
    const text = diffResult
      .map((line) => {
        const prefix =
          line.type === "added" ? "+" : line.type === "removed" ? "-" : " "
        return `${prefix} ${line.text}`
      })
      .join("\n")
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [diffResult])

  const handleClear = React.useCallback(() => {
    setLeftText("")
    setRightText("")
    setDiffResult([])
    setHasCompared(false)
  }, [])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <FileDiff className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Diff Checker</h2>
          <p className="text-sm text-muted-foreground">
            Compare two texts and find differences
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Original Text</label>
          <textarea
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            placeholder="Original text..."
            rows={8}
            className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm font-mono transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Modified Text</label>
          <textarea
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            placeholder="Modified text..."
            rows={8}
            className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm font-mono transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={handleCompare}
          loading={loading}
          icon={<FileDiff className="h-4 w-4" />}
        >
          Compare
        </Button>
        {hasCompared && (
          <>
            <Button
              variant="outline"
              onClick={handleCopy}
              icon={
                copied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )
              }
            >
              {copied ? "Copied" : "Copy Diff"}
            </Button>
            <Button variant="ghost" onClick={handleClear} icon={<RotateCcw className="h-4 w-4" />}>
              Clear
            </Button>
          </>
        )}
      </div>

      {hasCompared && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Differences
              <span className="ml-2 text-xs text-muted-foreground">
                ({diffResult.filter((l) => l.type !== "equal").length} changes)
              </span>
            </span>
            <div className="flex gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded bg-emerald-500/30" />
                Added
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-3 h-3 rounded bg-destructive/30" />
                Removed
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-border overflow-hidden max-h-96 overflow-y-auto">
            <div className="flex border-b border-border bg-muted/50 text-xs text-muted-foreground font-mono">
              <div className="flex w-20 shrink-0 border-r border-border px-2 py-1">
                <span className="w-10 text-right">L</span>
                <span className="w-10 text-right">R</span>
              </div>
              <div className="px-3 py-1">Content</div>
            </div>
            <div className="divide-y divide-border/50">
              {diffResult.map((line, idx) => (
                <DiffLineRow key={idx} line={line} />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </Card>
  )
}

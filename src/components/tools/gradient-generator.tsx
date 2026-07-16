"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Palette, RotateCcw } from "lucide-react"

type GradientType = "linear" | "radial"
type Direction = "to right" | "to bottom" | "to bottom right" | "to bottom left" | "to top" | "to left" | "to top right" | "to top left"

const DIRECTIONS: Direction[] = [
  "to right",
  "to bottom",
  "to bottom right",
  "to bottom left",
  "to top",
  "to left",
  "to top right",
  "to top left",
]

const PRESETS = [
  { name: "Sunset", from: "#ff6b6b", to: "#feca57", type: "linear" as GradientType, direction: "to right" as Direction },
  { name: "Ocean", from: "#48dbfb", to: "#0abde3", type: "linear" as GradientType, direction: "to bottom" as Direction },
  { name: "Mint", from: "#1dd1a1", to: "#10ac84", type: "linear" as GradientType, direction: "to right" as Direction },
  { name: "Lavender", from: "#a29bfe", to: "#6c5ce7", type: "linear" as GradientType, direction: "to bottom right" as Direction },
  { name: "Peach", from: "#fd79a8", to: "#e84393", type: "linear" as GradientType, direction: "to right" as Direction },
  { name: "Forest", from: "#00b894", to: "#00cec9", type: "linear" as GradientType, direction: "to bottom" as Direction },
  { name: "Night", from: "#2d3436", to: "#636e72", type: "linear" as GradientType, direction: "to right" as Direction },
  { name: "Sunrise", from: "#fdcb6e", to: "#e17055", type: "radial" as GradientType, direction: "to right" as Direction },
  { name: "Sky", from: "#74b9ff", to: "#0984e3", type: "linear" as GradientType, direction: "to bottom" as Direction },
  { name: "Aurora", from: "#a29bfe", to: "#fd79a8", type: "linear" as GradientType, direction: "to bottom right" as Direction },
  { name: "Gold", from: "#ffeaa7", to: "#fdcb6e", type: "linear" as GradientType, direction: "to right" as Direction },
  { name: "Berry", from: "#6c5ce7", to: "#e84393", type: "radial" as GradientType, direction: "to right" as Direction },
]

export function GradientGenerator() {
  const [colorFrom, setColorFrom] = React.useState("#6366f1")
  const [colorTo, setColorTo] = React.useState("#ec4899")
  const [gradientType, setGradientType] = React.useState<GradientType>("linear")
  const [direction, setDirection] = React.useState<Direction>("to right")
  const [copied, setCopied] = React.useState(false)

  const cssCode = React.useMemo(() => {
    if (gradientType === "linear") {
      return `background: linear-gradient(${direction}, ${colorFrom}, ${colorTo});`
    }
    return `background: radial-gradient(circle, ${colorFrom}, ${colorTo});`
  }, [colorFrom, colorTo, gradientType, direction])

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(cssCode)
      setCopied(true)
      toast.success("CSS copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [cssCode])

  const applyPreset = React.useCallback((preset: typeof PRESETS[0]) => {
    setColorFrom(preset.from)
    setColorTo(preset.to)
    setGradientType(preset.type)
    setDirection(preset.direction)
  }, [])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Palette className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Gradient Generator</h2>
          <p className="text-sm text-muted-foreground">
            Create beautiful CSS gradients visually
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Gradient Type</label>
        <div className="flex gap-2">
          {(["linear", "radial"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setGradientType(t)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                gradientType === t
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {gradientType === "linear" && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Direction</label>
          <div className="flex flex-wrap gap-1.5">
            {DIRECTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDirection(d)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  direction === d
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Color 1</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={colorFrom}
              onChange={(e) => setColorFrom(e.target.value)}
              className="h-10 w-14 rounded-lg border border-border bg-background cursor-pointer"
            />
            <input
              value={colorFrom}
              onChange={(e) => setColorFrom(e.target.value)}
              className="flex-1 h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Color 2</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={colorTo}
              onChange={(e) => setColorTo(e.target.value)}
              className="h-10 w-14 rounded-lg border border-border bg-background cursor-pointer"
            />
            <input
              value={colorTo}
              onChange={(e) => setColorTo(e.target.value)}
              className="flex-1 h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </div>

      <div
        className="h-40 rounded-xl border border-border shadow-inner"
        style={{ background: gradientType === "linear" ? `linear-gradient(${direction}, ${colorFrom}, ${colorTo})` : `radial-gradient(circle, ${colorFrom}, ${colorTo})` }}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">CSS Code</label>
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
        <div className="rounded-xl border border-border bg-zinc-950 dark:bg-zinc-900 p-4">
          <pre className="whitespace-pre-wrap text-sm font-mono text-green-400">
            {cssCode}
          </pre>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Presets</label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="group relative h-14 rounded-xl border border-border overflow-hidden transition-all hover:scale-105 hover:shadow-md"
              style={{
                background: preset.type === "linear"
                  ? `linear-gradient(${preset.direction}, ${preset.from}, ${preset.to})`
                  : `radial-gradient(circle, ${preset.from}, ${preset.to})`,
              }}
            >
              <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-white text-[10px] font-medium">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  )
}

"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { Copy, Check, FileCode, RotateCcw } from "lucide-react"

export function CssGenerator() {
  const [shadowX, setShadowX] = React.useState(2)
  const [shadowY, setShadowY] = React.useState(2)
  const [shadowBlur, setShadowBlur] = React.useState(10)
  const [shadowSpread, setShadowSpread] = React.useState(0)
  const [shadowColor, setShadowColor] = React.useState("rgba(0,0,0,0.2)")
  const [borderRadius, setBorderRadius] = React.useState(12)
  const [bgColor, setBgColor] = React.useState("#6366f1")
  const [copied, setCopied] = React.useState(false)

  const cssCode = React.useMemo(() => {
    return `.element {
  box-shadow: ${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor};
  border-radius: ${borderRadius}px;
  background-color: ${bgColor};
  padding: 24px;
  color: white;
}`
  }, [shadowX, shadowY, shadowBlur, shadowSpread, shadowColor, borderRadius, bgColor])

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

  const handleReset = React.useCallback(() => {
    setShadowX(2)
    setShadowY(2)
    setShadowBlur(10)
    setShadowSpread(0)
    setShadowColor("rgba(0,0,0,0.2)")
    setBorderRadius(12)
    setBgColor("#6366f1")
  }, [])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <FileCode className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">CSS Generator</h2>
          <p className="text-sm text-muted-foreground">
            Generate CSS code visually with interactive controls
          </p>
        </div>
      </div>

      <div
        className="h-40 rounded-xl border border-border flex items-center justify-center text-white text-lg font-bold shadow-inner transition-all"
        style={{
          boxShadow: `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`,
          borderRadius: `${borderRadius}px`,
          backgroundColor: bgColor,
        }}
      >
        Preview
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-3 block">
            Box Shadow
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">X</span>
                <span className="text-foreground font-mono">{shadowX}px</span>
              </div>
              <input
                type="range"
                min={-50}
                max={50}
                value={shadowX}
                onChange={(e) => setShadowX(Number(e.target.value))}
                className="w-full h-1.5 rounded-full bg-muted appearance-none cursor-pointer accent-primary"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Y</span>
                <span className="text-foreground font-mono">{shadowY}px</span>
              </div>
              <input
                type="range"
                min={-50}
                max={50}
                value={shadowY}
                onChange={(e) => setShadowY(Number(e.target.value))}
                className="w-full h-1.5 rounded-full bg-muted appearance-none cursor-pointer accent-primary"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Blur</span>
                <span className="text-foreground font-mono">{shadowBlur}px</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={shadowBlur}
                onChange={(e) => setShadowBlur(Number(e.target.value))}
                className="w-full h-1.5 rounded-full bg-muted appearance-none cursor-pointer accent-primary"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Spread</span>
                <span className="text-foreground font-mono">{shadowSpread}px</span>
              </div>
              <input
                type="range"
                min={-20}
                max={20}
                value={shadowSpread}
                onChange={(e) => setShadowSpread(Number(e.target.value))}
                className="w-full h-1.5 rounded-full bg-muted appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs text-muted-foreground">Shadow Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={shadowColor}
                onChange={(e) => {
                  const hex = e.target.value
                  const r = parseInt(hex.slice(1, 3), 16)
                  const g = parseInt(hex.slice(3, 5), 16)
                  const b = parseInt(hex.slice(5, 7), 16)
                  setShadowColor(`rgba(${r},${g},${b},0.2)`)
                }}
                className="h-10 w-12 rounded-lg border border-border bg-background cursor-pointer"
              />
              <input
                value={shadowColor}
                onChange={(e) => setShadowColor(e.target.value)}
                className="flex-1 h-10 rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-xs text-muted-foreground">Background Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-10 w-12 rounded-lg border border-border bg-background cursor-pointer"
              />
              <input
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="flex-1 h-10 rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Border Radius</span>
            <span className="text-foreground font-mono">{borderRadius}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={50}
            value={borderRadius}
            onChange={(e) => setBorderRadius(Number(e.target.value))}
            className="w-full h-1.5 rounded-full bg-muted appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="ghost" onClick={handleReset} icon={<RotateCcw className="h-4 w-4" />}>
          Reset
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Generated CSS</label>
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
        <div className="rounded-xl border border-border bg-zinc-950 dark:bg-zinc-900 p-4 overflow-auto">
          <pre className="whitespace-pre-wrap text-sm font-mono text-yellow-400 leading-relaxed">
            {cssCode}
          </pre>
        </div>
      </div>
    </Card>
  )
}

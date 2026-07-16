"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { Copy, Check, Palette } from "lucide-react"

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

function rgbToCmyk(r: number, g: number, b: number): { c: number; m: number; y: number; k: number } {
  const cr = r / 255
  const cg = g / 255
  const cb = b / 255
  const k = 1 - Math.max(cr, cg, cb)
  const c = k === 1 ? 0 : Math.round(((1 - cr - k) / (1 - k)) * 100)
  const m = k === 1 ? 0 : Math.round(((1 - cg - k) / (1 - k)) * 100)
  const y = k === 1 ? 0 : Math.round(((1 - cb - k) / (1 - k)) * 100)
  return { c, m, y, k: Math.round(k * 100) }
}

function getComplementary(hex: string): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return "#000000"
  const comp = {
    r: 255 - rgb.r,
    g: 255 - rgb.g,
    b: 255 - rgb.b,
  }
  return `#${comp.r.toString(16).padStart(2, "0")}${comp.g
    .toString(16)
    .padStart(2, "0")}${comp.b.toString(16).padStart(2, "0")}`
}

function getSimilar(hex: string, offset: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return "#000000"
  const sim = {
    r: Math.min(255, Math.max(0, rgb.r + offset * 40)),
    g: Math.min(255, Math.max(0, rgb.g + offset * 40)),
    b: Math.min(255, Math.max(0, rgb.b + offset * 40)),
  }
  return `#${sim.r.toString(16).padStart(2, "0")}${sim.g
    .toString(16)
    .padStart(2, "0")}${sim.b.toString(16).padStart(2, "0")}`
}

interface CopyFieldProps {
  label: string
  value: string
  onCopy: (value: string, label: string) => void
  copiedField: string | null
}

function CopyField({ label, value, onCopy, copiedField }: CopyFieldProps) {
  return (
    <div className="group flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
      <div className="min-w-0 flex-1">
        <span className="text-xs text-muted-foreground block">{label}</span>
        <span className="text-sm font-mono text-foreground select-all">{value}</span>
      </div>
      <button
        onClick={() => onCopy(value, label)}
        className="shrink-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copiedField === label ? (
          <Check className="h-4 w-4 text-emerald-500" />
        ) : (
          <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        )}
      </button>
    </div>
  )
}

export function ColorPicker() {
  const [color, setColor] = React.useState("#6366f1")
  const [copiedField, setCopiedField] = React.useState<string | null>(null)

  const rgb = React.useMemo(() => hexToRgb(color), [color])
  const hsl = React.useMemo(
    () => (rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null),
    [rgb]
  )
  const cmyk = React.useMemo(
    () => (rgb ? rgbToCmyk(rgb.r, rgb.g, rgb.b) : null),
    [rgb]
  )

  const complementary = React.useMemo(() => getComplementary(color), [color])

  const similarColors = React.useMemo(
    () => [-2, -1, 0, 1, 2].map((offset) => getSimilar(color, offset)),
    [color]
  )

  const handleCopy = React.useCallback(async (value: string, field: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedField(field)
      toast.success(`${field} copied`)
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Palette className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Color Picker & Converter</h2>
          <p className="text-sm text-muted-foreground">
            Pick colors and convert between color formats
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-32 w-32 rounded-2xl border-2 border-border shadow-lg"
            style={{ backgroundColor: color }}
          />
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-32 rounded-lg border border-border bg-background cursor-pointer"
          />
        </div>

        <div className="flex-1 space-y-2 w-full">
          <CopyField
            label="HEX"
            value={color}
            onCopy={handleCopy}
            copiedField={copiedField}
          />
          {rgb && (
            <CopyField
              label="RGB"
              value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}
              onCopy={handleCopy}
              copiedField={copiedField}
            />
          )}
          {hsl && (
            <CopyField
              label="HSL"
              value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`}
              onCopy={handleCopy}
              copiedField={copiedField}
            />
          )}
          {cmyk && (
            <CopyField
              label="CMYK"
              value={`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`}
              onCopy={handleCopy}
              copiedField={copiedField}
            />
          )}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">Complementary Color</span>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
          <div
            className="h-10 w-10 rounded-lg border border-border shrink-0"
            style={{ backgroundColor: complementary }}
          />
          <CopyField
            label="Complementary HEX"
            value={complementary}
            onCopy={handleCopy}
            copiedField={copiedField}
          />
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-foreground">Similar Colors</span>
        <div className="flex flex-wrap gap-2">
          {similarColors.map((c, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1"
            >
              <div
                className="h-10 w-10 rounded-lg border border-border cursor-pointer transition-transform hover:scale-110"
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
                title={c}
              />
              <span className="text-[10px] font-mono text-muted-foreground">{c}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

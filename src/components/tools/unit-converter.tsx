"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"
import { ArrowLeftRight, ArrowRight } from "lucide-react"

interface UnitCategory { id: string; name: string; units: { value: string; label: string; toBase: (v: number) => number; fromBase: (v: number) => number }[] }

const CATEGORIES: UnitCategory[] = [
  { id: "length", name: "Length", units: [
    { value: "m", label: "Meters", toBase: v => v, fromBase: v => v },
    { value: "km", label: "Kilometers", toBase: v => v * 1000, fromBase: v => v / 1000 },
    { value: "cm", label: "Centimeters", toBase: v => v / 100, fromBase: v => v * 100 },
    { value: "mm", label: "Millimeters", toBase: v => v / 1000, fromBase: v => v * 1000 },
    { value: "mi", label: "Miles", toBase: v => v * 1609.344, fromBase: v => v / 1609.344 },
    { value: "yd", label: "Yards", toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
    { value: "ft", label: "Feet", toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
    { value: "in", label: "Inches", toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
  ]},
  { id: "mass", name: "Mass", units: [
    { value: "kg", label: "Kilograms", toBase: v => v, fromBase: v => v },
    { value: "g", label: "Grams", toBase: v => v / 1000, fromBase: v => v * 1000 },
    { value: "mg", label: "Milligrams", toBase: v => v / 1e6, fromBase: v => v * 1e6 },
    { value: "lb", label: "Pounds", toBase: v => v * 0.453592, fromBase: v => v / 0.453592 },
    { value: "oz", label: "Ounces", toBase: v => v * 0.0283495, fromBase: v => v / 0.0283495 },
    { value: "t", label: "Tons", toBase: v => v * 1000, fromBase: v => v / 1000 },
  ]},
  { id: "volume", name: "Volume", units: [
    { value: "l", label: "Liters", toBase: v => v, fromBase: v => v },
    { value: "ml", label: "Milliliters", toBase: v => v / 1000, fromBase: v => v * 1000 },
    { value: "gal", label: "Gallons", toBase: v => v * 3.78541, fromBase: v => v / 3.78541 },
    { value: "qt", label: "Quarts", toBase: v => v * 0.946353, fromBase: v => v / 0.946353 },
    { value: "cup", label: "Cups", toBase: v => v * 0.236588, fromBase: v => v / 0.236588 },
    { value: "floz", label: "Fluid Ounces", toBase: v => v * 0.0295735, fromBase: v => v / 0.0295735 },
  ]},
  { id: "temperature", name: "Temperature", units: [
    { value: "c", label: "Celsius", toBase: v => v, fromBase: v => v },
    { value: "f", label: "Fahrenheit", toBase: v => (v - 32) * 5 / 9, fromBase: v => v * 9 / 5 + 32 },
    { value: "k", label: "Kelvin", toBase: v => v - 273.15, fromBase: v => v + 273.15 },
  ]},
  { id: "area", name: "Area", units: [
    { value: "sqm", label: "Square Meters", toBase: v => v, fromBase: v => v },
    { value: "sqkm", label: "Square Kilometers", toBase: v => v * 1e6, fromBase: v => v / 1e6 },
    { value: "sqft", label: "Square Feet", toBase: v => v * 0.092903, fromBase: v => v / 0.092903 },
    { value: "acre", label: "Acres", toBase: v => v * 4046.86, fromBase: v => v / 4046.86 },
    { value: "ha", label: "Hectares", toBase: v => v * 10000, fromBase: v => v / 10000 },
  ]},
  { id: "speed", name: "Speed", units: [
    { value: "kmh", label: "km/h", toBase: v => v / 3.6, fromBase: v => v * 3.6 },
    { value: "mph", label: "mph", toBase: v => v * 0.44704, fromBase: v => v / 0.44704 },
    { value: "ms", label: "m/s", toBase: v => v, fromBase: v => v },
    { value: "knot", label: "Knots", toBase: v => v * 0.514444, fromBase: v => v / 0.514444 },
  ]},
  { id: "time", name: "Time", units: [
    { value: "s", label: "Seconds", toBase: v => v, fromBase: v => v },
    { value: "min", label: "Minutes", toBase: v => v * 60, fromBase: v => v / 60 },
    { value: "h", label: "Hours", toBase: v => v * 3600, fromBase: v => v / 3600 },
    { value: "d", label: "Days", toBase: v => v * 86400, fromBase: v => v / 86400 },
    { value: "wk", label: "Weeks", toBase: v => v * 604800, fromBase: v => v / 604800 },
  ]},
  { id: "data", name: "Data", units: [
    { value: "b", label: "Bytes", toBase: v => v, fromBase: v => v },
    { value: "kb", label: "KB", toBase: v => v * 1024, fromBase: v => v / 1024 },
    { value: "mb", label: "MB", toBase: v => v * 1048576, fromBase: v => v / 1048576 },
    { value: "gb", label: "GB", toBase: v => v * 1.074e9, fromBase: v => v / 1.074e9 },
    { value: "tb", label: "TB", toBase: v => v * 1.1e12, fromBase: v => v / 1.1e12 },
  ]},
]

export function UnitConverter() {
  const [category, setCategory] = React.useState(CATEGORIES[0])
  const [fromUnit, setFromUnit] = React.useState(category.units[0].value)
  const [toUnit, setToUnit] = React.useState(category.units[1].value)
  const [value, setValue] = React.useState("1")

  React.useEffect(() => { setFromUnit(category.units[0].value); setToUnit(category.units[1].value) }, [category])

  const from = category.units.find(u => u.value === fromUnit)
  const to = category.units.find(u => u.value === toUnit)
  const numValue = parseFloat(value) || 0
  const result = from && to ? to.fromBase(from.toBase(numValue)) : 0

  const swap = () => { setFromUnit(toUnit); setToUnit(fromUnit) }

  return (
    <div className="mx-auto max-w-md space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><ArrowLeftRight className="h-6 w-6 text-teal-500" /></div>
        <div><h1 className="text-2xl font-bold text-foreground">Unit Converter</h1><p className="text-sm text-muted-foreground">Convert between measurement units</p></div>
      </motion.div>

      <Card className="space-y-4">
        <div className="flex flex-wrap gap-1.5">{CATEGORIES.map(c => (<button key={c.id} onClick={() => setCategory(c)} className={cn("rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors", category.id === c.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50")}>{c.name}</button>))}</div>

        <Input label="Value" type="number" value={value} onChange={(e) => setValue(e.target.value)} />

        <div className="grid grid-cols-[1fr,auto,1fr] items-end gap-3">
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">From</label><select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">{category.units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}</select></div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={swap} className="mt-6 flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-accent"><ArrowLeftRight className="h-4 w-4" /></motion.button>
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">To</label><select value={toUnit} onChange={(e) => setToUnit(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">{category.units.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}</select></div>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
          <p className="text-sm text-muted-foreground">{numValue} {from?.label || ""}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{result.toLocaleString(undefined, { maximumFractionDigits: 6 })}</p>
          <p className="text-sm text-muted-foreground">{to?.label || ""}</p>
        </div>
      </Card>
    </div>
  )
}

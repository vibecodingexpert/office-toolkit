"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { Percent, Copy, Check } from "lucide-react"

const MODES = [
  { id: "xy", label: "X% of Y" },
  { id: "what", label: "X is what % of Y?" },
  { id: "change", label: "% change from X to Y" },
]

export function PercentageCalculator() {
  const [mode, setMode] = React.useState("xy")
  const [x, setX] = React.useState("")
  const [y, setY] = React.useState("")
  const [result, setResult] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  const calculate = React.useCallback(() => {
    const numX = parseFloat(x)
    const numY = parseFloat(y)
    if (isNaN(numX) || isNaN(numY)) { setResult(null); return }
    if (mode === "xy") setResult(`${(numX / 100) * numY}`)
    else if (mode === "what") setResult(`${(numX / numY) * 100}%`)
    else setResult(`${((numY - numX) / Math.abs(numX)) * 100}%`)
  }, [mode, x, y])

  React.useEffect(() => { calculate() }, [calculate])

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
    }
  }

  const labelA = mode === "xy" ? "Percentage (X)" : mode === "what" ? "Value (X)" : "Initial Value (X)"
  const labelB = mode === "xy" ? "Value (Y)" : mode === "what" ? "Total (Y)" : "Final Value (Y)"
  const displayLabel = mode === "xy" ? `${x || "X"}% of ${y || "Y"}` : mode === "what" ? `${x || "X"} is what % of ${y || "Y"}?` : `% change from ${x || "X"} to ${y || "Y"}`

  return (
    <div className="mx-auto max-w-md space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10"><Percent className="h-6 w-6 text-violet-500" /></div>
        <div><h1 className="text-2xl font-bold text-foreground">Percentage Calculator</h1><p className="text-sm text-muted-foreground">Calculate percentages easily</p></div>
      </motion.div>

      <Card className="space-y-4">
        <div className="flex gap-2">{MODES.map(m => (<button key={m.id} onClick={() => { setMode(m.id); setResult(null) }} className={cn("flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-colors text-center", mode === m.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50")}>{m.label}</button>))}</div>

        <Input label={labelA} type="number" value={x} onChange={(e) => setX(e.target.value)} />
        <Input label={labelB} type="number" value={y} onChange={(e) => setY(e.target.value)} />

        {result !== null && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="text-xs text-muted-foreground mb-1">{displayLabel}</p>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-primary">{result}</p>
              <button onClick={copyResult} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent">{copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}</button>
            </div>
          </motion.div>
        )}

        <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Quick Examples</p>
          {mode === "xy" && <>
            <button onClick={() => { setX("10"); setY("200") }} className="block w-full text-left text-xs text-muted-foreground hover:text-foreground py-0.5">10% of 200</button>
            <button onClick={() => { setX("15"); setY("80") }} className="block w-full text-left text-xs text-muted-foreground hover:text-foreground py-0.5">15% of 80</button>
            <button onClick={() => { setX("25"); setY("150") }} className="block w-full text-left text-xs text-muted-foreground hover:text-foreground py-0.5">25% of 150</button>
          </>}
          {mode === "what" && <>
            <button onClick={() => { setX("30"); setY("120") }} className="block w-full text-left text-xs text-muted-foreground hover:text-foreground py-0.5">30 is what % of 120?</button>
            <button onClick={() => { setX("50"); setY("200") }} className="block w-full text-left text-xs text-muted-foreground hover:text-foreground py-0.5">50 is what % of 200?</button>
          </>}
          {mode === "change" && <>
            <button onClick={() => { setX("100"); setY("150") }} className="block w-full text-left text-xs text-muted-foreground hover:text-foreground py-0.5">% change 100 → 150</button>
            <button onClick={() => { setX("200"); setY("150") }} className="block w-full text-left text-xs text-muted-foreground hover:text-foreground py-0.5">% change 200 → 150</button>
          </>}
        </div>
      </Card>
    </div>
  )
}

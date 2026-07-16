"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { Calculator, Copy, Check, Percent } from "lucide-react"

const GST_RATES = [
  { value: 5, label: "5%" },
  { value: 12, label: "12%" },
  { value: 18, label: "18%" },
  { value: 28, label: "28%" },
]

export function GstCalculator() {
  const [amount, setAmount] = React.useState("1000")
  const [rate, setRate] = React.useState(18)
  const [mode, setMode] = React.useState<"exclusive" | "inclusive">("exclusive")
  const [copied, setCopied] = React.useState<string | null>(null)

  const numAmount = parseFloat(amount) || 0
  const gstAmount = mode === "exclusive" ? numAmount * (rate / 100) : numAmount - (numAmount / (1 + rate / 100))
  const baseAmount = mode === "exclusive" ? numAmount : numAmount / (1 + rate / 100)
  const total = mode === "exclusive" ? numAmount + gstAmount : numAmount

  const copyValue = (label: string, val: string) => {
    navigator.clipboard.writeText(val).then(() => { setCopied(label); setTimeout(() => setCopied(null), 2000) })
  }

  return (
    <div className="mx-auto max-w-md space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><Calculator className="h-6 w-6 text-teal-500" /></div>
        <div><h1 className="text-2xl font-bold text-foreground">GST Calculator</h1><p className="text-sm text-muted-foreground">Calculate GST amounts</p></div>
      </motion.div>

      <Card className="space-y-4">
        <Input label="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />

        <div><label className="text-sm font-medium text-foreground">GST Rate</label><div className="mt-1 flex gap-2">{GST_RATES.map(r => (<button key={r.value} onClick={() => setRate(r.value)} className={cn("flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors", rate === r.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50")}>{r.label}</button>))}</div></div>

        <div className="flex gap-2">{(["exclusive", "inclusive"] as const).map(m => (<button key={m} onClick={() => setMode(m)} className={cn("flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors capitalize", mode === m ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50")}>{m === "exclusive" ? "Exclusive" : "Inclusive"}</button>))}</div>

        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
            <div><p className="text-xs text-muted-foreground">Base Amount</p><p className="text-lg font-semibold text-foreground">${baseAmount.toFixed(2)}</p></div>
            <button onClick={() => copyValue("base", baseAmount.toFixed(2))} className="text-muted-foreground hover:text-foreground">{copied === "base" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}</button>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-primary/5 border border-primary/20 p-3">
            <div><p className="text-xs text-muted-foreground">GST Amount ({(rate)}%)</p><p className="text-lg font-semibold text-primary">${gstAmount.toFixed(2)}</p></div>
            <button onClick={() => copyValue("gst", gstAmount.toFixed(2))} className="text-muted-foreground hover:text-foreground">{copied === "gst" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}</button>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
            <div><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">${total.toFixed(2)}</p></div>
            <button onClick={() => copyValue("total", total.toFixed(2))} className="text-muted-foreground hover:text-foreground">{copied === "total" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}</button>
          </div>
        </div>
      </Card>
    </div>
  )
}

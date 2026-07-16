"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils/cn"
import { ArrowLeftRight, DollarSign, TrendingUp } from "lucide-react"

const RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, CAD: 1.36, AUD: 1.53, CHF: 0.88, CNY: 7.24, INR: 83.1, MXN: 17.15, BRL: 4.97, KRW: 1325, SEK: 10.45, NOK: 10.55, NZD: 1.63, SGD: 1.34, HKD: 7.82, TRY: 30.25, ZAR: 18.65, PLN: 4.02,
}

const CURRENCIES = Object.keys(RATES)
const FLAGS: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", CAD: "🇨🇦", AUD: "🇦🇺", CHF: "🇨🇭", CNY: "🇨🇳", INR: "🇮🇳", MXN: "🇲🇽", BRL: "🇧🇷", KRW: "🇰🇷", SEK: "🇸🇪", NOK: "🇳🇴", NZD: "🇳🇿", SGD: "🇸🇬", HKD: "🇭🇰", TRY: "🇹🇷", ZAR: "🇿🇦", PLN: "🇵🇱",
}

export function CurrencyConverter() {
  const [amount, setAmount] = React.useState("1")
  const [from, setFrom] = React.useState("USD")
  const [to, setTo] = React.useState("EUR")

  const numAmount = parseFloat(amount) || 0
  const inUSD = numAmount / RATES[from]
  const result = inUSD * RATES[to]

  const swap = () => { setFrom(to); setTo(from) }
  const popular = [["USD", "EUR"], ["USD", "GBP"], ["USD", "JPY"], ["EUR", "USD"], ["GBP", "USD"], ["INR", "USD"]]

  return (
    <div className="mx-auto max-w-md space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10"><DollarSign className="h-6 w-6 text-emerald-500" /></div>
        <div><h1 className="text-2xl font-bold text-foreground">Currency Converter</h1><p className="text-sm text-muted-foreground">Convert currencies in real-time</p></div>
      </motion.div>

      <Card className="space-y-4">
        <Input label="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} icon={<DollarSign className="h-4 w-4" />} />

        <div className="grid grid-cols-[1fr,auto,1fr] items-end gap-3">
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">From</label><select value={from} onChange={(e) => setFrom(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">{CURRENCIES.map(c => <option key={c} value={c}>{FLAGS[c]} {c}</option>)}</select></div>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={swap} className="mt-6 flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-accent"><ArrowLeftRight className="h-4 w-4" /></motion.button>
          <div className="space-y-2"><label className="text-sm font-medium text-foreground">To</label><select value={to} onChange={(e) => setTo(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">{CURRENCIES.map(c => <option key={c} value={c}>{FLAGS[c]} {c}</option>)}</select></div>
        </div>

        <div className="rounded-lg border border-border bg-gradient-to-r from-emerald-500/5 to-emerald-500/10 p-4 text-center">
          <p className="text-sm text-muted-foreground">{numAmount} {FLAGS[from]} {from}</p>
          <p className="text-3xl font-bold text-foreground mt-1">{result.toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
          <p className="text-sm text-muted-foreground">{FLAGS[to]} {to}</p>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Popular Pairs</p>
          <div className="flex flex-wrap gap-1.5">{popular.map(([f, t]) => {
            const rate = RATES[t] / RATES[f]
            return (<button key={`${f}-${t}`} onClick={() => { setFrom(f); setTo(t) }} className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors">{FLAGS[f]}{f}/{t} {rate.toFixed(4)}</button>)
          })}</div>
        </div>

        <div className="text-[10px] text-muted-foreground text-center">Rates are for reference only. Last updated: {new Date().toLocaleDateString()}</div>
      </Card>
    </div>
  )
}

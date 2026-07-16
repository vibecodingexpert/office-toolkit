"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils/cn"
import { Calculator, PieChart as PieChartIcon } from "lucide-react"

export function EmiCalculator() {
  const [amount, setAmount] = React.useState("100000")
  const [rate, setRate] = React.useState("8.5")
  const [tenure, setTenure] = React.useState("5")
  const [result, setResult] = React.useState<{ emi: number; totalInterest: number; totalPayment: number; amortization: { year: number; principal: number; interest: number; balance: number }[] } | null>(null)

  const calculate = () => {
    const P = parseFloat(amount)
    const r = parseFloat(rate) / 12 / 100
    const n = parseFloat(tenure) * 12
    if (!P || !r || !n) return

    const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
    const totalPayment = emi * n
    const totalInterest = totalPayment - P

    const amort: { year: number; principal: number; interest: number; balance: number }[] = []
    let balance = P
    for (let y = 1; y <= Math.ceil(n / 12); y++) {
      let annualPrincipal = 0
      let annualInterest = 0
      const monthsInYear = Math.min(12, n - (y - 1) * 12)
      for (let m = 0; m < monthsInYear; m++) {
        const interestPart = balance * r
        const principalPart = emi - interestPart
        annualPrincipal += principalPart
        annualInterest += interestPart
        balance -= principalPart
      }
      amort.push({ year: y, principal: Math.round(annualPrincipal), interest: Math.round(annualInterest), balance: Math.max(0, Math.round(balance)) })
    }

    setResult({ emi: Math.round(emi), totalInterest: Math.round(totalInterest), totalPayment: Math.round(totalPayment), amortization: amort })
  }

  const principalPct = result ? (parseFloat(amount) / result.totalPayment) * 100 : 50
  const interestPct = result ? (result.totalInterest / result.totalPayment) * 100 : 50

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10"><Calculator className="h-6 w-6 text-blue-500" /></div>
        <div><h1 className="text-2xl font-bold text-foreground">EMI Calculator</h1><p className="text-sm text-muted-foreground">Calculate loan EMIs</p></div>
      </motion.div>

      <Card className="space-y-4">
        <Input label="Loan Amount ($)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <Input label="Interest Rate (% per annum)" type="number" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} />
        <Input label="Loan Tenure (years)" type="number" value={tenure} onChange={(e) => setTenure(e.target.value)} />
        <Button variant="primary" size="lg" fullWidth onClick={calculate}>Calculate EMI</Button>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-center"><p className="text-xl font-bold text-primary">${result.emi.toLocaleString()}</p><p className="text-xs text-muted-foreground">Monthly EMI</p></div>
              <div className="rounded-lg bg-muted/30 border border-border p-3 text-center"><p className="text-xl font-bold text-foreground">${result.totalInterest.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Interest</p></div>
              <div className="rounded-lg bg-muted/30 border border-border p-3 text-center"><p className="text-xl font-bold text-foreground">${result.totalPayment.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Payment</p></div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground flex items-center gap-1.5"><PieChartIcon className="h-4 w-4" />Breakdown</p>
              <div className="flex h-6 w-full overflow-hidden rounded-full bg-muted">
                <motion.div initial={{ width: 0 }} animate={{ width: `${principalPct}%` }} className="bg-primary" />
                <motion.div initial={{ width: 0 }} animate={{ width: `${interestPct}%` }} className="bg-amber-500" />
              </div>
              <div className="flex justify-between text-xs"><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" /> Principal (${parseFloat(amount).toLocaleString()})</span><span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" /> Interest (${result.totalInterest.toLocaleString()})</span></div>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-foreground mb-2">Amortization Schedule (Yearly)</p>
              <div className="max-h-[250px] overflow-y-auto space-y-1">
                {result.amortization.map(a => (
                  <div key={a.year} className="grid grid-cols-4 gap-2 rounded border border-border/50 px-3 py-2 text-xs">
                    <span className="text-muted-foreground">Year {a.year}</span>
                    <span className="text-right text-emerald-500">+${a.principal.toLocaleString()}</span>
                    <span className="text-right text-amber-500">+${a.interest.toLocaleString()}</span>
                    <span className="text-right font-medium text-foreground">${a.balance.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </Card>
    </div>
  )
}

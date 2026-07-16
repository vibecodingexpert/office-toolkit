"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils/cn"
import { Calculator, Weight, Ruler, Heart } from "lucide-react"

function getCategory(bmi: number): { label: string; color: string; range: string; tips: string } {
  if (bmi < 18.5) return { label: "Underweight", color: "text-blue-500 bg-blue-500/10 border-blue-500/30", range: "Below 18.5", tips: "Consider consulting a nutritionist to develop a healthy weight gain plan." }
  if (bmi < 25) return { label: "Normal", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30", range: "18.5 - 24.9", tips: "Great! Maintain your current lifestyle with balanced diet and regular exercise." }
  if (bmi < 30) return { label: "Overweight", color: "text-amber-500 bg-amber-500/10 border-amber-500/30", range: "25 - 29.9", tips: "Consider increasing physical activity and monitoring your diet." }
  return { label: "Obese", color: "text-destructive bg-destructive/10 border-destructive/30", range: "30 and above", tips: "It's recommended to consult a healthcare professional for a personalized plan." }
}

export function BmiCalculator() {
  const [unit, setUnit] = React.useState<"metric" | "imperial">("metric")
  const [height, setHeight] = React.useState("")
  const [weight, setWeight] = React.useState("")
  const [bmi, setBmi] = React.useState<number | null>(null)

  const calculate = () => {
    const h = parseFloat(height)
    const w = parseFloat(weight)
    if (!h || !w) return
    const hInMeters = unit === "metric" ? h / 100 : h * 0.0254
    const wInKg = unit === "metric" ? w : w * 0.453592
    const bmiVal = wInKg / (hInMeters * hInMeters)
    setBmi(Math.round(bmiVal * 10) / 10)
  }

  const category = bmi !== null ? getCategory(bmi) : null

  const bmiScale = [
    { min: 0, max: 18.5, color: "bg-blue-500", label: "Under" },
    { min: 18.5, max: 24.9, color: "bg-emerald-500", label: "Normal" },
    { min: 25, max: 29.9, color: "bg-amber-500", label: "Over" },
    { min: 30, max: 50, color: "bg-destructive", label: "Obese" },
  ]

  return (
    <div className="mx-auto max-w-md space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10"><Heart className="h-6 w-6 text-rose-500" /></div>
        <div><h1 className="text-2xl font-bold text-foreground">BMI Calculator</h1><p className="text-sm text-muted-foreground">Calculate body mass index</p></div>
      </motion.div>

      <Card className="space-y-4">
        <div className="flex gap-2">{(["metric", "imperial"] as const).map(u => (<button key={u} onClick={() => setUnit(u)} className={cn("flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors", unit === u ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50")}>{u === "metric" ? "Metric (cm/kg)" : "Imperial (ft/in/lbs)"}</button>))}</div>

        <Input label={unit === "metric" ? "Height (cm)" : "Height (inches)"} type="number" value={height} onChange={(e) => setHeight(e.target.value)} icon={<Ruler className="h-4 w-4" />} />
        <Input label={unit === "metric" ? "Weight (kg)" : "Weight (lbs)"} type="number" value={weight} onChange={(e) => setWeight(e.target.value)} icon={<Weight className="h-4 w-4" />} />
        <Button variant="primary" size="lg" fullWidth onClick={calculate}>Calculate BMI</Button>

        {bmi !== null && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="rounded-2xl border-2 p-6 text-center" style={{ borderColor: category?.color.split(" ")[0].replace("text-", "rgb(") }}>
              <p className="text-5xl font-extrabold text-foreground">{bmi}</p>
              <p className="text-sm text-muted-foreground mt-1">Your BMI</p>
            </div>

            {category && <div className={cn("rounded-lg border p-3 text-center", category.color)}><p className="font-bold">{category.label}</p><p className="text-xs opacity-75">{category.range}</p></div>}

            <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
              {bmiScale.map((s, i) => {
                const left = (s.min / 50) * 100
                const width = ((s.max - s.min) / 50) * 100
                const bmiPos = Math.min((bmi / 50) * 100, 100)
                return (<div key={i} className="absolute top-0 h-full" style={{ left: `${left}%`, width: `${width}%`, backgroundColor: s.color === "bg-destructive" ? "var(--destructive)" : `var(--${s.color.replace("bg-", "")})` }} />)
              })}
              <motion.div initial={{ left: "0%" }} animate={{ left: `${Math.min((bmi / 50) * 100, 100)}%` }} className="absolute top-0 h-full w-1 bg-foreground -translate-x-1/2" style={{ left: `${Math.min((bmi / 50) * 100, 100)}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground"><span>0</span><span>18.5</span><span>25</span><span>30</span><span>50</span></div>

            {category && <div className="rounded-lg border border-border bg-muted/20 p-3"><div className="flex items-start gap-2"><Heart className="h-4 w-4 text-primary mt-0.5 shrink-0" /><p className="text-xs text-muted-foreground">{category.tips}</p></div></div>}
          </motion.div>
        )}
      </Card>
    </div>
  )
}

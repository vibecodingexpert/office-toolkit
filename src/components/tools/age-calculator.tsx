"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import { Calendar, Cake, Sparkles, Star } from "lucide-react"

const ZODIAC_SIGNS = [
  { name: "Capricorn", symbol: "♑", range: "Dec 22 - Jan 19" },
  { name: "Aquarius", symbol: "♒", range: "Jan 20 - Feb 18" },
  { name: "Pisces", symbol: "♓", range: "Feb 19 - Mar 20" },
  { name: "Aries", symbol: "♈", range: "Mar 21 - Apr 19" },
  { name: "Taurus", symbol: "♉", range: "Apr 20 - May 20" },
  { name: "Gemini", symbol: "♊", range: "May 21 - Jun 20" },
  { name: "Cancer", symbol: "♋", range: "Jun 21 - Jul 22" },
  { name: "Leo", symbol: "♌", range: "Jul 23 - Aug 22" },
  { name: "Virgo", symbol: "♍", range: "Aug 23 - Sep 22" },
  { name: "Libra", symbol: "♎", range: "Sep 23 - Oct 22" },
  { name: "Scorpio", symbol: "♏", range: "Oct 23 - Nov 21" },
  { name: "Sagittarius", symbol: "♐", range: "Nov 22 - Dec 21" },
]

function getZodiac(date: Date): { name: string; symbol: string } {
  const m = date.getMonth() + 1
  const d = date.getDate()
  if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return ZODIAC_SIGNS[0]
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return ZODIAC_SIGNS[1]
  if ((m === 2 && d >= 19) || (m === 3 && d <= 20)) return ZODIAC_SIGNS[2]
  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return ZODIAC_SIGNS[3]
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return ZODIAC_SIGNS[4]
  if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return ZODIAC_SIGNS[5]
  if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return ZODIAC_SIGNS[6]
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return ZODIAC_SIGNS[7]
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return ZODIAC_SIGNS[8]
  if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return ZODIAC_SIGNS[9]
  if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return ZODIAC_SIGNS[10]
  return ZODIAC_SIGNS[11]
}

const AGE_FACTS = [
  "You've blinked approximately {count} times",
  "Your heart has beaten about {count} times",
  "You've spent about {count} hours sleeping",
  "You've taken roughly {count} breaths",
  "You've traveled about {count} km with the Earth around the Sun",
]

export function AgeCalculator() {
  const [dob, setDob] = React.useState("")
  const [age, setAge] = React.useState<{ years: number; months: number; days: number; hours: number; minutes: number; seconds: number } | null>(null)
  const [nextBirthday, setNextBirthday] = React.useState<{ days: number; date: string } | null>(null)
  const [zodiac, setZodiac] = React.useState<{ name: string; symbol: string } | null>(null)
  const [fact, setFact] = React.useState("")

  const calculate = () => {
    if (!dob) { toast.error("Please enter your date of birth"); return }
    const birthDate = new Date(dob)
    const now = new Date()
    if (birthDate > now) { toast.error("Date of birth cannot be in the future"); return }

    let diff = now.getTime() - birthDate.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const years = Math.floor(days / 365.25)
    const months = Math.floor((days % 365.25) / 30.44)

    setAge({ years, months, days: days - Math.floor(years * 365.25), hours: hours % 24, minutes: minutes % 60, seconds: seconds % 60 })

    const next = new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate())
    if (next < now) next.setFullYear(next.getFullYear() + 1)
    const diffDays = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    setNextBirthday({ days: diffDays, date: next.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) })

    const z = getZodiac(birthDate)
    setZodiac(z)

    const randomFact = AGE_FACTS[Math.floor(Math.random() * AGE_FACTS.length)]
    setFact(randomFact.replace("{count}", (years * 365 * (randomFact.includes("blinked") ? 14400 : randomFact.includes("heart") ? 115200 : randomFact.includes("sleeping") ? 8 : randomFact.includes("breaths") ? 23000 : 2)).toLocaleString()))
  }

  return (
    <div className="mx-auto max-w-md space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-500/10"><Cake className="h-6 w-6 text-pink-500" /></div>
        <div><h1 className="text-2xl font-bold text-foreground">Age Calculator</h1><p className="text-sm text-muted-foreground">Calculate exact age</p></div>
      </motion.div>

      <Card className="space-y-4">
        <Input label="Date of Birth" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
        <Button variant="primary" size="lg" fullWidth onClick={calculate}><Calendar className="mr-2 h-4 w-4" />Calculate Age</Button>

        {age && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-center"><p className="text-2xl font-bold text-primary">{age.years}</p><p className="text-xs text-muted-foreground">Years</p></div>
              <div className="rounded-lg bg-muted/30 border border-border p-3 text-center"><p className="text-2xl font-bold text-foreground">{age.months}</p><p className="text-xs text-muted-foreground">Months</p></div>
              <div className="rounded-lg bg-muted/30 border border-border p-3 text-center"><p className="text-2xl font-bold text-foreground">{age.days}</p><p className="text-xs text-muted-foreground">Days</p></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/30 border border-border p-3 text-center"><p className="text-lg font-bold text-foreground tabular-nums">{age.hours.toLocaleString()}</p><p className="text-xs text-muted-foreground">Hours</p></div>
              <div className="rounded-lg bg-muted/30 border border-border p-3 text-center"><p className="text-lg font-bold text-foreground tabular-nums">{age.minutes.toLocaleString()}</p><p className="text-xs text-muted-foreground">Minutes</p></div>
              <div className="rounded-lg bg-muted/30 border border-border p-3 text-center"><p className="text-lg font-bold text-foreground tabular-nums">{age.seconds.toLocaleString()}</p><p className="text-xs text-muted-foreground">Seconds</p></div>
            </div>

            {nextBirthday && <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center dark:border-amber-800 dark:bg-amber-950/30">
              <div className="flex items-center justify-center gap-2"><Sparkles className="h-5 w-5 text-amber-500" /><p className="font-semibold text-amber-700 dark:text-amber-300">Next Birthday</p></div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{nextBirthday.days} days</p>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70">{nextBirthday.date}</p>
            </div>}

            {zodiac && <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3"><Star className="h-5 w-5 text-yellow-500" /><div><p className="text-sm font-medium text-foreground">Your Zodiac Sign</p><p className="text-xs text-muted-foreground">{zodiac.symbol} {zodiac.name}</p></div></div>}

            {fact && <div className="rounded-lg border border-border bg-muted/10 p-3"><div className="flex items-start gap-2"><Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" /><p className="text-xs text-muted-foreground">{fact}</p></div></div>}
          </motion.div>
        )}
      </Card>
    </div>
  )
}

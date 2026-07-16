"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { Download, FileText, Eye, EyeOff } from "lucide-react"

interface Earning { id: string; label: string; amount: number }
interface Deduction { id: string; label: string; amount: number }

function formatCurrency(n: number): string { return `$${n.toFixed(2)}` }

export function PayslipGenerator() {
  const [employee, setEmployee] = React.useState({ name: "", id: "", department: "", designation: "", bank: "", account: "" })
  const [period, setPeriod] = React.useState({ month: new Date().toLocaleString("default", { month: "long" }), year: new Date().getFullYear().toString() })
  const [earnings, setEarnings] = React.useState<Earning[]>([
    { id: "basic", label: "Basic Salary", amount: 0 },
    { id: "hra", label: "HRA", amount: 0 },
    { id: "allowances", label: "Allowances", amount: 0 },
    { id: "bonus", label: "Bonus", amount: 0 },
  ])
  const [deductions, setDeductions] = React.useState<Deduction[]>([
    { id: "tax", label: "Income Tax", amount: 0 },
    { id: "insurance", label: "Health Insurance", amount: 0 },
    { id: "pension", label: "Pension", amount: 0 },
  ])
  const [showPreview, setShowPreview] = React.useState(false)

  const updateEarning = (id: string, field: "label" | "amount", value: string | number) => {
    setEarnings(earnings.map((e) => e.id === id ? { ...e, [field]: value } : e))
  }
  const updateDeduction = (id: string, field: "label" | "amount", value: string | number) => {
    setDeductions(deductions.map((d) => d.id === id ? { ...d, [field]: value } : d))
  }

  const grossEarnings = earnings.reduce((s, e) => s + Number(e.amount), 0)
  const totalDeductions = deductions.reduce((s, d) => s + Number(d.amount), 0)
  const netSalary = grossEarnings - totalDeductions

  const handleDownload = () => {
    if (!employee.name) { toast.error("Please enter employee name"); return }
    const w = window.open("", "_blank")
    if (!w) { toast.error("Please allow pop-ups"); return }
    w.document.write(`
      <html><head><title>Payslip - ${employee.name}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 700px; margin: 0 auto; color: #1a1a2e; }
        h1 { font-size: 24px; color: #0891b2; margin: 0; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th { background: #ecfeff; text-align: left; padding: 10px; font-size: 13px; border-bottom: 2px solid #a5f3fc; }
        td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        .total-row td { font-weight: 700; border-top: 2px solid #0891b2; }
        .net-row td { font-size: 18px; font-weight: 800; color: #0891b2; border-top: 3px solid #0891b2; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
        @media print { body { padding: 0; } }
      </style></head><body>
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #0891b2;padding-bottom:15px;margin-bottom:20px">
          <div><h1>PAYSLIP</h1><p style="color:#64748b;font-size:13px">${period.month} ${period.year}</p></div>
          <div style="text-align:right"><strong>Employee ID:</strong> ${employee.id}</div>
        </div>
        <div class="grid">
          <div><strong>Employee:</strong> ${employee.name}</div>
          <div style="text-align:right"><strong>Department:</strong> ${employee.department}</div>
          <div><strong>Designation:</strong> ${employee.designation}</div>
          <div style="text-align:right"><strong>Bank:</strong> ${employee.bank} ${employee.account}</div>
        </div>
        <div style="display:flex;gap:20px">
          <div style="flex:1"><table><tr><th>Earnings</th><th style="text-align:right">Amount</th></tr>${earnings.filter(e => e.amount > 0).map(e => `<tr><td>${e.label}</td><td style="text-align:right">${formatCurrency(e.amount)}</td></tr>`).join("")}<tr class="total-row"><td>Gross Earnings</td><td style="text-align:right">${formatCurrency(grossEarnings)}</td></tr></table></div>
          <div style="flex:1"><table><tr><th>Deductions</th><th style="text-align:right">Amount</th></tr>${deductions.filter(d => d.amount > 0).map(d => `<tr><td>${d.label}</td><td style="text-align:right">${formatCurrency(d.amount)}</td></tr>`).join("")}<tr class="total-row"><td>Total Deductions</td><td style="text-align:right">${formatCurrency(totalDeductions)}</td></tr></table></div>
        </div>
        <table style="margin-top:20px"><tr class="net-row"><td>NET SALARY</td><td style="text-align:right">${formatCurrency(netSalary)}</td></tr></table>
        <div style="margin-top:30px;font-size:11px;color:#94a3b8;text-align:center;border-top:1px solid #e2e8f0;padding-top:10px">This is a computer-generated payslip</div>
      </body></html>
    `)
    w.document.close()
    setTimeout(() => w.print(), 500)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10"><FileText className="h-6 w-6 text-cyan-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Payslip Generator</h1><p className="text-sm text-muted-foreground">Generate employee payslips</p></div></div>
        <div className="flex items-center gap-2"><Button variant={showPreview ? "primary" : "outline"} size="sm" onClick={() => setShowPreview(!showPreview)}>{showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button><Button variant="pro" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /> Download</Button></div>
      </motion.div>

      <AnimatePresence mode="wait">
        {showPreview ? (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="overflow-hidden p-0">
              <div className="bg-white p-8 dark:bg-gray-950">
                <div className="flex items-start justify-between border-b-2 border-cyan-500 pb-4 mb-4"><div><h2 className="text-xl font-bold text-cyan-600 dark:text-cyan-400">PAYSLIP</h2><p className="text-sm text-gray-500">{period.month} {period.year}</p></div><div className="text-right text-sm text-gray-500"><strong>ID:</strong> {employee.id}</div></div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-6"><div><strong>Employee:</strong> {employee.name || "—"}</div><div className="text-right"><strong>Department:</strong> {employee.department || "—"}</div><div><strong>Designation:</strong> {employee.designation || "—"}</div><div className="text-right"><strong>Bank:</strong> {employee.bank} {employee.account}</div></div>
                <div className="grid grid-cols-2 gap-6">
                  <div><h4 className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-2">Earnings</h4><div className="space-y-1">{earnings.filter(e => e.amount > 0).map(e => <div key={e.id} className="flex justify-between text-sm"><span>{e.label}</span><span>${Number(e.amount).toFixed(2)}</span></div>)}<div className="flex justify-between border-t border-cyan-200 pt-1 font-bold text-sm">Gross: ${grossEarnings.toFixed(2)}</div></div></div>
                  <div><h4 className="text-xs font-bold uppercase tracking-wider text-cyan-600 mb-2">Deductions</h4><div className="space-y-1">{deductions.filter(d => d.amount > 0).map(d => <div key={d.id} className="flex justify-between text-sm"><span>{d.label}</span><span>${Number(d.amount).toFixed(2)}</span></div>)}<div className="flex justify-between border-t border-cyan-200 pt-1 font-bold text-sm">Total: ${totalDeductions.toFixed(2)}</div></div></div>
                </div>
                <div className="mt-4 border-t-2 border-cyan-500 pt-3 flex justify-between text-lg font-bold text-cyan-600 dark:text-cyan-400"><span>NET SALARY</span><span>${netSalary.toFixed(2)}</span></div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Card><h3 className="mb-4 font-semibold text-foreground">Employee Info</h3><div className="grid gap-4 sm:grid-cols-2"><Input label="Employee Name" value={employee.name} onChange={(e) => setEmployee({ ...employee, name: e.target.value })} /><Input label="Employee ID" value={employee.id} onChange={(e) => setEmployee({ ...employee, id: e.target.value })} /><Input label="Department" value={employee.department} onChange={(e) => setEmployee({ ...employee, department: e.target.value })} /><Input label="Designation" value={employee.designation} onChange={(e) => setEmployee({ ...employee, designation: e.target.value })} /><Input label="Bank Name" value={employee.bank} onChange={(e) => setEmployee({ ...employee, bank: e.target.value })} /><Input label="Account No" value={employee.account} onChange={(e) => setEmployee({ ...employee, account: e.target.value })} /></div></Card>
            <Card><h3 className="mb-4 font-semibold text-foreground">Pay Period</h3><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><label className="text-sm font-medium text-foreground">Month</label><select value={period.month} onChange={(e) => setPeriod({ ...period, month: e.target.value })} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">{["January","February","March","April","May","June","July","August","September","October","November","December"].map(m => <option key={m} value={m}>{m}</option>)}</select></div><Input label="Year" value={period.year} onChange={(e) => setPeriod({ ...period, year: e.target.value })} /></div></Card>
            <Card><h3 className="mb-4 font-semibold text-foreground">Earnings</h3><div className="space-y-3">{earnings.map(e => <div key={e.id} className="grid grid-cols-[1fr,120px] gap-3"><Input label={e.id === "basic" ? "Basic Salary" : e.id === "hra" ? "HRA" : e.id === "allowances" ? "Allowances" : "Bonus"} type="number" min="0" step="0.01" value={e.amount} onChange={(v) => updateEarning(e.id, "amount", Number(v.target.value))} /></div>)}</div></Card>
            <Card><h3 className="mb-4 font-semibold text-foreground">Deductions</h3><div className="space-y-3">{deductions.map(d => <div key={d.id} className="grid grid-cols-[1fr,120px] gap-3"><Input label={d.id === "tax" ? "Income Tax" : d.id === "insurance" ? "Health Insurance" : "Pension"} type="number" min="0" step="0.01" value={d.amount} onChange={(v) => updateDeduction(d.id, "amount", Number(v.target.value))} /></div>)}</div></Card>
            <Card><div className="space-y-2"><div className="flex justify-between text-sm"><span className="text-muted-foreground">Gross Earnings</span><span>${grossEarnings.toFixed(2)}</span></div><div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Deductions</span><span className="text-destructive">-${totalDeductions.toFixed(2)}</span></div><div className="flex justify-between border-t border-border pt-2 text-lg font-bold"><span>Net Salary</span><span className="text-cyan-500">${netSalary.toFixed(2)}</span></div></div></Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

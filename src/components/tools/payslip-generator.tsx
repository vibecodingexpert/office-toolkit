"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { Download, Eye, EyeOff, Plus, Trash2 } from "lucide-react"
import jsPDF from "jspdf"

interface LineItem { id: string; description: string; amount: number }

export function PayslipGenerator() {
  const [company, setCompany] = React.useState({ name: "", address: "", phone: "", email: "" })
  const [employee, setEmployee] = React.useState({ name: "", id: "", department: "", designation: "", bankName: "", accountNo: "", pan: "", uan: "" })
  const [period, setPeriod] = React.useState({ start: "", end: "" })
  const [earnings, setEarnings] = React.useState<LineItem[]>([{ id: "basic", description: "Basic Salary", amount: 0 }])
  const [deductions, setDeductions] = React.useState<LineItem[]>([{ id: "pf", description: "Provident Fund", amount: 0 }])
  const [showPreview, setShowPreview] = React.useState(false)

  const totalEarnings = earnings.reduce((s, e) => s + e.amount, 0)
  const totalDeductions = deductions.reduce((s, d) => s + d.amount, 0)
  const netPay = totalEarnings - totalDeductions

  const addEarning = () => setEarnings([...earnings, { id: crypto.randomUUID(), description: "", amount: 0 }])
  const addDeduction = () => setDeductions([...deductions, { id: crypto.randomUUID(), description: "", amount: 0 }])

  const handleDownload = () => {
    if (!employee.name) { toast.error("Please enter employee name"); return }
    if (!company.name) { toast.error("Please enter company name"); return }
    const doc = new jsPDF({ unit: "mm", format: "a4" })
    const m = 20
    let y = m

    doc.setFillColor("#14b8a6")
    doc.rect(0, 0, 210, 10, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(16)
    doc.setTextColor(255, 255, 255)
    doc.text("PAYSLIP", 105, 7, { align: "center" })

    y = 18
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.setTextColor(26, 26, 46)
    doc.text(company.name, m, y); y += 5
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text(`Pay Period: ${period.start || "N/A"} - ${period.end || "N/A"}`, 190, y + 5, { align: "right" })
    const companyDetails = [company.address, company.phone, company.email].filter(Boolean)
    companyDetails.forEach((d) => { doc.text(d, m, y); y += 4 })
    y += 8

    doc.setFillColor("#f1f5f9")
    doc.rect(m, y, 170, 25, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(26, 26, 46)
    doc.text("Employee Details", m + 2, y + 4)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(71, 85, 105)
    doc.text(`Name: ${employee.name}`, m + 2, y + 10)
    doc.text(`ID: ${employee.id}`, m + 65, y + 10)
    doc.text(`Department: ${employee.department}`, m + 110, y + 10)
    doc.text(`Designation: ${employee.designation}`, m + 2, y + 17)
    doc.text(`Bank: ${employee.bankName}`, m + 65, y + 17)
    doc.text(`A/C: ${employee.accountNo}`, m + 110, y + 17)
    y += 30

    const col1 = m, col2 = 130
    doc.setFillColor("#14b8a6")
    doc.rect(col1, y, 75, 6, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text("EARNINGS", col1 + 2, y + 4)
    doc.setTextColor(71, 85, 105)
    earnings.forEach((e) => {
      y += 7
      if (y > 270) { doc.addPage(); y = m }
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.text(e.description, col1 + 2, y)
      doc.text(e.amount.toLocaleString("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }), col1 + 72, y, { align: "right" })
    })
    y += 7
    doc.setDrawColor("#14b8a6")
    doc.line(col1, y, col1 + 75, y)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(26, 26, 46)
    doc.text("Total Earnings", col1 + 2, y + 4)
    doc.text(totalEarnings.toLocaleString("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }), col1 + 72, y + 4, { align: "right" })
    y += 12

    doc.setFillColor("#14b8a6")
    doc.rect(col2, 75, 60, 6, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(9)
    doc.text("DEDUCTIONS", col2 + 2, 79)
    let dy = 82
    doc.setTextColor(71, 85, 105)
    deductions.forEach((d) => {
      dy += 7
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.text(d.description, col2 + 2, dy)
      doc.text(d.amount.toLocaleString("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }), col2 + 57, dy, { align: "right" })
    })
    dy += 7
    doc.setDrawColor("#14b8a6")
    doc.line(col2, dy, col2 + 60, dy)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(26, 26, 46)
    doc.text("Total Deductions", col2 + 2, dy + 4)
    doc.text(totalDeductions.toLocaleString("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }), col2 + 57, dy + 4, { align: "right" })

    const netY = Math.max(y + 18, dy + 18)
    doc.setFillColor("#14b8a6")
    doc.rect(m, netY, 170, 10, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("NET PAY", m + 2, netY + 7)
    doc.text(netPay.toLocaleString("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }), 190, netY + 7, { align: "right" })

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text("This is a computer-generated payslip.", 105, 285, { align: "center" })
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 290, { align: "center" })

    doc.save(`payslip-${employee.name.replace(/\s+/g, "_")}.pdf`)
    toast.success("Payslip downloaded as PDF")
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><Download className="h-6 w-6 text-teal-500" /></div><div><h1 className="text-2xl font-bold text-foreground">Payslip Generator</h1><p className="text-sm text-muted-foreground">Generate payslips with earnings & deductions</p></div></div>
        <div className="flex items-center gap-2"><Button variant={showPreview ? "primary" : "outline"} size="sm" onClick={() => setShowPreview(!showPreview)}>{showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button><Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /> Download PDF</Button></div>
      </motion.div>

      <AnimatePresence mode="wait">
        {showPreview ? (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="overflow-hidden p-0">
              <div className="bg-white p-6 dark:bg-gray-950">
                <div className="mb-4 rounded-t-lg bg-teal-500 px-4 py-2 text-center text-lg font-bold text-white">PAYSLIP</div>
                <div className="flex items-start justify-between border-b pb-3"><div><h2 className="text-lg font-bold text-foreground">{company.name || "Company Name"}</h2><p className="text-xs text-muted-foreground">{company.address}<br />{company.phone}{company.phone && " | "}{company.email}</p></div><div className="text-right"><p className="text-sm text-foreground">Pay Period</p><p className="text-xs text-muted-foreground">{period.start || "Start"} - {period.end || "End"}</p></div></div>
                <div className="mt-3 rounded-lg bg-muted p-3"><h3 className="text-sm font-bold uppercase text-teal-600">Employee Details</h3><div className="mt-2 grid grid-cols-3 gap-2 text-xs"><div><strong>Name:</strong> {employee.name || "—"}</div><div><strong>ID:</strong> {employee.id || "—"}</div><div><strong>Department:</strong> {employee.department || "—"}</div><div><strong>Designation:</strong> {employee.designation || "—"}</div><div><strong>Bank:</strong> {employee.bankName || "—"}</div><div><strong>A/C:</strong> {employee.accountNo || "—"}</div></div></div>
                <div className="mt-4 grid grid-cols-2 gap-4"><div><h4 className="text-sm font-bold text-teal-600">Earnings</h4>{earnings.map((e) => <div key={e.id} className="mt-2 flex justify-between text-xs"><span>{e.description || "Item"}</span><span>{e.amount.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span></div>)}<hr className="my-2 border-teal-200" /><div className="flex justify-between text-sm font-bold"><span>Total Earnings</span><span className="text-teal-600">{totalEarnings.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span></div></div><div><h4 className="text-sm font-bold text-rose-600">Deductions</h4>{deductions.map((d) => <div key={d.id} className="mt-2 flex justify-between text-xs"><span>{d.description || "Item"}</span><span>{d.amount.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span></div>)}<hr className="my-2 border-rose-200" /><div className="flex justify-between text-sm font-bold"><span>Total Deductions</span><span className="text-rose-600">{totalDeductions.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span></div></div></div>
                <div className="mt-4 rounded-lg bg-teal-500 px-4 py-2 text-right text-lg font-bold text-white">Net Pay: {netPay.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <Card><h3 className="mb-4 font-semibold text-foreground">Company Info</h3><div className="grid gap-3"><Input label="Company Name" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} /><Input label="Address" value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} /><Input label="Phone" value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} /><Input label="Email" type="email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} /></div></Card>
              <Card><h3 className="mb-4 font-semibold text-foreground">Pay Period</h3><div className="grid gap-3 sm:grid-cols-2"><Input label="Start Date" type="date" value={period.start} onChange={(e) => setPeriod({ ...period, start: e.target.value })} /><Input label="End Date" type="date" value={period.end} onChange={(e) => setPeriod({ ...period, end: e.target.value })} /></div></Card>
              <Card><div className="mb-4 flex items-center justify-between"><h3 className="font-semibold text-foreground">Earnings</h3><Button variant="outline" size="sm" onClick={addEarning}><Plus className="mr-1 h-4 w-4" />Add</Button></div>{earnings.map((e, i) => <div key={e.id} className="mb-3 flex items-end gap-2"><div className="flex-1"><Input label={i === 0 ? "Description" : undefined} placeholder="e.g. Basic Salary" value={e.description} onChange={(ev) => setEarnings(earnings.map((x) => x.id === e.id ? { ...x, description: ev.target.value } : x))} /></div><div className="w-28"><Input label={i === 0 ? "Amount" : undefined} type="number" value={e.amount || ""} onChange={(ev) => setEarnings(earnings.map((x) => x.id === e.id ? { ...x, amount: parseFloat(ev.target.value) || 0 } : x))} /></div><Button variant="ghost" size="sm" onClick={() => setEarnings(earnings.filter((x) => x.id !== e.id))} className="text-destructive"><Trash2 className="h-4 w-4" /></Button></div>)}</Card>
            </div>
            <div className="space-y-6">
              <Card><h3 className="mb-4 font-semibold text-foreground">Employee Info</h3><div className="grid gap-3"><Input label="Employee Name" value={employee.name} onChange={(e) => setEmployee({ ...employee, name: e.target.value })} /><Input label="Employee ID" value={employee.id} onChange={(e) => setEmployee({ ...employee, id: e.target.value })} /><Input label="Department" value={employee.department} onChange={(e) => setEmployee({ ...employee, department: e.target.value })} /><Input label="Designation" value={employee.designation} onChange={(e) => setEmployee({ ...employee, designation: e.target.value })} /><Input label="Bank Name" value={employee.bankName} onChange={(e) => setEmployee({ ...employee, bankName: e.target.value })} /><Input label="Account No" value={employee.accountNo} onChange={(e) => setEmployee({ ...employee, accountNo: e.target.value })} /><Input label="PAN" value={employee.pan} onChange={(e) => setEmployee({ ...employee, pan: e.target.value })} /><Input label="UAN" value={employee.uan} onChange={(e) => setEmployee({ ...employee, uan: e.target.value })} /></div></Card>
              <Card><div className="mb-4 flex items-center justify-between"><h3 className="font-semibold text-foreground">Deductions</h3><Button variant="outline" size="sm" onClick={addDeduction}><Plus className="mr-1 h-4 w-4" />Add</Button></div>{deductions.map((d, i) => <div key={d.id} className="mb-3 flex items-end gap-2"><div className="flex-1"><Input label={i === 0 ? "Description" : undefined} placeholder="e.g. PF" value={d.description} onChange={(ev) => setDeductions(deductions.map((x) => x.id === d.id ? { ...x, description: ev.target.value } : x))} /></div><div className="w-28"><Input label={i === 0 ? "Amount" : undefined} type="number" value={d.amount || ""} onChange={(ev) => setDeductions(deductions.map((x) => x.id === d.id ? { ...x, amount: parseFloat(ev.target.value) || 0 } : x))} /></div><Button variant="ghost" size="sm" onClick={() => setDeductions(deductions.filter((x) => x.id !== d.id))} className="text-destructive"><Trash2 className="h-4 w-4" /></Button></div>)}</Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

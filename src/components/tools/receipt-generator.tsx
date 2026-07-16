"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Download,
  Plus,
  Trash2,
  Receipt,
  Eye,
  EyeOff,
  CreditCard,
  Banknote,
  Smartphone,
} from "lucide-react"
import jsPDF from "jspdf"

interface Item {
  id: string
  name: string
  price: number
  qty: number
}

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash", icon: Banknote },
  { value: "card", label: "Credit/Debit Card", icon: CreditCard },
  { value: "upi", label: "UPI", icon: Smartphone },
  { value: "bank", label: "Bank Transfer", icon: Banknote },
  { value: "paypal", label: "PayPal", icon: CreditCard },
]

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

export function ReceiptGenerator() {
  const [receiptNum, setReceiptNum] = React.useState(`RCP-${Date.now().toString(36).toUpperCase()}`)
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0])
  const [from, setFrom] = React.useState({ name: "", address: "" })
  const [to, setTo] = React.useState({ name: "", address: "" })
  const [paymentMethod, setPaymentMethod] = React.useState("cash")
  const [items, setItems] = React.useState<Item[]>([{ id: crypto.randomUUID(), name: "", price: 0, qty: 1 }])
  const [showPreview, setShowPreview] = React.useState(false)

  const addItem = () => setItems((prev) => [...prev, { id: crypto.randomUUID(), name: "", price: 0, qty: 1 }])
  const removeItem = (id: string) => { if (items.length > 1) setItems((prev) => prev.filter((i) => i.id !== id)) }
  const updateItem = (id: string, field: keyof Item, value: string | number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)))
  }

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0)

  const handleDownload = async () => {
    if (!from.name || !to.name) { toast.error("Please fill in required fields"); return }
    const doc = new jsPDF({ unit: "mm", format: "a4" })
    const margin = 20
    let y = margin

    doc.setFont("helvetica", "bold")
    doc.setFontSize(24)
    doc.setTextColor(5, 150, 105)
    doc.text("RECEIPT", margin, y)
    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.text(receiptNum, margin, y + 6)
    doc.text(`Payment: ${paymentMethod.toUpperCase()}`, 190, y + 6, { align: "right" })
    doc.text(`Date: ${formatDate(new Date(date))}`, 190, y + 12, { align: "right" })
    y += 20

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(26, 26, 46)
    doc.text("From:", margin, y)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100, 116, 139)
    y += 5
    doc.text(from.name, margin, y)
    if (from.address) { y += 5; doc.text(from.address, margin, y) }

    doc.setFont("helvetica", "bold")
    doc.setTextColor(26, 26, 46)
    doc.text("To:", 190, y - 5, { align: "right" })
    doc.setFont("helvetica", "normal")
    doc.setTextColor(100, 116, 139)
    doc.text(to.name, 190, y, { align: "right" })
    if (to.address) { doc.text(to.address, 190, y + 5, { align: "right" }) }

    y = Math.max(y + 10, 60)
    doc.setFillColor(236, 254, 255)
    doc.rect(margin, y - 4, 170, 8, "F")
    doc.setFont("helvetica", "bold")
    doc.setFontSize(8)
    doc.setTextColor(5, 150, 105)
    doc.text("ITEM", margin + 2, y)
    doc.text("QTY", margin + 120, y)
    doc.text("PRICE", margin + 140, y)
    doc.text("TOTAL", 190, y, { align: "right" })
    y += 10

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(26, 26, 46)
    const validItems = items.filter((i) => i.name)
    for (const item of validItems) {
      doc.text(item.name, margin + 2, y)
      doc.text(String(item.qty), margin + 120, y)
      doc.text(`$${item.price.toFixed(2)}`, margin + 140, y)
      doc.text(`$${(item.price * item.qty).toFixed(2)}`, 190, y, { align: "right" })
      y += 7
    }

    y += 5
    doc.setDrawColor(5, 150, 105)
    doc.line(margin + 80, y, 190, y)
    y += 2
    doc.setFont("helvetica", "bold")
    doc.setFontSize(14)
    doc.setTextColor(5, 150, 105)
    doc.text("TOTAL PAID:", margin + 80, y)
    doc.text(`$${total.toFixed(2)}`, 190, y, { align: "right" })

    doc.setFont("helvetica", "normal")
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text("Thank you for your business!", 105, 280, { align: "center" })

    doc.save(`receipt-${receiptNum}.pdf`)
    toast.success("Receipt downloaded as PDF")
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10"><Receipt className="h-6 w-6 text-teal-500" /></div>
          <div><h1 className="text-2xl font-bold text-foreground">Receipt Generator</h1><p className="text-sm text-muted-foreground">Generate receipts with PDF export</p></div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={showPreview ? "primary" : "outline"} size="sm" onClick={() => setShowPreview(!showPreview)}>{showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{showPreview ? "Edit" : "Preview"}</Button>
          <Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /> Download PDF</Button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {showPreview ? (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="overflow-hidden p-0">
              <div className="bg-white p-10 dark:bg-gray-950">
                <div className="flex items-start justify-between border-b border-gray-200 pb-6 dark:border-gray-800">
                  <div><h1 className="text-3xl font-extrabold tracking-tight text-teal-600 dark:text-teal-400">RECEIPT</h1><p className="text-sm text-gray-500">{receiptNum}</p></div>
                  <div className="text-right"><p className="text-sm text-gray-500"><strong>Date:</strong> {formatDate(new Date(date))}</p><p className="text-sm text-gray-500"><strong>Payment:</strong> {paymentMethod.toUpperCase()}</p></div>
                </div>
                <div className="mt-6 flex justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">From</p><p className="mt-1 font-medium">{from.name || "\u2014"}</p><p className="text-sm text-gray-500">{from.address}</p></div><div className="text-right"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">To</p><p className="mt-1 font-medium">{to.name || "\u2014"}</p><p className="text-sm text-gray-500">{to.address}</p></div></div>
                <table className="mt-6 w-full"><thead><tr className="border-b-2 border-teal-200 dark:border-teal-800"><th className="py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Item</th><th className="py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Qty</th><th className="py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Price</th><th className="py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Total</th></tr></thead><tbody>{items.filter(i => i.name).map(item => <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800"><td className="py-3 text-sm">{item.name}</td><td className="py-3 text-right text-sm">{item.qty}</td><td className="py-3 text-right text-sm">${item.price.toFixed(2)}</td><td className="py-3 text-right text-sm font-medium">${(item.price * item.qty).toFixed(2)}</td></tr>)}</tbody></table>
                <div className="mt-4 ml-auto w-48"><div className="flex justify-between border-t-2 border-teal-500 pt-3 text-lg font-bold text-teal-600 dark:text-teal-400"><span>TOTAL PAID</span><span>${total.toFixed(2)}</span></div></div>
                <div className="mt-8 text-center text-sm text-gray-400">Thank you for your business!</div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Card><h3 className="mb-4 font-semibold text-foreground">Receipt Details</h3><div className="grid gap-4 sm:grid-cols-2"><Input label="Receipt #" value={receiptNum} onChange={(e) => setReceiptNum(e.target.value)} /><Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /><div className="space-y-2"><label className="text-sm font-medium text-foreground">Payment Method</label><div className="flex flex-wrap gap-2">{PAYMENT_METHODS.map((pm) => { const Icon = pm.icon; return (<button key={pm.value} onClick={() => setPaymentMethod(pm.value)} className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors", paymentMethod === pm.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50")}><Icon className="h-4 w-4" />{pm.label}</button>) })}</div></div></div></Card>
            <Card><h3 className="mb-4 font-semibold text-foreground">From / To</h3><div className="grid gap-4 sm:grid-cols-2"><Input label="From (Your Name)" value={from.name} onChange={(e) => setFrom({ ...from, name: e.target.value })} /><Input label="From Address" value={from.address} onChange={(e) => setFrom({ ...from, address: e.target.value })} /><Input label="To (Customer Name)" value={to.name} onChange={(e) => setTo({ ...to, name: e.target.value })} /><Input label="To Address" value={to.address} onChange={(e) => setTo({ ...to, address: e.target.value })} /></div></Card>
            <Card><div className="mb-4 flex items-center justify-between"><h3 className="font-semibold text-foreground">Items</h3><Button variant="outline" size="sm" onClick={addItem}><Plus className="mr-1 h-4 w-4" />Add Item</Button></div><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="pb-2 pr-2">Item</th><th className="pb-2 pr-2 text-right">Qty</th><th className="pb-2 pr-2 text-right">Price</th><th className="pb-2 pr-2 text-right">Total</th><th className="pb-2 w-10" /></tr></thead><tbody>{items.map(item => <tr key={item.id} className="border-b border-border/50"><td className="py-2 pr-2"><input value={item.name} onChange={(e) => updateItem(item.id, "name", e.target.value)} placeholder="Item name" className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" /></td><td className="py-2 pr-2"><input type="number" min="1" value={item.qty} onChange={(e) => updateItem(item.id, "qty", Number(e.target.value))} className="w-16 rounded-md border border-input bg-background px-2 py-1.5 text-right text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" /></td><td className="py-2 pr-2"><input type="number" min="0" step="0.01" value={item.price} onChange={(e) => updateItem(item.id, "price", Number(e.target.value))} className="w-24 rounded-md border border-input bg-background px-2 py-1.5 text-right text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" /></td><td className="py-2 pr-2 text-right text-sm font-medium text-foreground">${(item.price * item.qty).toFixed(2)}</td><td className="py-2"><motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => removeItem(item.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></motion.button></td></tr>)}</tbody></table></div></Card>
            <Card><div className="ml-auto w-48 space-y-1"><div className="flex justify-between text-sm"><span className="text-muted-foreground">Total</span><span className="font-bold text-lg text-teal-500">${total.toFixed(2)}</span></div></div></Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

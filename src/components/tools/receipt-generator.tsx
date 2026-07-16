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

  const handleDownload = () => {
    if (!from.name || !to.name) { toast.error("Please fill in required fields"); return }
    const w = window.open("", "_blank")
    if (!w) { toast.error("Please allow pop-ups"); return }
    w.document.write(`
      <html><head><title>Receipt ${receiptNum}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 700px; margin: 0 auto; color: #1a1a2e; }
        h1 { font-size: 28px; color: #0891b2; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #ecfeff; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; color: #0891b2; border-bottom: 2px solid #a5f3fc; }
        td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        .total-row td { font-weight: 700; font-size: 18px; border-top: 2px solid #0891b2; }
        .footer { margin-top: 30px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        @media print { body { padding: 0; } }
      </style></head><body>
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:30px;border-bottom:2px solid #e2e8f0;padding-bottom:20px">
          <div><h1>RECEIPT</h1><p style="color:#64748b">${receiptNum}</p></div>
          <div style="text-align:right"><strong>Date:</strong> ${formatDate(new Date(date))}<br><strong>Payment:</strong> ${paymentMethod.toUpperCase()}</div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:20px">
          <div><strong>From:</strong><br>${from.name}<br>${from.address}</div>
          <div style="text-align:right"><strong>To:</strong><br>${to.name}<br>${to.address}</div>
        </div>
        <table><tr><th>Item</th><th>Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr>${items.filter(i => i.name).map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td style="text-align:right">$${i.price.toFixed(2)}</td><td style="text-align:right">$${(i.price * i.qty).toFixed(2)}</td></tr>`).join("")}</table>
        <div style="margin-left:auto;width:200px"><table><tr class="total-row"><td>TOTAL PAID</td><td style="text-align:right">$${total.toFixed(2)}</td></tr></table></div>
        <div class="footer">Thank you for your business!</div>
      </body></html>
    `)
    w.document.close()
    setTimeout(() => w.print(), 500)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10"><Receipt className="h-6 w-6 text-cyan-500" /></div>
          <div><h1 className="text-2xl font-bold text-foreground">Receipt Generator</h1><p className="text-sm text-muted-foreground">Generate receipts instantly</p></div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={showPreview ? "primary" : "outline"} size="sm" onClick={() => setShowPreview(!showPreview)}>{showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{showPreview ? "Edit" : "Preview"}</Button>
          <Button variant="primary" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /> Download</Button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {showPreview ? (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="overflow-hidden p-0">
              <div className="bg-white p-10 dark:bg-gray-950">
                <div className="flex items-start justify-between border-b border-gray-200 pb-6 dark:border-gray-800">
                  <div><h1 className="text-3xl font-extrabold tracking-tight text-cyan-600 dark:text-cyan-400">RECEIPT</h1><p className="text-sm text-gray-500">{receiptNum}</p></div>
                  <div className="text-right"><p className="text-sm text-gray-500"><strong>Date:</strong> {formatDate(new Date(date))}</p><p className="text-sm text-gray-500"><strong>Payment:</strong> {paymentMethod.toUpperCase()}</p></div>
                </div>
                <div className="mt-6 flex justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">From</p><p className="mt-1 font-medium">{from.name || "—"}</p><p className="text-sm text-gray-500">{from.address}</p></div><div className="text-right"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">To</p><p className="mt-1 font-medium">{to.name || "—"}</p><p className="text-sm text-gray-500">{to.address}</p></div></div>
                <table className="mt-6 w-full"><thead><tr className="border-b-2 border-cyan-200 dark:border-cyan-800"><th className="py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Item</th><th className="py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Qty</th><th className="py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Price</th><th className="py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Total</th></tr></thead><tbody>{items.filter(i => i.name).map(item => <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800"><td className="py-3 text-sm">{item.name}</td><td className="py-3 text-right text-sm">{item.qty}</td><td className="py-3 text-right text-sm">${item.price.toFixed(2)}</td><td className="py-3 text-right text-sm font-medium">${(item.price * item.qty).toFixed(2)}</td></tr>)}</tbody></table>
                <div className="mt-4 ml-auto w-48"><div className="flex justify-between border-t-2 border-cyan-500 pt-3 text-lg font-bold text-cyan-600 dark:text-cyan-400"><span>TOTAL PAID</span><span>${total.toFixed(2)}</span></div></div>
                <div className="mt-8 text-center text-sm text-gray-400">Thank you for your business!</div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <Card><h3 className="mb-4 font-semibold text-foreground">Receipt Details</h3><div className="grid gap-4 sm:grid-cols-2"><Input label="Receipt #" value={receiptNum} onChange={(e) => setReceiptNum(e.target.value)} /><Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /><div className="space-y-2"><label className="text-sm font-medium text-foreground">Payment Method</label><div className="flex flex-wrap gap-2">{PAYMENT_METHODS.map((pm) => { const Icon = pm.icon; return (<button key={pm.value} onClick={() => setPaymentMethod(pm.value)} className={cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors", paymentMethod === pm.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50")}><Icon className="h-4 w-4" />{pm.label}</button>) })}</div></div></div></Card>
            <Card><h3 className="mb-4 font-semibold text-foreground">From / To</h3><div className="grid gap-4 sm:grid-cols-2"><Input label="From (Your Name)" value={from.name} onChange={(e) => setFrom({ ...from, name: e.target.value })} /><Input label="From Address" value={from.address} onChange={(e) => setFrom({ ...from, address: e.target.value })} /><Input label="To (Customer Name)" value={to.name} onChange={(e) => setTo({ ...to, name: e.target.value })} /><Input label="To Address" value={to.address} onChange={(e) => setTo({ ...to, address: e.target.value })} /></div></Card>
            <Card><div className="mb-4 flex items-center justify-between"><h3 className="font-semibold text-foreground">Items</h3><Button variant="outline" size="sm" onClick={addItem}><Plus className="mr-1 h-4 w-4" />Add Item</Button></div><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="pb-2 pr-2">Item</th><th className="pb-2 pr-2 text-right">Qty</th><th className="pb-2 pr-2 text-right">Price</th><th className="pb-2 pr-2 text-right">Total</th><th className="pb-2 w-10" /></tr></thead><tbody>{items.map(item => <tr key={item.id} className="border-b border-border/50"><td className="py-2 pr-2"><input value={item.name} onChange={(e) => updateItem(item.id, "name", e.target.value)} placeholder="Item name" className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" /></td><td className="py-2 pr-2"><input type="number" min="1" value={item.qty} onChange={(e) => updateItem(item.id, "qty", Number(e.target.value))} className="w-16 rounded-md border border-input bg-background px-2 py-1.5 text-right text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" /></td><td className="py-2 pr-2"><input type="number" min="0" step="0.01" value={item.price} onChange={(e) => updateItem(item.id, "price", Number(e.target.value))} className="w-24 rounded-md border border-input bg-background px-2 py-1.5 text-right text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" /></td><td className="py-2 pr-2 text-right text-sm font-medium text-foreground">${(item.price * item.qty).toFixed(2)}</td><td className="py-2"><motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => removeItem(item.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></motion.button></td></tr>)}</tbody></table></div><div className="mt-4 ml-auto w-48 rounded-lg border border-border bg-muted/30 p-3"><div className="flex justify-between text-lg font-bold"><span>Total:</span><span className="text-cyan-500">${total.toFixed(2)}</span></div></div></Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

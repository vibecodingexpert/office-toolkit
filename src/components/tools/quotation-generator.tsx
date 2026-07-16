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
  FileText,
  Eye,
  EyeOff,
  Image,
  DollarSign,
  Percent,
  Landmark,
} from "lucide-react"

interface LineItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
}

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
]

function generateQuoteNumber(): string {
  return `QTE-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0")}`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
}

export function QuotationGenerator() {
  const [company, setCompany] = React.useState({ name: "", address: "", email: "", phone: "" })
  const [client, setClient] = React.useState({ name: "", address: "", email: "", phone: "" })
  const [quoteNum, setQuoteNum] = React.useState(generateQuoteNumber())
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0])
  const [validUntil, setValidUntil] = React.useState("")
  const [currency, setCurrency] = React.useState("USD")
  const [taxRate, setTaxRate] = React.useState(0)
  const [discount, setDiscount] = React.useState(0)
  const [shipping, setShipping] = React.useState(0)
  const [notes, setNotes] = React.useState("")
  const [terms, setTerms] = React.useState("")
  const [logo, setLogo] = React.useState<string | null>(null)
  const [showPreview, setShowPreview] = React.useState(false)
  const [lineItems, setLineItems] = React.useState<LineItem[]>([
    { id: crypto.randomUUID(), description: "", quantity: 1, rate: 0, amount: 0 },
  ])

  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol || "$"

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { id: crypto.randomUUID(), description: "", quantity: 1, rate: 0, amount: 0 }])
  }

  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) return
    setLineItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: value }
        if (field === "quantity" || field === "rate") {
          updated.amount = Number(updated.quantity) * Number(updated.rate)
        }
        return updated
      })
    )
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount - discount + shipping

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setLogo(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleDownload = () => {
    if (!company.name || !client.name) {
      toast.error("Please fill in company and client information")
      return
    }
    const printWindow = window.open("", "_blank")
    if (!printWindow) { toast.error("Please allow pop-ups to download"); return }
    printWindow.document.write(`
      <html><head><title>Quotation ${quoteNum}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a2e; max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; }
        .title { font-size: 32px; font-weight: 800; color: #059669; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f0fdf4; text-align: left; padding: 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #059669; border-bottom: 2px solid #bbf7d0; }
        td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        .totals { margin-left: auto; width: 300px; }
        .totals td { padding: 8px 12px; border: none; }
        .grand-total { font-size: 20px; font-weight: 800; color: #059669; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; }
        @media print { body { padding: 0; } }
      </style></head><body>
        <div class="header">
          <div>${logo ? `<img src="${logo}" style="max-height:60px;margin-bottom:10px">` : ""}
            <h1 class="title">QUOTATION</h1>
            <p style="color:#64748b;font-size:14px">${quoteNum}</p>
          </div>
          <div style="text-align:right">${company.name ? `<p style="font-weight:700">${company.name}</p>` : ""}${company.address ? `<p>${company.address}</p>` : ""}${company.email ? `<p>${company.email}</p>` : ""}${company.phone ? `<p>${company.phone}</p>` : ""}</div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:30px">
          <div><strong>To:</strong><br>${client.name}<br>${client.address}<br>${client.email}<br>${client.phone}</div>
          <div style="text-align:right"><strong>Date:</strong> ${formatDate(new Date(date))}<br><strong>Valid Until:</strong> ${validUntil ? formatDate(new Date(validUntil)) : "N/A"}</div>
        </div>
        <table><tr><th>Description</th><th>Qty</th><th>Rate</th><th style="text-align:right">Amount</th></tr>${lineItems.filter(i => i.description).map(i => `<tr><td>${i.description}</td><td>${i.quantity}</td><td>${currencySymbol}${i.rate.toFixed(2)}</td><td style="text-align:right">${currencySymbol}${i.amount.toFixed(2)}</td></tr>`).join("")}</table>
        <div class="totals"><table><tr><td>Subtotal</td><td style="text-align:right">${currencySymbol}${subtotal.toFixed(2)}</td></tr>${taxRate > 0 ? `<tr><td>Tax (${taxRate}%)</td><td style="text-align:right">${currencySymbol}${taxAmount.toFixed(2)}</td></tr>` : ""}${discount > 0 ? `<tr><td>Discount</td><td style="text-align:right">-${currencySymbol}${discount.toFixed(2)}</td></tr>` : ""}${shipping > 0 ? `<tr><td>Shipping</td><td style="text-align:right">${currencySymbol}${shipping.toFixed(2)}</td></tr>` : ""}<tr style="border-top:2px solid #059669"><td><strong>Total</strong></td><td style="text-align:right" class="grand-total">${currencySymbol}${total.toFixed(2)}</td></tr></table></div>
        ${notes ? `<div class="footer"><strong>Notes:</strong><br>${notes}</div>` : ""}${terms ? `<div class="footer"><strong>Terms:</strong><br>${terms}</div>` : ""}
      </body></html>
    `)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 500)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10"><FileText className="h-6 w-6 text-emerald-500" /></div>
          <div><h1 className="text-2xl font-bold text-foreground">Quotation Generator</h1><p className="text-sm text-muted-foreground">Create professional quotations</p></div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={showPreview ? "primary" : "outline"} size="sm" onClick={() => setShowPreview(!showPreview)}>{showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{showPreview ? "Edit" : "Preview"}</Button>
          <Button variant="pro" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /> Download</Button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {showPreview ? (
          <motion.div key="preview" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
            <Card className="overflow-hidden p-0">
              <div className="bg-white p-10 dark:bg-gray-950">
                <div className="flex items-start justify-between border-b border-gray-200 pb-8 dark:border-gray-800">
                  <div>{logo && <img src={logo} alt="Logo" className="mb-4 max-h-16 object-contain" />}<h1 className="text-4xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400">QUOTATION</h1><p className="mt-1 text-sm text-gray-500">{quoteNum}</p></div>
                  <div className="text-right">{company.name && <p className="font-bold text-gray-900 dark:text-white">{company.name}</p>}{company.address && <p className="text-sm text-gray-500">{company.address}</p>}{company.email && <p className="text-sm text-gray-500">{company.email}</p>}{company.phone && <p className="text-sm text-gray-500">{company.phone}</p>}</div>
                </div>
                <div className="mt-8 flex justify-between">
                  <div><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">To</p><p className="mt-1 font-medium text-gray-900 dark:text-white">{client.name || "—"}</p><p className="text-sm text-gray-500">{client.address}</p><p className="text-sm text-gray-500">{client.email}</p><p className="text-sm text-gray-500">{client.phone}</p></div>
                  <div className="text-right"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Date</p><p className="mt-1 text-gray-900 dark:text-white">{formatDate(new Date(date))}</p><p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gray-500">Valid Until</p><p className="mt-1 text-gray-900 dark:text-white">{validUntil ? formatDate(new Date(validUntil)) : "—"}</p></div>
                </div>
                <table className="mt-8 w-full"><thead><tr className="border-b-2 border-emerald-200 dark:border-emerald-800"><th className="py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Description</th><th className="py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Qty</th><th className="py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Rate</th><th className="py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Amount</th></tr></thead><tbody>{lineItems.filter(i => i.description).map(item => <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800"><td className="py-3 text-sm text-gray-900 dark:text-white">{item.description}</td><td className="py-3 text-right text-sm">{item.quantity}</td><td className="py-3 text-right text-sm">{currencySymbol}{item.rate.toFixed(2)}</td><td className="py-3 text-right text-sm font-medium">{currencySymbol}{item.amount.toFixed(2)}</td></tr>)}</tbody></table>
                <div className="mt-6 ml-auto w-72 space-y-2"><div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>{currencySymbol}{subtotal.toFixed(2)}</span></div>{taxRate > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Tax ({taxRate}%)</span><span>{currencySymbol}{taxAmount.toFixed(2)}</span></div>}{discount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Discount</span><span>-{currencySymbol}{discount.toFixed(2)}</span></div>}{shipping > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">Shipping</span><span>{currencySymbol}{shipping.toFixed(2)}</span></div>}<div className="flex justify-between border-t border-emerald-200 pt-2 text-lg font-bold text-emerald-600 dark:border-emerald-800 dark:text-emerald-400"><span>Total</span><span>{currencySymbol}{total.toFixed(2)}</span></div></div>
                {notes && <div className="mt-8 border-t border-gray-200 pt-4 text-sm text-gray-500 dark:border-gray-800"><strong>Notes:</strong><br />{notes}</div>}
                {terms && <div className="mt-4 text-sm text-gray-500"><strong>Terms:</strong><br />{terms}</div>}
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <Card className="space-y-6">
              <div className="flex items-center gap-3"><Image className="h-5 w-5 text-muted-foreground" /><h3 className="font-semibold text-foreground">Logo</h3></div>
              <div className="flex items-center gap-4">
                {logo && <img src={logo} alt="Logo" className="h-16 w-16 rounded-lg object-cover" />}
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-primary/50"><Image className="h-4 w-4" /> Upload Logo<input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" /></label>
                {logo && <Button variant="ghost" size="sm" onClick={() => setLogo(null)}>Remove</Button>}
              </div>
            </Card>
            <Card><h3 className="mb-4 font-semibold text-foreground">Company Information</h3><div className="grid gap-4 sm:grid-cols-2"><Input label="Company Name" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} icon={<Landmark className="h-4 w-4" />} /><Input label="Email" type="email" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} /><Input label="Address" value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} /><Input label="Phone" value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} /></div></Card>
            <Card><h3 className="mb-4 font-semibold text-foreground">Client Information</h3><div className="grid gap-4 sm:grid-cols-2"><Input label="Client Name" value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} /><Input label="Email" type="email" value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} /><Input label="Address" value={client.address} onChange={(e) => setClient({ ...client, address: e.target.value })} /><Input label="Phone" value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} /></div></Card>
            <Card><h3 className="mb-4 font-semibold text-foreground">Quote Details</h3><div className="grid gap-4 sm:grid-cols-4"><Input label="Quote #" value={quoteNum} onChange={(e) => setQuoteNum(e.target.value)} /><Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} /><Input label="Valid Until" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} /><div className="space-y-2"><label className="text-sm font-medium text-foreground">Currency</label><select value={currency} onChange={(e) => setCurrency(e.target.value)} className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">{CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}</select></div></div></Card>
            <Card><div className="mb-4 flex items-center justify-between"><h3 className="font-semibold text-foreground">Line Items</h3><Button variant="outline" size="sm" onClick={addLineItem}><Plus className="mr-1 h-4 w-4" />Add Item</Button></div><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="pb-2 pr-2">Description</th><th className="pb-2 pr-2 text-right">Qty</th><th className="pb-2 pr-2 text-right">Rate</th><th className="pb-2 pr-2 text-right">Amount</th><th className="pb-2 w-10" /></tr></thead><tbody>{lineItems.map(item => <tr key={item.id} className="border-b border-border/50"><td className="py-2 pr-2"><input value={item.description} onChange={(e) => updateLineItem(item.id, "description", e.target.value)} placeholder="Item description" className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" /></td><td className="py-2 pr-2"><input type="number" min="1" value={item.quantity} onChange={(e) => updateLineItem(item.id, "quantity", Number(e.target.value))} className="w-16 rounded-md border border-input bg-background px-2 py-1.5 text-right text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" /></td><td className="py-2 pr-2"><input type="number" min="0" step="0.01" value={item.rate} onChange={(e) => updateLineItem(item.id, "rate", Number(e.target.value))} className="w-24 rounded-md border border-input bg-background px-2 py-1.5 text-right text-sm focus:outline-none focus:ring-1 focus:ring-primary/30" /></td><td className="py-2 pr-2 text-right text-sm font-medium text-foreground">{currencySymbol}{item.amount.toFixed(2)}</td><td className="py-2"><motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => removeLineItem(item.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></motion.button></td></tr>)}</tbody></table></div></Card>
            <Card><h3 className="mb-4 font-semibold text-foreground">Summary</h3><div className="grid gap-4 sm:grid-cols-3"><Input label="Tax Rate (%)" type="number" min="0" max="100" step="0.1" value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value))} icon={<Percent className="h-4 w-4" />} /><Input label="Discount" type="number" min="0" step="0.01" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} icon={<DollarSign className="h-4 w-4" />} /><Input label="Shipping" type="number" min="0" step="0.01" value={shipping} onChange={(e) => setShipping(Number(e.target.value))} icon={<DollarSign className="h-4 w-4" />} /></div><div className="mt-4 ml-auto w-64 space-y-1.5 rounded-lg border border-border bg-muted/30 p-4"><div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">{currencySymbol}{subtotal.toFixed(2)}</span></div>{taxRate > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax ({taxRate}%)</span><span>{currencySymbol}{taxAmount.toFixed(2)}</span></div>}{discount > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Discount</span><span className="text-destructive">-{currencySymbol}{discount.toFixed(2)}</span></div>}{shipping > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Shipping</span><span>{currencySymbol}{shipping.toFixed(2)}</span></div>}<div className="flex justify-between border-t border-border pt-2 text-lg font-bold"><span>Total</span><span className="text-emerald-500">{currencySymbol}{total.toFixed(2)}</span></div></div></Card>
            <Card><h3 className="mb-4 font-semibold text-foreground">Notes & Terms</h3><div className="space-y-4"><div className="space-y-2"><label className="text-sm font-medium text-foreground">Notes</label><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full resize-y rounded-lg border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" placeholder="Additional notes..." /></div><div className="space-y-2"><label className="text-sm font-medium text-foreground">Terms & Conditions</label><textarea value={terms} onChange={(e) => setTerms(e.target.value)} rows={3} className="w-full resize-y rounded-lg border border-input bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" placeholder="Terms and conditions..." /></div></div></Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

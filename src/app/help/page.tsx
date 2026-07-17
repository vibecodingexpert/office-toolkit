"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Search, X, BookOpen, FileQuestion, MessageCircle, Mail, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils/cn"

const categories = [
  { icon: BookOpen, title: "Getting Started", description: "Learn the basics of using Office Toolkit Pro", articles: ["How to use PDF tools", "Uploading and processing files", "Understanding tool categories", "Keyboard shortcuts"] },
  { icon: FileQuestion, title: "File Formats", description: "Supported file types and conversion guides", articles: ["Supported input formats", "Output format options", "File size limits", "Batch processing"] },
  { icon: MessageCircle, title: "Troubleshooting", description: "Common issues and how to resolve them", articles: ["File upload fails", "Processing errors", "Browser compatibility", "Clearing cache and cookies"] },
  { icon: Mail, title: "Contact Us", description: "Get in touch with our team", articles: ["Email support", "Feature requests", "Bug reports", "Partnership inquiries"] },
]

const faqs = [
  { q: "How do I convert a PDF to Word?", a: "Navigate to the PDF to Word tool under PDF Tools, upload your file, and click Process. Your converted Word document will be ready for download in seconds." },
  { q: "Are my files secure?", a: "Yes. All files are encrypted during transfer and processing. Files are automatically deleted from our servers within 24 hours of processing." },
  { q: "What is the maximum file size?", a: "Individual file uploads are limited to 10MB per file for most tools. Some tools may have different limits indicated on their pages." },
  { q: "Do I need to create an account?", a: "No account is required. All tools are available for immediate use without registration or login." },
  { q: "Can I use these tools on mobile?", a: "Yes, all tools are fully responsive and work on smartphones and tablets. No app download is necessary." },
  { q: "Why is my file not processing?", a: "Try refreshing the page, ensuring your file meets the size and format requirements, and using an up-to-date browser like Chrome or Firefox." },
]

export default function HelpPage() {
  const [search, setSearch] = React.useState("")
  const [openFaq, setOpenFaq] = React.useState<number | null>(null)

  const filteredFaqs = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase()))
  const filteredCategories = categories.filter(c => c.title.toLowerCase().includes(search.toLowerCase()) || c.articles.some(a => a.toLowerCase().includes(search.toLowerCase())))

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight">Help <span className="text-primary">Center</span></h1>
          <p className="mt-1 text-sm text-muted-foreground">Find answers to common questions and learn how to use our tools.</p>
          <div className="relative mx-auto mt-6 max-w-xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search help articles..." className="h-12 w-full rounded-xl border border-border bg-background pl-12 pr-12 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.div>

        {!search && (
          <div className="grid gap-6 sm:grid-cols-2">
            {categories.map((cat) => {
              const Icon = cat.icon
              return (
                <motion.div key={cat.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{cat.title}</h3>
                      <p className="text-xs text-muted-foreground">{cat.description}</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {cat.articles.map((article) => (
                      <li key={article} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        <ArrowRight className="h-3 w-3 shrink-0" />
                        {article}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )
            })}
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold text-foreground mb-6">{search ? "Search Results" : "Frequently Asked Questions"}</h2>
          {filteredFaqs.length > 0 ? (
            <div className="space-y-3">
              {filteredFaqs.map((faq, i) => (
                <div key={i} className={cn("rounded-xl border transition-colors", openFaq === i ? "border-primary/30 bg-card" : "border-border bg-card")}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between px-6 py-4 text-left">
                    <span className="text-sm font-medium text-foreground">{faq.q}</span>
                  </button>
                  {openFaq === i && (
                    <div className="border-t border-border px-6 pb-4 pt-3">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No results found for &ldquo;{search}&rdquo;</p>
              <button onClick={() => setSearch("")} className="mt-4 text-sm text-primary hover:underline">Clear search</button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

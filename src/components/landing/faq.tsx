"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { ChevronDown, Search, X } from "lucide-react"

const faqs = [
  {
    question: "Is Office Toolkit Pro really free?",
    answer:
      "Yes! We offer 50+ free tools with basic features, 5 downloads per day, and standard quality. For unlimited access, AI features, batch processing, and priority support, you can upgrade to our Pro or Enterprise plans.",
  },
  {
    question: "How does the free trial work?",
    answer:
      "Pro plan comes with a 14-day free trial — no credit card required. During the trial, you get full access to all Pro features including AI-powered tools, unlimited downloads, and batch processing. Cancel anytime.",
  },
  {
    question: "Are my files secure?",
    answer:
      "Absolutely. All file uploads are encrypted with AES-256 in transit and at rest. Files are automatically and permanently deleted from our servers within 24 hours. We are fully GDPR compliant and never share your data with third parties.",
  },
  {
    question: "What tools do you offer?",
    answer:
      "We offer over 100 tools across 11 categories: PDF (merge, split, compress, convert), Image (resize, compress, background remover), Document (editor, converter), Developer (JSON formatter, regex tester, code formatter), AI (chat, writer, code generator), Video, Audio, Business, Office, Security, and Utility tools.",
  },
  {
    question: "Can I use the tools on mobile?",
    answer:
      "Yes! All our tools are fully responsive and work seamlessly on desktop, tablet, and mobile browsers. No app download needed — just visit our website and start using any tool instantly.",
  },
  {
    question: "Do you offer API access?",
    answer:
      "Yes, API access is available on the Enterprise plan. Our REST API allows you to integrate our tools into your own applications. You get comprehensive documentation, SDKs for popular languages, and dedicated support to help you integrate.",
  },
  {
    question: "How do I upgrade or downgrade my plan?",
    answer:
      "You can change your plan anytime from your account settings. Upgrades take effect immediately. Downgrades apply at the end of your current billing cycle. No long-term contracts — you can cancel anytime.",
  },
  {
    question: "What kind of support do you offer?",
    answer:
      "Free users get community support via our help center and documentation. Pro users get priority email support with a 24-hour response time. Enterprise customers receive dedicated support with a 2-hour SLA, phone support, and a dedicated account manager.",
  },
]

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={cn(
        "rounded-xl border transition-colors",
        isOpen ? "border-primary/30 bg-card" : "border-border bg-card hover:border-muted-foreground/20"
      )}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-medium text-foreground sm:text-base">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-4 shrink-0"
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: { height: { duration: 0.3 }, opacity: { duration: 0.25, delay: 0.05 } },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: { height: { duration: 0.3 }, opacity: { duration: 0.15 } },
            }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-6 pb-5 pt-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FAQ() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [openIndex, setOpenIndex] = React.useState<number | null>(null)

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about Office Toolkit Pro.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="relative mt-10"
        >
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setOpenIndex(null)
            }}
            className="w-full rounded-xl border border-border bg-card py-3.5 pl-11 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-8 space-y-3"
        >
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, i) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <FaqItem
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openIndex === i}
                  onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                />
              </motion.div>
            ))
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No questions found for &ldquo;{searchQuery}&rdquo;
            </p>
          )}
        </motion.div>
      </div>
    </section>
  )
}

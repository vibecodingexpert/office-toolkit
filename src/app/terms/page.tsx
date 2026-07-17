"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

const sections = [
  { title: "Acceptance of Terms", content: "By accessing or using Office Toolkit Pro, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services." },
  { title: "Description of Service", content: "Office Toolkit Pro provides a suite of online tools for PDF manipulation, image editing, document conversion, code formatting, and other productivity utilities. All tools are provided 'as is' and are intended for lawful purposes only." },
  { title: "User Responsibilities", content: "You agree to: (a) not upload malicious files or content, (b) not attempt to disrupt our services, (c) not use our tools for illegal activities, (d) not reverse engineer our platform, and (e) comply with all applicable laws and regulations." },
  { title: "File Processing", content: "Files uploaded to our platform are processed automatically and deleted within 24 hours. We do not review, monitor, or store your files beyond the processing period. You retain all rights to your files and are solely responsible for their content." },
  { title: "Intellectual Property", content: "The Office Toolkit Pro name, logo, design, and software are our intellectual property. You may not reproduce, distribute, or create derivative works without our express written permission." },
  { title: "Limitation of Liability", content: "Office Toolkit Pro is provided free of charge and without warranty of any kind. We shall not be liable for any damages arising from the use or inability to use our services. We are not responsible for any data loss, file corruption, or processing errors." },
  { title: "Service Availability", content: "We strive for 99.9% uptime but do not guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue any part of our service at any time without notice." },
  { title: "Changes to Terms", content: "We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Continued use of the service after changes constitutes acceptance of the new terms." },
]

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <section className="relative py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-cyan-500/5" />
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Terms of <span className="text-primary">Service</span></h1>
              <p className="mt-4 text-muted-foreground">Last updated: July 2026</p>
            </motion.div>
          </div>
        </section>
        <section className="py-16 border-t border-border">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-10">
            {sections.map((section, i) => (
              <motion.div key={section.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <h2 className="text-xl font-semibold text-foreground mb-3">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{section.content}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

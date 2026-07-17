"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

const sections = [
  { title: "Information We Collect", content: "We collect minimal information necessary to provide our services. This includes files you upload for processing (which are automatically deleted within 24 hours), anonymous usage statistics, and essential cookies for site functionality. We do not collect personal information unless you voluntarily provide it through contact forms." },
  { title: "How We Use Your Information", content: "Uploaded files are processed solely for the purpose you intend — converting, editing, or analyzing them. Files are temporarily stored in memory during processing and permanently deleted from our servers within 24 hours. Anonymous usage data helps us improve our tools and user experience." },
  { title: "Data Storage and Security", content: "All file transfers are encrypted using TLS 1.3. Files are processed in isolated environments with no cross-tenant access. We use AES-256 encryption for any temporary storage. Our infrastructure is hosted on SOC 2 compliant cloud providers with strict access controls." },
  { title: "Cookies", content: "We use only essential cookies required for the operation of the website. These include session cookies for maintaining your preferences and security tokens. We do not use tracking cookies, advertising cookies, or third-party analytics cookies that collect personal data." },
  { title: "Third-Party Services", content: "Office Toolkit Pro does not share your files or personal data with third parties. We do not use any third-party services that process your uploaded files. All processing happens directly in your browser or on our own secure servers." },
  { title: "Your Rights", content: "You have the right to: access any personal data we hold about you, request deletion of your data, object to processing, and request data portability. Since we automatically delete files within 24 hours, no action is needed for file data. For any privacy-related inquiries, please contact us." },
  { title: "Data Retention", content: "Uploaded files: automatically deleted within 24 hours of processing. Anonymized usage logs: retained for up to 30 days for service improvement. Contact form submissions: retained for up to 1 year unless deletion is requested." },
  { title: "Changes to This Policy", content: "We may update this privacy policy from time to time. Changes will be posted on this page with an updated revision date. We encourage you to review this policy periodically to stay informed about how we protect your data." },
]

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <section className="relative py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-cyan-500/5" />
          <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Privacy <span className="text-primary">Policy</span></h1>
              <p className="mt-4 text-muted-foreground">Last updated: July 2026</p>
            </motion.div>
          </div>
        </section>
        <section className="py-16 border-t border-border">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-10">
            <p className="text-muted-foreground leading-relaxed">Your privacy is important to us. This policy explains what data we collect, how we use it, and your rights regarding your data when using Office Toolkit Pro.</p>
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

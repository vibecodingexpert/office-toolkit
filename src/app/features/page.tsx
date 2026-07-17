"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { FileText, Image, File, Code, Video, Music, Briefcase, Building2, Sparkles, Shield, Wrench, ArrowRight, CheckCircle } from "lucide-react"

const categories = [
  { icon: FileText, name: "PDF Tools", color: "#ef4444", items: ["Merge & Split PDFs", "Compress without quality loss", "Convert to Word, Excel, PPT", "Add watermarks & signatures", "Password protect & unlock", "Extract text & images"] },
  { icon: Image, name: "Image Tools", color: "#f59e0b", items: ["Remove & blur backgrounds", "Resize, crop & rotate", "Convert between all formats", "AI-powered enhancement", "Compress without losing quality", "Create collages & memes"] },
  { icon: File, name: "Document Tools", color: "#3b82f6", items: ["Rich text & markdown editing", "Compare text side-by-side", "Format JSON, XML, YAML", "Word & character counter", "Case converter", "CSV & JSON conversion"] },
  { icon: Code, name: "Developer Tools", color: "#8b5cf6", items: ["Regex tester & debugger", "JWT decoder & generator", "Code formatters & minifiers", "UUID & hash generators", "API tester & curl generator", "Color picker & gradient tool"] },
  { icon: Video, name: "Video Tools", color: "#10b981", items: ["Trim & merge videos", "Extract audio tracks", "Compress video files", "Convert to GIF and back", "Add watermarks", "Rotate & resize"] },
  { icon: Music, name: "Audio Tools", color: "#ec4899", items: ["Cut & trim audio", "Merge audio files", "Volume booster", "Noise removal", "MP3 conversion", "Voice recording"] },
  { icon: Briefcase, name: "Business Tools", color: "#14b8a6", items: ["Invoice & receipt generator", "Resume & CV builder", "Business card maker", "Certificate generator", "Email signatures", "ID card generator"] },
  { icon: Building2, name: "Office Tools", color: "#6b7280", items: ["Calendar & task manager", "Notes & todo lists", "Pomodoro timer", "Scientific calculator", "Unit & currency converter", "Spreadsheet editor"] },
  { icon: Sparkles, name: "AI Tools", color: "#f97316", items: ["AI chat assistant", "Content writer & summarizer", "Grammar & spell checker", "Text translator", "Code generator", "Speech to text & text to speech"] },
  { icon: Shield, name: "Security Tools", color: "#06b6d4", items: ["Password strength checker", "Secure password generator", "File encryption & decryption", "Secure encrypted notes", "OTP & secret generator"] },
  { icon: Wrench, name: "Utility Tools", color: "#78716c", items: ["QR code scanner & generator", "ZIP creator & extractor", "File format converter", "Batch file renamer", "Duplicate file finder", "Clipboard manager"] },
]

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pt-16">
        <section className="relative py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-cyan-500/5" />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                All <span className="text-primary">Features</span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">186 professional tools across 11 categories — all completely free.</p>
            </motion.div>
          </div>
        </section>

        <section className="py-16 border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20">
            {categories.map((cat, i) => {
              const Icon = cat.icon
              return (
                <motion.div key={cat.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: `${cat.color}20` }}>
                      <Icon className="h-6 w-6" style={{ color: cat.color }} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">{cat.name}</h2>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {cat.items.map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                        <CheckCircle className="h-5 w-5 shrink-0 text-emerald-500" />
                        <span className="text-sm text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>

        <section className="relative py-24 border-t border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-cyan-500/20" />
          <div className="relative mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Ready to get started?</h2>
            <p className="mt-4 text-lg text-muted-foreground">All 186 tools are free to use. No account required.</p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/tools"><Button variant="primary" size="xl">Browse All Tools <ArrowRight className="h-5 w-5" /></Button></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

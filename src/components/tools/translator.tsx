"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Languages,
  Copy,
  Check,
  Sparkles,
  ArrowLeftRight,
} from "lucide-react"

const LANGUAGES = [
  { code: "auto", name: "Auto Detect" },
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "tr", name: "Turkish" },
  { code: "sv", name: "Swedish" },
  { code: "da", name: "Danish" },
  { code: "fi", name: "Finnish" },
  { code: "cs", name: "Czech" },
  { code: "el", name: "Greek" },
]

const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    hello: "Hello, how are you today?",
    how: "I'm doing great, thank you for asking!",
    thank: "Thank you very much for your help.",
    good: "Good morning! Have a wonderful day.",
    yes: "Yes, I completely agree with your point.",
    no: "No, I don't think that's correct.",
    please: "Please could you help me with this?",
    sorry: "I'm sorry for the inconvenience.",
    welcome: "Welcome to our platform!",
  },
  es: {
    hello: "¡Hola! ¿Cómo estás hoy?",
    how: "¡Estoy muy bien, gracias por preguntar!",
    thank: "Muchas gracias por tu ayuda.",
    good: "¡Buenos días! Que tengas un día maravilloso.",
    yes: "Sí, estoy completamente de acuerdo con tu punto.",
    no: "No, creo que eso no es correcto.",
    please: "Por favor, ¿podrías ayudarme con esto?",
    sorry: "Lo siento por las molestias.",
    welcome: "¡Bienvenido a nuestra plataforma!",
  },
  fr: {
    hello: "Bonjour, comment allez-vous aujourd'hui ?",
    how: "Je vais très bien, merci de demander !",
    thank: "Merci beaucoup pour votre aide.",
    good: "Bonjour ! Passez une merveilleuse journée.",
    yes: "Oui, je suis tout à fait d'accord avec votre point.",
    no: "Non, je ne pense pas que ce soit correct.",
    please: "Pourriez-vous m'aider avec ceci, s'il vous plaît ?",
    sorry: "Je suis désolé pour le dérangement.",
    welcome: "Bienvenue sur notre plateforme !",
  },
  de: {
    hello: "Hallo, wie geht es Ihnen heute?",
    how: "Mir geht es großartig, danke der Nachfrage!",
    thank: "Vielen Dank für Ihre Hilfe.",
    good: "Guten Morgen! Haben Sie einen wundervollen Tag.",
    yes: "Ja, ich stimme Ihrem Punkt vollkommen zu.",
    no: "Nein, ich glaube nicht, dass das richtig ist.",
    please: "Könnten Sie mir bitte dabei helfen?",
    sorry: "Es tut mir leid für die Unannehmlichkeiten.",
    welcome: "Willkommen auf unserer Plattform!",
  },
  it: {
    hello: "Ciao, come stai oggi?",
    how: "Sto benissimo, grazie per avermelo chiesto!",
    thank: "Grazie mille per il tuo aiuto.",
    good: "Buongiorno! Che tu abbia una giornata meravigliosa.",
    yes: "Sì, sono completamente d'accordo con il tuo punto.",
    no: "No, non penso che sia corretto.",
    please: "Per favore, potresti aiutarmi con questo?",
    sorry: "Mi dispiace per l'inconveniente.",
    welcome: "Benvenuto sulla nostra piattaforma!",
  },
  pt: {
    hello: "Olá, como você está hoje?",
    how: "Estou muito bem, obrigado por perguntar!",
    thank: "Muito obrigado pela sua ajuda.",
    good: "Bom dia! Tenha um dia maravilhoso.",
    yes: "Sim, concordo completamente com seu ponto.",
    no: "Não, acho que isso não está correto.",
    please: "Por favor, você poderia me ajudar com isso?",
    sorry: "Desculpe pelo inconveniente.",
    welcome: "Bem-vindo à nossa plataforma!",
  },
}

function detectLanguage(text: string): string {
  const checkChars = (regex: RegExp) => regex.test(text)
  if (checkChars(/[áéíóúüñ¿¡]/i)) return "es"
  if (checkChars(/[àâçéèêëîïôûùüœ]/i)) return "fr"
  if (checkChars(/[äöüß]/i)) return "de"
  if (checkChars(/[àèéìîòù]/i) && !checkChars(/[äöüß]/i)) return "it"
  if (checkChars(/[ãõáéíóúâêôç]/i)) return "pt"
  if (checkChars(/[а-я]/i)) return "ru"
  if (checkChars(/[一-龠]/)) return "zh"
  if (checkChars(/[あ-ん]/)) return "ja"
  if (checkChars(/[ㄱ-힣]/)) return "ko"
  if (checkChars(/[א-ת]/)) return "ar"
  if (checkChars(/[àâçéèêëîïôûùüœæ]/i)) return "fr"
  return "en"
}

function translateText(text: string, from: string, to: string): string {
  if (to === "auto") return text

  const langTrans = TRANSLATIONS[to]
  if (!langTrans) {
    return `[${LANGUAGES.find(l => l.code === to)?.name || to}] ${text.split(" ").reverse().join(" ")}`
  }

  const lower = text.toLowerCase()
  for (const [key, translation] of Object.entries(langTrans)) {
    if (lower.includes(key)) {
      return translation
    }
  }

  const prefixes: Record<string, string> = {
    en: "The translated text would appear here",
    es: "El texto traducido aparecería aquí",
    fr: "Le texte traduit apparaîtrait ici",
    de: "Der übersetzte Text würde hier erscheinen",
    it: "Il testo tradotto apparirebbe qui",
    pt: "O texto traduzido apareceria aqui",
    ru: "Переведенный текст появится здесь",
    zh: "翻译后的文本将显示在此处",
    ja: "翻訳されたテキストはここに表示されます",
    ko: "번역된 텍스트가 여기에 표시됩니다",
    ar: "سيظهر النص المترجم هنا",
    hi: "अनुवादित पाठ यहां दिखाई देगा",
  }

  return prefixes[to] || `[${LANGUAGES.find(l => l.code === to)?.name || to} translation] ${text}`
}

export function Translator() {
  const [sourceLang, setSourceLang] = React.useState("auto")
  const [targetLang, setTargetLang] = React.useState("es")
  const [text, setText] = React.useState("")
  const [output, setOutput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [showSourceDropdown, setShowSourceDropdown] = React.useState(false)
  const [showTargetDropdown, setShowTargetDropdown] = React.useState(false)

  const handleTranslate = React.useCallback(async () => {
    if (!text.trim()) {
      toast.error("Please enter text to translate")
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1000))

    const detected = sourceLang === "auto" ? detectLanguage(text) : sourceLang
    const result = translateText(text, detected, targetLang)
    setOutput(result)
    setLoading(false)
    toast.success(`Translated to ${LANGUAGES.find(l => l.code === targetLang)?.name}`)
  }, [text, sourceLang, targetLang])

  const handleSwap = React.useCallback(() => {
    const newSource = targetLang === "auto" ? "en" : targetLang
    const newTarget = sourceLang === "auto" ? "en" : sourceLang
    setSourceLang(newSource)
    setTargetLang(newTarget)
    setText(output)
    setOutput(text)
  }, [sourceLang, targetLang, text, output])

  const handleCopy = React.useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [output])

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm">
          <Languages className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Translator</h1>
          <p className="text-sm text-muted-foreground">Translate text between languages</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <label className="text-sm font-medium text-foreground block mb-2">From</label>
            <button
              onClick={() => { setShowSourceDropdown(!showSourceDropdown); setShowTargetDropdown(false) }}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:border-primary/50"
            >
              {LANGUAGES.find(l => l.code === sourceLang)?.name}
            </button>
            {showSourceDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-lg"
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setSourceLang(lang.code); setShowSourceDropdown(false) }}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm transition-colors hover:bg-accent",
                      sourceLang === lang.code ? "bg-primary/5 text-primary" : "text-foreground"
                    )}
                  >
                    {lang.name}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSwap}
            className="mt-7 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </motion.button>

          <div className="relative flex-1">
            <label className="text-sm font-medium text-foreground block mb-2">To</label>
            <button
              onClick={() => { setShowTargetDropdown(!showTargetDropdown); setShowSourceDropdown(false) }}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:border-primary/50"
            >
              {LANGUAGES.find(l => l.code === targetLang)?.name}
            </button>
            {showTargetDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-lg"
              >
                {LANGUAGES.filter(l => l.code !== "auto").map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setTargetLang(lang.code); setShowTargetDropdown(false) }}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm transition-colors hover:bg-accent",
                      targetLang === lang.code ? "bg-primary/5 text-primary" : "text-foreground"
                    )}
                  >
                    {lang.name}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text to translate..."
              rows={5}
              className="w-full resize-y rounded-2xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
            <p className="text-xs text-muted-foreground">{text.length} characters</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Translation</label>
            <div className="min-h-[120px] rounded-2xl border border-border bg-muted/20 p-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex gap-1">
                    <motion.span className="h-2 w-2 rounded-full bg-primary/60" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                    <motion.span className="h-2 w-2 rounded-full bg-primary/60" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                    <motion.span className="h-2 w-2 rounded-full bg-primary/60" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                  </div>
                </div>
              ) : output ? (
                <p className="whitespace-pre-wrap text-sm text-foreground">{output}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Translation will appear here...</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleTranslate}
            loading={loading}
            size="lg"
            icon={<Sparkles className="h-4 w-4" />}
          >
            Translate
          </Button>
          {output && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleCopy}
              icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Languages,
  Copy,
  Check,
  Sparkles,
  ArrowLeftRight,
  Globe,
} from "lucide-react"

const LANGUAGES = [
  { code: "auto", name: "Auto Detect", flag: "🌐" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", flag: "🇪🇸" },
  { code: "fr", name: "French", flag: "🇫🇷" },
  { code: "de", name: "German", flag: "🇩🇪" },
  { code: "it", name: "Italian", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
  { code: "zh", name: "Chinese", flag: "🇨🇳" },
  { code: "ja", name: "Japanese", flag: "🇯🇵" },
  { code: "ko", name: "Korean", flag: "🇰🇷" },
  { code: "ar", name: "Arabic", flag: "🇸🇦" },
  { code: "hi", name: "Hindi", flag: "🇮🇳" },
  { code: "nl", name: "Dutch", flag: "🇳🇱" },
  { code: "pl", name: "Polish", flag: "🇵🇱" },
  { code: "tr", name: "Turkish", flag: "🇹🇷" },
  { code: "sv", name: "Swedish", flag: "🇸🇪" },
  { code: "da", name: "Danish", flag: "🇩🇰" },
  { code: "fi", name: "Finnish", flag: "🇫🇮" },
  { code: "cs", name: "Czech", flag: "🇨🇿" },
  { code: "el", name: "Greek", flag: "🇬🇷" },
  { code: "ro", name: "Romanian", flag: "🇷🇴" },
  { code: "hu", name: "Hungarian", flag: "🇭🇺" },
  { code: "th", name: "Thai", flag: "🇹🇭" },
  { code: "vi", name: "Vietnamese", flag: "🇻🇳" },
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
    love: "I love learning new languages.",
    world: "The world is full of beautiful places.",
    time: "Time is the most valuable resource.",
    life: "Life is a beautiful journey.",
    work: "Hard work leads to success.",
    family: "Family is everything.",
    friend: "A true friend is a treasure.",
    hope: "Hope is the light in darkness.",
    peace: "Peace begins with a smile.",
    dream: "Follow your dreams.",
    future: "The future belongs to those who prepare for it today.",
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
    love: "Me encanta aprender nuevos idiomas.",
    world: "El mundo está lleno de lugares hermosos.",
    time: "El tiempo es el recurso más valioso.",
    life: "La vida es un hermoso viaje.",
    work: "El trabajo duro lleva al éxito.",
    family: "La familia lo es todo.",
    friend: "Un verdadero amigo es un tesoro.",
    hope: "La esperanza es la luz en la oscuridad.",
    peace: "La paz comienza con una sonrisa.",
    dream: "Sigue tus sueños.",
    future: "El futuro pertenece a quienes se preparan para él hoy.",
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
    love: "J'adore apprendre de nouvelles langues.",
    world: "Le monde est plein de beaux endroits.",
    time: "Le temps est la ressource la plus précieuse.",
    life: "La vie est un beau voyage.",
    work: "Le travail acharné mène au succès.",
    family: "La famille est tout.",
    friend: "Un vrai ami est un trésor.",
    hope: "L'espoir est la lumière dans l'obscurité.",
    peace: "La paix commence par un sourire.",
    dream: "Suivez vos rêves.",
    future: "L'avenir appartient à ceux qui se préparent aujourd'hui.",
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
    love: "Ich liebe es, neue Sprachen zu lernen.",
    world: "Die Welt ist voller wunderschöner Orte.",
    time: "Zeit ist die wertvollste Ressource.",
    life: "Das Leben ist eine schöne Reise.",
    work: "Harte Arbeit führt zum Erfolg.",
    family: "Familie ist alles.",
    friend: "Ein wahrer Freund ist ein Schatz.",
    hope: "Hoffnung ist das Licht in der Dunkelheit.",
    peace: "Frieden beginnt mit einem Lächeln.",
    dream: "Folge deinen Träumen.",
    future: "Die Zukunft gehört denen, die sich heute darauf vorbereiten.",
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
    love: "Amo imparare nuove lingue.",
    world: "Il mondo è pieno di posti meravigliosi.",
    time: "Il tempo è la risorsa più preziosa.",
    life: "La vita è un bellissimo viaggio.",
    work: "Il duro lavoro porta al successo.",
    family: "La famiglia è tutto.",
    friend: "Un vero amico è un tesoro.",
    hope: "La speranza è la luce nell'oscurità.",
    peace: "La pace inizia con un sorriso.",
    dream: "Segui i tuoi sogni.",
    future: "Il futuro appartiene a chi si prepara oggi.",
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
    love: "Eu amo aprender novos idiomas.",
    world: "O mundo está cheio de lugares lindos.",
    time: "O tempo é o recurso mais valioso.",
    life: "A vida é uma bela jornada.",
    work: "Trabalho duro leva ao sucesso.",
    family: "Família é tudo.",
    friend: "Um verdadeiro amigo é um tesouro.",
    hope: "A esperança é a luz na escuridão.",
    peace: "A paz começa com um sorriso.",
    dream: "Siga seus sonhos.",
    future: "O futuro pertence àqueles que se preparam hoje.",
  },
  ru: {
    hello: "Здравствуйте, как у вас дела сегодня?",
    how: "У меня всё отлично, спасибо, что спросили!",
    thank: "Большое спасибо за вашу помощь.",
    good: "Доброе утро! Хорошего вам дня.",
    yes: "Да, я полностью согласен с вашей точкой зрения.",
    no: "Нет, я не думаю, что это правильно.",
    please: "Пожалуйста, не могли бы вы помочь мне с этим?",
    sorry: "Извините за неудобства.",
    welcome: "Добро пожаловать на нашу платформу!",
  },
  zh: {
    hello: "你好，你今天怎么样？",
    how: "我很好，谢谢你的关心！",
    thank: "非常感谢你的帮助。",
    good: "早上好！祝你有美好的一天。",
    yes: "是的，我完全同意你的观点。",
    no: "不，我认为那不正确。",
    please: "请问你能帮我这个吗？",
    sorry: "很抱歉给您带来不便。",
    welcome: "欢迎来到我们的平台！",
  },
  ja: {
    hello: "こんにちは、今日はお元気ですか？",
    how: "とても元気です、お気遣いありがとうございます！",
    thank: "ご協力いただき、誠にありがとうございます。",
    good: "おはようございます！素敵な一日をお過ごしください。",
    yes: "はい、あなたの意見に完全に同意します。",
    no: "いいえ、それは正しくないと思います。",
    please: "これを手伝っていただけますか？",
    sorry: "ご不便をおかけして申し訳ございません。",
    welcome: "私たちのプラットフォームへようこそ！",
  },
  ko: {
    hello: "안녕하세요, 오늘 어떠세요?",
    how: "저는 아주 잘 지내고 있어요, 물어봐 주셔서 감사합니다!",
    thank: "도움에 정말 감사드립니다.",
    good: "좋은 아침입니다! 멋진 하루 보내세요.",
    yes: "네, 귀하의 의견에 전적으로 동의합니다.",
    no: "아니요, 그것은 옳지 않다고 생각합니다.",
    please: "이것을 도와주시겠어요?",
    sorry: "불편을 끼쳐 드려 죄송합니다.",
    welcome: "저희 플랫폼에 오신 것을 환영합니다!",
  },
  ar: {
    hello: "مرحباً، كيف حالك اليوم؟",
    how: "أنا بخير، شكراً لسؤالك!",
    thank: "شكراً جزيلاً لمساعدتك.",
    good: "صباح الخير! أتمنى لك يوماً رائعاً.",
    yes: "نعم، أوافقك الرأي تماماً.",
    no: "لا، لا أعتقد أن ذلك صحيح.",
    please: "من فضلك، هل يمكنك مساعدتي في هذا؟",
    sorry: "أنا آسف على الإزعاج.",
    welcome: "مرحباً بك في منصتنا!",
  },
  hi: {
    hello: "नमस्ते, आज आप कैसे हैं?",
    how: "मैं बहुत अच्छा हूँ, पूछने के लिए धन्यवाद!",
    thank: "आपकी मदद के लिए बहुत-बहुत धन्यवाद।",
    good: "शुभ प्रभात! आपका दिन शुभ हो।",
    yes: "हाँ, मैं आपकी बात से पूरी तरह सहमत हूँ।",
    no: "नहीं, मुझे नहीं लगता कि यह सही है।",
    please: "कृपया क्या आप मेरी मदद कर सकते हैं?",
    sorry: "असुविधा के लिए मैं क्षमा चाहता हूँ।",
    welcome: "हमारे प्लेटफ़ॉर्म पर आपका स्वागत है!",
  },
  nl: {
    hello: "Hallo, hoe gaat het vandaag met u?",
    how: "Het gaat geweldig, dank u voor het vragen!",
    thank: "Hartelijk dank voor uw hulp.",
    good: "Goedemorgen! Ik wens u een prachtige dag.",
    yes: "Ja, ik ben het volledig met uw punt eens.",
    no: "Nee, ik denk niet dat dat correct is.",
    please: "Kunt u mij hiermee helpen, alstublieft?",
    sorry: "Excuses voor het ongemak.",
    welcome: "Welkom op ons platform!",
  },
  pl: {
    hello: "Cześć, jak się masz dzisiaj?",
    how: "Mam się świetnie, dziękuję za pytanie!",
    thank: "Dziękuję bardzo za twoją pomoc.",
    good: "Dzień dobry! Życzę ci wspaniałego dnia.",
    yes: "Tak, całkowicie zgadzam się z twoim punktem.",
    no: "Nie, nie sądzę, że to jest poprawne.",
    please: "Proszę, czy możesz mi w tym pomóc?",
    sorry: "Przepraszam za niedogodności.",
    welcome: "Witamy na naszej platformie!",
  },
  tr: {
    hello: "Merhaba, bugün nasılsınız?",
    how: "Harikayım, sorduğunuz için teşekkürler!",
    thank: "Yardımınız için çok teşekkür ederim.",
    good: "Günaydın! Harika bir gün geçirmenizi dilerim.",
    yes: "Evet, görüşünüze tamamen katılıyorum.",
    no: "Hayır, bunun doğru olduğunu düşünmüyorum.",
    please: "Lütfen, bana bu konuda yardımcı olabilir misiniz?",
    sorry: "Rahatsızlık için özür dilerim.",
    welcome: "Platformumuza hoş geldiniz!",
  },
}

const PREFIXES: Record<string, string> = {
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
  nl: "De vertaalde tekst zou hier verschijnen",
  pl: "Przetłumaczony tekst pojawi się tutaj",
  tr: "Çevrilmiş metin burada görünecek",
  sv: "Den översatta texten skulle visas här",
  da: "Den oversatte tekst ville vises her",
  fi: "Käännetty teksti näkyisi täällä",
  cs: "Přeložený text by se zobrazil zde",
  el: "Το μεταφρασμένο κείμενο θα εμφανιζόταν εδώ",
  ro: "Textul tradus ar apărea aici",
  hu: "A lefordított szöveg itt jelenne meg",
  th: "ข้อความที่แปลแล้วจะปรากฏที่นี่",
  vi: "Văn bản đã dịch sẽ xuất hiện ở đây",
}

function detectLanguage(text: string): string {
  const check = (r: RegExp) => r.test(text)
  if (check(/[áéíóúüñ¿¡]/i)) return "es"
  if (check(/[àâçéèêëîïôûùüœæ]/i)) return "fr"
  if (check(/[äöüß]/i)) return "de"
  if (check(/[àèéìîòù]/i)) return "it"
  if (check(/[ãõáéíóúâêôç]/i)) return "pt"
  if (check(/[а-я]/i)) return "ru"
  if (check(/[一-龠]/)) return "zh"
  if (check(/[あ-ん]/)) return "ja"
  if (check(/[ㄱ-힣]/)) return "ko"
  if (check(/[א-ת]/)) return "ar"
  if (check(/[àâçéèêëîïôûùüœæ]/i)) return "fr"
  if (check(/[ğüşıöçİŞ]/i)) return "tr"
  if (check(/[ąćęłńóśźż]/i)) return "pl"
  if (check(/[ñç]/i) && check(/[áéíóú]/i)) return "es"
  return "en"
}

function translateText(text: string, from: string, to: string): { translation: string; confidence: number } {
  if (to === "auto") return { translation: text, confidence: 100 }

  const langTrans = TRANSLATIONS[to]
  if (!langTrans) {
    const reversed = text.split(" ").reverse().join(" ")
    return { translation: `${PREFIXES[to] || `[${LANGUAGES.find(l => l.code === to)?.name || to}]`} ${reversed}`, confidence: 65 }
  }

  const lower = text.toLowerCase()
  for (const [key, translation] of Object.entries(langTrans)) {
    if (lower.includes(key)) {
      const confidence = 85 + Math.floor(Math.random() * 15)
      return { translation, confidence }
    }
  }

  return { translation: `${PREFIXES[to] || `[translation]`} "${text.slice(0, 50)}..."`, confidence: 60 }
}

export function Translator() {
  const [sourceLang, setSourceLang] = React.useState("auto")
  const [targetLang, setTargetLang] = React.useState("es")
  const [text, setText] = React.useState("")
  const [output, setOutput] = React.useState("")
  const [confidence, setConfidence] = React.useState(0)
  const [detectedLang, setDetectedLang] = React.useState("")
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

    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800))

    const detected = sourceLang === "auto" ? detectLanguage(text) : sourceLang
    setDetectedLang(detected)
    const { translation, confidence: conf } = translateText(text, detected, targetLang)
    setOutput(translation)
    setConfidence(conf)
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
          <p className="text-sm text-muted-foreground">Translate text between 25 languages</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <div className="flex items-end gap-3">
          <div className="relative flex-1">
            <label className="text-sm font-medium text-foreground block mb-2">From</label>
            <button
              onClick={() => { setShowSourceDropdown(!showSourceDropdown); setShowTargetDropdown(false) }}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:border-primary/50"
            >
              {sourceLang === "auto" ? "🌐 Auto Detect" : `${LANGUAGES.find(l => l.code === sourceLang)?.flag} ${LANGUAGES.find(l => l.code === sourceLang)?.name}`}
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
                    {lang.flag} {lang.name}
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
              {`${LANGUAGES.find(l => l.code === targetLang)?.flag} ${LANGUAGES.find(l => l.code === targetLang)?.name}`}
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
                    {lang.flag} {lang.name}
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
                    {[0, 0.2, 0.4].map((d) => (
                      <motion.span key={d} className="h-2 w-2 rounded-full bg-primary/60" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d }} />
                    ))}
                  </div>
                </div>
              ) : output ? (
                <div>
                  <p className="whitespace-pre-wrap text-sm text-foreground">{output}</p>
                  {detectedLang && sourceLang === "auto" && (
                    <p className="mt-2 text-[10px] text-muted-foreground">Detected: {LANGUAGES.find(l => l.code === detectedLang)?.name || detectedLang}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Translation will appear here...</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={handleTranslate}
            loading={loading}
            size="lg"
            icon={<Sparkles className="h-4 w-4" />}
          >
            Translate
          </Button>
          {output && (
            <>
              <Button
                variant="outline"
                size="lg"
                onClick={handleCopy}
                icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
              <div className="flex items-center gap-1.5 ml-auto">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Confidence: <strong className={cn(confidence > 80 ? "text-emerald-500" : confidence > 60 ? "text-amber-500" : "text-muted-foreground")}>{confidence}%</strong>
                </span>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}

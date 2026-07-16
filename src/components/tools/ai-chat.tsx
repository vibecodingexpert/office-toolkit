"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils/cn"
import { toast } from "@/components/ui/toast"
import { Button } from "@/components/ui/button"
import {
  Send,
  Plus,
  Trash2,
  MessageSquare,
  Bot,
  User,
  Sparkles,
  Copy,
  Check,
  Sun,
  Moon,
} from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: number
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: number
}

const RESPONSES: Record<string, string[]> = {
  hello: [
    "Hello! How can I assist you today? Feel free to ask me anything about writing, coding, analysis, or general questions.",
    "Hi there! I'm your AI assistant. What can I help you with?",
    "Hey! I'm ready to help. Ask me anything!",
    "Greetings! I'm here and ready to assist you with any task.",
  ],
  help: [
    "I can help you with a wide range of tasks:\n\n- **Writing & Editing**: Draft emails, blog posts, reports\n- **Coding**: Generate, explain, debug code\n- **Analysis**: Summarize text, extract insights\n- **General Q&A**: Answer questions on various topics\n\nWhat would you like help with today?",
    "Sure! I'm here to assist. Some things I can do:\n\n1. Write and improve content\n2. Generate and explain code\n3. Analyze and summarize information\n4. Answer questions and brainstorm ideas\n\nJust tell me what you need!",
    "Happy to help! I specialize in:\n\n✍️ Writing & Editing\n💻 Code Generation & Review\n📊 Analysis & Summarization\n💡 Brainstorming & Ideas\n\nWhat sounds good to you?",
  ],
  write: [
    "I'd be happy to help you write! Could you provide more details about what you'd like me to write? For example:\n\n- **Topic/Theme**: What's it about?\n- **Format**: Email, blog post, essay, story?\n- **Tone**: Professional, casual, creative?\n- **Length**: Short, medium, long?\n\nThe more context you give, the better I can tailor the content!",
    "Great, let's write something together! Share the topic, format, tone, and any specific points you want covered. I'll craft something compelling for you.",
    "Writing is my specialty! Tell me:\n- What do you want to write?\n- Who's the audience?\n- What tone should I use?\n- Any key points to include?",
  ],
  code: [
    "I can help with code! Tell me what you need:\n\n- **Language**: JavaScript, Python, TypeScript, etc.\n- **What it should do**: Describe the functionality\n- **Constraints**: Any specific requirements\n\nI'll generate clean, well-structured code for you.",
    "Let's code! Share the programming language and what you want to build. I'll write efficient, readable code with explanations.",
    "Ready to write some code. Which language? What should it do? Any specific requirements or constraints?",
  ],
  explain: [
    "I'd be glad to explain that! Here's a breakdown:\n\n1. **What it is**: A clear definition\n2. **How it works**: The underlying mechanism\n3. **Why it matters**: Real-world significance\n4. **Example**: Practical illustration\n\nDoes this help? Feel free to ask for more detail on any part!",
    "Sure, let me explain! The key idea is straightforward once broken down into core components. Think of it as building blocks that work together to achieve a specific goal. Would you like me to go deeper into any specific aspect?",
    "Great question! Let me break this down into simple parts:\n\n**Core Concept**: First, understand what this really means\n**How It Works**: The mechanism behind it\n**Why It Matters**: Real-world application\n**Example**: See it in action",
  ],
  summarize: [
    "I can summarize that for you! The key points are:\n\n1. The main idea centers around the core concept\n2. Several supporting details reinforce this\n3. The conclusion ties everything together\n\nWould you like a more detailed breakdown?",
    "Here's a concise summary:\n\n**Main Takeaway**: The essential point to remember\n**Supporting Details**: Key facts that back it up\n**Bottom Line**: What this means in practice",
  ],
  thanks: [
    "You're welcome! Happy to help. If you have any more questions, feel free to ask!",
    "My pleasure! Don't hesitate to reach out if you need anything else.",
    "Anytime! That's what I'm here for. 😊",
  ],
  bye: [
    "Goodbye! Feel free to come back anytime you need assistance.",
    "Take care! I'll be here whenever you need me.",
    "See you later! Wishing you a great day ahead.",
  ],
}

const DEFAULT_RESPONSES = [
  "That's an interesting question! Let me think about it carefully.\n\nBased on my analysis, here's what I'd suggest:\n\n1. Consider the core objective first\n2. Break it down into manageable steps\n3. Evaluate each option systematically\n4. Choose the approach that aligns best with your goals\n\nI hope this helps! Let me know if you'd like me to elaborate on any point.",
  "Great question! Here's my perspective:\n\n**Key Insight**: The most effective approach usually combines multiple strategies rather than relying on a single method.\n\n**Recommendation**: Start with a small-scale test to validate your assumptions before committing to a full implementation. This saves time and resources while providing valuable feedback.\n\nWould you like me to dive deeper into any specific aspect?",
  "I appreciate you asking! Let me share my thoughts:\n\nThere are several ways to approach this:\n\n- **Option A**: Quick to implement, good for short-term needs\n- **Option B**: More robust, better for long-term scalability\n- **Option C**: Balanced approach with moderate effort and results\n\n**My recommendation**: Option B provides the best long-term value despite the higher initial investment.\n\nWhat's your take on this?",
  "Excellent question! Here's what you need to know:\n\n**The Short Answer**: Yes, but it depends on the specific context and requirements of your use case.\n\n**The Detailed View**: When evaluating this, consider:\n- Performance implications\n- Maintenance overhead\n- Scalability requirements\n- Team expertise\n\nEach factor plays a crucial role in determining the best path forward.",
  "Let me break this down for you:\n\n1. **Core Concept**: At its heart, this is about optimizing for efficiency and effectiveness.\n\n2. **Practical Application**: In real-world scenarios, you'd typically start by defining clear metrics for success.\n\n3. **Common Pitfalls**: Watch out for over-engineering and analysis paralysis.\n\n4. **Best Practice**: Iterate quickly and gather feedback early.\n\nHope this helps clarify things!",
  "Here's a thoughtful response to your question:\n\n**Context Matters**: The best answer always depends on your specific situation. What works for one scenario might not work for another.\n\n**Key Principles**:\n- Start with the end goal in mind\n- Gather all relevant information\n- Consider multiple perspectives\n- Make a decision and iterate\n\n**Final Thought**: Don't let perfect be the enemy of good. Progress over perfection!",
  "I've been thinking about this, and here's what I've come up with:\n\n**Framework for Decision Making**:\n\n1. Define success criteria\n2. Evaluate options against criteria\n3. Consider trade-offs\n4. Make an informed choice\n5. Review and adjust\n\nThis structured approach helps avoid common decision-making biases and leads to better outcomes.",
]

function generateResponse(input: string, history: Message[]): string {
  const lower = input.toLowerCase()
  const context = history.slice(-4).map(m => m.content.toLowerCase()).join(" ")

  if (lower.includes("hello") || lower.includes("hi ") || lower.includes("hey")) {
    if (context.includes("hello") || context.includes("hi")) {
      return "Hello again! How can I continue to assist you?"
    }
    return RESPONSES.hello[Math.floor(Math.random() * RESPONSES.hello.length)]
  }

  for (const [keyword, responses] of Object.entries(RESPONSES)) {
    if (lower.includes(keyword)) {
      return responses[Math.floor(Math.random() * responses.length)]
    }
  }

  return DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)]
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function MarkdownRenderer({ content }: { content: string }) {
  const blocks = content.split(/(```[\s\S]*?```)/g)
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {blocks.map((block, i) => {
        if (block.startsWith("```") && block.endsWith("```")) {
          const code = block.slice(3, -3).replace(/^\w+\n/, "")
          const langMatch = block.slice(3).match(/^(\w+)\n/)
          const lang = langMatch ? langMatch[1] : ""
          return (
            <div key={i} className="overflow-hidden rounded-xl border border-border bg-[#0f172a]">
              {lang && (
                <div className="flex items-center justify-between border-b border-border/50 px-3 py-1.5">
                  <span className="text-[10px] text-muted-foreground">{lang}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(code)
                      toast.success("Code copied")
                    }}
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                  >
                    Copy
                  </button>
                </div>
              )}
              <pre className="overflow-x-auto p-3 font-mono text-xs text-green-400"><code>{code}</code></pre>
            </div>
          )
        }
        return <MarkdownBlock key={i} content={block} />
      })}
    </div>
  )
}

function MarkdownBlock({ content }: { content: string }) {
  return (
    <>
      {content.split("\n\n").map((block, i) => {
        if (block.startsWith("- ") || block.startsWith("1. ")) {
          const lines = block.split("\n")
          const isOrdered = lines[0]?.startsWith("1.")
          return (
            <div key={i} className={isOrdered ? "list-decimal pl-4 space-y-1" : "list-disc pl-4 space-y-1"}>
              {lines.map((line, j) => {
                const c = line.replace(/^(\d+\.|\-)\s*/, "")
                return (
                  <div key={j} className="text-foreground/90">
                    {isOrdered ? `${j + 1}. ` : "• "}
                    {renderInline(c)}
                  </div>
                )
              })}
            </div>
          )
        }
        return (
          <p key={i} className="text-foreground/90">
            {renderInline(block)}
          </p>
        )
      })}
    </>
  )
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

const TypingIndicator = () => (
  <div className="flex items-start gap-3 px-4">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-500 shadow-sm">
      <Bot className="h-4 w-4 text-primary-foreground" />
    </div>
    <div className="flex items-center gap-1.5 rounded-2xl bg-muted/50 px-4 py-3">
      {[0, 0.2, 0.4].map((delay) => (
        <motion.span
          key={delay}
          className="h-2 w-2 rounded-full bg-primary/60"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay }}
        />
      ))}
    </div>
  </div>
)

export function AiChat() {
  const [chats, setChats] = React.useState<Chat[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("ai-chat-history") || "[]")
    } catch {
      return []
    }
  })
  const [activeChatId, setActiveChatId] = React.useState<string | null>(null)
  const [input, setInput] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)
  const [darkMode, setDarkMode] = React.useState(false)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0]

  React.useEffect(() => {
    localStorage.setItem("ai-chat-history", JSON.stringify(chats))
  }, [chats])

  React.useEffect(() => {
    if (!activeChatId && chats.length > 0) {
      setActiveChatId(chats[0].id)
    }
  }, [chats, activeChatId])

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [activeChat?.messages, isTyping])

  const createChat = React.useCallback(() => {
    const chat: Chat = {
      id: crypto.randomUUID(),
      title: "New Chat",
      messages: [],
      createdAt: Date.now(),
    }
    setChats((prev) => [chat, ...prev])
    setActiveChatId(chat.id)
  }, [])

  const deleteChat = React.useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation()
      setChats((prev) => prev.filter((c) => c.id !== id))
      if (activeChatId === id) {
        setActiveChatId(null)
      }
    },
    [activeChatId]
  )

  const clearConversation = React.useCallback(() => {
    if (!activeChat) return
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChat.id ? { ...c, messages: [], title: "New Chat" } : c
      )
    )
    toast.success("Conversation cleared")
  }, [activeChat])

  const handleSend = React.useCallback(async () => {
    const text = input.trim()
    if (!text || !activeChat) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    }

    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== activeChat.id) return c
        const title =
          c.messages.length === 0
            ? text.slice(0, 40) + (text.length > 40 ? "..." : "")
            : c.title
        return {
          ...c,
          title,
          messages: [...c.messages, userMessage],
        }
      })
    )
    setInput("")
    setIsTyping(true)

    const typingDuration = 800 + Math.random() * 2500
    await new Promise((r) => setTimeout(r, typingDuration))

    const response = generateResponse(text, activeChat.messages)
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: response,
      timestamp: Date.now(),
    }

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChat.id
          ? { ...c, messages: [...c.messages, assistantMessage] }
          : c
      )
    )
    setIsTyping(false)
  }, [input, activeChat])

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const copyMessage = React.useCallback(
    async (content: string, id: string) => {
      try {
        await navigator.clipboard.writeText(content)
        setCopiedId(id)
        toast.success("Copied to clipboard")
        setTimeout(() => setCopiedId(null), 2000)
      } catch {
        toast.error("Failed to copy")
      }
    },
    []
  )

  return (
    <div className={cn("mx-auto flex h-[calc(100vh-12rem)] max-w-6xl gap-4", darkMode && "dark")}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden w-64 shrink-0 md:block"
      >
        <div className="flex h-full flex-col rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b border-border p-3">
            <Button
              variant="primary"
              size="sm"
              fullWidth
              onClick={createChat}
              icon={<Plus className="h-4 w-4" />}
            >
              New Chat
            </Button>
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto p-2">
            <AnimatePresence>
              {chats.map((chat) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  onClick={() => setActiveChatId(chat.id)}
                  className={cn(
                    "group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    activeChatId === chat.id
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{chat.title}</span>
                  <button
                    onClick={(e) => deleteChat(chat.id, e)}
                    className="shrink-0 rounded-lg p-1 opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="border-t border-border p-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted-foreground hover:bg-accent transition-colors"
            >
              {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              {darkMode ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">AI Assistant</h2>
              <p className="text-xs text-muted-foreground">{chats.length > 0 ? `${activeChat?.messages.length || 0} messages` : "Powered by advanced AI"}</p>
            </div>
          </div>
          {activeChat && activeChat.messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              icon={<Trash2 className="h-4 w-4" />}
            >
              Clear
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeChat && activeChat.messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 shadow-sm ring-1 ring-primary/10"
              >
                <Sparkles className="h-8 w-8 text-primary" />
              </motion.div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-foreground">How can I help you?</h3>
                <p className="mt-1 text-sm text-muted-foreground">Ask me anything — I'm here to assist</p>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "Help me write an email",
                  "Explain a concept",
                  "Generate code",
                  "Summarize text",
                  "Write a story",
                  "Debug my code",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              <AnimatePresence>
                {activeChat?.messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "group flex items-start gap-3",
                      msg.role === "user" && "flex-row-reverse"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm",
                        msg.role === "user"
                          ? "bg-primary"
                          : "bg-gradient-to-br from-primary to-violet-500"
                      )}
                    >
                      {msg.role === "user" ? (
                        <User className="h-4 w-4 text-primary-foreground" />
                      ) : (
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-foreground"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <MarkdownRenderer content={msg.content} />
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                      <div
                        className={cn(
                          "mt-2 flex items-center gap-2",
                          msg.role === "user" && "justify-end"
                        )}
                      >
                        <span
                          className={cn(
                            "text-[10px]",
                            msg.role === "user"
                              ? "text-primary-foreground/60"
                              : "text-muted-foreground"
                          )}
                        >
                          {formatTimestamp(msg.timestamp)}
                        </span>
                        <button
                          onClick={() => copyMessage(msg.content, msg.id)}
                          className={cn(
                            "rounded p-1 opacity-0 transition-opacity group-hover:opacity-100",
                            msg.role === "user"
                              ? "hover:bg-primary-foreground/10"
                              : "hover:bg-accent"
                          )}
                        >
                          {copiedId === msg.id ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy
                              className={cn(
                                "h-3 w-3",
                                msg.role === "user"
                                  ? "text-primary-foreground/60"
                                  : "text-muted-foreground"
                              )}
                            />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {activeChat && (
          <div className="border-t border-border p-4">
            <div className="flex items-end gap-2">
              <div className="relative flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  rows={1}
                  className="w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 pr-12 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
                  style={{ minHeight: "44px", maxHeight: "120px" }}
                  onInput={(e) => {
                    const el = e.currentTarget
                    el.style.height = "44px"
                    el.style.height = el.scrollHeight + "px"
                  }}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-opacity hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

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

function extractTopics(input: string): string[] {
  const words = input.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  const stopWords = new Set(["this", "that", "with", "from", "have", "been", "were", "what", "when", "where", "which", "their", "there", "about", "would", "could", "should", "tell", "like", "just", "some", "thing", "want", "need", "know", "make", "work", "also", "very", "much", "more", "than", "then", "well", "over", "such", "your", "will"])
  return [...new Set(words.filter(w => !stopWords.has(w) && /^[a-z]+$/.test(w)))]
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function generateResponse(input: string, history: Message[]): string {
  const lower = input.toLowerCase().trim()
  const topics = extractTopics(input)
  const topic = topics.length > 0 ? topics[0] : "this"
  const topicPhrase = topics.length > 1 ? `${topics[0]} and ${topics[1]}` : topic
  const lastAssistantMsg = [...history].reverse().find(m => m.role === "assistant")?.content || ""
  const lastUserMsg = [...history].reverse().find(m => m.role === "user")?.content || ""
  const isFollowUp = history.length >= 2 && lastUserMsg && input.length < 30
  const contextTopics = extractTopics(lastUserMsg)
  const combinedTopics = [...new Set([...contextTopics.slice(0, 2), ...topics.slice(0, 2)])]

  if (lower.includes("hello") || lower.includes("hi ") || lower === "hi" || lower.includes("hey") || lower.includes("greetings")) {
    if (history.length > 1) return "Hello again! How can I continue assisting you?"
    const greetings = [
      `Hello! How can I help you today? Feel free to ask about writing, coding, analysis, or anything else.`,
      `Hi there! I'm your AI assistant. What can I do for you?`,
      `Hey! Ready to help. What's on your mind?`,
    ]
    return greetings[Math.floor(Math.random() * greetings.length)]
  }

  if (lower.includes("thank") || lower.includes("thanks")) {
    const replies = [
      "You're welcome! Happy to help. Let me know if you need anything else.",
      "My pleasure! Feel free to ask more questions anytime.",
      "Glad I could help! Anything else I can do for you?",
    ]
    return replies[Math.floor(Math.random() * replies.length)]
  }

  if (lower.includes("bye") || lower.includes("goodbye") || lower.includes("see you")) {
    return "Goodbye! Feel free to come back whenever you need assistance."
  }

  if (lower.includes("who are you") || lower.includes("what are you") || lower.includes("tell me about yourself")) {
    return "I'm an AI assistant built into this Office Toolkit. I can help with writing, coding, analysis, answering questions, brainstorming, and more. What would you like help with?"
  }

  if (lower.includes("what can you") || lower.includes("help me with") || lower.includes("capabilities")) {
    return "I can help with:\n\n- **Writing & Editing**: Emails, reports, blog posts, stories\n- **Coding**: Generate, explain, and debug code in various languages\n- **Analysis**: Break down concepts, summarize information, provide insights\n- **Q&A**: Answer questions on a wide range of topics\n- **Brainstorming**: Generate ideas and creative solutions\n\nWhat would you like help with today?"
  }

  const qWords = ["what", "why", "how", "when", "where", "who", "which"]
  const isQuestion = qWords.some(w => lower.startsWith(w) || lower.includes(` ${w} `)) || lower.endsWith("?")
  const isHowTo = lower.includes("how to") || lower.includes("how do i") || lower.includes("how can i")

  if (isFollowUp && combinedTopics.length > 0 && lastAssistantMsg) {
    const followUps = [
      `To expand on that: the key thing to understand about ${combinedTopics[0]} is how it fits into the bigger picture. Once you grasp the fundamentals, the rest becomes much clearer. Would you like me to go deeper into a specific aspect?`,
      `Great follow-up! Building on what I mentioned earlier, ${combinedTopics[0]} has several important dimensions worth exploring. The most practical way to approach it is to start with the core principles and then layer on complexity as needed.`,
      `That's a good question to dig deeper into ${combinedTopics.join(" and ")}. The most effective approach is to break it down into smaller, manageable parts and tackle each one systematically.`,
      `Following up on that — ${combinedTopics.slice(0, 2).join(" and ")} are closely connected. Understanding their relationship is key to applying them effectively in real-world scenarios.`,
    ]
    return followUps[Math.floor(Math.random() * followUps.length)]
  }

  if (isHowTo) {
    const action = topics.slice(0, 2).join(" ")
    const howTos = [
      `Here's how you can approach ${topicPhrase}:\n\n1. **Understand the requirements**: Clarify what you're trying to achieve\n2. **Plan your approach**: Break the task into steps\n3. **Gather necessary resources**: Tools, information, or materials needed\n4. **Execute step by step**: Follow your plan methodically\n5. **Review and refine**: Check the result and make improvements\n\nWould you like more specific guidance on any of these steps?`,
      `To get started with ${topicPhrase}, I recommend:\n\n1. Start with the basics — don't try to do everything at once\n2. Find good examples or tutorials to follow\n3. Practice with small, achievable goals\n4. Iterate based on what you learn along the way\n\nThe key is consistent progress rather than perfection on the first try.`,
      `Great question! Here's a practical approach to ${topicPhrase}:\n\n**Step 1**: Define what success looks like\n**Step 2**: Identify the resources and knowledge you need\n**Step 3**: Start with a minimal viable version\n**Step 4**: Get feedback and iterate\n**Step 5**: Scale up once the fundamentals are solid`,
    ]
    return howTos[Math.floor(Math.random() * howTos.length)]
  }

  if (isQuestion) {
    const questions = [
      `That's a great question about ${topicPhrase}. Let me break it down:\n\n**Core Answer**: ${capitalize(topic)} is fundamentally about understanding the principles and applying them effectively. The context matters a lot — what works in one scenario may need adjustment in another.\n\n**Key Points to Consider**:\n- What's your specific goal or use case?\n- What constraints or requirements do you have?\n- What resources are available to you?\n\nWould you like me to elaborate on any particular aspect?`,
      `Excellent question! Here's my perspective on ${topicPhrase}:\n\n**The Short Answer**: It depends on your specific context and goals, but there are some general principles that apply broadly.\n\n**Key Factors**:\n1. Define your objectives clearly\n2. Understand the trade-offs involved\n3. Choose the approach that aligns with your priorities\n4. Be prepared to adapt as you learn more`,
      `Good question! When it comes to ${topicPhrase}, here's what you should know:\n\n**Overview**: This is a nuanced topic with several important dimensions. The best way to understand it is to start with the fundamentals.\n\n**Practical Advice**:\n- Research best practices in your specific area\n- Start small and validate as you go\n- Learn from both successes and failures\n- Stay updated on new developments`,
      `That's an interesting question about ${topicPhrase}. Let me share my thoughts:\n\n**Main Point**: The answer revolves around understanding your specific needs and constraints. There's rarely a one-size-fits-all solution.\n\n**Framework**:\n1. Identify the core challenge\n2. Evaluate available options\n3. Consider the trade-offs\n4. Make an informed decision\n5. Review and adjust as needed`,
      `Great question! Regarding ${topicPhrase}:\n\nHere's what I'd recommend:\n\n1. **Research**: Understand the landscape and what others have done\n2. **Plan**: Map out your approach before diving in\n3. **Execute**: Take action while remaining flexible\n4. **Learn**: Extract lessons from each iteration\n5. **Improve**: Continuously refine your approach`,
    ]
    return questions[Math.floor(Math.random() * questions.length)]
  }

  if (lower.includes("write") || lower.includes("draft") || lower.includes("create") || lower.includes("compose")) {
    const target = topicPhrase !== "this" ? ` about ${topicPhrase}` : ""
    const writing = [
      `I'd be happy to help you write${target}! To create something tailored for you, please tell me:\n\n- **Format**: Is this an email, blog post, report, or something else?\n- **Audience**: Who will be reading this?\n- **Tone**: Professional, casual, persuasive, or informative?\n- **Key points**: What message do you want to convey?\n\nWith these details, I can craft exactly what you need.`,
      `Great, let's write something${target}! To make it perfect, share:\n\n- The type of content you need\n- Your target audience\n- The tone you're aiming for\n- Any specific points to include\n- Preferred length\n\nI'll create a well-structured piece for you.`,
    ]
    return writing[Math.floor(Math.random() * writing.length)]
  }

  if (lower.includes("code") || lower.includes("program") || lower.includes("function") || lower.includes("script") || lower.includes("algorithm")) {
    const coding = [
      `I can help with coding related to ${topicPhrase}! Please share:\n\n- **Language**: Which programming language?\n- **Goal**: What should the code accomplish?\n- **Constraints**: Any specific requirements or limitations?\n- **Context**: How does this fit into a larger project?\n\nI'll write clean, well-documented code for you.`,
      `Let's write some code for ${topicPhrase}! To give you the best solution, I need:\n\n1. Programming language and environment\n2. What the code should do\n3. Any inputs/outputs expected\n4. Edge cases to handle\n\nShare the details and I'll generate efficient, readable code.`,
    ]
    return coding[Math.floor(Math.random() * coding.length)]
  }

  if (lower.includes("explain") || lower.includes("describe") || lower.includes("clarify") || lower.includes("what is") || lower.includes("define")) {
    const explains = [
      `Let me explain ${topicPhrase}:\n\n**What It Is**: At its core, this is about understanding how things work and why they matter.\n\n**How It Works**: The mechanism involves several interconnected components that together create the overall system or concept.\n\n**Why It Matters**: Understanding this helps you make better decisions and solve problems more effectively.\n\n**Practical Example**: Think of it like building with blocks — each piece has its purpose and contributes to the whole.`,
      `Sure, I can explain ${topicPhrase}! Here's a simple breakdown:\n\n**Core Idea**: Everything starts with a fundamental principle that everything else builds upon.\n\n**How It Fits Together**: The different aspects are interconnected — changing one affects the others.\n\n**Real-World Application**: This isn't just theoretical — it has practical uses in everyday scenarios.\n\nDoes this help? Would you like me to go into more detail on any part?`,
    ]
    return explains[Math.floor(Math.random() * explains.length)]
  }

  if (lower.includes("compare") || lower.includes("difference") || lower.includes("vs ") || lower.includes("versus")) {
    return `Let me compare ${topicPhrase}:\n\n**Similarities**: Both approaches share common goals and principles, but they differ in execution and trade-offs.\n\n**Key Differences**:\n- **Approach**: Each takes a different path to achieve results\n- **Complexity**: One may be simpler but less flexible\n- **Use Case**: Each excels in different scenarios\n- **Learning Curve**: One might be easier to start with\n\n**Recommendation**: Choose based on your specific needs, constraints, and long-term goals.`
  }

  if (lower.includes("advice") || lower.includes("suggest") || lower.includes("recommend") || lower.includes("should i") || lower.includes("opinion")) {
    const advice = [
      `Based on what you've shared about ${topicPhrase}, here's my advice:\n\n**Start Here**: Begin by clarifying what success looks like for your specific situation. Having clear criteria makes decision-making much easier.\n\n**Key Considerations**:\n- What's the most important outcome for you?\n- What resources (time, budget, skills) do you have?\n- What risks are you comfortable with?\n- What does your timeline look like?\n\n**My Take**: There's no single right answer, but being clear on your priorities will point you in the right direction.`,
      `Great question! Here are my thoughts on ${topicPhrase}:\n\n**Recommendation**: I suggest starting with a small-scale test or pilot before committing fully. This lets you validate assumptions and adjust course early.\n\n**Why**: Most challenges become clearer once you start working through them. Analysis is valuable, but action reveals things you can't anticipate.\n\n**Next Step**: What's the smallest step you can take right now to move forward?`,
    ]
    return advice[Math.floor(Math.random() * advice.length)]
  }

  if (lower.includes("error") || lower.includes("bug") || lower.includes("issue") || lower.includes("problem") || lower.includes("not working") || lower.includes("fail")) {
    const problem = topics.length > 1 ? topics.slice(0, 2).join(" ") : topic
    return `Let me help you troubleshoot ${problem}:\n\n**Common Causes**:\n1. Check for simple things first — typos, missing imports, or configuration issues\n2. Verify your inputs and assumptions\n3. Look for version mismatches or compatibility issues\n\n**Debugging Approach**:\n1. Reproduce the issue consistently\n2. Isolate the specific component that's failing\n3. Check logs and error messages carefully\n4. Test one change at a time\n\nCan you share more details about what's happening? The error message and what you've tried so far would help me give more specific guidance.`
  }

  if (lower.includes("idea") || lower.includes("brainstorm") || lower.includes("suggestion") || lower.includes("creative")) {
    return `Let's brainstorm ideas around ${topicPhrase}! Here are some directions to consider:\n\n**Direction 1**: Think about the core problem from a different angle — what would an outsider suggest?\n\n**Direction 2**: Combine existing approaches in a new way. Innovation often comes from unexpected combinations.\n\n**Direction 3**: Ask "what if" questions to challenge assumptions and open up new possibilities.\n\n**Direction 4**: Look at how similar challenges are solved in different fields — cross-pollination often yields fresh ideas.\n\nWant me to explore any of these directions further?`
  }

  const defaults = [
    `That's an interesting point about ${topicPhrase}. Let me share my thoughts:\n\n1. Start by understanding the core principles involved\n2. Consider the specific context and requirements of your situation\n3. Evaluate different approaches and their trade-offs\n4. Choose the path that best aligns with your goals\n5. Iterate and refine based on results\n\nWould you like me to dive deeper into any specific aspect?`,
    `Great topic! Here's my perspective on ${topicPhrase}:\n\n**Key Insight**: The most effective approach usually balances multiple factors rather than optimizing for just one. Context and trade-offs matter a lot.\n\n**Practical Steps**:\n1. Define what success looks like for you\n2. Identify the key variables at play\n3. Start with a well-informed approach\n4. Measure results and adjust course as needed\n\nWhat's your specific goal or challenge here?`,
    `When it comes to ${topicPhrase}, here's what I'd suggest:\n\n**First Principles**: Break the topic down to its fundamentals. What are you really trying to achieve?\n\n**Action Plan**:\n- Research what's been done before\n- Identify the gaps or opportunities\n- Develop a hypothesis and test it\n- Learn from the results and refine\n\nThe most successful approaches come from a cycle of learning and adaptation.`,
    `I appreciate you asking about ${topicPhrase}! Here's my take:\n\n**Core Idea**: The most important thing is to align your approach with your specific goals and constraints. Generic solutions often fall short.\n\n**What To Focus On**:\n1. Clarity on what you want to achieve\n2. Understanding the landscape and options\n3. Making informed choices based on evidence\n4. Staying flexible and adapting as you learn\n\nFeel free to share more context so I can give more specific guidance!`,
    `Let me share my thoughts on ${topicPhrase}:\n\n**Overview**: This is a nuanced area where the right approach depends heavily on context. That said, some general principles apply broadly.\n\n**Framework**:\n1. **Assess**: Understand your starting point and goals\n2. **Explore**: Consider multiple approaches\n3. **Decide**: Make an informed choice\n4. **Execute**: Take action and monitor progress\n5. **Reflect**: Learn and adjust for next time\n\nWhat specific aspect would you like to explore further?`,
    `Here's my response regarding ${topicPhrase}:\n\n**Main Takeaway**: Focus on what you can control and take consistent action. Progress is better than perfection.\n\n**Key Principles**:\n- Start where you are, use what you have\n- Learn by doing — theory only takes you so far\n- Seek feedback and iterate\n- Stay curious and keep learning\n\nWhat's the next step you're considering?`,
  ]
  return defaults[Math.floor(Math.random() * defaults.length)]
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

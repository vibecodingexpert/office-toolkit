"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Wand2,
  Copy,
  Check,
  Sparkles,
  Lightbulb,
  Target,
  MessageSquare,
  Zap,
} from "lucide-react"

const CATEGORIES = [
  { id: "writing", label: "Writing", icon: "📝" },
  { id: "coding", label: "Coding", icon: "💻" },
  { id: "analysis", label: "Analysis", icon: "📊" },
  { id: "creative", label: "Creative", icon: "🎨" },
  { id: "business", label: "Business", icon: "💼" },
  { id: "education", label: "Education", icon: "📚" },
  { id: "marketing", label: "Marketing", icon: "📣" },
  { id: "research", label: "Research", icon: "🔬" },
] as const

const AUDIENCES = [
  "General Public", "Technical Experts", "Executives", "Beginners",
  "Students", "Professionals", "Clients", "Team Members",
] as const

const TONES = [
  "Professional", "Casual", "Academic", "Persuasive", "Friendly", "Authoritative",
] as const

const TEMPLATES: Record<string, { name: string; template: string; category: string; audience: string; tone: string }[]> = {
  writing: [
    { name: "Blog Post", template: "Write a comprehensive blog post about [TOPIC] targeting [AUDIENCE]. Include an engaging introduction, 3-5 key points with examples, and a strong conclusion with a call to action. Use a [TONE] tone and aim for [LENGTH] words.", category: "writing", audience: "General Public", tone: "Professional" },
    { name: "Email", template: "Compose a [TONE] email to [AUDIENCE] about [TOPIC]. Start with a compelling subject line, keep the body concise, and end with a clear call to action. Include placeholders for personalization.", category: "writing", audience: "General Public", tone: "Professional" },
    { name: "Newsletter", template: "Create a [TONE] newsletter for [AUDIENCE] covering [TOPIC]. Structure it with a welcome section, main content with bullet points or short paragraphs, and a closing section with next steps or resources.", category: "writing", audience: "Professionals", tone: "Professional" },
  ],
  coding: [
    { name: "Code Generator", template: "Write a [LANGUAGE] [FUNCTIONALITY] with the following requirements:\n\n- Input: [INPUT_DESCRIPTION]\n- Output: [OUTPUT_DESCRIPTION]\n- Constraints: [CONSTRAINTS]\n- Edge cases: [EDGE_CASES]\n\nInclude error handling, type annotations (if applicable), and a usage example.", category: "coding", audience: "Technical Experts", tone: "Professional" },
    { name: "Code Review", template: "Review the following [LANGUAGE] code for bugs, performance issues, and best practices:\n\n```[LANGUAGE]\n[CODE]\n```\n\nProvide specific, actionable feedback organized by severity (critical, major, minor). Include suggested fixes for each issue.", category: "coding", audience: "Technical Experts", tone: "Professional" },
    { name: "Architecture", template: "Design a system architecture for [PROJECT_DESCRIPTION]. Consider:\n\n1. Core components and their responsibilities\n2. Data flow and state management\n3. API design and endpoints\n4. Scalability considerations\n5. Security best practices\n6. Testing strategy\n\nProvide a high-level overview with specific implementation recommendations.", category: "coding", audience: "Technical Experts", tone: "Professional" },
  ],
  analysis: [
    { name: "Data Analysis", template: "Analyze the following data about [TOPIC]:\n\n[DATA]\n\nProvide:\n1. Key trends and patterns\n2. Statistical insights\n3. Actionable recommendations\n4. Potential risks or limitations\n\nUse a [TONE] tone suitable for [AUDIENCE].", category: "analysis", audience: "Professionals", tone: "Professional" },
    { name: "SWOT Analysis", template: "Perform a SWOT analysis for [TOPIC/COMPANY]. For each category (Strengths, Weaknesses, Opportunities, Threats), provide 3-5 specific, actionable points. Conclude with strategic recommendations based on the analysis.", category: "analysis", audience: "Executives", tone: "Professional" },
    { name: "Competitor Analysis", template: "Research and analyze competitors in [INDUSTRY/MARKET]. For each key competitor, evaluate:\n\n1. Market position and share\n2. Strengths and differentiators\n3. Weaknesses and gaps\n4. Recent moves and strategy\n\nProvide a comparative analysis and strategic recommendations.", category: "analysis", audience: "Executives", tone: "Professional" },
  ],
  creative: [
    { name: "Story Outline", template: "Create a story outline in the [GENRE] genre with the following elements:\n\n- Protagonist: [PROTAGONIST_DESCRIPTION]\n- Setting: [SETTING]\n- Central conflict: [CONFLICT]\n- Theme: [THEME]\n\nStructure with Act I (Setup), Act II (Confrontation), Act III (Resolution). Include 3-5 key scenes per act with emotional beats.", category: "creative", audience: "General Public", tone: "Creative" },
    { name: "Character Profile", template: "Develop a detailed character profile for [CHARACTER_NAME], a [ROLE] in [STORY_SETTING]. Include:\n\n- Physical description\n- Personality traits and flaws\n- Backstory and motivation\n- Relationships and conflicts\n- Character arc and growth\n\nMake the character feel real and relatable.", category: "creative", audience: "General Public", tone: "Casual" },
    { name: "Marketing Copy", template: "Write creative marketing copy for [PRODUCT/SERVICE] targeting [AUDIENCE]. \n\nHeadline options (3 variations):\nBody copy highlighting key benefits:\nCall to action:\n\nUse persuasive language and emotional triggers. [TONE] tone.", category: "creative", audience: "Clients", tone: "Persuasive" },
  ],
  business: [
    { name: "Project Plan", template: "Create a project plan for [PROJECT_NAME]. Include:\n\n1. Executive summary\n2. Goals and objectives (SMART)\n3. Timeline with milestones\n4. Resource allocation\n5. Risk assessment and mitigation\n6. Success metrics (KPIs)\n\nTailor the language for [AUDIENCE].", category: "business", audience: "Executives", tone: "Professional" },
    { name: "Meeting Agenda", template: "Create a meeting agenda for a [MEETING_TYPE] meeting with [AUDIENCE]. Topics to cover:\n\n1. [TOPIC_1] - [TIME_ALLOCATION]\n2. [TOPIC_2] - [TIME_ALLOCATION]\n3. [TOPIC_3] - [TIME_ALLOCATION]\n\nInclude pre-reading materials, desired outcomes, and action items.", category: "business", audience: "Team Members", tone: "Professional" },
    { name: "Proposal", template: "Write a business proposal for [PROJECT/SERVICE] targeting [AUDIENCE]. Include:\n\n- Executive summary\n- Problem statement\n- Proposed solution\n- Implementation plan\n- Budget and timeline\n- Expected outcomes and ROI\n\nUse a [TONE] tone.", category: "business", audience: "Clients", tone: "Persuasive" },
  ],
  education: [
    { name: "Lesson Plan", template: "Design a lesson plan for teaching [TOPIC] to [AUDIENCE]. Include:\n\n- Learning objectives\n- Prerequisites\n- Materials needed\n- Lesson structure (10min intro, 20min core, 15min practice, 5min review)\n- Assessment questions\n- Homework assignment\n\nUse [TONE] tone suitable for the audience level.", category: "education", audience: "Students", tone: "Academic" },
    { name: "Study Guide", template: "Create a study guide for [TOPIC/COURSE] aimed at [AUDIENCE]. Cover:\n\n- Key concepts and definitions\n- Important formulas/theorems\n- Common pitfalls and mistakes\n- Practice problems with solutions\n- Memory aids and mnemonics\n- Recommended resources for further study", category: "education", audience: "Students", tone: "Academic" },
    { name: "Explanation", template: "Explain [COMPLEX_TOPIC] to a [AUDIENCE_LEVEL]. Use:\n\n- Simple analogies and metaphors\n- Step-by-step breakdown\n- Visual description (what a diagram would show)\n- Real-world examples\n- Common misconceptions\n\nAssume no prior knowledge of the subject.", category: "education", audience: "Beginners", tone: "Friendly" },
  ],
  marketing: [
    { name: "Social Media", template: "Create a social media campaign for [PRODUCT/SERVICE] on [PLATFORM]. Include:\n\n- 5 post ideas with captions\n- Hashtag strategy (10-15 hashtags)\n- Best posting times\n- Engagement tactics\n- Visual description for each post\n\nTarget [AUDIENCE] with a [TONE] tone.", category: "marketing", audience: "General Public", tone: "Casual" },
    { name: "SEO Content", template: "Write SEO-optimized content about [TOPIC] targeting keywords [KEYWORDS]. Include:\n\n- Meta title and description\n- H1, H2, H3 structure with keyword placement\n- 1500+ words of content\n- Internal and external linking suggestions\n- FAQ schema markup opportunities\n\nWrite for [AUDIENCE] in a [TONE] tone.", category: "marketing", audience: "General Public", tone: "Professional" },
    { name: "Press Release", template: "Write a press release announcing [NEWS/EVENT] to [AUDIENCE]. Format:\n\nHEADLINE (bold, attention-grabbing)\nSUBTITLE (supporting detail)\n[DATE] - [CITY] - Opening paragraph (who, what, when, where, why)\nBody paragraph (details and quotes)\nBoilerplate (company description)\n###\nMedia contact information\n\nUse [TONE] tone.", category: "marketing", audience: "Professionals", tone: "Professional" },
  ],
  research: [
    { name: "Research Paper", template: "Write a research paper outline on [TOPIC] for [AUDIENCE]. Structure:\n\n1. Abstract (150-250 words summarising the paper)\n2. Introduction (background, problem statement, research questions, hypothesis)\n3. Literature Review (key theories and prior work)\n4. Methodology (approach, data collection, analysis)\n5. Results (key findings with supporting data)\n6. Discussion (interpretation, limitations, implications)\n7. Conclusion (summary, contributions, future work)\n8. References\n\nUse [TONE] academic tone.", category: "research", audience: "Academics", tone: "Academic" },
    { name: "Literature Review", template: "Conduct a literature review on [TOPIC] for [AUDIENCE]. \n\nCover:\n- Historical development of the field\n- Key theories and frameworks\n- Major studies and findings\n- Current debates and controversies\n- Gaps in the literature\n- Future research directions\n\nInclude at least 15-20 references and a critical analysis.", category: "research", audience: "Academics", tone: "Academic" },
    { name: "Case Study", template: "Write a detailed case study on [TOPIC/CASE] for [AUDIENCE]. Structure:\n\n- Background and context\n- Problem or challenge\n- Approach and methodology\n- Solution implementation\n- Results and outcomes\n- Lessons learned\n- Recommendations\n\nUse data and evidence to support claims. [TONE] tone.", category: "research", audience: "Professionals", tone: "Professional" },
  ],
}

function generatePrompt(description: string, category: string, audience: string, tone: string, templateIndex?: number): string {
  const categoryTemplates = TEMPLATES[category] || TEMPLATES.writing
  const template = templateIndex !== undefined ? categoryTemplates[templateIndex] : categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)]

  if (!template) return ""

  let prompt = template.template
    .replace(/\[TOPIC\]/g, description || "your topic")
    .replace(/\[AUDIENCE\]/g, audience)
    .replace(/\[TONE\]/g, tone.toLowerCase())
    .replace(/\[LENGTH\]/g, ["300-500", "800-1000", "1500+"][Math.floor(Math.random() * 3)])
    .replace(/\[LANGUAGE\]/g, "TypeScript")
    .replace(/\[FUNCTIONALITY\]/g, "feature")
    .replace(/\[INPUT_DESCRIPTION\]/g, "user input")
    .replace(/\[OUTPUT_DESCRIPTION\]/g, "processed result")
    .replace(/\[CONSTRAINTS\]/g, "performance and security")
    .replace(/\[EDGE_CASES\]/g, "empty input, null values, large payloads")
    .replace(/\[CODE\]/g, "your code here")
    .replace(/\[PROJECT_DESCRIPTION\]/g, description || "your project")
    .replace(/\[DATA\]/g, "your dataset")
    .replace(/\[TOPIC\/COMPANY\]/g, description || "the subject")
    .replace(/\[INDUSTRY\/MARKET\]/g, "your industry")
    .replace(/\[GENRE\]/g, "fiction")
    .replace(/\[PROTAGONIST_DESCRIPTION\]/g, "a compelling protagonist")
    .replace(/\[SETTING\]/g, "the world")
    .replace(/\[CONFLICT\]/g, "a central challenge")
    .replace(/\[THEME\]/g, "the central theme")
    .replace(/\[CHARACTER_NAME\]/g, "the main character")
    .replace(/\[ROLE\]/g, "key role")
    .replace(/\[STORY_SETTING\]/g, "the story world")
    .replace(/\[PRODUCT_SERVICE\]/g, "your offering")
    .replace(/\[PROJECT_NAME\]/g, description || "the project")
    .replace(/\[PRODUCT_SERVICE_ALT\]/g, "your offering")
    .replace(/\[MEETING_TYPE\]/g, "team sync")
    .replace(/\[TOPIC_1\]/g, "topic one")
    .replace(/\[TOPIC_2\]/g, "topic two")
    .replace(/\[TOPIC_3\]/g, "topic three")
    .replace(/\[TIME_ALLOCATION\]/g, "10 min")
    .replace(/\[PROJECT_SERVICE\]/g, "the project")
    .replace(/\[TOPIC_COURSE\]/g, description || "the course")
    .replace(/\[COMPLEX_TOPIC\]/g, description || "the concept")
    .replace(/\[AUDIENCE_LEVEL\]/g, audience === "General Public" ? "general audience" : audience.toLowerCase())
    .replace(/\[PLATFORM\]/g, "social media")
    .replace(/\[KEYWORDS\]/g, "relevant keywords")
    .replace(/\[NEWS_EVENT\]/g, "the announcement")
    .replace(/\[CITY\]/g, "City Name")
    .replace(/\[DATE\]/g, new Date().toLocaleDateString())
    .replace(/\[TOPIC_CASE\]/g, description || "the case")

  if (categoryTemplates.length > 1) {
    prompt = `## ${template.name}\n\n${prompt}`
  }

  return prompt
}

export function PromptGenerator() {
  const [description, setDescription] = React.useState("")
  const [category, setCategory] = React.useState("writing")
  const [audience, setAudience] = React.useState<(typeof AUDIENCES)[number]>("General Public")
  const [tone, setTone] = React.useState<(typeof TONES)[number]>("Professional")
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [generatedPrompts, setGeneratedPrompts] = React.useState<string[]>([])
  const [copied, setCopied] = React.useState(false)

  const handleGenerate = React.useCallback(async () => {
    if (!description.trim()) {
      toast.error("Please describe what you need")
      return
    }

    setLoading(true)
    setProgress(0)

    const categoryTemplates = TEMPLATES[category]
    const prompts: string[] = []
    const indices = new Set<number>()

    while (indices.size < Math.min(3, categoryTemplates.length)) {
      indices.add(Math.floor(Math.random() * categoryTemplates.length))
    }

    for (const idx of indices) {
      const prompt = generatePrompt(description, category, audience, tone, idx)
      if (prompt) prompts.push(prompt)
    }

    setProgress(100)
    setGeneratedPrompts(prompts)
    setLoading(false)
    toast.success("Prompts generated")
  }, [description, category, audience, tone])

  const handleCopyAll = React.useCallback(async () => {
    if (generatedPrompts.length === 0) return
    try {
      await navigator.clipboard.writeText(generatedPrompts.join("\n\n---\n\n"))
      setCopied(true)
      toast.success("All prompts copied")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }, [generatedPrompts])

  const handleCopySingle = React.useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Prompt copied")
    } catch {
      toast.error("Failed to copy")
    }
  }, [])

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm">
          <Wand2 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prompt Generator</h1>
          <p className="text-sm text-muted-foreground">Create structured, detailed prompts for AI</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">What do you need?</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Write a blog post about AI productivity tools..."
            className="w-full rounded-2xl border border-border bg-background p-3 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-xs font-medium transition-all",
                  category === c.id
                    ? "border-primary/50 bg-primary/5 text-primary shadow-sm"
                    : "border-border text-foreground hover:border-primary/30"
                )}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Audience</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as typeof AUDIENCES[number])}
              className="w-full rounded-2xl border border-border bg-background p-3 text-sm text-foreground shadow-sm outline-none focus:border-primary/50"
            >
              {AUDIENCES.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as typeof TONES[number])}
              className="w-full rounded-2xl border border-border bg-background p-3 text-sm text-foreground shadow-sm outline-none focus:border-primary/50"
            >
              {TONES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          loading={loading}
          fullWidth
          size="lg"
          icon={<Sparkles className="h-5 w-5" />}
        >
          Generate Prompts
        </Button>

        {loading && (
          <ProgressBar value={progress} variant="gradient" showPercentage label="Crafting prompts..." />
        )}
      </Card>

      <AnimatePresence>
        {generatedPrompts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">Generated Prompts ({generatedPrompts.length})</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCopyAll}
                className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                {copied ? (<><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</>) : (<><Copy className="h-3.5 w-3.5" /> Copy All</>)}
              </motion.button>
            </div>

            {generatedPrompts.map((prompt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <div className="absolute right-3 top-3 z-10">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopySingle(prompt)}
                    className="flex h-8 items-center gap-1.5 rounded-lg bg-background/80 px-3 text-xs font-medium text-muted-foreground opacity-0 transition-all hover:text-foreground hover:bg-background group-hover:opacity-100"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </motion.button>
                </div>
                <pre className="p-5 text-sm text-foreground leading-relaxed whitespace-pre-wrap font-sans">{prompt}</pre>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

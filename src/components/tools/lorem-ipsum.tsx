"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { Copy, Check, TextQuote, RotateCcw } from "lucide-react"

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea",
  "commodo", "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit",
  "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla",
  "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident",
  "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id",
  "est", "laborum", "fusce", "feugiat", "pretium", "nibh", "ipsum", "consequat",
  "tempus", "iaculis", "urna", "id", "volutpat", "lacus", "laoreet", "non",
  "curabitur", "gravida", "arcu", "ac", "tortor", "dignissim", "convallis",
  "aenean", "et", "tortor", "at", "risus", "viverra", "adipiscing", "at", "in",
  "donec", "ultrices", "tincidunt", "arcu", "non", "sodales", "neque", "sodales",
  "integer", "vitae", "justo", "eget", "magna", "fermentum", "iaculis",
  "phasellus", "vestibulum", "lorem", "sed", "risus", "ultricies", "tristique",
  "nulla", "aliquet", "enim", "tortor", "at", "auctor", "urna", "nunc"
]

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function generateSentence(wordCount: number, rng: () => number): string {
  const words: string[] = []
  for (let i = 0; i < wordCount; i++) {
    const idx = Math.floor(rng() * LOREM_WORDS.length)
    words.push(LOREM_WORDS[idx])
  }
  let sentence = words.join(" ")
  sentence = capitalize(sentence)
  sentence += "."
  return sentence
}

function generateParagraph(sentences: number, wordsPerSentence: number, rng: () => number): string {
  const sentenceList: string[] = []
  for (let i = 0; i < sentences; i++) {
    sentenceList.push(generateSentence(wordsPerSentence, rng))
  }
  return sentenceList.join(" ")
}

function generateText(
  paragraphs: number,
  wordsPerParagraph: number
): string {
  const sentences = Math.max(3, Math.round(wordsPerParagraph / 8))
  const wordsPerSentence = Math.round(wordsPerParagraph / sentences)
  const seed = Date.now()
  let state = seed
  const rng = () => {
    state = (state * 1664525 + 1013904223) & 0x7fffffff
    return state / 0x7fffffff
  }
  const result: string[] = []
  for (let i = 0; i < paragraphs; i++) {
    result.push(generateParagraph(sentences, wordsPerSentence, rng))
  }
  return result.join("\n\n")
}

const VARIATIONS = [
  { name: "Standard", fn: (p: number, w: number) => generateText(p, w) },
  {
    name: "Short",
    fn: (p: number, _w: number) => generateText(p, Math.max(20, Math.round(_w * 0.5))),
  },
  {
    name: "Long",
    fn: (p: number, _w: number) => generateText(p, Math.min(60, Math.round(_w * 1.5))),
  },
]

export function LoremIpsum() {
  const [paragraphs, setParagraphs] = React.useState(3)
  const [wordsPerParagraph, setWordsPerParagraph] = React.useState(50)
  const [output, setOutput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [variation, setVariation] = React.useState(0)

  const handleGenerate = React.useCallback(
    (variationIdx?: number) => {
      setLoading(true)
      setTimeout(() => {
        const idx = variationIdx ?? variation
        const text = VARIATIONS[idx].fn(paragraphs, wordsPerParagraph)
        setOutput(text)
        if (variationIdx !== undefined) setVariation(variationIdx)
        setLoading(false)
      }, 200)
    },
    [paragraphs, wordsPerParagraph, variation]
  )

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

  const handleClear = React.useCallback(() => {
    setOutput("")
  }, [])

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <TextQuote className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Lorem Ipsum Generator</h2>
          <p className="text-sm text-muted-foreground">
            Generate placeholder text for your designs
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Paragraphs: {paragraphs}
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={paragraphs}
            onChange={(e) => setParagraphs(Number(e.target.value))}
            className="w-full h-2 rounded-full bg-muted appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span>10</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Words per Paragraph: {wordsPerParagraph}
          </label>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={wordsPerParagraph}
            onChange={(e) => setWordsPerParagraph(Number(e.target.value))}
            className="w-full h-2 rounded-full bg-muted appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10</span>
            <span>100</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Variation</label>
        <div className="flex flex-wrap gap-2">
          {VARIATIONS.map((v, i) => (
            <button
              key={v.name}
              onClick={() => handleGenerate(i)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                variation === i
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() => handleGenerate()}
          loading={loading}
          icon={<TextQuote className="h-4 w-4" />}
        >
          Generate
        </Button>
        {output && (
          <Button variant="ghost" onClick={handleClear} icon={<RotateCcw className="h-4 w-4" />}>
            Clear
          </Button>
        )}
      </div>

      {output && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">
              Generated Text
              <span className="ml-2 text-xs text-muted-foreground">
                ({output.split(/\s+/).length} words)
              </span>
            </label>
            <button
              onClick={handleCopy}
              className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4 max-h-96 overflow-y-auto">
            {output.split("\n\n").map((para, i) => (
              <p key={i} className="text-sm text-foreground leading-relaxed mb-4 last:mb-0">
                {para}
              </p>
            ))}
          </div>
        </motion.div>
      )}
    </Card>
  )
}

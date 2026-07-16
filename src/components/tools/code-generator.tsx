"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProgressBar } from "@/components/ui/progress-bar"
import { toast } from "@/components/ui/toast"
import { cn } from "@/lib/utils/cn"
import {
  Code,
  Copy,
  Check,
  Sparkles,
  Download,
  RefreshCw,
  FileCode,
} from "lucide-react"

const LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "HTML",
  "CSS",
  "SQL",
  "React",
  "Next.js",
  "Node.js",
  "Java",
  "Go",
  "Rust",
  "C++",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "C#",
  "Dart",
] as const

const CODE_TYPES = ["function", "class", "api-endpoint", "component", "algorithm", "utility"] as const

const CODE_TEMPLATES: Record<string, (desc: string, type: string) => string> = {
  JavaScript: (desc, type) => {
    if (type === "class") {
      return `class DataProcessor {
  constructor(options = {}) {
    this.options = { debug: false, ...options };
    this.cache = new Map();
    this.queue = [];
  }

  async process(input) {
    try {
      const normalized = this._normalize(input);
      const result = await this._transform(normalized);
      this.cache.set(input, result);
      return result;
    } catch (error) {
      console.error('Processing failed:', error);
      throw new Error(\`Failed to process: \${error.message}\`);
    }
  }

  _normalize(data) {
    if (typeof data === 'string') return data.trim().toLowerCase();
    if (Array.isArray(data)) return data.filter(Boolean).map(i => i.toString());
    return data;
  }

  async _transform(data) {
    // Simulate async transformation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ original: data, processed: true, timestamp: Date.now() });
      }, 100);
    });
  }

  getStats() {
    return {
      cacheSize: this.cache.size,
      queueLength: this.queue.length,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export { DataProcessor };`
    }
    return `/**\n * Processes and transforms input data with validation\n * @param {*} input - The data to process\n * @param {Object} options - Configuration options\n * @returns {Promise<Object>} Processed result\n */\nasync function processData(input, options = {}) {\n  const { validate = true, transform = 'json', format = true } = options;\n\n  if (validate && !input) {\n    throw new Error('Input is required');\n  }\n\n  const normalized = typeof input === 'string' ? JSON.parse(input) : input;\n  const transformed = await performTransform(normalized, transform);\n  const result = format ? JSON.stringify(transformed, null, 2) : transformed;\n\n  return {\n    success: true,\n    data: result,\n    metadata: {\n      timestamp: new Date().toISOString(),\n      inputType: typeof input,\n      optionsUsed: options,\n    },\n  };\n}\n\nasync function performTransform(data, type) {\n  // Transform logic here\n  return { ...data, transformed: true, type };\n}\n\n// Usage example\nconst result = await processData({ name: 'example', value: 42 });\nconsole.log(result);`
  },
  Python: (desc, type) => {
    if (type === "class") {
      return `from typing import Any, Optional, Dict, List\nfrom datetime import datetime\nimport json\n\nclass DataProcessor:\n    """Process and transform data with validation and caching."""\n\n    def __init__(self, debug: bool = False):\n        self.debug = debug\n        self.cache: Dict[str, Any] = {}\n        self.queue: List[Dict] = []\n\n    async def process(self, input_data: Any, **options) -> Dict[str, Any]:\n        try:\n            normalized = self._normalize(input_data)\n            result = await self._transform(normalized, options)\n            self.cache[str(input_data)] = result\n            return {"success": True, "data": result, "cached": False}\n        except Exception as e:\n            if self.debug:\n                print(f"Processing error: {e}")\n            raise\n\n    def _normalize(self, data: Any) -> Any:\n        if isinstance(data, str):\n            return data.strip().lower()\n        if isinstance(data, (list, tuple)):\n            return [str(i) for i in data if i]\n        return data\n\n    async def _transform(self, data: Any, options: dict) -> dict:\n        return {\n            "original": data,\n            "processed": True,\n            "timestamp": datetime.now().isoformat(),\n            "options": options,\n        }\n\n    def get_stats(self) -> dict:\n        return {\n            "cache_size": len(self.cache),\n            "queue_length": len(self.queue),\n            "last_updated": datetime.now().isoformat(),\n        }`
    }
    return `import asyncio\nfrom typing import Any, Optional\n\nasync def process_data(\n    input_data: Any,\n    validate: bool = True,\n    transform_type: str = "json"\n) -> dict:\n    """Process and transform input data.\n\n    Args:\n        input_data: The data to process\n        validate: Whether to validate input\n        transform_type: Type of transformation\n\n    Returns:\n        Processed result with metadata\n    """\n    if validate and not input_data:\n        raise ValueError("Input is required")\n\n    normalized = input_data if isinstance(input_data, (dict, list)) else json.loads(input_data)\n    transformed = await perform_transform(normalized, transform_type)\n\n    return {\n        "success": True,\n        "data": transformed,\n        "metadata": {\n            "timestamp": datetime.now().isoformat(),\n            "input_type": type(input_data).__name__,\n        },\n    }\n\nasync def perform_transform(data: Any, transform_type: str) -> Any:\n    """Apply transformation to data."""\n    await asyncio.sleep(0.1)  # Simulate async work\n    return {**data, "transformed": True, "type": transform_type}`
  },
  TypeScript: (desc, type) => {
    return `interface ProcessResult<T> {\n  success: boolean;\n  data: T;\n  metadata: {\n    timestamp: string;\n    duration: number;\n    inputType: string;\n  };\n}\n\ninterface ProcessOptions {\n  validate?: boolean;\n  transform?: 'json' | 'xml' | 'csv';\n  format?: boolean;\n  timeout?: number;\n}\n\nasync function processData<T>(\n  input: unknown,\n  options: ProcessOptions = {}\n): Promise<ProcessResult<T>> {\n  const {\n    validate = true,\n    transform = 'json',\n    format = true,\n    timeout = 5000,\n  } = options;\n\n  const startTime = performance.now();\n\n  if (validate && !input) {\n    throw new Error('Input is required');\n  }\n\n  const normalized = typeof input === 'string'\n    ? JSON.parse(input)\n    : input as T;\n\n  const transformed = await performTransform(normalized, transform);\n  const result = format\n    ? JSON.stringify(transformed, null, 2)\n    : transformed;\n\n  return {\n    success: true,\n    data: result as unknown as T,\n    metadata: {\n      timestamp: new Date().toISOString(),\n      duration: performance.now() - startTime,\n      inputType: typeof input,\n    },\n  };\n}\n\nasync function performTransform<T>(data: T, type: string): Promise<T> {\n  return { ...data, transformed: true as const, type } as unknown as T;\n}\n\nexport { processData, type ProcessResult, type ProcessOptions };`
  },
  React: (desc, type) => {
    return `import React, { useState, useEffect, useCallback, useMemo } from 'react';\n\ninterface DataItem {\n  id: number;\n  name: string;\n  value: number;\n  category: string;\n}\n\ninterface DashboardProps {\n  title: string;\n  initialData?: DataItem[];\n  onItemSelect?: (item: DataItem) => void;\n}\n\nconst DataDashboard: React.FC<DashboardProps> = ({\n  title,\n  initialData = [],\n  onItemSelect,\n}) => {\n  const [data, setData] = useState<DataItem[]>(initialData);\n  const [sortKey, setSortKey] = useState<keyof DataItem>('id');\n  const [sortAsc, setSortAsc] = useState(true);\n  const [filter, setFilter] = useState('');\n  const [isLoading, setIsLoading] = useState(false);\n  const [error, setError] = useState<string | null>(null);\n\n  const fetchData = useCallback(async () => {\n    setIsLoading(true);\n    setError(null);\n    try {\n      const response = await fetch('/api/data');\n      if (!response.ok) throw new Error(\`HTTP \${response.status}\`);\n      const result = await response.json();\n      setData(result);\n    } catch (err) {\n      setError(err instanceof Error ? err.message : 'Failed to fetch');\n    } finally {\n      setIsLoading(false);\n    }\n  }, []);\n\n  useEffect(() => {\n    if (initialData.length === 0) fetchData();\n  }, [fetchData, initialData.length]);\n\n  const sortedAndFiltered = useMemo(() =>\n    data\n      .filter(item =>\n        item.name.toLowerCase().includes(filter.toLowerCase())\n      )\n      .sort((a, b) => {\n        const valA = a[sortKey];\n        const valB = b[sortKey];\n        if (typeof valA === 'string' && typeof valB === 'string') {\n          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);\n        }\n        return sortAsc ? Number(valA) - Number(valB) : Number(valB) - Number(valA);\n      }),\n    [data, filter, sortKey, sortAsc]\n  );\n\n  const handleSort = (key: keyof DataItem) => {\n    if (key === sortKey) setSortAsc(!sortAsc);\n    else { setSortKey(key); setSortAsc(true); }\n  };\n\n  if (error) return <div className="error">Error: {error}</div>;\n\n  return (\n    <div className="dashboard p-6">\n      <header className="flex items-center justify-between mb-6">\n        <h1 className="text-2xl font-bold">{title}</h1>\n        <input\n          type="text"\n          placeholder="Filter by name..."\n          value={filter}\n          onChange={e => setFilter(e.target.value)}\n          className="search-input px-4 py-2 rounded-lg border"\n        />\n      </header>\n\n      {isLoading ? (\n        <div className="flex justify-center py-12">\n          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />\n        </div>\n      ) : (\n        <table className="w-full border-collapse">\n          <thead>\n            <tr className="bg-muted/50">\n              {(['id', 'name', 'value', 'category'] as const).map(key => (\n                <th\n                  key={key}\n                  onClick={() => handleSort(key)}\n                  className="cursor-pointer px-4 py-3 text-left text-sm font-medium"\n                >\n                  {key.charAt(0).toUpperCase() + key.slice(1)}\n                  {sortKey === key && (sortAsc ? ' ▲' : ' ▼')}\n                </th>\n              ))}\n            </tr>\n          </thead>\n          <tbody>\n            {sortedAndFiltered.map(item => (\n              <tr\n                key={item.id}\n                onClick={() => onItemSelect?.(item)}\n                className="border-t hover:bg-muted/30 cursor-pointer transition-colors"\n              >\n                <td className="px-4 py-3">{item.id}</td>\n                <td className="px-4 py-3 font-medium">{item.name}</td>\n                <td className="px-4 py-3">{item.value}</td>\n                <td className="px-4 py-3">\n                  <span className="px-2 py-1 rounded-full bg-primary/10 text-xs">{item.category}</span>\n                </td>\n              </tr>\n            ))}\n          </tbody>\n        </table>\n      )}\n\n      <footer className="mt-4 flex items-center justify-between text-sm text-muted-foreground">\n        <span>Showing {sortedAndFiltered.length} of {data.length} items</span>\n        <button onClick={fetchData} className="px-4 py-2 rounded-lg border hover:bg-accent">\n          Refresh\n        </button>\n      </footer>\n    </div>\n  );\n};\n\nexport default DataDashboard;`
  },
  Node: (desc, type) => {
    return `const express = require('express');\nconst { rateLimit } = require('express-rate-limit');\nconst cors = require('cors');\n\nconst app = express();\nconst PORT = process.env.PORT || 3000;\n\n// Middleware\napp.use(cors());\napp.use(express.json({ limit: '10mb' }));\napp.use(express.urlencoded({ extended: true }));\n\n// Rate limiting\nconst limiter = rateLimit({\n  windowMs: 15 * 60 * 1000,\n  max: 100,\n  message: { error: 'Too many requests', retryAfter: '15 minutes' },\n});\napp.use('/api/', limiter);\n\n// Routes\napp.get('/api/health', (req, res) => {\n  res.json({ status: 'ok', timestamp: new Date().toISOString() });\n});\n\napp.post('/api/data', async (req, res) => {\n  try {\n    const { input, options } = req.body;\n    const result = await processData(input, options);\n    res.json(result);\n  } catch (error) {\n    res.status(500).json({ error: error.message });\n  }\n});\n\nasync function processData(input, options) {\n  // Data processing logic\n  return { processed: true, input, options };\n}\n\napp.listen(PORT, () => {\n  console.log(\`Server running on http://localhost:\${PORT}\`);\n});\n\nmodule.exports = app;`
  },
  SQL: (desc, type) => {
    return `-- ${desc}\n\nCREATE TABLE IF NOT EXISTS users (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    email VARCHAR(255) UNIQUE NOT NULL,\n    password_hash VARCHAR(255) NOT NULL,\n    first_name VARCHAR(100) NOT NULL,\n    last_name VARCHAR(100) NOT NULL,\n    phone VARCHAR(20),\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,\n    INDEX idx_email (email),\n    INDEX idx_name (last_name, first_name)\n);\n\nCREATE TABLE IF NOT EXISTS products (\n    id INT PRIMARY KEY AUTO_INCREMENT,\n    name VARCHAR(255) NOT NULL,\n    description TEXT,\n    price DECIMAL(10, 2) NOT NULL,\n    stock_quantity INT NOT NULL DEFAULT 0,\n    category_id INT,\n    is_active BOOLEAN DEFAULT TRUE,\n    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,\n    FOREIGN KEY (category_id) REFERENCES categories(id),\n    INDEX idx_price (price),\n    FULLTEXT INDEX idx_search (name, description)\n);\n\n-- Sample query\nSELECT\n    p.name,\n    SUM(oi.quantity * oi.unit_price) AS total_revenue,\n    COUNT(DISTINCT o.user_id) AS unique_customers\nFROM products p\nJOIN order_items oi ON p.id = oi.product_id\nJOIN orders o ON oi.order_id = o.id\nWHERE o.status = 'delivered'\n  AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)\nGROUP BY p.id, p.name\nORDER BY total_revenue DESC\nLIMIT 10;`
  },
}

const DEFAULT_CODE = `// Function to process and analyze data
function processData(data, options = {}) {
  const { sortBy = 'id', ascending = true, filter = null } = options;

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Invalid data: expected non-empty array');
  }

  const filtered = filter ? data.filter(item => filter(item)) : data;
  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];
    if (typeof valA === 'string') {
      return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return ascending ? valA - valB : valB - valA;
  });

  return {
    data: sorted,
    metadata: {
      total: data.length,
      filtered: sorted.length,
      sortBy,
      ascending,
      timestamp: new Date().toISOString(),
    },
  };
}

// Example usage
const sampleData = [
  { id: 3, name: 'Charlie', score: 85 },
  { id: 1, name: 'Alice', score: 92 },
  { id: 2, name: 'Bob', score: 78 },
];

const result = processData(sampleData, {
  sortBy: 'score',
  ascending: false,
  filter: (item) => item.score >= 80,
});

console.log('Processed results:', result);`

export function CodeGenerator() {
  const [language, setLanguage] = React.useState<(typeof LANGUAGES)[number]>("JavaScript")
  const [codeType, setCodeType] = React.useState<(typeof CODE_TYPES)[number]>("function")
  const [description, setDescription] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [output, setOutput] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  const handleGenerate = React.useCallback(async () => {
    const desc = description.trim() || `Generate a ${codeType} in ${language}`
    if (!desc.trim()) {
      toast.error("Please describe what the code should do")
      return
    }

    setLoading(true)
    setProgress(0)
    setOutput("")

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 15
        return next >= 90 ? 90 : next
      })
    }, 300)

    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1500))

    clearInterval(interval)
    setProgress(100)

    const template = CODE_TEMPLATES[language] || CODE_TEMPLATES[language.replace(/\.\w+$/, "")]
    const code = template ? template(desc, codeType) : DEFAULT_CODE
    setOutput(code)
    setLoading(false)
    toast.success(`${language} ${codeType} generated`)
  }, [language, codeType, description])

  const highlightSyntax = (code: string): React.ReactNode => {
    const lines = code.split("\n")
    return lines.map((line, i) => {
      const highlighted = line
        .replace(/(\/\/.*)$/gm, '<span class="text-emerald-500/70">$1</span>')
        .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|from|class|interface|type|async|await|try|catch|throw|new|this|typeof|instanceof|in|of|true|false|null|undefined)\b/g, '<span class="text-violet-400">$1</span>')
        .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-amber-400">$1</span>')
        .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span class="text-emerald-400">$1</span>')
        .replace(/\b([A-Z][a-zA-Z]+)\b/g, (match) => {
          const types = ["ProcessOptions", "ProcessResult", "DashboardProps", "DataItem", "FC", "Promise"]
          return types.includes(match) ? `<span class="text-cyan-400">${match}</span>` : match
        })
      return (
        <div key={i} className="flex">
          <span className="mr-4 inline-block w-8 text-right text-muted-foreground/40 select-none text-xs">
            {i + 1}
          </span>
          <span dangerouslySetInnerHTML={{ __html: highlighted || " " }} className="flex-1" />
        </div>
      )
    })
  }

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

  const handleDownload = React.useCallback(() => {
    if (!output) return
    const extMap: Record<string, string> = {
      JavaScript: "js", TypeScript: "ts", Python: "py", HTML: "html", CSS: "css", SQL: "sql",
      React: "tsx", "Node.js": "js", Java: "java", Go: "go", Rust: "rs", "C++": "cpp",
      Ruby: "rb", PHP: "php", Swift: "swift", Kotlin: "kt", "C#": "cs", Dart: "dart",
      "Next.js": "tsx",
    }
    const ext = extMap[language] || "txt"
    const blob = new Blob([output], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `generated-code.${ext}`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("File downloaded")
  }, [output, language])

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 shadow-sm">
          <Code className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Code Generator</h1>
          <p className="text-sm text-muted-foreground">Generate code in 19 languages</p>
        </div>
      </motion.div>

      <Card className="space-y-6 p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Language</label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={cn(
                  "rounded-xl border px-3 py-1.5 text-xs font-medium transition-all",
                  language === lang
                    ? "border-primary/50 bg-primary/5 text-primary shadow-sm"
                    : "border-border text-foreground hover:border-primary/30"
                )}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Code Type</label>
          <div className="flex gap-2">
            {CODE_TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setCodeType(t)}
                className={cn(
                  "rounded-xl border px-4 py-2 text-xs font-medium transition-all capitalize",
                  codeType === t
                    ? "border-primary/50 bg-primary/5 text-primary shadow-sm"
                    : "border-border text-foreground hover:border-primary/30"
                )}
              >
                {t.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what the code should do..."
            rows={4}
            className="w-full resize-y rounded-2xl border border-border bg-background p-4 text-sm text-foreground placeholder-muted-foreground shadow-sm transition-all focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        <Button
          onClick={handleGenerate}
          loading={loading}
          fullWidth
          size="lg"
          icon={<Sparkles className="h-5 w-5" />}
        >
          Generate Code
        </Button>

        {loading && (
          <ProgressBar value={progress} variant="gradient" showPercentage label="Generating..." />
        )}
      </Card>

      <AnimatePresence>
        {output && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground capitalize">{language} — {codeType}</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  {copied ? (<><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</>) : (<><Copy className="h-3.5 w-3.5" /> Copy</>)}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </motion.button>
              </div>
            </div>
            <div className="overflow-x-auto bg-[#0f172a] p-4">
              <pre className="font-mono text-xs leading-relaxed">
                {highlightSyntax(output)}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

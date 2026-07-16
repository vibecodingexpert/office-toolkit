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
] as const

const CODE_SAMPLES: Record<string, string> = {
  JavaScript: `// Function to process and analyze data
function processData(data, options = {}) {
  const { sortBy = 'id', ascending = true, filter = null } = options;

  // Validate input
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Invalid data: expected non-empty array');
  }

  // Apply filter if provided
  const filtered = filter
    ? data.filter(item => filter(item))
    : data;

  // Sort the data
  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];

    if (typeof valA === 'string') {
      return ascending
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    return ascending ? valA - valB : valB - valA;
  });

  // Enrich with metadata
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

console.log('Processed results:', result);`,
  TypeScript: `interface ProcessOptions<T> {
  sortBy?: keyof T;
  ascending?: boolean;
  filter?: (item: T) => boolean;
  limit?: number;
}

interface ProcessResult<T> {
  data: T[];
  metadata: {
    total: number;
    filtered: number;
    sortBy: string;
    ascending: boolean;
    timestamp: string;
  };
}

function processData<T extends Record<string, unknown>>(
  data: T[],
  options: ProcessOptions<T> = {}
): ProcessResult<T> {
  const {
    sortBy = 'id' as keyof T,
    ascending = true,
    filter = null,
    limit,
  } = options;

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Invalid data: expected non-empty array');
  }

  const filtered = filter ? data.filter(filter) : data;

  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return ascending
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    return ascending
      ? Number(valA) - Number(valB)
      : Number(valB) - Number(valA);
  });

  const limited = limit ? sorted.slice(0, limit) : sorted;

  return {
    data: limited,
    metadata: {
      total: data.length,
      filtered: limited.length,
      sortBy: String(sortBy),
      ascending,
      timestamp: new Date().toISOString(),
    },
  };
}

export { processData, type ProcessOptions, type ProcessResult };`,
  Python: `from typing import Any, Optional, Callable
from datetime import datetime

def process_data(
    data: list[dict[str, Any]],
    sort_by: str = "id",
    ascending: bool = True,
    filter_func: Optional[Callable] = None,
    limit: Optional[int] = None
) -> dict:
    """
    Process and analyze a list of dictionaries.

    Args:
        data: List of dictionaries to process
        sort_by: Key to sort by
        ascending: Sort order
        filter_func: Optional filter function
        limit: Maximum number of items to return

    Returns:
        Dictionary with processed data and metadata
    """
    if not data or not isinstance(data, list):
        raise ValueError("Data must be a non-empty list")

    # Apply filter
    filtered = list(filter(filter_func, data)) if filter_func else data

    # Sort the data
    sorted_data = sorted(
        filtered,
        key=lambda x: x.get(sort_by, 0),
        reverse=not ascending
    )

    # Apply limit
    if limit:
        sorted_data = sorted_data[:limit]

    return {
        "data": sorted_data,
        "metadata": {
            "total": len(data),
            "filtered": len(sorted_data),
            "sort_by": sort_by,
            "ascending": ascending,
            "timestamp": datetime.now().isoformat(),
        },
    }


# Example usage
if __name__ == "__main__":
    sample_data = [
        {"id": 3, "name": "Charlie", "score": 85},
        {"id": 1, "name": "Alice", "score": 92},
        {"id": 2, "name": "Bob", "score": 78},
    ]

    result = process_data(
        sample_data,
        sort_by="score",
        ascending=False,
        filter_func=lambda x: x.get("score", 0) >= 80,
    )

    print("Processed results:", result)`,
  HTML: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Dashboard</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header class="dashboard-header">
        <h1>Data Dashboard</h1>
        <nav class="dashboard-nav">
            <a href="#overview">Overview</a>
            <a href="#analytics">Analytics</a>
            <a href="#reports">Reports</a>
        </nav>
    </header>

    <main class="dashboard-main">
        <section id="overview" class="card-grid">
            <article class="card">
                <div class="card-header">
                    <h2>Total Users</h2>
                    <span class="badge badge-primary">+12%</span>
                </div>
                <div class="card-body">
                    <p class="stat-value">24,563</p>
                    <p class="stat-label">Active users this month</p>
                </div>
            </article>

            <article class="card">
                <div class="card-header">
                    <h2>Revenue</h2>
                    <span class="badge badge-success">+8%</span>
                </div>
                <div class="card-body">
                    <p class="stat-value">$48,290</p>
                    <p class="stat-label">Monthly recurring revenue</p>
                </div>
            </article>

            <article class="card">
                <div class="card-header">
                    <h2>Conversion Rate</h2>
                    <span class="badge badge-warning">+3%</span>
                </div>
                <div class="card-body">
                    <p class="stat-value">3.24%</p>
                    <p class="stat-label">Overall conversion rate</p>
                </div>
            </article>
        </section>

        <section id="analytics" class="chart-container">
            <h2>Monthly Trends</h2>
            <div class="chart-placeholder">
                <canvas id="trendsChart"></canvas>
            </div>
        </section>
    </main>

    <script src="dashboard.js"></script>
</body>
</html>`,
  CSS: `/* Modern CSS Reset and Base Styles */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --secondary: #ec4899;
  --background: #0f172a;
  --surface: #1e293b;
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  --border: #334155;
  --success: #22c55e;
  --warning: #eab308;
  --error: #ef4444;
  --radius: 12px;
  --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3);
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: var(--background);
  color: var(--text);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* Card Component */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  box-shadow: var(--shadow);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px -1px rgb(0 0 0 / 0.4);
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

/* Grid Layout */
.grid {
  display: grid;
  gap: 1.5rem;
}

.grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 768px) {
  .grid-cols-3 {
    grid-template-columns: 1fr;
  }
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}`,
  SQL: `-- Database Schema for E-Commerce Platform

-- Create database
CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_name (last_name, first_name)
);

-- Products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    category_id INT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_category (category_id),
    INDEX idx_price (price),
    FULLTEXT INDEX idx_search (name, description)
);

-- Orders table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(12, 2) NOT NULL,
    shipping_address TEXT NOT NULL,
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- Order Items table
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),
    INDEX idx_order (order_id)
);

-- Query: Get top products by revenue
SELECT
    p.id,
    p.name,
    SUM(oi.quantity * oi.unit_price) AS total_revenue,
    COUNT(DISTINCT o.user_id) AS unique_customers
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.status IN ('delivered', 'confirmed')
  AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY p.id, p.name
ORDER BY total_revenue DESC
LIMIT 10;`,
  React: `import React, { useState, useEffect, useCallback } from 'react';
import './DataDashboard.css';

interface DataItem {
  id: number;
  name: string;
  value: number;
  category: string;
}

interface DashboardProps {
  title: string;
  initialData?: DataItem[];
}

const DataDashboard: React.FC<DashboardProps> = ({
  title,
  initialData = [],
}) => {
  const [data, setData] = useState<DataItem[]>(initialData);
  const [sortKey, setSortKey] = useState<keyof DataItem>('id');
  const [sortAsc, setSortAsc] = useState(true);
  const [filter, setFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialData.length === 0) {
      fetchData();
    }
  }, [fetchData, initialData.length]);

  const sortedAndFiltered = data
    .filter((item) =>
      item.name.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortAsc
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return sortAsc
        ? Number(valA) - Number(valB)
        : Number(valB) - Number(valA);
    });

  const handleSort = (key: keyof DataItem) => {
    if (key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>{title}</h1>
        <input
          type="text"
          placeholder="Filter by name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="search-input"
        />
      </header>

      {isLoading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>
                ID {sortKey === 'id' && (sortAsc ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('name')}>
                Name {sortKey === 'name' && (sortAsc ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('value')}>
                Value {sortKey === 'value' && (sortAsc ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('category')}>
                Category {sortKey === 'category' && (sortAsc ? '▲' : '▼')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFiltered.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.value}</td>
                <td>
                  <span className="category-badge">{item.category}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="dashboard-footer">
        <span>Showing {sortedAndFiltered.length} of {data.length} items</span>
        <button onClick={fetchData} className="refresh-btn">
          Refresh
        </button>
      </div>
    </div>
  );
};

export default DataDashboard;`,
}

export function CodeGenerator() {
  const [language, setLanguage] = React.useState<(typeof LANGUAGES)[number]>("JavaScript")
  const [description, setDescription] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [output, setOutput] = React.useState("")
  const [copied, setCopied] = React.useState(false)

  const handleGenerate = React.useCallback(async () => {
    if (!description.trim()) {
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

    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 2000))

    clearInterval(interval)
    setProgress(100)

    const sample = CODE_SAMPLES[language] || CODE_SAMPLES.JavaScript
    setOutput(sample)
    setLoading(false)
    toast.success("Code generated")
  }, [language, description])

  const highlightSyntax = (code: string): React.ReactNode => {
    const lines = code.split("\n")
    return lines.map((line, i) => {
      const highlighted = line
        .replace(/(\/\/.*)$/gm, '<span class="text-emerald-500/70">$1</span>')
        .replace(/\b(const|let|var|function|return|if|else|for|while|import|export|from|class|interface|type|async|await|try|catch|throw|new|this|typeof|instanceof|in|of|true|false|null|undefined)\b/g, '<span class="text-violet-400">$1</span>')
        .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-amber-400">$1</span>')
        .replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, '<span class="text-emerald-400">$1</span>')
        .replace(/\b([A-Z][a-zA-Z]+)\b/g, (match) => {
          const types = ["ProcessOptions", "ProcessResult", "DashboardProps", "DataItem", "HTMLInputElement", "React", "FC", "Dispatch", "SetStateAction"]
          return types.includes(match) ? `<span class="text-cyan-400">${match}</span>` : match
        })
        .replace(/([{}().,;:[\]])\s*/g, '$1 ')

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
      JavaScript: "js",
      TypeScript: "ts",
      Python: "py",
      HTML: "html",
      CSS: "css",
      SQL: "sql",
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
          <p className="text-sm text-muted-foreground">Generate code with AI</p>
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
              <span className="text-sm font-medium text-foreground capitalize">{language} Code</span>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  {copied ? (
                    <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5" /> Copy</>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
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

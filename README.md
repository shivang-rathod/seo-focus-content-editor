# SEO Focus Editor

A distraction-free, local-first, open-source SEO and content optimization editor built with React and TypeScript. Write directly in the browser with real-time content scoring, readability metrics, keyword density analysis, E-E-A-T signals, JSON-LD schema generation, and optional **Bring-Your-Own-Key (BYOK)** AI assistance—with no accounts, paywalls, or backend required.

---

## ✨ Feature Highlights

### ✍️ Distraction-Free Rich Text Editor
- **Direct Editor Experience**: Opens straight into your workspace with zero login gates or artificial word limits.
- **Rich Formatting Toolbar**: Undo/Redo, block selector (`Paragraph`, `H1`–`H6`, `Quote`, `Code Block`), inline formatting (`Bold`, `Italic`, `Underline`, `Strikethrough`, `Subscript`, `Superscript`), plus modals for inserting tables, images, horizontal dividers, and links.
- **Long-Paragraph Detection**: Automatically flags overly dense paragraphs (`>150` words) directly in the editor.

### 📊 Real-Time Insights & Readability
- **Content Health Score (`0–100`)**: Live composite score across Meta Tags, Heading Structure, Keyword Optimization, Content Quality, and Link Structure.
- **Readability Analysis**: Real-time Flesch Reading Ease score, difficulty classification, total words, sentences, paragraphs, and estimated reading time.
- **E-E-A-T Scoring**: Breakdown across **Experience**, **Expertise**, **Authoritativeness**, and **Trustworthiness**.
- **Interactive Outline**: Clickable `H1–H4` heading tree to jump directly to any section in your draft.

### 🎯 Keyword Targeting & N-Gram Density
- **Primary & Secondary Targets**: Track one primary keyword and up to three secondary keywords simultaneously.
- **1W–4W Phrase Density Table**: Live word and multi-word phrase frequency, count, and percentage density with search filtering and color-coded over/under-optimization indicators.
- **In-Editor Keyword Highlighting**: Toggle visual highlights across your draft for primary and secondary keywords.
- **NLP Entities**: Automatic extraction of key entities detected in your copy.

### 🔍 Technical SEO, Links & Schema
- **Meta Tag Optimizer**: Live character count and status checks for Meta Title (`50–60` chars) and Meta Description (`140–160` chars).
- **Link Analysis**: Tracks internal vs. external links against your target domain and validates link URLs in your document.
- **FAQ Builder & JSON-LD Export**: Add or generate FAQs and copy ready-to-use `Article` + `FAQPage` Schema.org JSON-LD markup in one click.

### 🚀 Actionable Optimization Engine
- **Prioritized Audit**: Categorizes feedback into **Critical Issues**, **SEO Improvements**, **SEO Enhancements**, and **E-E-A-T Suggestions**.
- **Sentence-Level Diagnostics**: Detects very long sentences (`>35` words), long sentences (`>25` words), consecutive long sentences, passive voice, comma overload, and repetitive sentence openings—click any issue to scroll straight to it.

### 🤖 Optional Bring-Your-Own-Key (BYOK) AI Tab
- **Multi-Provider Support**: Use your own **Google Gemini**, **OpenAI**, or **Custom** endpoint directly from the **AI** tab.
- **AI Writing & SEO Tools**:
  - Rewrite selected text (`Clarity`, `Make Precise`, `Expand Examples`, `Tone Expert`).
  - Auto-generate Meta Titles, Meta Descriptions, and FAQs.
  - Scan content for AI-generated patterns.
- **Local-Only Key Storage**: API keys are stored solely in your browser's `localStorage` and sent directly to your chosen provider—never uploaded to any server.

### 💾 Local-First Storage & Export
- **Local Documents Drawer**: Create, switch, rename, delete, and import `.json` document backups stored in `localStorage`.
- **Multi-Format Export**: Download your work as **Markdown (`.md`)**, **HTML (`.html`)**, **JSON Backup (`.json`)**, or copy Markdown directly to the clipboard.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **AI SDK**: `@google/genai` (plus OpenAI & custom HTTP provider adapters)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)

### Run Locally

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd seo-focus-editor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser and start writing immediately.

4. **Build for production**
   ```bash
   npm run build
   ```
   Static assets are output to `dist/` and can be hosted on any static hosting provider (Vercel, Netlify, Cloudflare Pages, GitHub Pages, etc.).

> **Using AI Features (Optional):** No `.env` file is required. Open the **AI** tab in the editor sidebar, select your provider (Gemini, OpenAI, or Custom), and paste your own API key.

---

## 📁 Project Structure

```text
├── ai/                  # AI prompt orchestration (rewrites, metadata, FAQs, detection)
├── components/
│   ├── editor/          # ContentEditable rich text editor & formatting toolbar
│   └── layout/          # Documents drawer & Insights/Keywords/SEO/AI/Optimize sidebar tabs
├── core/                # Client-side SEO, readability, E-E-A-T, keyword & sentence analyzers
├── pages/               # Direct EditorPage entry view
├── services/            # Local BYOK AI config, gateway & provider adapters (Gemini, OpenAI, Custom)
├── types/               # TypeScript definitions for documents, editor metrics & AI config
└── utils/               # LocalStorage document persistence manager
```

---

## 🔒 Privacy & Security

- **100% Client-Side**: Documents and settings stay in your browser's `localStorage`.
- **BYOK Note**: Because this app runs purely in the browser without a backend proxy, any API key you enter is stored in `localStorage` and sent directly from your browser to the selected AI provider. Use personal or domain/quota-restricted keys when deploying publicly.

---

## 📄 License

Open source under the [MIT License](LICENSE). Contributions, issues, and feature requests are welcome!

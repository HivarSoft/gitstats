# GitStats Web · [hivarsoft.com](https://hivarsoft.com)

> A modern, full-stack React dashboard for **real** local Git repository analytics.  
> Browse, select, and analyze any `.git` repo on your machine — no cloud, no upload, everything stays local.

[![Website](https://img.shields.io/badge/website-hivarsoft.com-0078d4?style=flat-square)](https://hivarsoft.com)
[![GitHub](https://img.shields.io/badge/GitHub-HivarSoft-181717?style=flat-square&logo=github)](https://github.com/HivarSoft)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![Chakra UI](https://img.shields.io/badge/Chakra_UI-2-319795?style=flat-square)
![Express](https://img.shields.io/badge/Express-5-black?style=flat-square)

---

## ✨ Features

| | |
|---|---|
| 📁 **Folder browser** | Click Browse to navigate your filesystem and pick any git repo — git repos are highlighted automatically |
| 🖱 **Drag & drop** | Drop a repository folder straight onto the import page |
| ⌨️ **Path input** | Paste any absolute path manually |
| 📊 **Overview** | KPI cards, LOC timeline, top authors, recent tags |
| 📅 **Activity** | Weekly bars, hour-of-day, day-of-week, 7×24 heatmap, timezone breakdown |
| 👥 **Authors** | Per-author stats, cumulative lines, domain chart, author-of-month/year |
| 📂 **Files** | File count timeline, extension pie chart & breakdown table |
| 📈 **Lines** | Full LOC history, monthly add/remove, net cumulative |
| 🏷 **Tags** | Release bar chart, full tag table with contributor attribution |
| 🌙 **Dark mode first** | Polished dark/light toggle |
| 🔒 **100% local** | The Express API only reads from your local filesystem |

---

## 🏗 Architecture

```
Browser (React + Vite)
        │  fetch /api/*
        ▼
Express API (Node.js / tsx)   port 3001
        │  execFileSync git …
        ▼
Local .git repository
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- git installed and on `$PATH`

### Install & Run

```bash
cd gitstats/web
npm install
npm run dev          # starts API (port 3001) + Vite (port 5173) together
```

Open **http://localhost:5173** — you'll land on the import page.

1. Click **Browse** to open the folder picker, or paste a path directly
2. Click **Analyze**
3. View the full dashboard

---

## 📂 Project Structure

```
web/
├── server/
│   ├── index.ts        Express API server (health, browse, validate, analyze)
│   ├── analyzer.ts     Git analytics engine — all commit parsing logic
│   └── git.ts          Git subprocess helpers (resolveGitDir, gitPlumbing)
├── src/
│   ├── api/
│   │   └── client.ts   Typed fetch wrappers for all API endpoints
│   ├── components/
│   │   ├── FolderBrowser.tsx   Filesystem navigation modal
│   │   ├── Layout.tsx          App shell with sidebar + topbar
│   │   ├── Sidebar.tsx         Navigation rail
│   │   ├── PageHeader.tsx      Page title component
│   │   ├── SectionCard.tsx     Section wrapper card
│   │   ├── StatCard.tsx        KPI metric tile
│   │   └── ChartWrapper.tsx    Recharts responsive container
│   ├── hooks/
│   │   ├── useAnalyze.ts       Orchestrates validate → analyze flow
│   │   └── useReportData.ts    Access report from store, redirect if none
│   ├── pages/
│   │   ├── Import.tsx          Landing / repo selection page
│   │   ├── Overview.tsx
│   │   ├── Activity.tsx
│   │   ├── Authors.tsx
│   │   ├── Files.tsx
│   │   ├── Lines.tsx
│   │   └── Tags.tsx
│   ├── store/
│   │   └── reportStore.tsx     Global state (React context + useReducer)
│   ├── theme/
│   │   └── index.ts            Chakra UI theme — dark-first, semantic tokens
│   ├── types/
│   │   └── index.ts            GitStatsReport TypeScript interfaces
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts      Proxies /api → :3001
├── tsconfig.app.json   Frontend TS config
├── tsconfig.server.json Server TS config
└── index.html
```

---

## 🔌 API Endpoints

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/api/health` | — | Server health check |
| POST | `/api/browse` | `{ dirPath? }` | List directories at path (defaults to `$HOME`) |
| POST | `/api/validate` | `{ repoPath }` | Validate a git repo path |
| POST | `/api/analyze` | `{ repoPath }` | Full analysis → `GitStatsReport` |

---

## 🛠 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API + Vite dev server together |
| `npm run dev:server` | API only (with file watching) |
| `npm run dev:ui` | Vite only |
| `npm run build` | Production frontend build |
| `npm run type-check` | TypeScript check without emit |

---

## 📄 License

MIT © [HivarSoft](https://hivarsoft.com)

---

Made by [@HivarSoft](https://github.com/HivarSoft) · [hivarsoft.com](https://hivarsoft.com) · [GitHub Repo](https://github.com/HivarSoft/gitstats)

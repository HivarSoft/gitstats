# Architecture

This document describes how GitStats Web is structured and how to extend it with a real backend.

## Frontend Architecture

```
App (BrowserRouter)
└── Layout (Sidebar + Outlet)
    ├── Overview        /
    ├── Activity        /activity
    ├── Authors         /authors
    ├── Files           /files
    ├── Lines           /lines
    └── Tags            /tags
```

### Data Flow

```
mockReport.ts  ──▶  Page Component  ──▶  Recharts / Chakra UI
(replace with API)
```

Each page imports data from `src/data/mockReport.ts`. Replacing this with an API call is straightforward:

```ts
// Before (mock)
import { mockReport } from '@/data/mockReport'

// After (API)
import { useQuery } from '@tanstack/react-query'
const { data: report } = useQuery({
  queryKey: ['report'],
  queryFn: () => fetch('/api/report').then(r => r.json()),
})
```

### Theme System

Chakra UI semantic tokens are used throughout, defined in `src/theme/index.ts`:

| Token | Light | Dark |
|---|---|---|
| `bg.canvas` | `gray.50` | `#080e1a` |
| `bg.surface` | `white` | `#0f172a` |
| `bg.subtle` | `gray.100` | `#1e293b` |
| `text.primary` | `gray.900` | `whiteAlpha.900` |
| `text.secondary` | `gray.600` | `whiteAlpha.600` |

### Shared Components

| Component | Purpose |
|---|---|
| `StatCard` | KPI metric tile with icon |
| `SectionCard` | Section wrapper with title/description header |
| `PageHeader` | Page title + icon banner |
| `ChartWrapper` | Fixed-height responsive container for Recharts |
| `Sidebar` | Persistent left navigation |
| `Layout` | Page shell (Sidebar + main content area) |

## Backend Integration (FastAPI Example)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import subprocess, json, re
from datetime import datetime

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_methods=["*"])

@app.get("/api/report")
def get_report(path: str = "."):
    # Run git commands and return GitStatsReport JSON
    total_commits = int(subprocess.check_output(
        ["git", "-C", path, "rev-list", "--count", "HEAD"]
    ).decode().strip())
    # ... (full implementation omitted for brevity)
    return { "projectName": path.split("/")[-1], "totalCommits": total_commits, ... }
```

The `GitStatsReport` TypeScript interface in `src/types/index.ts` documents the exact shape the backend must return.

## TypeScript Types

All data shapes are defined in `src/types/index.ts`. The root type is `GitStatsReport`. Each section of the dashboard uses a subset of this type:

| Page | Key fields |
|---|---|
| Overview | `totalCommits`, `totalLOC`, `authors`, `tags`, `linesTimeline` |
| Activity | `weeklyActivity`, `activityByHour`, `activityByDay`, `hourOfWeek`, `commitsByYearMonth` |
| Authors | `authors`, `authorTimeline`, `authorOfMonth`, `authorOfYear`, `domains` |
| Files | `extensions`, `filesTimeline`, `totalFiles`, `avgFileSize` |
| Lines | `linesTimeline`, `totalLinesAdded`, `totalLinesRemoved`, `commitsByYearMonth` |
| Tags | `tags` |

## Adding a New Page

1. Create `src/pages/MyPage.tsx`
2. Add a route in `src/App.tsx`:
   ```tsx
   <Route path="mypage" element={<MyPage />} />
   ```
3. Add a nav item in `src/components/Sidebar.tsx`:
   ```ts
   { to: '/mypage', icon: SomeIcon, label: 'My Page' }
   ```

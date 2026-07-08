import type { GitStatsReport } from '@/types'

const BASE = '/api'

export interface AnalyzeResponse {
  report: GitStatsReport
  elapsed: number
}

export interface ValidateResponse {
  valid: boolean
  gitDir?: string
  projectName?: string
  error?: string
}

export interface BrowseEntry {
  name: string
  path: string
  isGitRepo: boolean
  isGitDir: boolean
}

export interface BrowseResponse {
  current: string
  parent: string | null
  dirs: BrowseEntry[]
  isGitRepo: boolean
  gitDir: string | null
}

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
  return data as T
}

export const api = {
  health: () =>
    fetchJSON<{ ok: boolean }>(`${BASE}/health`),

  browse: (dirPath?: string) =>
    fetchJSON<BrowseResponse>(`${BASE}/browse`, {
      method: 'POST',
      body: JSON.stringify({ dirPath }),
    }),

  validate: (repoPath: string) =>
    fetchJSON<ValidateResponse>(`${BASE}/validate`, {
      method: 'POST',
      body: JSON.stringify({ repoPath }),
    }),

  analyze: (repoPath: string) =>
    fetchJSON<AnalyzeResponse>(`${BASE}/analyze`, {
      method: 'POST',
      body: JSON.stringify({ repoPath }),
    }),
}

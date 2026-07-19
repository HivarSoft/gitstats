/**
 * server/index.ts — Express API server for GitStats
 */
import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { analyze } from './analyzer.js'
import { resolveGitDir, listBranches } from './git.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = parseInt(process.env.PORT ?? '3001')

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    'http://localhost:3000',
    'https://gitstats.hivarsoft.com',
    // also allow any *.vercel.app preview deployments
    /\.vercel\.app$/,
  ],
}))
app.use(express.json({ limit: '1mb' }))

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, version: '1.0.0' })
})

// ─── Browse filesystem ────────────────────────────────────────────────────────
// Returns directories at a given path so the frontend can show a folder picker
app.post('/api/browse', (req, res) => {
  const { dirPath } = req.body as { dirPath?: string }

  // Default to home directory
  const targetRaw = dirPath || process.env.HOME || '/'
  const target = path.resolve(targetRaw)

  if (!fs.existsSync(target)) {
    return res.status(400).json({ error: `Path does not exist: ${target}` })
  }

  try {
    const entries = fs.readdirSync(target, { withFileTypes: true })
    const dirs = entries
      .filter(e => e.isDirectory() && !e.name.startsWith('.') || e.name === '.git')
      .map(e => ({
        name: e.name,
        path: path.join(target, e.name),
        isGitRepo: fs.existsSync(path.join(target, e.name, '.git')) ||
                   fs.existsSync(path.join(target, e.name, 'HEAD')),
        isGitDir: e.name === '.git',
      }))
      .sort((a, b) => {
        // Git repos first, then alphabetical
        if (a.isGitRepo && !b.isGitRepo) return -1
        if (!a.isGitRepo && b.isGitRepo) return 1
        return a.name.localeCompare(b.name)
      })

    // Also include hidden .git folder if present
    const hiddenGit = path.join(target, '.git')
    const hasHiddenGit = fs.existsSync(hiddenGit)

    return res.json({
      current: target,
      parent: path.dirname(target) !== target ? path.dirname(target) : null,
      dirs,
      isGitRepo: hasHiddenGit,
      gitDir: hasHiddenGit ? hiddenGit : null,
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

// ─── List branches ────────────────────────────────────────────────────────────
app.post('/api/branches', (req, res) => {
  const { repoPath } = req.body as { repoPath?: string }
  if (!repoPath) return res.status(400).json({ error: 'repoPath is required' })
  try {
    const gitDir = resolveGitDir(repoPath)
    const result = listBranches(gitDir)
    return res.json(result)
  } catch (err: any) {
    return res.status(400).json({ error: err.message })
  }
})

// ─── Validate a repo path before full analysis ────────────────────────────────
app.post('/api/validate', (req, res) => {
  const { repoPath } = req.body as { repoPath?: string }
  if (!repoPath) {
    return res.status(400).json({ error: 'repoPath is required' })
  }
  try {
    const gitDir = resolveGitDir(repoPath)
    const projectName = path.basename(
      gitDir.endsWith('.git') ? path.dirname(gitDir) : gitDir
    ).replace(/\.git$/, '')
    return res.json({ valid: true, gitDir, projectName })
  } catch (err: any) {
    return res.status(400).json({ valid: false, error: err.message })
  }
})

// ─── Full analysis ────────────────────────────────────────────────────────────
app.post('/api/analyze', async (req, res) => {
  const { repoPath, branch } = req.body as { repoPath?: string; branch?: string }
  if (!repoPath) {
    return res.status(400).json({ error: 'repoPath is required' })
  }

  // Security: only allow absolute paths on the local filesystem
  const abs = path.resolve(repoPath)
  if (!fs.existsSync(abs)) {
    return res.status(400).json({ error: `Path not found: ${abs}` })
  }

  try {
    console.log(`[analyze] Starting: ${abs}${branch ? ` (branch: ${branch})` : ''}`)
    const t0 = Date.now()
    const report = await analyze(abs, branch)
    const elapsed = ((Date.now() - t0) / 1000).toFixed(2)
    console.log(`[analyze] Done in ${elapsed}s — ${report.totalCommits} commits`)
    return res.json({ report, elapsed: parseFloat(elapsed) })
  } catch (err: any) {
    console.error('[analyze] Error:', err.message)
    return res.status(500).json({ error: err.message ?? 'Analysis failed' })
  }
})

// ─── Serve built frontend in production ───────────────────────────────────────
const distDir = path.join(__dirname, '..', 'dist')
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  // Express 5 dropped bare '*' — use named wildcard
  app.get('/{*splat}', (_req, res) => res.sendFile(path.join(distDir, 'index.html')))
}

app.listen(PORT, () => {
  console.log(`\n  GitStats API  →  http://localhost:${PORT}`)
  console.log(`  Health check  →  http://localhost:${PORT}/api/health\n`)
})

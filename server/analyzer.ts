/**
 * analyzer.ts — Core git analytics engine.
 * Produces a complete GitStatsReport from any local git repository.
 */
import path from 'path'
import fs from 'fs'
import { resolveGitDir, gitPlumbing, gitPlumbingLines } from './git.js'
import type {
  GitStatsReport, Author, Tag, Extension,
  ActivityByHour, ActivityByDay, ActivityByMonth,
  CommitsByYearMonth, CommitsByYear, WeeklyActivity,
  HourOfWeek, TimelinePoint, FilesTimelinePoint,
  AuthorTimeline, Domain, AuthorOfPeriod, TimezoneData,
} from '../src/types/index.js'

// ─── Constants ────────────────────────────────────────────────────────────────
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const MAX_AUTHORS = 30
const MAX_TAGS = 30

// ─── Local aliases ────────────────────────────────────────────────────────────
const run = (gitDir: string, args: string[]) => gitPlumbing(gitDir, args)
const lines = (gitDir: string, args: string[]) => gitPlumbingLines(gitDir, args)

// ─── ISO week ─────────────────────────────────────────────────────────────────
function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export async function analyze(repoPath: string): Promise<GitStatsReport> {
  const gitDir = resolveGitDir(repoPath)

  // Project name: strip trailing .git
  const rawName = path.basename(
    gitDir.endsWith('/.git') || gitDir.endsWith('\\.git')
      ? path.dirname(gitDir)
      : gitDir
  )
  const projectName = rawName.replace(/\.git$/i, '') || 'repository'

  // ── Step 1: Pull full log with stats ────────────────────────────────────────
  // Format per commit block:
  //   <stamp>|<author>|<email>|<tz>
  //   (blank line)
  //   N files changed, N insertions(+), N deletions(-)
  //   (blank line)
  const logOutput = run(gitDir, [
    'log',
    '--pretty=format:COMMIT:%at|%aN|%aE|%ai',
    '--shortstat',
    '--no-merges',
    'HEAD',
  ])

  // ── Step 2: Parse log ────────────────────────────────────────────────────────
  interface RawCommit {
    stamp: number; date: Date; author: string
    email: string; tz: string
    ins: number; del: number
  }

  const rawCommits: RawCommit[] = []
  let cur: Partial<RawCommit> | null = null

  for (const line of logOutput.split('\n')) {
    if (line.startsWith('COMMIT:')) {
      if (cur?.stamp) rawCommits.push(cur as RawCommit)
      const parts = line.slice(7).split('|')
      const stamp = parseInt(parts[0] ?? '0')
      const iso = parts[3] ?? ''
      // Extract timezone: last 5 or 6 chars of ISO string, e.g. "+0530"
      const tzMatch = iso.match(/([+-]\d{4})$/)
      cur = {
        stamp,
        date: new Date(stamp * 1000),
        author: (parts[1] ?? 'Unknown').trim(),
        email: (parts[2] ?? '').trim(),
        tz: tzMatch?.[1] ?? '+0000',
        ins: 0,
        del: 0,
      }
    } else if (cur && line.includes('changed')) {
      const ins = parseInt(line.match(/(\d+) insertion/)?.[1] ?? '0')
      const del = parseInt(line.match(/(\d+) deletion/)?.[1] ?? '0')
      cur.ins = ins
      cur.del = del
    }
  }
  if (cur?.stamp) rawCommits.push(cur as RawCommit)

  if (rawCommits.length === 0) throw new Error('No commits found in this repository.')

  // ── Step 3: Aggregate all counters ──────────────────────────────────────────
  type AuthorAcc = {
    commits: number; ins: number; del: number
    firstStamp: number; lastStamp: number; days: Set<string>
  }
  const authorMap = new Map<string, AuthorAcc>()
  const byHour: Record<number, number> = {}
  const byDay: Record<number, number> = {}       // 0=Mon..6=Sun
  const byMonth: Record<number, number> = {}     // 1..12
  const byYearWeek: Record<string, number> = {}
  const byHourOfWeek: Record<string, Record<number, number>> = {}
  const byYM: Record<string, { c: number; ins: number; del: number }> = {}
  const byYear: Record<number, { c: number; ins: number; del: number }> = {}
  const tzMap: Record<string, number> = {}
  const domainMap: Record<string, number> = {}
  const aomMap: Record<string, Record<string, number>> = {} // yymm → author → commits
  const aoyMap: Record<number, Record<string, number>> = {} // year → author → commits
  const globalDays = new Set<string>()

  // For LOC timeline and author timeline
  let runningLOC = 0
  const locTimeline: TimelinePoint[] = []
  // author cumulative lines: stamp → author → { ins, commits }
  const authorState = new Map<string, { ins: number; commits: number }>()
  const authorTimelineByMonth: Record<string, Record<string, number>> = {}

  // Process oldest → newest for running LOC
  const sorted = [...rawCommits].sort((a, b) => a.stamp - b.stamp)

  for (const c of sorted) {
    const { stamp, date, author, email, ins, del, tz } = c

    // ── author ──
    if (!authorMap.has(author)) {
      authorMap.set(author, { commits: 0, ins: 0, del: 0, firstStamp: stamp, lastStamp: stamp, days: new Set() })
    }
    const a = authorMap.get(author)!
    a.commits++
    a.ins += ins
    a.del += del
    if (stamp < a.firstStamp) a.firstStamp = stamp
    if (stamp > a.lastStamp) a.lastStamp = stamp
    const yymmdd = date.toISOString().slice(0, 10)
    a.days.add(yymmdd)
    globalDays.add(yymmdd)

    // ── activity ──
    const hour = date.getHours()
    byHour[hour] = (byHour[hour] ?? 0) + 1

    const jsDay = date.getDay() // 0=Sun
    const weekday = jsDay === 0 ? 6 : jsDay - 1 // 0=Mon
    byDay[weekday] = (byDay[weekday] ?? 0) + 1

    const wLabel = WEEKDAYS[weekday]
    if (!byHourOfWeek[wLabel]) byHourOfWeek[wLabel] = {}
    byHourOfWeek[wLabel][hour] = (byHourOfWeek[wLabel][hour] ?? 0) + 1

    const mo = date.getMonth() + 1
    byMonth[mo] = (byMonth[mo] ?? 0) + 1

    const yw = `${date.getFullYear()}-W${String(isoWeek(date)).padStart(2, '0')}`
    byYearWeek[yw] = (byYearWeek[yw] ?? 0) + 1

    const yymm = date.toISOString().slice(0, 7)
    if (!byYM[yymm]) byYM[yymm] = { c: 0, ins: 0, del: 0 }
    byYM[yymm].c++
    byYM[yymm].ins += ins
    byYM[yymm].del += del

    const yr = date.getFullYear()
    if (!byYear[yr]) byYear[yr] = { c: 0, ins: 0, del: 0 }
    byYear[yr].c++
    byYear[yr].ins += ins
    byYear[yr].del += del

    // ── timezone ──
    tzMap[tz] = (tzMap[tz] ?? 0) + 1

    // ── domain ──
    const at = email.indexOf('@')
    const domain = at !== -1 ? email.slice(at + 1).toLowerCase() : '?'
    domainMap[domain] = (domainMap[domain] ?? 0) + 1

    // ── author of month/year ──
    if (!aomMap[yymm]) aomMap[yymm] = {}
    aomMap[yymm][author] = (aomMap[yymm][author] ?? 0) + 1

    if (!aoyMap[yr]) aoyMap[yr] = {}
    aoyMap[yr][author] = (aoyMap[yr][author] ?? 0) + 1

    // ── LOC timeline ──
    runningLOC += ins - del
    locTimeline.push({ date: yymmdd, lines: Math.max(0, runningLOC) })

    // ── author cumulative (monthly snapshots) ──
    const prevState = authorState.get(author) ?? { ins: 0, commits: 0 }
    prevState.ins += ins
    prevState.commits++
    authorState.set(author, prevState)
    if (!authorTimelineByMonth[yymm]) authorTimelineByMonth[yymm] = {}
    authorState.forEach((v, n) => { authorTimelineByMonth[yymm][n] = v.ins })
  }

  const totalCommits = rawCommits.length
  const totalIns = sorted.reduce((s, c) => s + c.ins, 0)
  const totalDel = sorted.reduce((s, c) => s + c.del, 0)
  const firstStamp = sorted[0].stamp
  const lastStamp = sorted[sorted.length - 1].stamp
  const totalDays = Math.max(1, Math.round((lastStamp - firstStamp) / 86400) + 1)
  const activeDays = globalDays.size

  // ── Step 4: Build sorted authors ────────────────────────────────────────────
  const sortedAuthors = [...authorMap.entries()].sort((a, b) => b[1].commits - a[1].commits)
  const authors: Author[] = sortedAuthors.slice(0, MAX_AUTHORS).map(([name, d], i) => ({
    name,
    commits: d.commits,
    commitsFrac: +((d.commits / totalCommits) * 100).toFixed(2),
    linesAdded: d.ins,
    linesRemoved: d.del,
    dateFirst: new Date(d.firstStamp * 1000).toISOString().slice(0, 10),
    dateLast: new Date(d.lastStamp * 1000).toISOString().slice(0, 10),
    activeDays: d.days.size,
    placeByCommits: i + 1,
    timedelta: `${Math.round((d.lastStamp - d.firstStamp) / 86400)} days`,
  }))

  // ── Step 5: Activity arrays ──────────────────────────────────────────────────
  const activityByHour: ActivityByHour[] = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    commits: byHour[h] ?? 0,
    percentage: +((((byHour[h] ?? 0) / totalCommits) * 100).toFixed(2)),
  }))

  const activityByDay: ActivityByDay[] = WEEKDAYS.map((day, i) => ({
    day,
    commits: byDay[i] ?? 0,
    percentage: +((((byDay[i] ?? 0) / totalCommits) * 100).toFixed(2)),
  }))

  const activityByMonth: ActivityByMonth[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    monthName: MONTH_NAMES[i],
    commits: byMonth[i + 1] ?? 0,
    percentage: +((((byMonth[i + 1] ?? 0) / totalCommits) * 100).toFixed(2)),
  }))

  // ── Step 6: Weekly activity (32 weeks ending at last commit) ────────────────
  // Anchor to the repo's last commit so inactive repos still show real data
  const anchorDate = new Date(lastStamp * 1000)
  const weeklyActivity: WeeklyActivity[] = Array.from({ length: 32 }, (_, i) => {
    const d = new Date(anchorDate)
    d.setDate(d.getDate() - (31 - i) * 7)
    const key = `${d.getFullYear()}-W${String(isoWeek(d)).padStart(2, '0')}`
    return { week: key, label: `W${i + 1}`, commits: byYearWeek[key] ?? 0 }
  })

  // ── Step 7: Hour of week ──────────────────────────────────────────────────────
  const hourOfWeek: HourOfWeek[] = WEEKDAYS.flatMap((wd, di) =>
    Array.from({ length: 24 }, (_, h) => ({
      weekday: wd,
      weekdayIndex: di,
      hour: h,
      commits: byHourOfWeek[wd]?.[h] ?? 0,
    }))
  )

  // ── Step 8: Commits by year/month & year ─────────────────────────────────────
  const commitsByYearMonth: CommitsByYearMonth[] = Object.entries(byYM)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([period, d]) => ({ period, commits: d.c, linesAdded: d.ins, linesRemoved: d.del }))

  const commitsByYear: CommitsByYear[] = Object.entries(byYear)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([yr, d]) => ({
      year: Number(yr),
      commits: d.c,
      commitsFrac: +((d.c / totalCommits) * 100).toFixed(2),
      linesAdded: d.ins,
      linesRemoved: d.del,
    }))

  // ── Step 9: Timezones ─────────────────────────────────────────────────────────
  const timezones: TimezoneData[] = Object.entries(tzMap)
    .sort((a, b) => b[1] - a[1])
    .map(([timezone, commits]) => ({ timezone, commits }))

  // ── Step 10: LOC timeline — deduplicate to one point per day ─────────────────
  const locByDay: Record<string, number> = {}
  for (const p of locTimeline) locByDay[p.date] = p.lines
  const linesTimeline: TimelinePoint[] = Object.entries(locByDay)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, lines]) => ({ date, lines }))

  // ── Step 11: Author timeline (monthly, top 5) ─────────────────────────────────
  const top5Names = authors.slice(0, 5).map(a => a.name)
  const allMonths = Object.keys(authorTimelineByMonth).sort()
  // Forward-fill so each month shows cumulative totals for all top-5
  const fwdState: Record<string, number> = {}
  top5Names.forEach(n => { fwdState[n] = 0 })
  const authorTimeline: AuthorTimeline[] = allMonths.map(mo => {
    const snap = authorTimelineByMonth[mo]
    top5Names.forEach(n => {
      if (snap[n] !== undefined) fwdState[n] = snap[n]
    })
    return { date: mo, ...Object.fromEntries(top5Names.map(n => [n, fwdState[n]])) }
  })

  // ── Step 12: Author of Month / Year ──────────────────────────────────────────
  const authorOfMonth: AuthorOfPeriod[] = Object.entries(aomMap)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 24)
    .map(([period, ac]) => {
      const sorted = Object.entries(ac).sort((a, b) => b[1] - a[1])
      const [topAuthor, topC] = sorted[0]
      const total = byYM[period]?.c ?? 1
      return {
        period, topAuthor, commits: topC,
        commitsFrac: +((topC / total) * 100).toFixed(2),
        totalCommits: total,
        nextAuthors: sorted.slice(1, 4).map(([n]) => n),
        authorCount: sorted.length,
      }
    })

  const authorOfYear: AuthorOfPeriod[] = Object.entries(aoyMap)
    .sort((a, b) => Number(b[0]) - Number(a[0]))
    .map(([yr, ac]) => {
      const sorted = Object.entries(ac).sort((a, b) => b[1] - a[1])
      const [topAuthor, topC] = sorted[0]
      const total = byYear[Number(yr)]?.c ?? 1
      return {
        period: yr, topAuthor, commits: topC,
        commitsFrac: +((topC / total) * 100).toFixed(2),
        totalCommits: total,
        nextAuthors: sorted.slice(1, 4).map(([n]) => n),
        authorCount: sorted.length,
      }
    })

  // ── Step 13: Domains ──────────────────────────────────────────────────────────
  const domains: Domain[] = Object.entries(domainMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([domain, commits]) => ({
      domain, commits,
      percentage: +((commits / totalCommits) * 100).toFixed(2),
    }))

  // ── Step 14: Tags ─────────────────────────────────────────────────────────────
  const tags = parseTags(gitDir)

  // ── Step 15: File extensions ──────────────────────────────────────────────────
  const { extensions, totalFiles, totalSize } = parseExtensions(gitDir)

  // ── Step 16: Files timeline (sampled, one per month) ─────────────────────────
  const filesTimeline = parseFilesTimeline(gitDir)

  // ── Step 17: LOC current state ────────────────────────────────────────────────
  const totalLOC = Math.max(0, runningLOC)
  const repoSizeBytes = totalSize
  const repoSizeStr = repoSizeBytes > 1024 * 1024
    ? `${(repoSizeBytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.round(repoSizeBytes / 1024)} KB`

  return {
    projectName,
    generatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    reportPeriod: {
      from: new Date(firstStamp * 1000).toISOString().replace('T', ' ').slice(0, 19),
      to: new Date(lastStamp * 1000).toISOString().replace('T', ' ').slice(0, 19),
    },
    age: { totalDays, activeDays, activeFrac: +((activeDays / totalDays) * 100).toFixed(2) },
    totalFiles,
    totalLOC,
    totalLinesAdded: totalIns,
    totalLinesRemoved: totalDel,
    totalCommits,
    avgCommitsPerActiveDay: +(totalCommits / Math.max(1, activeDays)).toFixed(2),
    avgCommitsPerDay: +(totalCommits / totalDays).toFixed(2),
    totalAuthors: authorMap.size,
    avgCommitsPerAuthor: +(totalCommits / Math.max(1, authorMap.size)).toFixed(2),
    repositorySize: repoSizeStr,

    weeklyActivity,
    activityByHour,
    activityByDay,
    activityByMonth,
    hourOfWeek,
    commitsByYearMonth,
    commitsByYear,
    timezones,

    authors,
    authorTimeline,
    authorOfMonth,
    authorOfYear,
    domains,

    extensions,
    filesTimeline,
    avgFileSize: totalFiles > 0 ? Math.round(repoSizeBytes / totalFiles) : 0,

    linesTimeline,
    tags,
  }
}

// ─── Tags ──────────────────────────────────────────────────────────────────────
function parseTags(gitDir: string): Tag[] {
  try {
    const refLines = lines(gitDir, ['show-ref', '--tags', '-d'])
    // We only want dereferenced tags (^{}) to get the real commit hash
    const tagMap: Record<string, { hash: string; name: string }> = {}

    for (const line of refLines) {
      const [hash, ref] = line.split(' ')
      if (!ref || !hash) continue
      if (ref.endsWith('^{}')) {
        const name = ref.replace('refs/tags/', '').replace('^{}', '')
        tagMap[name] = { hash, name }
      } else if (!tagMap[ref.replace('refs/tags/', '')]) {
        const name = ref.replace('refs/tags/', '')
        tagMap[name] = { hash, name }
      }
    }

    // Get date for each tag
    const tagDates: Array<{ name: string; hash: string; date: string }> = []
    for (const { name, hash } of Object.values(tagMap)) {
      try {
        const stamp = parseInt(run(gitDir, ['log', '-1', '--pretty=format:%at', hash]))
        if (!isNaN(stamp) && stamp > 0) {
          tagDates.push({ name, hash, date: new Date(stamp * 1000).toISOString().slice(0, 10) })
        }
      } catch { /* skip */ }
    }

    // Sort chronologically to compute per-tag commits
    tagDates.sort((a, b) => a.date.localeCompare(b.date))

    const result: Tag[] = []
    for (let i = 0; i < tagDates.length && result.length < MAX_TAGS; i++) {
      const { name, hash, date } = tagDates[i]
      const prevHash = i > 0 ? tagDates[i - 1].hash : null
      const range = prevHash ? `${prevHash}..${hash}` : hash
      let commits = 0
      const authors: Record<string, number> = {}
      try {
        const shortlog = lines(gitDir, ['shortlog', '-s', range])
        for (const sl of shortlog) {
          const m = sl.match(/^\s*(\d+)\s+(.+)$/)
          if (m) {
            const n = parseInt(m[1])
            const a = m[2].trim()
            commits += n
            authors[a] = n
          }
        }
      } catch { /* skip */ }
      result.push({ name, date, commits, authors })
    }

    return result.reverse() // newest first
  } catch {
    return []
  }
}

// ─── Extensions ────────────────────────────────────────────────────────────────
function parseExtensions(gitDir: string): {
  extensions: Extension[]
  totalFiles: number
  totalSize: number
} {
  const extMap: Record<string, { files: number; size: number }> = {}
  let totalFiles = 0
  let totalSize = 0

  try {
    // Standard format: <mode> SP <type> SP <hash> SP <size> TAB <path>
    // e.g. 100644 blob abc123 1234\tpath/to/file
    const lsLines = lines(gitDir, ['ls-tree', '-r', '-l', 'HEAD'])
    for (const line of lsLines) {
      if (!line.trim()) continue
      // Split on tab to separate metadata from path
      const tabIdx = line.indexOf('\t')
      if (tabIdx === -1) continue
      const meta = line.slice(0, tabIdx).trim()
      const filePath = line.slice(tabIdx + 1).trim()
      // meta: "100644 blob <hash> <size>"
      const metaParts = meta.split(/\s+/)
      if (metaParts[0] === '160000') continue // submodule
      const size = parseInt(metaParts[3] ?? '0')
      if (isNaN(size) || size < 0) continue

      const fname = filePath.split('/').pop() ?? ''
      const dotIdx = fname.lastIndexOf('.')
      let ext = ''
      if (dotIdx > 0 && dotIdx < fname.length - 1) {
        ext = fname.slice(dotIdx + 1).toLowerCase()
      }
      if (ext.length > 10) ext = ''

      if (!extMap[ext]) extMap[ext] = { files: 0, size: 0 }
      extMap[ext].files++
      extMap[ext].size += size
      totalFiles++
      totalSize += size
    }
  } catch { /* ignore */ }

  // Fallback: try ls-tree without size format
  if (totalFiles === 0) {
    try {
      const lsLines = lines(gitDir, ['ls-files'])
      for (const file of lsLines) {
        if (!file.trim()) continue
        const fname = file.split('/').pop() ?? ''
        const dotIdx = fname.lastIndexOf('.')
        let ext = ''
        if (dotIdx > 0) ext = fname.slice(dotIdx + 1).toLowerCase()
        if (ext.length > 10) ext = ''
        if (!extMap[ext]) extMap[ext] = { files: 0, size: 0 }
        extMap[ext].files++
        totalFiles++
      }
    } catch { /* ignore */ }
  }

  const extensions: Extension[] = Object.entries(extMap)
    .sort((a, b) => b[1].files - a[1].files)
    .map(([extension, d]) => ({
      extension,
      files: d.files,
      lines: 0,
      filesFrac: totalFiles > 0 ? +((d.files / totalFiles) * 100).toFixed(2) : 0,
      linesFrac: 0,
      linesPerFile: 0,
    }))

  return { extensions, totalFiles, totalSize }
}

// ─── Files timeline ─────────────────────────────────────────────────────────────
function parseFilesTimeline(gitDir: string): FilesTimelinePoint[] {
  const result: FilesTimelinePoint[] = []
  try {
    // Get one commit hash per month from the mainline history
    const logLines = lines(gitDir, [
      'log', '--first-parent', '--pretty=format:%at %H', 'HEAD',
    ])

    const monthMap: Record<string, { date: string; hash: string }> = {}
    for (const line of logLines) {
      const [stampStr, hash] = line.split(' ')
      if (!stampStr || !hash) continue
      const stamp = parseInt(stampStr)
      if (isNaN(stamp)) continue
      const d = new Date(stamp * 1000)
      const mo = d.toISOString().slice(0, 7)
      if (!monthMap[mo]) {
        monthMap[mo] = { date: d.toISOString().slice(0, 10), hash }
      }
    }

    // Sample at most 120 months
    const samples = Object.values(monthMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-120)

    for (const { date, hash } of samples) {
      try {
        const countStr = run(gitDir, ['ls-tree', '-r', '--name-only', hash])
        const count = countStr ? countStr.split('\n').filter(Boolean).length : 0
        result.push({ date, files: count })
      } catch { /* skip this sample */ }
    }
  } catch { /* ignore */ }

  return result
}

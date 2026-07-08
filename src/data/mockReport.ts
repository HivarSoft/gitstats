import type { GitStatsReport } from '@/types'

// Realistic mock data modelled after a medium-sized open-source project
export const mockReport: GitStatsReport = {
  projectName: 'my-awesome-project',
  generatedAt: '2026-07-08 18:30:00',
  reportPeriod: { from: '2019-03-12 09:14:02', to: '2026-07-08 17:55:43' },
  age: { totalDays: 2674, activeDays: 894, activeFrac: 33.43 },
  totalFiles: 312,
  totalLOC: 48_204,
  totalLinesAdded: 134_812,
  totalLinesRemoved: 86_608,
  totalCommits: 2_847,
  avgCommitsPerActiveDay: 3.18,
  avgCommitsPerDay: 1.06,
  totalAuthors: 38,
  avgCommitsPerAuthor: 74.92,
  repositorySize: '14.2 MB',

  weeklyActivity: Array.from({ length: 32 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (31 - i) * 7)
    const year = d.getFullYear()
    const week = String(Math.ceil(d.getDate() / 7)).padStart(2, '0')
    return {
      week: `${year}-W${week}`,
      label: `W${31 - i + 1}`,
      commits: Math.floor(Math.random() * 28) + 2,
    }
  }),

  activityByHour: Array.from({ length: 24 }, (_, h) => {
    const base =
      h >= 9 && h <= 18
        ? 80 + Math.random() * 120
        : h >= 19 && h <= 23
          ? 20 + Math.random() * 40
          : Math.random() * 15
    const commits = Math.round(base)
    return { hour: h, commits, percentage: 0 }
  }).map((d, _, arr) => {
    const total = arr.reduce((s, x) => s + x.commits, 0)
    return { ...d, percentage: +((d.commits / total) * 100).toFixed(2) }
  }),

  activityByDay: [
    { day: 'Mon', commits: 512, percentage: 19.5 },
    { day: 'Tue', commits: 598, percentage: 22.7 },
    { day: 'Wed', commits: 571, percentage: 21.7 },
    { day: 'Thu', commits: 543, percentage: 20.6 },
    { day: 'Fri', commits: 387, percentage: 14.7 },
    { day: 'Sat', commits: 102, percentage: 3.9 },
    { day: 'Sun', commits: 63, percentage: 2.4 },
  ],

  activityByMonth: [
    { month: 1, monthName: 'Jan', commits: 198, percentage: 6.95 },
    { month: 2, monthName: 'Feb', commits: 212, percentage: 7.45 },
    { month: 3, monthName: 'Mar', commits: 267, percentage: 9.38 },
    { month: 4, monthName: 'Apr', commits: 284, percentage: 9.98 },
    { month: 5, monthName: 'May', commits: 301, percentage: 10.57 },
    { month: 6, monthName: 'Jun', commits: 278, percentage: 9.77 },
    { month: 7, monthName: 'Jul', commits: 245, percentage: 8.61 },
    { month: 8, monthName: 'Aug', commits: 231, percentage: 8.11 },
    { month: 9, monthName: 'Sep', commits: 256, percentage: 8.99 },
    { month: 10, monthName: 'Oct', commits: 271, percentage: 9.52 },
    { month: 11, monthName: 'Nov', commits: 189, percentage: 6.64 },
    { month: 12, monthName: 'Dec', commits: 115, percentage: 4.04 },
  ],

  hourOfWeek: (() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const result = []
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        const isWorkHour = h >= 9 && h <= 18
        const isWeekend = d >= 5
        const commits = isWorkHour && !isWeekend
          ? Math.floor(Math.random() * 30) + 5
          : isWorkHour
            ? Math.floor(Math.random() * 10)
            : Math.floor(Math.random() * 5)
        result.push({ weekday: days[d], weekdayIndex: d, hour: h, commits })
      }
    }
    return result
  })(),

  commitsByYearMonth: (() => {
    const result = []
    const start = new Date('2019-03-01')
    const end = new Date('2026-07-01')
    const cur = new Date(start)
    while (cur <= end) {
      const period = cur.toISOString().slice(0, 7)
      const commits = Math.floor(Math.random() * 40) + 5
      result.push({
        period,
        commits,
        linesAdded: commits * (Math.floor(Math.random() * 80) + 20),
        linesRemoved: commits * (Math.floor(Math.random() * 50) + 10),
      })
      cur.setMonth(cur.getMonth() + 1)
    }
    return result.reverse()
  })(),

  commitsByYear: [
    { year: 2019, commits: 287, commitsFrac: 10.08, linesAdded: 18_432, linesRemoved: 9_201 },
    { year: 2020, commits: 412, commitsFrac: 14.47, linesAdded: 24_891, linesRemoved: 14_302 },
    { year: 2021, commits: 534, commitsFrac: 18.76, linesAdded: 31_204, linesRemoved: 20_118 },
    { year: 2022, commits: 498, commitsFrac: 17.49, linesAdded: 22_341, linesRemoved: 15_687 },
    { year: 2023, commits: 467, commitsFrac: 16.40, linesAdded: 19_832, linesRemoved: 13_201 },
    { year: 2024, commits: 389, commitsFrac: 13.67, linesAdded: 11_204, linesRemoved: 8_903 },
    { year: 2025, commits: 198, commitsFrac: 6.95, linesAdded: 5_812, linesRemoved: 4_201 },
    { year: 2026, commits: 62, commitsFrac: 2.18, linesAdded: 1_096, linesRemoved: 995 },
  ].reverse(),

  timezones: [
    { timezone: '+0000', commits: 487 },
    { timezone: '+0100', commits: 312 },
    { timezone: '+0200', commits: 198 },
    { timezone: '-0500', commits: 876 },
    { timezone: '-0600', commits: 423 },
    { timezone: '-0700', commits: 312 },
    { timezone: '-0800', commits: 201 },
    { timezone: '+0530', commits: 38 },
  ],

  authors: [
    {
      name: 'Alice Johnson',
      commits: 847,
      commitsFrac: 29.75,
      linesAdded: 42_312,
      linesRemoved: 28_901,
      dateFirst: '2019-03-12',
      dateLast: '2026-07-07',
      activeDays: 412,
      placeByCommits: 1,
      timedelta: '2673 days',
    },
    {
      name: 'Bob Martinez',
      commits: 634,
      commitsFrac: 22.27,
      linesAdded: 31_204,
      linesRemoved: 21_032,
      dateFirst: '2019-06-04',
      dateLast: '2026-06-28',
      activeDays: 298,
      placeByCommits: 2,
      timedelta: '2581 days',
    },
    {
      name: 'Carol Chen',
      commits: 487,
      commitsFrac: 17.11,
      linesAdded: 22_018,
      linesRemoved: 14_209,
      dateFirst: '2020-02-11',
      dateLast: '2026-05-14',
      activeDays: 221,
      placeByCommits: 3,
      timedelta: '2284 days',
    },
    {
      name: 'David Kim',
      commits: 312,
      commitsFrac: 10.96,
      linesAdded: 14_302,
      linesRemoved: 9_812,
      dateFirst: '2020-08-22',
      dateLast: '2025-11-30',
      activeDays: 178,
      placeByCommits: 4,
      timedelta: '1926 days',
    },
    {
      name: 'Eva Müller',
      commits: 198,
      commitsFrac: 6.96,
      linesAdded: 8_912,
      linesRemoved: 5_401,
      dateFirst: '2021-01-15',
      dateLast: '2024-12-20',
      activeDays: 134,
      placeByCommits: 5,
      timedelta: '1435 days',
    },
    {
      name: 'Frank Okonkwo',
      commits: 143,
      commitsFrac: 5.02,
      linesAdded: 6_201,
      linesRemoved: 3_812,
      dateFirst: '2021-07-09',
      dateLast: '2025-08-14',
      activeDays: 98,
      placeByCommits: 6,
      timedelta: '1497 days',
    },
    {
      name: 'Grace Tanaka',
      commits: 89,
      commitsFrac: 3.13,
      linesAdded: 3_402,
      linesRemoved: 2_109,
      dateFirst: '2022-03-01',
      dateLast: '2024-09-22',
      activeDays: 67,
      placeByCommits: 7,
      timedelta: '936 days',
    },
    {
      name: 'Hiro Nakamura',
      commits: 72,
      commitsFrac: 2.53,
      linesAdded: 2_801,
      linesRemoved: 1_902,
      dateFirst: '2022-09-18',
      dateLast: '2025-03-11',
      activeDays: 54,
      placeByCommits: 8,
      timedelta: '904 days',
    },
    {
      name: 'Isla Scott',
      commits: 48,
      commitsFrac: 1.69,
      linesAdded: 1_912,
      linesRemoved: 1_204,
      dateFirst: '2023-01-22',
      dateLast: '2024-06-30',
      activeDays: 38,
      placeByCommits: 9,
      timedelta: '525 days',
    },
    {
      name: 'Jake Patel',
      commits: 37,
      commitsFrac: 1.30,
      linesAdded: 1_402,
      linesRemoved: 980,
      dateFirst: '2023-05-14',
      dateLast: '2024-02-28',
      activeDays: 29,
      placeByCommits: 10,
      timedelta: '290 days',
    },
  ],

  authorTimeline: (() => {
    const authors = ['Alice Johnson', 'Bob Martinez', 'Carol Chen', 'David Kim', 'Eva Müller']
    const result: { date: string; [k: string]: string | number }[] = []
    const state: Record<string, number> = {}
    authors.forEach(a => { state[a] = 0 })
    const start = new Date('2019-03-01')
    const end = new Date('2026-07-01')
    const cur = new Date(start)
    while (cur <= end) {
      authors.forEach(a => {
        state[a] += Math.floor(Math.random() * 8)
      })
      result.push({ date: cur.toISOString().slice(0, 7), ...state })
      cur.setMonth(cur.getMonth() + 1)
    }
    return result
  })(),

  authorOfMonth: (() => {
    const authors = ['Alice Johnson', 'Bob Martinez', 'Carol Chen', 'David Kim', 'Eva Müller']
    const result = []
    const start = new Date('2024-01-01')
    for (let i = 0; i < 18; i++) {
      const d = new Date(start)
      d.setMonth(d.getMonth() + i)
      const period = d.toISOString().slice(0, 7)
      const topAuthor = authors[Math.floor(Math.random() * 3)]
      const totalCommits = Math.floor(Math.random() * 40) + 15
      const commits = Math.floor(totalCommits * (0.3 + Math.random() * 0.3))
      result.push({
        period,
        topAuthor,
        commits,
        commitsFrac: +((commits / totalCommits) * 100).toFixed(2),
        totalCommits,
        nextAuthors: authors.filter(a => a !== topAuthor).slice(0, 3),
        authorCount: Math.floor(Math.random() * 8) + 4,
      })
    }
    return result.reverse()
  })(),

  authorOfYear: [
    {
      period: '2026',
      topAuthor: 'Alice Johnson',
      commits: 42,
      commitsFrac: 67.74,
      totalCommits: 62,
      nextAuthors: ['Bob Martinez', 'Carol Chen', 'David Kim'],
      authorCount: 7,
    },
    {
      period: '2025',
      topAuthor: 'Alice Johnson',
      commits: 89,
      commitsFrac: 44.95,
      totalCommits: 198,
      nextAuthors: ['Bob Martinez', 'Carol Chen', 'David Kim'],
      authorCount: 14,
    },
    {
      period: '2024',
      topAuthor: 'Bob Martinez',
      commits: 121,
      commitsFrac: 31.11,
      totalCommits: 389,
      nextAuthors: ['Alice Johnson', 'Carol Chen', 'David Kim'],
      authorCount: 18,
    },
    {
      period: '2023',
      topAuthor: 'Alice Johnson',
      commits: 154,
      commitsFrac: 32.97,
      totalCommits: 467,
      nextAuthors: ['Bob Martinez', 'Carol Chen', 'Eva Müller'],
      authorCount: 22,
    },
    {
      period: '2022',
      topAuthor: 'Carol Chen',
      commits: 178,
      commitsFrac: 35.74,
      totalCommits: 498,
      nextAuthors: ['Alice Johnson', 'Bob Martinez', 'David Kim'],
      authorCount: 24,
    },
  ],

  domains: [
    { domain: 'gmail.com', commits: 987, percentage: 34.67 },
    { domain: 'company.io', commits: 743, percentage: 26.10 },
    { domain: 'outlook.com', commits: 312, percentage: 10.96 },
    { domain: 'github.com', commits: 298, percentage: 10.47 },
    { domain: 'protonmail.com', commits: 201, percentage: 7.06 },
    { domain: 'yahoo.com', commits: 145, percentage: 5.09 },
    { domain: 'hotmail.com', commits: 98, percentage: 3.44 },
    { domain: '?', commits: 63, percentage: 2.21 },
  ],

  extensions: [
    { extension: 'ts', files: 89, lines: 18_432, filesFrac: 28.53, linesFrac: 38.23, linesPerFile: 207 },
    { extension: 'tsx', files: 67, lines: 12_301, filesFrac: 21.47, linesFrac: 25.52, linesPerFile: 184 },
    { extension: 'json', files: 42, lines: 3_892, filesFrac: 13.46, linesFrac: 8.07, linesPerFile: 93 },
    { extension: 'md', files: 28, lines: 4_201, filesFrac: 8.97, linesFrac: 8.71, linesPerFile: 150 },
    { extension: 'css', files: 18, lines: 2_891, filesFrac: 5.77, linesFrac: 5.99, linesPerFile: 161 },
    { extension: 'py', files: 22, lines: 3_412, filesFrac: 7.05, linesFrac: 7.08, linesPerFile: 155 },
    { extension: 'yaml', files: 15, lines: 1_204, filesFrac: 4.81, linesFrac: 2.50, linesPerFile: 80 },
    { extension: 'sh', files: 11, lines: 892, filesFrac: 3.53, linesFrac: 1.85, linesPerFile: 81 },
    { extension: '', files: 20, lines: 979, filesFrac: 6.41, linesFrac: 2.03, linesPerFile: 49 },
  ],

  filesTimeline: (() => {
    const result = []
    let files = 12
    const start = new Date('2019-03-01')
    const end = new Date('2026-07-01')
    const cur = new Date(start)
    while (cur <= end) {
      files += Math.floor(Math.random() * 4)
      result.push({ date: cur.toISOString().slice(0, 10), files })
      cur.setMonth(cur.getMonth() + 1)
    }
    return result
  })(),

  linesTimeline: (() => {
    const result = []
    let lines = 0
    const start = new Date('2019-03-01')
    const end = new Date('2026-07-01')
    const cur = new Date(start)
    while (cur <= end) {
      lines += Math.floor(Math.random() * 600) - 50
      if (lines < 0) lines = 0
      result.push({ date: cur.toISOString().slice(0, 10), lines })
      cur.setMonth(cur.getMonth() + 1)
    }
    return result
  })(),

  tags: [
    { name: 'v3.2.0', date: '2026-05-14', commits: 87, authors: { 'Alice Johnson': 52, 'Bob Martinez': 35 } },
    { name: 'v3.1.2', date: '2026-02-09', commits: 43, authors: { 'Carol Chen': 28, 'Alice Johnson': 15 } },
    { name: 'v3.1.0', date: '2025-11-22', commits: 112, authors: { 'Bob Martinez': 61, 'Alice Johnson': 51 } },
    { name: 'v3.0.0', date: '2025-06-30', commits: 198, authors: { 'Alice Johnson': 98, 'Carol Chen': 67, 'David Kim': 33 } },
    { name: 'v2.4.1', date: '2024-12-18', commits: 67, authors: { 'Bob Martinez': 39, 'Eva Müller': 28 } },
    { name: 'v2.4.0', date: '2024-08-05', commits: 134, authors: { 'Alice Johnson': 72, 'Bob Martinez': 62 } },
    { name: 'v2.3.0', date: '2024-03-20', commits: 89, authors: { 'Carol Chen': 54, 'Alice Johnson': 35 } },
    { name: 'v2.2.0', date: '2023-10-11', commits: 156, authors: { 'Alice Johnson': 88, 'Bob Martinez': 68 } },
    { name: 'v2.1.0', date: '2023-04-28', commits: 203, authors: { 'Bob Martinez': 112, 'Carol Chen': 91 } },
    { name: 'v2.0.0', date: '2022-09-15', commits: 312, authors: { 'Alice Johnson': 178, 'Bob Martinez': 134 } },
    { name: 'v1.5.0', date: '2021-12-01', commits: 189, authors: { 'Alice Johnson': 112, 'David Kim': 77 } },
    { name: 'v1.0.0', date: '2020-06-22', commits: 287, authors: { 'Alice Johnson': 190, 'Bob Martinez': 97 } },
  ],
}

// ─── Core Data Types ───────────────────────────────────────────────────────────

export interface Author {
  name: string;
  commits: number;
  commitsFrac: number;
  linesAdded: number;
  linesRemoved: number;
  dateFirst: string;
  dateLast: string;
  activeDays: number;
  placeByCommits: number;
  timedelta: string;
}

export interface Tag {
  name: string;
  date: string;
  commits: number;
  authors: Record<string, number>;
}

export interface Extension {
  extension: string;
  files: number;
  lines: number;
  filesFrac: number;
  linesFrac: number;
  linesPerFile: number;
}

export interface ActivityByHour {
  hour: number;
  commits: number;
  percentage: number;
}

export interface ActivityByDay {
  day: string;
  commits: number;
  percentage: number;
}

export interface ActivityByMonth {
  month: number;
  monthName: string;
  commits: number;
  percentage: number;
}

export interface CommitsByYearMonth {
  period: string;
  commits: number;
  linesAdded: number;
  linesRemoved: number;
}

export interface CommitsByYear {
  year: number;
  commits: number;
  commitsFrac: number;
  linesAdded: number;
  linesRemoved: number;
}

export interface WeeklyActivity {
  week: string;
  label: string;
  commits: number;
}

export interface HourOfWeek {
  weekday: string;
  weekdayIndex: number;
  hour: number;
  commits: number;
}

export interface TimelinePoint {
  date: string;
  lines: number;
}

export interface FilesTimelinePoint {
  date: string;
  files: number;
}

export interface AuthorTimeline {
  date: string;
  [author: string]: string | number;
}

export interface Domain {
  domain: string;
  commits: number;
  percentage: number;
}

export interface AuthorOfPeriod {
  period: string;
  topAuthor: string;
  commits: number;
  commitsFrac: number;
  totalCommits: number;
  nextAuthors: string[];
  authorCount: number;
}

export interface TimezoneData {
  timezone: string;
  commits: number;
}

// ─── Full Report Shape ─────────────────────────────────────────────────────────

export interface GitStatsReport {
  projectName: string;
  generatedAt: string;
  reportPeriod: { from: string; to: string };
  age: { totalDays: number; activeDays: number; activeFrac: number };
  totalFiles: number;
  totalLOC: number;
  totalLinesAdded: number;
  totalLinesRemoved: number;
  totalCommits: number;
  avgCommitsPerActiveDay: number;
  avgCommitsPerDay: number;
  totalAuthors: number;
  avgCommitsPerAuthor: number;
  repositorySize: string;

  // Activity
  weeklyActivity: WeeklyActivity[];
  activityByHour: ActivityByHour[];
  activityByDay: ActivityByDay[];
  activityByMonth: ActivityByMonth[];
  hourOfWeek: HourOfWeek[];
  commitsByYearMonth: CommitsByYearMonth[];
  commitsByYear: CommitsByYear[];
  timezones: TimezoneData[];

  // Authors
  authors: Author[];
  authorTimeline: AuthorTimeline[];
  authorOfMonth: AuthorOfPeriod[];
  authorOfYear: AuthorOfPeriod[];
  domains: Domain[];

  // Files
  extensions: Extension[];
  filesTimeline: FilesTimelinePoint[];
  avgFileSize: number;

  // Lines
  linesTimeline: TimelinePoint[];

  // Tags
  tags: Tag[];
}

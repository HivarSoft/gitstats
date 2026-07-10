# Changelog

All notable changes to this project are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [1.2.0] — 2026-07-08

### Added
- Mobile hamburger menu in the top bar that opens the sidebar as a Chakra UI `Drawer` on small screens
- `onNavClick` callback on `Sidebar` so tapping a nav item auto-closes the mobile drawer
- Bottom navigation bar dismisses cleanly on route change

### Changed
- **Layout** — sidebar is hidden on mobile (`display={{ base: 'none', md: 'block' }}`); top-bar padding is responsive (`px={{ base: 3, md: 8 }}`); date-range text hides on very small screens to prevent overflow
- **PageHeader** — icon shrinks on mobile, heading uses responsive size (`{ base: 'md', md: 'lg' }`), actions slot stacks below the title on small screens
- **SectionCard** — header and body padding reduced on mobile (`px/py` use responsive values)
- **StatCard** — label, value, and icon scale down on small screens; value uses `noOfLines={1}` to prevent overflow
- **Activity page** — 7 × 24 heatmap table and monthly commits table wrapped in `overflowX="auto"` with a `minW` so they scroll horizontally instead of breaking layout
- **Authors page** — 9-column authors table, author-of-month and author-of-year tables all receive horizontal-scroll wrappers; author cards drop to 2 columns on mobile
- **Files page** — extensions breakdown table wrapped for horizontal scroll; mini progress bars narrowed to fit
- **Lines page** — section spacing made responsive
- **Overview page** — stat grid spacing tightened on mobile; tag/author rows use `flexWrap` to prevent overflow; "Project Age" label shortened to avoid card overflow on small screens
- **Tags page** — all-tags table wrapped for horizontal scroll; release cards stack to 1 column on mobile
- **Import page** — Browse + path input + Analyze button row stacks vertically on mobile; Analyze button becomes full-width below the input on small screens

---

## [1.1.0] — 2026-07-08

### Changed
- **README** — added HivarSoft website badge, GitHub badge, and updated license footer with correct links (`hivarsoft.com`, `github.com/HivarSoft/gitstats`)
- **CONTRIBUTING** — added project byline linking to `hivarsoft.com` and the GitHub repository
- **package.json** — added `homepage`, `author`, `repository`, and `bugs` fields pointing to `hivarsoft.com` and `github.com/HivarSoft/gitstats`
- **index.html** — updated `description` meta tag; added `author`, Open Graph (`og:title`, `og:description`, `og:url`) meta tags
- **Sidebar** — GitHub footer link updated to `https://github.com/HivarSoft/gitstats`

---

## [1.0.0] — 2026-07-08

### Added
- Initial release of GitStats Web
- **Overview page** — project KPI cards, LOC area chart, top authors, recent tags
- **Activity page** — weekly bar chart, hour-of-day, day-of-week, hour-of-week heatmap, month-of-year, commits by year/month, timezone table
- **Authors page** — author cards, cumulative LOC/commits line charts, domain bar chart, authors table, author-of-month/year tables
- **Files page** — file count timeline, extension pie chart, extensions breakdown table
- **Lines page** — LOC area chart, monthly add/remove bar chart, cumulative net line chart
- **Tags page** — commits-per-tag bar chart, full tag table, recent release cards
- Dark mode first design with Chakra UI semantic tokens
- Responsive layout with persistent sidebar navigation
- Full TypeScript coverage with strict mode
- Vite build with manual code splitting for optimal chunk sizes
- MIT License

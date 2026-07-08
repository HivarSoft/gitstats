/**
 * git.ts — Low-level git subprocess helpers.
 *
 * Key insight: --work-tree is needed only for porcelain commands that read
 * the working directory (status, diff, etc.). Plumbing commands like
 * ls-tree, log, shortlog, cat-file, show-ref work fine with --git-dir only.
 */
import { spawnSync } from 'child_process'
import path from 'path'
import fs from 'fs'

export function resolveGitDir(inputPath: string): string {
  const abs = path.resolve(inputPath)

  // Passed a bare .git directory directly (has HEAD + objects/)
  if (
    fs.existsSync(path.join(abs, 'HEAD')) &&
    fs.existsSync(path.join(abs, 'objects'))
  ) {
    return abs
  }

  // Passed a working tree root that contains a .git folder or file
  const dotGit = path.join(abs, '.git')
  if (fs.existsSync(dotGit)) {
    const stat = fs.statSync(dotGit)
    if (stat.isDirectory()) return dotGit
    // Worktree / submodule: .git is a file pointing to the real git dir
    const content = fs.readFileSync(dotGit, 'utf8').trim()
    const m = content.match(/^gitdir:\s*(.+)$/)
    if (m) {
      const linked = path.resolve(abs, m[1].trim())
      if (fs.existsSync(linked)) return linked
    }
  }

  throw new Error(
    `No git repository found at: ${abs}\n` +
    `Make sure you select a folder that contains a .git directory.`
  )
}

/**
 * Run a git plumbing command with only --git-dir (no --work-tree).
 * This is correct for all read-only commands: log, ls-tree, shortlog,
 * show-ref, cat-file, ls-files, etc.
 */
export function gitPlumbing(gitDir: string, args: string[]): string {
  const result = spawnSync('git', ['--git-dir', gitDir, ...args], {
    encoding: 'utf8',
    env: { ...process.env, LC_ALL: 'C', LANG: 'C', GIT_TERMINAL_PROMPT: '0' },
    maxBuffer: 512 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  if (result.error) throw result.error
  return (result.stdout ?? '').trimEnd()
}

export function gitPlumbingLines(gitDir: string, args: string[]): string[] {
  const out = gitPlumbing(gitDir, args)
  return out ? out.split('\n') : []
}

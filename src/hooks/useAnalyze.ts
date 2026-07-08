import { useCallback } from 'react'
import { api } from '@/api/client'
import { useReport } from '@/store/reportStore'

export function useAnalyze() {
  const { state, dispatch } = useReport()

  const run = useCallback(async (repoPath: string) => {
    if (!repoPath.trim()) return
    dispatch({ type: 'SET_PATH', payload: repoPath })

    // Step 1 — validate path
    dispatch({ type: 'START_VALIDATE' })
    let projectName = ''
    try {
      const v = await api.validate(repoPath)
      if (!v.valid) {
        dispatch({ type: 'ERROR', payload: v.error ?? 'Invalid repository path' })
        return
      }
      projectName = v.projectName ?? repoPath.split('/').pop() ?? 'project'
    } catch (err: any) {
      dispatch({ type: 'ERROR', payload: err.message ?? 'Validation failed' })
      return
    }

    // Step 2 — full analysis
    dispatch({ type: 'START_ANALYZE', payload: { projectName } })
    try {
      const { report, elapsed } = await api.analyze(repoPath)
      dispatch({ type: 'DONE', payload: { report, elapsed } })
    } catch (err: any) {
      dispatch({ type: 'ERROR', payload: err.message ?? 'Analysis failed' })
    }
  }, [dispatch])

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [dispatch])

  return { state, run, reset }
}

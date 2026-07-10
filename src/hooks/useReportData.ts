/**
 * Convenience hook — returns the current report, redirecting to /import if none loaded.
 * During a branch switch the old report stays in place (status = 'switching'),
 * so we only redirect when there is genuinely no report at all.
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReport } from '@/store/reportStore'
import type { GitStatsReport } from '@/types'

export function useReportData(): GitStatsReport {
  const { state } = useReport()
  const navigate = useNavigate()

  useEffect(() => {
    // Only redirect when there is no report loaded at all.
    // 'switching' means a branch re-analysis is in progress — keep showing the old report.
    if (!state.report && state.status !== 'switching') {
      navigate('/import', { replace: true })
    }
  }, [state.status, state.report, navigate])

  return state.report!
}

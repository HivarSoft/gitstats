/**
 * Convenience hook — returns the current report, redirecting to /import if none loaded.
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReport } from '@/store/reportStore'
import type { GitStatsReport } from '@/types'

export function useReportData(): GitStatsReport {
  const { state } = useReport()
  const navigate = useNavigate()

  useEffect(() => {
    if (state.status !== 'done' || !state.report) {
      navigate('/import', { replace: true })
    }
  }, [state.status, state.report, navigate])

  // Return empty shell while redirecting
  return state.report!
}

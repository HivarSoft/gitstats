/**
 * Global report store — React context + useReducer.
 * Holds the current GitStatsReport and analysis state.
 */
import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { GitStatsReport } from '@/types'

// ─── State ────────────────────────────────────────────────────────────────────

export type AnalysisStatus = 'idle' | 'validating' | 'analyzing' | 'done' | 'error'

export interface ReportState {
  status: AnalysisStatus
  report: GitStatsReport | null
  repoPath: string
  projectName: string
  elapsed: number
  error: string | null
}

const initialState: ReportState = {
  status: 'idle',
  report: null,
  repoPath: '',
  projectName: '',
  elapsed: 0,
  error: null,
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export type Action =
  | { type: 'SET_PATH'; payload: string }
  | { type: 'START_VALIDATE' }
  | { type: 'START_ANALYZE'; payload: { projectName: string } }
  | { type: 'DONE'; payload: { report: GitStatsReport; elapsed: number } }
  | { type: 'ERROR'; payload: string }
  | { type: 'RESET' }

function reducer(state: ReportState, action: Action): ReportState {
  switch (action.type) {
    case 'SET_PATH':
      return { ...state, repoPath: action.payload, error: null }
    case 'START_VALIDATE':
      return { ...state, status: 'validating', error: null }
    case 'START_ANALYZE':
      return { ...state, status: 'analyzing', projectName: action.payload.projectName, error: null }
    case 'DONE':
      return {
        ...state,
        status: 'done',
        report: action.payload.report,
        elapsed: action.payload.elapsed,
        error: null,
      }
    case 'ERROR':
      return { ...state, status: 'error', error: action.payload }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ReportContextValue {
  state: ReportState
  dispatch: React.Dispatch<Action>
}

const ReportContext = createContext<ReportContextValue | null>(null)

export function ReportProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <ReportContext.Provider value={{ state, dispatch }}>
      {children}
    </ReportContext.Provider>
  )
}

export function useReport() {
  const ctx = useContext(ReportContext)
  if (!ctx) throw new Error('useReport must be used inside ReportProvider')
  return ctx
}

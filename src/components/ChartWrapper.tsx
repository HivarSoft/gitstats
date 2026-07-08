import { Box, useColorModeValue } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface ChartWrapperProps {
  height?: number
  children: ReactNode
}

export default function ChartWrapper({ height = 260, children }: ChartWrapperProps) {
  const gridColor = useColorModeValue('#e2e8f0', 'rgba(255,255,255,0.06)')
  const legendColor = useColorModeValue('#4a5568', 'rgba(255,255,255,0.7)')

  return (
    <Box
      w="full"
      h={`${height}px`}
      sx={{
        '.recharts-cartesian-grid line': { stroke: gridColor },
        '.recharts-tooltip-wrapper': { outline: 'none' },
        '.recharts-legend-item-text': {
          color: `${legendColor} !important`,
          fontSize: '12px',
        },
      }}
    >
      {children}
    </Box>
  )
}

// Consistent palette for multi-series charts
export const CHART_COLORS = [
  '#6366f1', // brand indigo
  '#22d3ee', // cyan
  '#f59e0b', // amber
  '#10b981', // emerald
  '#f43f5e', // rose
  '#8b5cf6', // violet
  '#0ea5e9', // sky
  '#84cc16', // lime
]

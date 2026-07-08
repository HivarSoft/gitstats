import {
  Box,
  SimpleGrid,
  Text,
  Flex,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
} from '@chakra-ui/react'
import { Activity as ActivityIcon } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import SectionCard from '@/components/SectionCard'
import PageHeader from '@/components/PageHeader'
import ChartWrapper from '@/components/ChartWrapper'
import { useReportData } from '@/hooks/useReportData'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const CustomBar = ({ active, payload, label }: any) => {
  const bg = useColorModeValue('white', '#1e293b')
  const border = useColorModeValue('#e2e8f0', 'rgba(255,255,255,0.1)')
  if (active && payload?.length) {
    return (
      <Box bg={bg} border="1px solid" borderColor={border} borderRadius="lg" px={3} py={2} shadow="lg">
        <Text fontSize="xs" color="text.secondary" mb={1}>{label}</Text>
        <Text fontSize="sm" fontWeight="semibold" color="#6366f1">{payload[0].value} commits</Text>
      </Box>
    )
  }
  return null
}

export default function Activity() {
  const d = useReportData()
  if (!d) return null
  const gridLine = useColorModeValue('#e2e8f0', 'rgba(255,255,255,0.06)')
  const cellBg = useColorModeValue('gray.50', 'surface.700')
  const maxHourCommits = Math.max(...d.activityByHour.map(h => h.commits))

  function heatColor(commits: number, max: number) {
    if (!commits || !max) return 'transparent'
    const intensity = commits / max
    return `rgba(99, 102, 241, ${0.1 + intensity * 0.85})`
  }

  // Build hour-of-week matrix
  const howMatrix: Record<string, Record<number, number>> = {}
  WEEKDAYS.forEach(d => { howMatrix[d] = {} })
  d.hourOfWeek.forEach(({ weekday, hour, commits }) => {
    howMatrix[weekday][hour] = commits
  })
  const maxHoW = Math.max(...d.hourOfWeek.map(h => h.commits))

  return (
    <Box>
      <PageHeader
        title="Activity"
        description="Commit patterns across time dimensions"
        icon={ActivityIcon}
        mb={8}
      />

      {/* Weekly activity bar */}
      <SectionCard title="Weekly Activity" description={`Last 32 weeks (ending ${d.reportPeriod.to.slice(0,10)})`} mb={6}>
        <ChartWrapper height={200}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={d.weeklyActivity} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine} vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
              <RechartTooltip content={<CustomBar />} cursor={{ fill: 'rgba(99,102,241,0.07)' }} />
              <Bar dataKey="commits" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </SectionCard>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
        {/* Hour of Day */}
        <SectionCard title="Hour of Day" description="When commits happen most">
          <ChartWrapper height={200}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.activityByHour} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridLine} vertical={false} />
                <XAxis dataKey="hour" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
                <RechartTooltip content={<CustomBar />} cursor={{ fill: 'rgba(99,102,241,0.07)' }} />
                <Bar dataKey="commits" fill="#22d3ee" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </SectionCard>

        {/* Day of Week */}
        <SectionCard title="Day of Week" description="Busiest days">
          <ChartWrapper height={200}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.activityByDay} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridLine} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={38} />
                <RechartTooltip content={<CustomBar />} cursor={{ fill: 'rgba(99,102,241,0.07)' }} />
                <Bar dataKey="commits" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
          <Box mt={3}>
            {d.activityByDay.map(day => (
              <Flex key={day.day} align="center" justify="space-between" py={1} fontSize="xs">
                <Text color="text.secondary" w={8}>{day.day}</Text>
                <Box flex={1} mx={2} bg="bg.subtle" borderRadius="full" h="5px" overflow="hidden">
                  <Box
                    w={`${day.percentage}%`}
                    h="full"
                    bg="#f59e0b"
                    borderRadius="full"
                    transition="width 0.5s"
                  />
                </Box>
                <Text color="text.muted" textAlign="right">{day.percentage.toFixed(1)}%</Text>
              </Flex>
            ))}
          </Box>
        </SectionCard>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={6}>
        {/* Month of Year */}
        <SectionCard title="Month of Year" description="Seasonal commit patterns">
          <ChartWrapper height={200}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.activityByMonth} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridLine} vertical={false} />
                <XAxis dataKey="monthName" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={38} />
                <RechartTooltip content={<CustomBar />} cursor={{ fill: 'rgba(99,102,241,0.07)' }} />
                <Bar dataKey="commits" fill="#10b981" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </SectionCard>

        {/* Commits by Year */}
        <SectionCard title="Commits by Year">
          <ChartWrapper height={200}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...d.commitsByYear].reverse()} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridLine} vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={38} />
                <RechartTooltip content={<CustomBar />} cursor={{ fill: 'rgba(99,102,241,0.07)' }} />
                <Bar dataKey="commits" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </SectionCard>
      </SimpleGrid>

      {/* Hour of Week heatmap */}
      <SectionCard title="Hour of Week" description="7 × 24 commit heatmap" mb={6}>
        <Box overflowX="auto">
          <Table size="sm" sx={{ 'td, th': { p: 1, textAlign: 'center', fontSize: '11px' } }}>
            <Thead>
              <Tr>
                <Th w="52px" />
                {Array.from({ length: 24 }, (_, h) => (
                  <Th key={h} textAlign="center" color="text.muted" fontWeight="normal">{h}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {WEEKDAYS.map(day => (
                <Tr key={day}>
                  <Td fontWeight="semibold" color="text.secondary" textAlign="left" pl={2}>{day}</Td>
                  {Array.from({ length: 24 }, (_, h) => {
                    const commits = howMatrix[day]?.[h] ?? 0
                    return (
                      <Tooltip key={h} label={`${day} ${h}:00 — ${commits} commits`} hasArrow placement="top">
                        <Td
                          bg={heatColor(commits, maxHoW)}
                          borderRadius="sm"
                          cursor={commits ? 'default' : 'default'}
                          _hover={commits ? { opacity: 0.85 } : {}}
                          transition="opacity 0.15s"
                        >
                          {commits > 0 ? commits : ''}
                        </Td>
                      </Tooltip>
                    )
                  })}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </SectionCard>

      {/* Commits by Year/Month */}
      <SectionCard title="Commits by Year / Month">
        <ChartWrapper height={220}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[...d.commitsByYearMonth].reverse().slice(0, 36)}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
              <XAxis dataKey="period" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={5} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={32} />
              <RechartTooltip content={<CustomBar />} cursor={{ stroke: '#6366f1', strokeDasharray: '4 2' }} />
              <Line type="monotone" dataKey="commits" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>
        <Box overflowX="auto" mt={4}>
          <Table variant="stats" size="sm">
            <Thead>
              <Tr>
                <Th>Month</Th>
                <Th isNumeric>Commits</Th>
                <Th isNumeric>Lines Added</Th>
                <Th isNumeric>Lines Removed</Th>
              </Tr>
            </Thead>
            <Tbody>
              {d.commitsByYearMonth.slice(0, 12).map(r => (
                <Tr key={r.period}>
                  <Td fontFamily="mono" fontSize="xs">{r.period}</Td>
                  <Td isNumeric>{r.commits}</Td>
                  <Td isNumeric color="green.400">+{r.linesAdded.toLocaleString()}</Td>
                  <Td isNumeric color="red.400">-{r.linesRemoved.toLocaleString()}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </SectionCard>
    </Box>
  )
}

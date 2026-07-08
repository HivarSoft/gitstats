import {
  Box,
  SimpleGrid,
  Text,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react'
import { LineChart as LineChartIcon, Code2, TrendingUp, TrendingDown } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts'
import StatCard from '@/components/StatCard'
import SectionCard from '@/components/SectionCard'
import PageHeader from '@/components/PageHeader'
import ChartWrapper from '@/components/ChartWrapper'
import { useReportData } from '@/hooks/useReportData'

const CustomTooltip = ({ active, payload, label }: any) => {
  const bg = useColorModeValue('white', '#1e293b')
  const border = useColorModeValue('#e2e8f0', 'rgba(255,255,255,0.1)')
  if (active && payload?.length) {
    return (
      <Box bg={bg} border="1px solid" borderColor={border} borderRadius="lg" px={3} py={2} shadow="lg">
        <Text fontSize="xs" color="text.secondary" mb={1}>{label}</Text>
        {payload.map((p: any) => (
          <Text key={p.dataKey} fontSize="sm" fontWeight="semibold" color={p.color || '#6366f1'}>
            {p.value.toLocaleString()} {p.name}
          </Text>
        ))}
      </Box>
    )
  }
  return null
}

export default function Lines() {
  const d = useReportData()
  if (!d) return null

  const gridLine = useColorModeValue('#e2e8f0', 'rgba(255,255,255,0.06)')

  // Build monthly net change data from the last 24 months
  const netChangeData = d.commitsByYearMonth.slice(0, 24).reverse().map(r => ({
    period: r.period,
    added: r.linesAdded,
    removed: -r.linesRemoved,
    net: r.linesAdded - r.linesRemoved,
  }))

  // Sample the LOC timeline for performance — max 200 points
  const locTimeline = d.linesTimeline.length > 200
    ? d.linesTimeline.filter((_, i) => i % Math.ceil(d.linesTimeline.length / 200) === 0)
    : d.linesTimeline

  return (
    <Box>
      <PageHeader
        title="Lines of Code"
        description="Code volume growth and churn over the project lifetime"
        icon={LineChartIcon}
        mb={8}
      />

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={8}>
        <StatCard
          label="Total Lines of Code"
          value={d.totalLOC.toLocaleString()}
          icon={Code2}
          iconColor="brand.400"
        />
        <StatCard
          label="Lines Added"
          value={`+${d.totalLinesAdded.toLocaleString()}`}
          helpText="all time"
          icon={TrendingUp}
          iconColor="green.400"
        />
        <StatCard
          label="Lines Removed"
          value={`-${d.totalLinesRemoved.toLocaleString()}`}
          helpText="all time"
          icon={TrendingDown}
          iconColor="red.400"
        />
      </SimpleGrid>

      {/* LOC over time */}
      <SectionCard title="Lines of Code over Time" description="Full project history" mb={6}>
        <ChartWrapper height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={locTimeline} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="locAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9 }}
                tickLine={false}
                axisLine={false}
                interval={Math.max(1, Math.floor(locTimeline.length / 8))}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={44}
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="lines"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#locAreaGrad)"
                dot={false}
                name="lines"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </SectionCard>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Net change per month */}
        <SectionCard title="Monthly Net Change" description="Lines added vs removed (last 24 months)">
          <ChartWrapper height={240}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={netChangeData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridLine} vertical={false} />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 8 }}
                  tickLine={false}
                  axisLine={false}
                  interval={Math.max(0, Math.floor(netChangeData.length / 8))}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="added" name="added" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={14} />
                <Bar dataKey="removed" name="removed" fill="#f43f5e" radius={[0, 0, 2, 2]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </SectionCard>

        {/* Cumulative net */}
        <SectionCard title="Cumulative Net Lines" description="Running total of added minus removed">
          <ChartWrapper height={240}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={netChangeData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 8 }}
                  tickLine={false}
                  axisLine={false}
                  interval={Math.max(0, Math.floor(netChangeData.length / 8))}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="net" name="net" stroke="#22d3ee" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </SectionCard>
      </SimpleGrid>
    </Box>
  )
}

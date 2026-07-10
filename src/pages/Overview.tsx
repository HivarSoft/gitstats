import {
  SimpleGrid,
  Box,
  Text,
  Flex,
  Badge,
  VStack,
  HStack,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  LayoutDashboard,
  GitCommit,
  Users,
  FileCode2,
  Code2,
  Calendar,
  TrendingUp,
  Clock,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import StatCard from '@/components/StatCard'
import SectionCard from '@/components/SectionCard'
import PageHeader from '@/components/PageHeader'
import ChartWrapper from '@/components/ChartWrapper'
import { useReportData } from '@/hooks/useReportData'

function formatNumber(n: number) {
  return n.toLocaleString()
}

const CustomTooltip = ({ active, payload, label }: any) => {
  const bg = useColorModeValue('white', '#1e293b')
  const border = useColorModeValue('#e2e8f0', 'rgba(255,255,255,0.1)')
  if (active && payload && payload.length) {
    return (
      <Box bg={bg} border="1px solid" borderColor={border} borderRadius="lg" px={3} py={2} shadow="lg">
        <Text fontSize="xs" color="text.secondary" mb={1}>{label}</Text>
        {payload.map((p: any) => (
          <Text key={p.dataKey} fontSize="sm" fontWeight="semibold" color={p.color}>
            {formatNumber(p.value)}
          </Text>
        ))}
      </Box>
    )
  }
  return null
}

export default function Overview() {
  const d = useReportData()
  if (!d) return null

  const gridLine = useColorModeValue('#e2e8f0', 'rgba(255,255,255,0.06)')

  const locSample = d.linesTimeline.length > 60
    ? d.linesTimeline.filter((_, i) => i % Math.ceil(d.linesTimeline.length / 60) === 0)
    : d.linesTimeline

  return (
    <Box>
      <PageHeader
        title="Overview"
        description={`${d.projectName} — repository analytics`}
        icon={LayoutDashboard}
        mb={{ base: 4, md: 8 }}
      />

      {/* Key stats */}
      <SimpleGrid columns={{ base: 2, md: 3, xl: 4 }} spacing={{ base: 3, md: 4 }} mb={{ base: 4, md: 8 }}>
        <StatCard
          label="Total Commits"
          value={formatNumber(d.totalCommits)}
          helpText={`${d.avgCommitsPerActiveDay.toFixed(1)} per active day`}
          icon={GitCommit}
          iconColor="brand.400"
        />
        <StatCard
          label="Total Authors"
          value={formatNumber(d.totalAuthors)}
          helpText={`${d.avgCommitsPerAuthor.toFixed(1)} commits each`}
          icon={Users}
          iconColor="cyan.400"
        />
        <StatCard
          label="Total Files"
          value={formatNumber(d.totalFiles)}
          helpText={d.avgFileSize > 0 ? `${(d.avgFileSize / 1024).toFixed(1)} KB avg` : undefined}
          icon={FileCode2}
          iconColor="amber.400"
        />
        <StatCard
          label="Lines of Code"
          value={formatNumber(d.totalLOC)}
          helpText={`+${formatNumber(d.totalLinesAdded)} / -${formatNumber(d.totalLinesRemoved)}`}
          icon={Code2}
          iconColor="emerald.400"
        />
        <StatCard
          label="Active Days"
          value={formatNumber(d.age.activeDays)}
          helpText={`${d.age.activeFrac.toFixed(1)}% of project life`}
          icon={Calendar}
          iconColor="violet.400"
        />
        <StatCard
          label="Project Age"
          value={`${d.age.totalDays.toLocaleString()}d`}
          helpText={`${d.reportPeriod.from.slice(0, 10)} → now`}
          icon={Clock}
          iconColor="rose.400"
        />
        <StatCard
          label="Repo Size"
          value={d.repositorySize}
          icon={TrendingUp}
          iconColor="sky.400"
        />
        <StatCard
          label="Commits / Day"
          value={d.avgCommitsPerDay.toFixed(2)}
          helpText="calendar day avg"
          icon={GitCommit}
          iconColor="orange.400"
        />
      </SimpleGrid>

      {/* LOC chart + project details */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={{ base: 4, md: 6 }} mb={{ base: 4, md: 6 }}>
        <Box gridColumn={{ lg: 'span 2' }}>
          <SectionCard title="Lines of Code over Time" description="Commit history">
            <ChartWrapper height={240}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={locSample} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="locGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval={Math.max(1, Math.floor(locSample.length / 6))}
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                    width={38}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="lines"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#locGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </SectionCard>
        </Box>

        {/* Project details */}
        <SectionCard title="Project Details">
          <VStack align="stretch" spacing={0} divider={<Divider />}>
            {[
              ['Project Name', d.projectName],
              ['Generated', d.generatedAt.slice(0, 10)],
              ['First Commit', d.reportPeriod.from.slice(0, 10)],
              ['Last Commit', d.reportPeriod.to.slice(0, 10)],
              ['Total Tags', String(d.tags.length)],
              ['Extensions', String(d.extensions.length)],
            ].map(([label, value]) => (
              <Flex key={label} justify="space-between" align="center" py={2.5} gap={2}>
                <Text fontSize="sm" color="text.secondary" flexShrink={0}>{label}</Text>
                <Text fontSize="sm" fontWeight="semibold" color="text.primary" maxW="160px" noOfLines={1} title={value} textAlign="right">
                  {value}
                </Text>
              </Flex>
            ))}
          </VStack>
        </SectionCard>
      </SimpleGrid>

      {/* Top authors + recent tags */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 4, md: 6 }}>
        <SectionCard title="Top Authors" description="By commit count">
          <VStack align="stretch" spacing={2}>
            {d.authors.slice(0, 5).map((author, i) => (
              <Flex key={author.name} align="center" gap={3}>
                <Flex
                  w={7}
                  h={7}
                  borderRadius="full"
                  bg={`hsl(${(i * 60 + 240) % 360}, 60%, 55%)`}
                  align="center"
                  justify="center"
                  flexShrink={0}
                >
                  <Text fontSize="xs" fontWeight="bold" color="white">
                    {author.name.charAt(0).toUpperCase()}
                  </Text>
                </Flex>
                <Box flex={1} minW={0}>
                  <Flex justify="space-between" mb={1} gap={2}>
                    <Text fontSize="sm" fontWeight="medium" color="text.primary" noOfLines={1}>
                      {author.name}
                    </Text>
                    <Text fontSize="xs" color="text.muted" flexShrink={0}>
                      {author.commits.toLocaleString()} ({author.commitsFrac.toFixed(1)}%)
                    </Text>
                  </Flex>
                  <Box w="full" bg="bg.subtle" borderRadius="full" h="4px" overflow="hidden">
                    <Box
                      w={`${author.commitsFrac}%`}
                      h="full"
                      bg={`hsl(${(i * 60 + 240) % 360}, 60%, 55%)`}
                      borderRadius="full"
                      transition="width 0.6s ease"
                    />
                  </Box>
                </Box>
              </Flex>
            ))}
          </VStack>
        </SectionCard>

        <SectionCard
          title="Recent Tags"
          description={d.tags.length > 0 ? 'Latest releases' : 'No tags found'}
        >
          {d.tags.length === 0 ? (
            <Text fontSize="sm" color="text.muted" textAlign="center" py={4}>
              This repository has no tags yet.
            </Text>
          ) : (
            <VStack align="stretch" spacing={2}>
              {d.tags.slice(0, 6).map(tag => (
                <Flex key={tag.name} align="center" justify="space-between" py={1.5} flexWrap="wrap" gap={1}>
                  <HStack spacing={2}>
                    <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                      {tag.name}
                    </Badge>
                    <Text fontSize="xs" color="text.muted">{tag.date}</Text>
                  </HStack>
                  <HStack spacing={2}>
                    <Text fontSize="xs" color="text.secondary">
                      {tag.commits} commits
                    </Text>
                    <Text fontSize="xs" color="text.muted">
                      {Object.keys(tag.authors).length} authors
                    </Text>
                  </HStack>
                </Flex>
              ))}
            </VStack>
          )}
        </SectionCard>
      </SimpleGrid>
    </Box>
  )
}

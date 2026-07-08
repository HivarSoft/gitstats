import {
  Box,
  SimpleGrid,
  Text,
  Flex,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  Avatar,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react'
import { Tag, GitBranch, GitCommit } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import StatCard from '@/components/StatCard'
import SectionCard from '@/components/SectionCard'
import PageHeader from '@/components/PageHeader'
import ChartWrapper, { CHART_COLORS } from '@/components/ChartWrapper'
import { useReportData } from '@/hooks/useReportData'

const CustomTooltip = ({ active, payload, label }: any) => {
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

export default function Tags() {
  const d = useReportData()
  if (!d) return null

  const gridLine = useColorModeValue('#e2e8f0', 'rgba(255,255,255,0.06)')
  const avgCommitsPerTag = d.tags.length > 0
    ? (d.totalCommits / d.tags.length).toFixed(1)
    : '—'

  const tagBarData = [...d.tags].reverse().map(t => ({
    name: t.name,
    commits: t.commits,
  }))

  return (
    <Box>
      <PageHeader
        title="Tags"
        description="Release history and version milestones"
        icon={Tag}
        mb={8}
      />

      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} mb={8}>
        <StatCard
          label="Total Tags"
          value={d.tags.length}
          icon={Tag}
          iconColor="violet.400"
        />
        <StatCard
          label="Avg Commits / Tag"
          value={avgCommitsPerTag}
          icon={GitCommit}
          iconColor="brand.400"
        />
        <StatCard
          label="Latest Tag"
          value={d.tags[0]?.name ?? '—'}
          helpText={d.tags[0]?.date ?? ''}
          icon={GitBranch}
          iconColor="emerald.400"
        />
      </SimpleGrid>

      {/* Tags chart */}
      {d.tags.length > 0 && (
        <SectionCard title="Commits per Release" description="All tags sorted chronologically" mb={6}>
          <ChartWrapper height={240}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tagBarData}
                margin={{ top: 5, right: 10, left: 0, bottom: tagBarData.length > 8 ? 50 : 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridLine} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 9 }}
                  tickLine={false}
                  axisLine={false}
                  angle={tagBarData.length > 8 ? -40 : 0}
                  textAnchor={tagBarData.length > 8 ? 'end' : 'middle'}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={32} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.07)' }} />
                <Bar dataKey="commits" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </SectionCard>
      )}

      {d.tags.length === 0 && (
        <SectionCard title="Tags" mb={6}>
          <Text color="text.muted" fontSize="sm" textAlign="center" py={8}>
            No tags found in this repository.
          </Text>
        </SectionCard>
      )}

      {/* Tags table */}
      {d.tags.length > 0 && (
        <SectionCard title="All Tags" description="Sorted by date descending" mb={6}>
          <Box overflowX="auto">
            <Table variant="stats" size="sm">
              <Thead>
                <Tr>
                  <Th>Tag</Th>
                  <Th>Date</Th>
                  <Th isNumeric>Commits</Th>
                  <Th>Top Contributors</Th>
                </Tr>
              </Thead>
              <Tbody>
                {d.tags.map((tag, i) => {
                  const sortedAuthors = Object.entries(tag.authors).sort((a, b) => b[1] - a[1])
                  return (
                    <Tr key={tag.name}>
                      <Td>
                        <Badge
                          colorScheme={i === 0 ? 'green' : 'purple'}
                          variant={i === 0 ? 'solid' : 'subtle'}
                          fontSize="xs"
                          fontFamily="mono"
                        >
                          {tag.name}
                        </Badge>
                      </Td>
                      <Td fontSize="xs" fontFamily="mono" color="text.secondary">{tag.date}</Td>
                      <Td isNumeric fontWeight="semibold">{tag.commits}</Td>
                      <Td>
                        <HStack spacing={2} flexWrap="wrap">
                          {sortedAuthors.slice(0, 3).map(([author, commits], ai) => (
                            <HStack key={author} spacing={1}>
                              <Avatar
                                name={author}
                                size="xs"
                                bg={CHART_COLORS[ai % CHART_COLORS.length]}
                                color="white"
                              />
                              <Text fontSize="xs" color="text.secondary">
                                {author.split(' ')[0]} ({commits})
                              </Text>
                            </HStack>
                          ))}
                          {sortedAuthors.length > 3 && (
                            <Text fontSize="10px" color="text.muted">
                              +{sortedAuthors.length - 3} more
                            </Text>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </Box>
        </SectionCard>
      )}

      {/* Recent release cards */}
      {d.tags.length > 0 && (
        <SectionCard title="Recent Releases" description="Latest 4 tag highlights">
          <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={4}>
            {d.tags.slice(0, 4).map((tag, i) => {
              const topAuthors = Object.entries(tag.authors)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
              return (
                <Box
                  key={tag.name}
                  bg="bg.subtle"
                  borderWidth="1px"
                  borderColor="border.default"
                  borderRadius="xl"
                  p={4}
                  transition="all 0.2s"
                  _hover={{ borderColor: 'brand.500', shadow: 'sm' }}
                >
                  <Flex justify="space-between" align="center" mb={3}>
                    <Badge
                      colorScheme={i === 0 ? 'green' : 'purple'}
                      variant={i === 0 ? 'solid' : 'subtle'}
                      fontSize="sm"
                      fontFamily="mono"
                      px={2}
                      py={0.5}
                    >
                      {tag.name}
                    </Badge>
                    {i === 0 && (
                      <Badge colorScheme="green" variant="subtle" fontSize="9px">Latest</Badge>
                    )}
                  </Flex>
                  <Divider mb={3} />
                  <VStack align="stretch" spacing={1.5}>
                    <Flex justify="space-between" fontSize="xs">
                      <Text color="text.muted">Date</Text>
                      <Text fontFamily="mono">{tag.date}</Text>
                    </Flex>
                    <Flex justify="space-between" fontSize="xs">
                      <Text color="text.muted">Commits</Text>
                      <Text fontWeight="semibold">{tag.commits}</Text>
                    </Flex>
                    <Box mt={1}>
                      <Text fontSize="xs" color="text.muted" mb={1.5}>Contributors</Text>
                      <HStack spacing={1.5}>
                        {topAuthors.map(([author], ai) => (
                          <Avatar
                            key={author}
                            name={author}
                            size="xs"
                            title={author}
                            bg={CHART_COLORS[ai % CHART_COLORS.length]}
                            color="white"
                          />
                        ))}
                        {Object.keys(tag.authors).length > 3 && (
                          <Text fontSize="10px" color="text.muted">
                            +{Object.keys(tag.authors).length - 3} more
                          </Text>
                        )}
                      </HStack>
                    </Box>
                  </VStack>
                </Box>
              )
            })}
          </SimpleGrid>
        </SectionCard>
      )}
    </Box>
  )
}

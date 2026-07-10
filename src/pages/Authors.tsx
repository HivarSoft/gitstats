import {
  Box,
  SimpleGrid,
  Text,
  Flex,
  Avatar,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  VStack,
  HStack,
  Divider,
} from '@chakra-ui/react'
import { Users } from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import SectionCard from '@/components/SectionCard'
import PageHeader from '@/components/PageHeader'
import ChartWrapper, { CHART_COLORS } from '@/components/ChartWrapper'
import { useReportData } from '@/hooks/useReportData'

const CustomTooltip = ({ active, payload, label }: any) => {
  const bg = useColorModeValue('white', '#1e293b')
  const border = useColorModeValue('#e2e8f0', 'rgba(255,255,255,0.1)')
  if (active && payload?.length) {
    return (
      <Box bg={bg} border="1px solid" borderColor={border} borderRadius="lg" px={3} py={2} shadow="lg" maxW="180px">
        <Text fontSize="xs" color="text.secondary" mb={1}>{label}</Text>
        {payload.map((p: any) => (
          <Flex key={p.dataKey} align="center" gap={1.5} mb={0.5}>
            <Box w={2} h={2} borderRadius="full" bg={p.color} flexShrink={0} />
            <Text fontSize="xs" noOfLines={1}>{p.name}: <strong>{p.value.toLocaleString()}</strong></Text>
          </Flex>
        ))}
      </Box>
    )
  }
  return null
}

export default function Authors() {
  const d = useReportData()
  if (!d) return null

  const TOP_AUTHORS = d.authors.slice(0, 5).map(a => a.name)
  const gridLine = useColorModeValue('#e2e8f0', 'rgba(255,255,255,0.06)')

  return (
    <Box>
      <PageHeader
        title="Authors"
        description={`${d.totalAuthors} contributors · ${d.totalCommits.toLocaleString()} total commits`}
        icon={Users}
        mb={{ base: 4, md: 8 }}
      />

      {/* Author cards (top 5) */}
      <SimpleGrid columns={{ base: 2, sm: 3, xl: 5 }} spacing={{ base: 3, md: 4 }} mb={{ base: 4, md: 8 }}>
        {d.authors.slice(0, 5).map((author, i) => (
          <Box
            key={author.name}
            bg="bg.surface"
            borderWidth="1px"
            borderColor="border.default"
            borderRadius="xl"
            p={{ base: 3, md: 4 }}
            transition="all 0.2s"
            _hover={{ borderColor: 'brand.500', shadow: 'md', transform: 'translateY(-1px)' }}
          >
            <VStack spacing={2} align="center">
              <Avatar
                name={author.name}
                size="md"
                bg={CHART_COLORS[i % CHART_COLORS.length]}
                color="white"
                fontWeight="bold"
              />
              <Box textAlign="center">
                <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>{author.name}</Text>
                <Badge colorScheme="purple" fontSize="9px" mt={0.5}>#{author.placeByCommits}</Badge>
              </Box>
              <Divider />
              <VStack spacing={0.5} w="full">
                {[
                  ['Commits', author.commits.toLocaleString()],
                  ['Share', `${author.commitsFrac.toFixed(1)}%`],
                  ['Active days', author.activeDays],
                ].map(([label, value]) => (
                  <Flex key={label as string} justify="space-between" w="full" fontSize="xs">
                    <Text color="text.muted">{label}</Text>
                    <Text fontWeight="semibold">{value}</Text>
                  </Flex>
                ))}
              </VStack>
            </VStack>
          </Box>
        ))}
      </SimpleGrid>

      {/* Author timeline charts */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 4, md: 6 }} mb={{ base: 4, md: 6 }}>
        <SectionCard title="Cumulative Lines of Code" description="Top 5 authors over time">
          <ChartWrapper height={240}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={d.authorTimeline} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={11} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                {TOP_AUTHORS.map((a, i) => (
                  <Line
                    key={a}
                    type="monotone"
                    dataKey={a}
                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    strokeWidth={1.5}
                    dot={false}
                    name={a.split(' ')[0]}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </SectionCard>

        <SectionCard title="Commits by Domain" description="Email domain distribution">
          <ChartWrapper height={240}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={d.domains.slice(0, 10)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridLine} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="domain"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={100}
                />
                <Tooltip
                  formatter={(v: number) => [`${v} commits`, 'Commits']}
                  contentStyle={{ fontSize: '12px' }}
                />
                <Bar dataKey="commits" fill="#8b5cf6" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </SectionCard>
      </SimpleGrid>

      {/* Authors table — full scroll on mobile */}
      <SectionCard title="All Authors" description={`Showing top ${d.authors.length} by commits`} mb={{ base: 4, md: 6 }}>
        <Box overflowX="auto" WebkitOverflowScrolling="touch">
          <Box minW="640px">
            <Table variant="stats" size="sm">
              <Thead>
                <Tr>
                  <Th>#</Th>
                  <Th>Author</Th>
                  <Th isNumeric>Commits</Th>
                  <Th isNumeric>Share</Th>
                  <Th isNumeric>+Lines</Th>
                  <Th isNumeric>−Lines</Th>
                  <Th>First</Th>
                  <Th>Last</Th>
                  <Th isNumeric>Days</Th>
                </Tr>
              </Thead>
              <Tbody>
                {d.authors.map((a, i) => (
                  <Tr key={a.name}>
                    <Td>
                      <Badge
                        colorScheme={i < 3 ? 'yellow' : 'gray'}
                        variant="subtle"
                        fontSize="xs"
                      >
                        {a.placeByCommits}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <Avatar name={a.name} size="xs" bg={CHART_COLORS[i % CHART_COLORS.length]} color="white" />
                        <Text fontSize="sm" noOfLines={1} maxW="120px">{a.name}</Text>
                      </HStack>
                    </Td>
                    <Td isNumeric fontWeight="semibold">{a.commits.toLocaleString()}</Td>
                    <Td isNumeric>
                      <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                        {a.commitsFrac.toFixed(1)}%
                      </Badge>
                    </Td>
                    <Td isNumeric color="green.400">+{a.linesAdded.toLocaleString()}</Td>
                    <Td isNumeric color="red.400">-{a.linesRemoved.toLocaleString()}</Td>
                    <Td fontSize="xs" fontFamily="mono" color="text.secondary">{a.dateFirst}</Td>
                    <Td fontSize="xs" fontFamily="mono" color="text.secondary">{a.dateLast}</Td>
                    <Td isNumeric>{a.activeDays}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </SectionCard>

      {/* Author of Month / Year */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 4, md: 6 }}>
        <SectionCard title="Author of Month" description="Most active contributor each month">
          <Box overflowX="auto" WebkitOverflowScrolling="touch">
            <Box minW="360px">
              <Table variant="stats" size="sm">
                <Thead>
                  <Tr>
                    <Th>Month</Th>
                    <Th>Top Author</Th>
                    <Th isNumeric>Commits</Th>
                    <Th isNumeric>Authors</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {d.authorOfMonth.slice(0, 12).map(row => (
                    <Tr key={row.period}>
                      <Td fontFamily="mono" fontSize="xs">{row.period}</Td>
                      <Td>
                        <HStack spacing={1.5}>
                          <Avatar
                            name={row.topAuthor}
                            size="xs"
                            bg={CHART_COLORS[TOP_AUTHORS.indexOf(row.topAuthor) % CHART_COLORS.length]}
                            color="white"
                          />
                          <Text fontSize="sm" noOfLines={1} maxW="80px">{row.topAuthor}</Text>
                        </HStack>
                      </Td>
                      <Td isNumeric>
                        <Text fontSize="xs">
                          {row.commits}{' '}
                          <Text as="span" color="text.muted">({row.commitsFrac.toFixed(0)}%)</Text>
                        </Text>
                      </Td>
                      <Td isNumeric>{row.authorCount}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </SectionCard>

        <SectionCard title="Author of Year">
          <Box overflowX="auto" WebkitOverflowScrolling="touch">
            <Box minW="360px">
              <Table variant="stats" size="sm">
                <Thead>
                  <Tr>
                    <Th>Year</Th>
                    <Th>Top Author</Th>
                    <Th isNumeric>Commits</Th>
                    <Th isNumeric>Authors</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {d.authorOfYear.map(row => (
                    <Tr key={row.period}>
                      <Td fontFamily="mono" fontWeight="semibold">{row.period}</Td>
                      <Td>
                        <HStack spacing={1.5}>
                          <Avatar
                            name={row.topAuthor}
                            size="xs"
                            bg={CHART_COLORS[TOP_AUTHORS.indexOf(row.topAuthor) % CHART_COLORS.length]}
                            color="white"
                          />
                          <Text fontSize="sm" noOfLines={1} maxW="80px">{row.topAuthor}</Text>
                        </HStack>
                      </Td>
                      <Td isNumeric>
                        <Text fontSize="xs">
                          {row.commits}{' '}
                          <Text as="span" color="text.muted">({row.commitsFrac.toFixed(0)}%)</Text>
                        </Text>
                      </Td>
                      <Td isNumeric>{row.authorCount}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </SectionCard>
      </SimpleGrid>
    </Box>
  )
}

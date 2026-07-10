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
  useColorModeValue,
} from '@chakra-ui/react'
import { FolderOpen, FileCode2, Code2, Database } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
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
        <Text fontSize="sm" fontWeight="semibold">{payload[0].value.toLocaleString()} files</Text>
      </Box>
    )
  }
  return null
}

export default function Files() {
  const d = useReportData()
  if (!d) return null

  const gridLine = useColorModeValue('#e2e8f0', 'rgba(255,255,255,0.06)')

  const pieData = d.extensions.slice(0, 8).map(e => ({
    name: e.extension ? `.${e.extension}` : '(none)',
    value: e.files,
  }))

  return (
    <Box>
      <PageHeader
        title="Files"
        description="Repository file structure and language breakdown"
        icon={FolderOpen}
        mb={{ base: 4, md: 8 }}
      />

      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={{ base: 3, md: 4 }} mb={{ base: 4, md: 8 }}>
        <StatCard label="Total Files" value={d.totalFiles.toLocaleString()} icon={FileCode2} iconColor="amber.400" />
        <StatCard label="Total Lines" value={d.totalLOC.toLocaleString()} icon={Code2} iconColor="brand.400" />
        <StatCard
          label="Avg File Size"
          value={d.avgFileSize > 0 ? `${(d.avgFileSize / 1024).toFixed(1)} KB` : 'N/A'}
          icon={Database}
          iconColor="cyan.400"
        />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 4, md: 6 }} mb={{ base: 4, md: 6 }}>
        {/* File count over time */}
        <SectionCard title="File Count over Time" description="Monthly growth">
          <ChartWrapper height={240}>
            {d.filesTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.filesTimeline} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="filesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridLine} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 9 }}
                    tickLine={false}
                    axisLine={false}
                    interval={Math.floor(d.filesTimeline.length / 6)}
                  />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={36} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="files" stroke="#f59e0b" strokeWidth={2} fill="url(#filesGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Flex h="100%" align="center" justify="center">
                <Text fontSize="sm" color="text.muted">Loading file timeline…</Text>
              </Flex>
            )}
          </ChartWrapper>
        </SectionCard>

        {/* Extension pie */}
        <SectionCard title="Files by Extension">
          <ChartWrapper height={240}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number, n: string) => [`${v} files`, n]} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </SectionCard>
      </SimpleGrid>

      {/* Extensions table */}
      <SectionCard title="Extensions Breakdown">
        <Box overflowX="auto" WebkitOverflowScrolling="touch">
          <Box minW="480px">
            <Table variant="stats" size="sm">
              <Thead>
                <Tr>
                  <Th>Extension</Th>
                  <Th isNumeric>Files</Th>
                  <Th isNumeric>Files %</Th>
                  <Th isNumeric>Lines</Th>
                  <Th isNumeric>Lines %</Th>
                  <Th isNumeric>Lines / File</Th>
                </Tr>
              </Thead>
              <Tbody>
                {d.extensions.map((ext, i) => (
                  <Tr key={ext.extension || '__none__'}>
                    <Td>
                      <Flex align="center" gap={2}>
                        <Box w={2.5} h={2.5} borderRadius="sm" bg={CHART_COLORS[i % CHART_COLORS.length]} flexShrink={0} />
                        <Badge variant="subtle" colorScheme="gray" fontFamily="mono" fontSize="xs">
                          {ext.extension ? `.${ext.extension}` : '(none)'}
                        </Badge>
                      </Flex>
                    </Td>
                    <Td isNumeric fontWeight="semibold">{ext.files.toLocaleString()}</Td>
                    <Td isNumeric>
                      <Flex align="center" justify="flex-end" gap={2}>
                        <Box w="40px" bg="bg.subtle" borderRadius="full" h="5px" overflow="hidden">
                          <Box
                            w={`${Math.min(ext.filesFrac, 100)}%`}
                            h="full"
                            bg={CHART_COLORS[i % CHART_COLORS.length]}
                            borderRadius="full"
                          />
                        </Box>
                        <Text>{ext.filesFrac.toFixed(1)}%</Text>
                      </Flex>
                    </Td>
                    <Td isNumeric>{ext.lines > 0 ? ext.lines.toLocaleString() : '—'}</Td>
                    <Td isNumeric>
                      {ext.linesFrac > 0 ? (
                        <Flex align="center" justify="flex-end" gap={2}>
                          <Box w="40px" bg="bg.subtle" borderRadius="full" h="5px" overflow="hidden">
                            <Box
                              w={`${Math.min(ext.linesFrac, 100)}%`}
                              h="full"
                              bg={CHART_COLORS[i % CHART_COLORS.length]}
                              borderRadius="full"
                              opacity={0.7}
                            />
                          </Box>
                          <Text>{ext.linesFrac.toFixed(1)}%</Text>
                        </Flex>
                      ) : '—'}
                    </Td>
                    <Td isNumeric>{ext.linesPerFile > 0 ? ext.linesPerFile : '—'}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </SectionCard>
    </Box>
  )
}

import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  Icon,
  Progress,
  Alert,
  AlertIcon,
  AlertDescription,
  Badge,
  HStack,
  Divider,
  useColorModeValue,
  Code,
  List,
  ListItem,
  ListIcon,
  useDisclosure,
  IconButton,
  Tooltip,
} from '@chakra-ui/react'
import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  GitBranch, FolderOpen, CheckCircle, AlertCircle,
  ArrowRight, Info, Search, X, Sun, Moon,
} from 'lucide-react'
import { useColorMode } from '@chakra-ui/react'
import { useAnalyze } from '@/hooks/useAnalyze'
import FolderBrowser from '@/components/FolderBrowser'

// ── Status copy ───────────────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, string> = {
  idle:      '',
  validating:'Validating repository…',
  analyzing: 'Analyzing commits, files, and contributors…',
  done:      'Analysis complete!',
  error:     'Analysis failed',
}
const STATUS_PROGRESS: Record<string, number> = {
  idle: 0, validating: 20, analyzing: 65, done: 100, error: 0,
}

// ── Spinner keyframe injected once ───────────────────────────────────────────
const SPIN_CSS = `@keyframes gs-spin{to{transform:rotate(360deg)}}.gs-spin{animation:gs-spin 1s linear infinite}`

export default function Import() {
  const [inputPath, setInputPath]   = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const { state, run, reset }       = useAnalyze()
  const navigate                    = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { colorMode, toggleColorMode } = useColorMode()

  // colours
  const cardBg    = useColorModeValue('white',        'surface.800')
  const subtleBg  = useColorModeValue('gray.50',      'surface.700')
  const borderCol = useColorModeValue('gray.200',     'whiteAlpha.100')
  const dropBg    = useColorModeValue('brand.50',     'rgba(99,102,241,0.08)')
  const dropBdr   = useColorModeValue('brand.400',    'brand.500')
  const inputBg   = useColorModeValue('white',        'surface.700')

  const isLoading = state.status === 'validating' || state.status === 'analyzing'

  // ── Drag-and-drop ──────────────────────────────────────────────────────────
  const onDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true)  }, [])
  const onDragLeave = useCallback(() => setIsDragging(false), [])
  const onDrop      = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // Electron / desktop browsers expose full path via File.path
    const file = e.dataTransfer.files[0] as any
    if (file?.path) { setInputPath(file.path); return }
    // Fallback: webkitGetAsEntry
    const entry = (e.dataTransfer.items[0] as any)?.webkitGetAsEntry?.()
    if (entry?.fullPath) setInputPath(entry.fullPath)
  }, [])

  // ── Folder browser callback ────────────────────────────────────────────────
  const onBrowseSelect = useCallback((p: string) => setInputPath(p), [])

  // ── Analyze ────────────────────────────────────────────────────────────────
  const handleAnalyze = useCallback(async () => {
    if (!inputPath.trim() || isLoading) return
    reset()
    await run(inputPath.trim())
  }, [inputPath, isLoading, reset, run])

  // Navigate to dashboard once done
  useEffect(() => {
    if (state.status === 'done') {
      const t = setTimeout(() => navigate('/'), 800)
      return () => clearTimeout(t)
    }
  }, [state.status, navigate])

  return (
    <Flex minH="100vh" bg="bg.canvas" align="center" justify="center" p={4}>
      <style>{SPIN_CSS}</style>

      {/* ── Folder browser modal ──────────────────────────────────────────── */}
      <FolderBrowser isOpen={isOpen} onClose={onClose} onSelect={onBrowseSelect} />

      <Box maxW="600px" w="full">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <Flex justify="space-between" align="flex-start" mb={8}>
          <VStack spacing={2} align="flex-start">
            <HStack spacing={3}>
              <Flex
                w={12} h={12} borderRadius="xl" bg="brand.500"
                align="center" justify="center" shadow="md"
              >
                <Icon as={GitBranch} boxSize={6} color="white" />
              </Flex>
              <Box>
                <Heading size="lg" fontWeight="bold" lineHeight="shorter">GitStats</Heading>
                <Text fontSize="sm" color="text.secondary">Local repository analytics</Text>
              </Box>
            </HStack>
          </VStack>

          <Tooltip label={`${colorMode === 'dark' ? 'Light' : 'Dark'} mode`}>
            <IconButton
              aria-label="Toggle colour mode"
              icon={<Icon as={colorMode === 'dark' ? Sun : Moon} boxSize={4} />}
              size="sm"
              variant="ghost"
              color="text.secondary"
              onClick={toggleColorMode}
            />
          </Tooltip>
        </Flex>

        {/* ── Main card ───────────────────────────────────────────────────── */}
        <Box
          bg={cardBg}
          borderWidth="1px"
          borderColor={isDragging ? dropBdr : borderCol}
          borderRadius="2xl"
          overflow="hidden"
          shadow="lg"
          transition="border-color 0.2s"
        >

          {/* Drop zone */}
          <Box
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            bg={isDragging ? dropBg : subtleBg}
            borderBottomWidth="1px"
            borderBottomColor={isDragging ? dropBdr : borderCol}
            borderStyle={isDragging ? 'dashed' : 'solid'}
            p={7}
            textAlign="center"
            transition="all 0.2s"
          >
            <Icon
              as={FolderOpen}
              boxSize={10}
              color={isDragging ? 'brand.500' : 'text.muted'}
              mb={2}
              transition="color 0.2s"
            />
            <Text fontWeight="semibold" color={isDragging ? 'brand.500' : 'text.primary'} mb={0.5}>
              {isDragging ? 'Drop your repository folder here' : 'Drag & drop a repository folder'}
            </Text>
            <Text fontSize="sm" color="text.muted">
              Or use the Browse button / paste a path below
            </Text>
          </Box>

          {/* Input row */}
          <Box px={6} pt={5} pb={5}>
            <Text fontSize="xs" fontWeight="semibold" color="text.secondary" mb={2} letterSpacing="wide" textTransform="uppercase">
              Repository path
            </Text>

            {/* Input row — stacks on mobile */}
            <Flex gap={2} flexDir={{ base: 'column', sm: 'row' }} align="stretch">
              {/* Browse + path on first row on mobile */}
              <HStack spacing={2} flex={1}>
                {/* Browse button */}
                <Button
                  leftIcon={<Icon as={Search} boxSize={3.5} />}
                  size="sm"
                  variant="outline"
                  colorScheme="brand"
                  onClick={onOpen}
                  isDisabled={isLoading}
                  flexShrink={0}
                  px={3}
                >
                  Browse
                </Button>

                {/* Path input */}
                <Box pos="relative" flex={1}>
                  <Input
                    value={inputPath}
                    onChange={e => setInputPath(e.target.value)}
                    placeholder="/Users/you/projects/my-app"
                    fontFamily="mono"
                    fontSize="sm"
                    bg={inputBg}
                    borderColor="border.default"
                    _placeholder={{ color: 'text.muted' }}
                    _focus={{ borderColor: 'brand.500', boxShadow: 'outline' }}
                    onKeyDown={e => { if (e.key === 'Enter') handleAnalyze() }}
                    isDisabled={isLoading}
                    pr={inputPath ? 8 : 3}
                  />
                  {inputPath && !isLoading && (
                    <IconButton
                      aria-label="Clear"
                      icon={<Icon as={X} boxSize={3} />}
                      size="xs"
                      variant="ghost"
                      pos="absolute"
                      right={1}
                      top="50%"
                      transform="translateY(-50%)"
                      color="text.muted"
                      onClick={() => setInputPath('')}
                      zIndex={1}
                    />
                  )}
                </Box>
              </HStack>

              {/* Analyze button — full width on mobile */}
              <Button
                onClick={handleAnalyze}
                isLoading={isLoading}
                isDisabled={!inputPath.trim() || isLoading}
                colorScheme="brand"
                size="sm"
                px={5}
                rightIcon={<Icon as={ArrowRight} boxSize={3.5} />}
                flexShrink={0}
                w={{ base: 'full', sm: 'auto' }}
              >
                Analyze
              </Button>
            </Flex>

            {/* Hint */}
            <HStack spacing={1.5} mt={2.5} flexWrap="wrap">
              <Icon as={Info} boxSize={3} color="text.muted" />
              <Text fontSize="xs" color="text.muted">Accepts a working tree root or a bare .git directory</Text>
            </HStack>
          </Box>

          {/* ── Status area ─────────────────────────────────────────────── */}
          {state.status !== 'idle' && (
            <Box px={6} pb={6}>
              <Divider mb={4} />

              {/* Progress */}
              {isLoading && (
                <Box mb={4}>
                  <HStack spacing={2} mb={2}>
                    <Box
                      as="span"
                      display="inline-block"
                      w={3}
                      h={3}
                      borderRadius="full"
                      border="2px solid"
                      borderColor="brand.400"
                      borderTopColor="transparent"
                      className="gs-spin"
                    />
                    <Text fontSize="sm" color="text.secondary">
                      {STATUS_LABEL[state.status]}
                    </Text>
                  </HStack>
                  <Progress
                    value={STATUS_PROGRESS[state.status]}
                    size="xs"
                    colorScheme="brand"
                    borderRadius="full"
                    isIndeterminate={state.status === 'analyzing'}
                    hasStripe
                    isAnimated
                  />
                  {state.status === 'analyzing' && (
                    <Text fontSize="xs" color="text.muted" mt={1.5}>
                      Large repos may take 10–30 seconds…
                    </Text>
                  )}
                </Box>
              )}

              {/* Done */}
              {state.status === 'done' && state.report && (
                <VStack spacing={3} align="stretch">
                  <Alert status="success" borderRadius="lg" variant="subtle" py={2.5}>
                    <AlertIcon as={CheckCircle} />
                    <AlertDescription>
                      <Text fontWeight="semibold" fontSize="sm">{state.report.projectName}</Text>
                      <Text fontSize="xs" color="text.secondary">
                        Analyzed in {state.elapsed}s · {state.report.totalCommits.toLocaleString()} commits · {state.report.totalAuthors} authors
                      </Text>
                    </AlertDescription>
                  </Alert>

                  {/* Quick stats */}
                  <Box bg="bg.subtle" borderRadius="xl" p={4}>
                    <List spacing={1.5}>
                      {([
                        ['Total commits',    state.report.totalCommits.toLocaleString()],
                        ['Contributors',     state.report.totalAuthors.toLocaleString()],
                        ['Total files',      state.report.totalFiles.toLocaleString()],
                        ['Lines of code',    state.report.totalLOC.toLocaleString()],
                        ['Project age',      `${state.report.age.totalDays.toLocaleString()} days`],
                        ['Active days',      `${state.report.age.activeDays} (${state.report.age.activeFrac.toFixed(1)}%)`],
                        ['Repository size',  state.report.repositorySize],
                      ] as [string, string][]).map(([label, value]) => (
                        <ListItem key={label} display="flex" justifyContent="space-between" fontSize="sm">
                          <HStack spacing={1.5}>
                            <ListIcon as={CheckCircle} color="green.400" m={0} />
                            <Text color="text.secondary">{label}</Text>
                          </HStack>
                          <Text fontWeight="semibold" color="text.primary">{value}</Text>
                        </ListItem>
                      ))}
                    </List>
                  </Box>

                  <Text fontSize="xs" color="text.muted" textAlign="center">
                    Redirecting to dashboard…
                  </Text>

                  <Button
                    colorScheme="brand"
                    onClick={() => navigate('/')}
                    rightIcon={<Icon as={ArrowRight} boxSize={4} />}
                  >
                    View Full Analytics
                  </Button>
                </VStack>
              )}

              {/* Error */}
              {state.status === 'error' && (
                <VStack spacing={3} align="stretch">
                  <Alert status="error" borderRadius="lg" variant="subtle" py={2.5}>
                    <AlertIcon as={AlertCircle} />
                    <AlertDescription fontSize="sm">{state.error}</AlertDescription>
                  </Alert>
                  <HStack>
                    <Button variant="outline" colorScheme="red" size="sm" onClick={reset} flex={1}>
                      Try Again
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onOpen} leftIcon={<Icon as={Search} boxSize={3.5} />} flex={1}>
                      Browse
                    </Button>
                  </HStack>
                </VStack>
              )}
            </Box>
          )}
        </Box>

        {/* ── Footer trust badges ─────────────────────────────────────────── */}
        <HStack spacing={6} mt={6} justify="center" flexWrap="wrap">
          {[
            'Any local git repo',
            'Bare repos supported',
            'All data stays local',
          ].map(tip => (
            <HStack key={tip} spacing={1.5}>
              <Icon as={CheckCircle} boxSize={3} color="green.400" />
              <Text fontSize="xs" color="text.muted">{tip}</Text>
            </HStack>
          ))}
        </HStack>
      </Box>
    </Flex>
  )
}

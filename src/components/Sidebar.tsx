import {
  Box,
  Flex,
  VStack,
  Text,
  Icon,
  Tooltip,
  useColorModeValue,
  Divider,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Spinner,
} from '@chakra-ui/react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Activity,
  Users,
  FolderOpen,
  GitBranch,
  Tag,
  Github,
  LineChart,
  ChevronDown,
  Check,
} from 'lucide-react'
import { useState, useCallback } from 'react'
import { useReport } from '@/store/reportStore'
import { api } from '@/api/client'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/activity', icon: Activity, label: 'Activity' },
  { to: '/authors', icon: Users, label: 'Authors' },
  { to: '/files', icon: FolderOpen, label: 'Files' },
  { to: '/lines', icon: LineChart, label: 'Lines' },
  { to: '/tags', icon: Tag, label: 'Tags' },
]

// ─── Nav item ──────────────────────────────────────────────────────────────────

function NavItem({
  to,
  icon,
  label,
  onClick,
}: {
  to: string
  icon: typeof LayoutDashboard
  label: string
  onClick?: () => void
}) {
  const location = useLocation()
  const isActive = location.pathname === to
  const activeBg = useColorModeValue('brand.50', 'whiteAlpha.100')
  const hoverBg = useColorModeValue('gray.100', 'whiteAlpha.50')
  const activeColor = useColorModeValue('brand.600', 'brand.300')
  const inactiveColor = useColorModeValue('gray.600', 'whiteAlpha.700')

  return (
    <Tooltip label={label} placement="right" hasArrow>
      <Box as={NavLink} to={to} w="full" display="block" onClick={onClick}>
        <Flex
          align="center"
          gap={3}
          px={3}
          py={2.5}
          borderRadius="lg"
          bg={isActive ? activeBg : 'transparent'}
          color={isActive ? activeColor : inactiveColor}
          fontWeight={isActive ? 'semibold' : 'medium'}
          fontSize="sm"
          transition="all 0.15s"
          _hover={{ bg: isActive ? activeBg : hoverBg, color: isActive ? activeColor : 'text.primary' }}
          borderLeftWidth="3px"
          borderColor={isActive ? 'brand.500' : 'transparent'}
        >
          <Icon as={icon} boxSize={4.5} flexShrink={0} />
          <Text>{label}</Text>
        </Flex>
      </Box>
    </Tooltip>
  )
}

// ─── Branch selector ───────────────────────────────────────────────────────────

function BranchSelector() {
  const { state, dispatch } = useReport()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.150')
  const menuBg = useColorModeValue('white', 'surface.800')
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.80')

  const handleSelect = useCallback(async (branch: string) => {
    if (branch === state.branch || !state.repoPath) return
    dispatch({ type: 'SET_BRANCH', payload: branch })
    setLoading(true)
    try {
      dispatch({ type: 'START_ANALYZE', payload: { projectName: state.projectName } })
      const { report, elapsed } = await api.analyze(state.repoPath, branch)
      dispatch({ type: 'DONE', payload: { report, elapsed } })
      navigate('/')
    } catch (err: any) {
      dispatch({ type: 'ERROR', payload: err.message ?? 'Analysis failed' })
    } finally {
      setLoading(false)
    }
  }, [state.branch, state.repoPath, state.projectName, dispatch, navigate])

  // Only show when we have a loaded report with multiple branches
  if (!state.report || state.branches.length === 0) return null

  const displayBranch = state.branch || 'HEAD'

  return (
    <Box px={3} pb={3}>
      <Text
        fontSize="9px"
        fontWeight="semibold"
        color="text.muted"
        letterSpacing="wider"
        textTransform="uppercase"
        mb={1.5}
        px={1}
      >
        Branch
      </Text>
      <Menu placement="right-start" strategy="fixed">
        <MenuButton
          as={Button}
          w="full"
          size="sm"
          variant="outline"
          borderColor={borderColor}
          bg="bg.subtle"
          _hover={{ borderColor: 'brand.500', bg: 'bg.subtle' }}
          _active={{ bg: 'bg.subtle' }}
          rightIcon={
            loading
              ? <Spinner size="xs" color="brand.400" />
              : <Icon as={ChevronDown} boxSize={3} />
          }
          leftIcon={<Icon as={GitBranch} boxSize={3} color="brand.400" />}
          fontSize="xs"
          fontFamily="mono"
          fontWeight="medium"
          justifyContent="flex-start"
          overflow="hidden"
          isDisabled={loading}
          aria-label="Select branch"
        >
          <Text noOfLines={1} flex={1} textAlign="left">
            {displayBranch}
          </Text>
        </MenuButton>
        <MenuList
          bg={menuBg}
          borderColor={borderColor}
          shadow="lg"
          py={1}
          minW="200px"
          maxH="280px"
          overflowY="auto"
          zIndex={100}
        >
          {state.branches.map(b => (
            <MenuItem
              key={b}
              onClick={() => handleSelect(b)}
              bg="transparent"
              _hover={{ bg: hoverBg }}
              fontSize="xs"
              fontFamily="mono"
              icon={
                b === (state.branch || state.branches[0])
                  ? <Icon as={Check} boxSize={3} color="brand.400" />
                  : <Box w={3} />
              }
            >
              <Text noOfLines={1}>{b}</Text>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  )
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  projectName: string
  onNavClick?: () => void
}

export default function Sidebar({ projectName, onNavClick }: SidebarProps) {
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.100')
  const bg = useColorModeValue('white', 'surface.800')

  return (
    <Box
      as="nav"
      w="220px"
      minW="220px"
      h="100vh"
      bg={bg}
      borderRightWidth="1px"
      borderColor={borderColor}
      display="flex"
      flexDir="column"
      pos="sticky"
      top={0}
      zIndex={10}
      aria-label="Main navigation"
    >
      {/* Logo / Project name */}
      <Flex align="center" gap={2.5} px={4} py={5} borderBottomWidth="1px" borderColor={borderColor}>
        <Flex
          w={8}
          h={8}
          borderRadius="lg"
          bg="brand.500"
          align="center"
          justify="center"
          flexShrink={0}
        >
          <Icon as={GitBranch} boxSize={4} color="white" />
        </Flex>
        <Box minW={0}>
          <Text fontSize="xs" fontWeight="semibold" color="brand.500" letterSpacing="wider" textTransform="uppercase">
            GitStats
          </Text>
          <Text fontSize="sm" fontWeight="semibold" color="text.primary" noOfLines={1} title={projectName}>
            {projectName}
          </Text>
        </Box>
      </Flex>

      {/* Branch selector */}
      <Box pt={3}>
        <BranchSelector />
      </Box>

      {/* Nav links */}
      <VStack px={3} py={2} align="stretch" spacing={0.5} flex={1}>
        {navItems.map(item => (
          <NavItem key={item.to} {...item} onClick={onNavClick} />
        ))}
      </VStack>

      <Divider />

      {/* Footer */}
      <Flex align="center" gap={2} px={4} py={3} justify="space-between">
        <Badge colorScheme="purple" fontSize="9px" variant="subtle">
          Open Source
        </Badge>
        <Tooltip label="View on GitHub" placement="top">
          <Box
            as="a"
            href="https://github.com/HivarSoft/gitstats"
            target="_blank"
            rel="noopener noreferrer"
            color="text.muted"
            _hover={{ color: 'text.primary' }}
            transition="color 0.15s"
            aria-label="GitHub repository"
          >
            <Icon as={Github} boxSize={4} />
          </Box>
        </Tooltip>
      </Flex>
    </Box>
  )
}

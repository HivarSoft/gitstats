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
} from '@chakra-ui/react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Activity,
  Users,
  FolderOpen,
  GitBranch,
  Tag,
  Github,
  LineChart,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Overview' },
  { to: '/activity', icon: Activity, label: 'Activity' },
  { to: '/authors', icon: Users, label: 'Authors' },
  { to: '/files', icon: FolderOpen, label: 'Files' },
  { to: '/lines', icon: LineChart, label: 'Lines' },
  { to: '/tags', icon: Tag, label: 'Tags' },
]

function NavItem({ to, icon, label }: { to: string; icon: typeof LayoutDashboard; label: string }) {
  const location = useLocation()
  const isActive = location.pathname === to
  const activeBg = useColorModeValue('brand.50', 'whiteAlpha.100')
  const hoverBg = useColorModeValue('gray.100', 'whiteAlpha.50')
  const activeColor = useColorModeValue('brand.600', 'brand.300')
  const inactiveColor = useColorModeValue('gray.600', 'whiteAlpha.700')

  return (
    <Tooltip label={label} placement="right" hasArrow>
      <Box
        as={NavLink}
        to={to}
        w="full"
        display="block"
      >
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

interface SidebarProps {
  projectName: string
}

export default function Sidebar({ projectName }: SidebarProps) {
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

      {/* Nav links */}
      <VStack px={3} py={4} align="stretch" spacing={0.5} flex={1}>
        {navItems.map(item => (
          <NavItem key={item.to} {...item} />
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
            href="https://github.com"
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

import {
  Box,
  Flex,
  Button,
  HStack,
  Icon,
  Text,
  useColorMode,
  Tooltip,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
} from '@chakra-ui/react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Sun, Moon, RefreshCw, Menu } from 'lucide-react'
import Sidebar from './Sidebar'
import { useReport } from '@/store/reportStore'

export default function Layout() {
  const { state, dispatch } = useReport()
  const { colorMode, toggleColorMode } = useColorMode()
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const handleReset = () => {
    dispatch({ type: 'RESET' })
    navigate('/import')
  }

  const projectName = state.report?.projectName ?? state.projectName ?? 'GitStats'

  return (
    <Flex minH="100vh" bg="bg.canvas">
      {/* Desktop sidebar */}
      <Box display={{ base: 'none', md: 'block' }}>
        <Sidebar projectName={projectName} />
      </Box>

      {/* Mobile sidebar drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent bg="bg.surface" maxW="220px">
          <DrawerCloseButton zIndex={20} />
          <Sidebar projectName={projectName} onNavClick={onClose} />
        </DrawerContent>
      </Drawer>

      <Box flex={1} overflow="auto" minW={0}>
        {/* Top bar */}
        <Flex
          h="52px"
          px={{ base: 3, md: 8 }}
          align="center"
          justify="space-between"
          borderBottomWidth="1px"
          borderColor="border.default"
          bg="bg.surface"
          pos="sticky"
          top={0}
          zIndex={9}
          gap={2}
        >
          {/* Hamburger on mobile */}
          <HStack spacing={2}>
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              aria-label="Open menu"
              icon={<Icon as={Menu} boxSize={5} />}
              size="sm"
              variant="ghost"
              onClick={onOpen}
              color="text.secondary"
            />
            {state.report && (
              <HStack spacing={1} display={{ base: 'none', sm: 'flex' }}>
                <Text fontSize="xs" color="text.muted">
                  {state.report.reportPeriod.from.slice(0, 10)}
                </Text>
                <Text fontSize="xs" color="text.muted">→</Text>
                <Text fontSize="xs" color="text.muted">
                  {state.report.reportPeriod.to.slice(0, 10)}
                </Text>
                {state.elapsed > 0 && (
                  <Text fontSize="xs" color="text.muted" ml={1}>
                    · {state.elapsed}s
                  </Text>
                )}
              </HStack>
            )}
          </HStack>

          <HStack spacing={2}>
            <Tooltip label="Analyze another repo">
              <Button
                size="xs"
                variant="ghost"
                leftIcon={<Icon as={RefreshCw} boxSize={3} />}
                onClick={handleReset}
                color="text.secondary"
                _hover={{ color: 'text.primary' }}
              >
                <Text display={{ base: 'none', sm: 'block' }}>Change repo</Text>
              </Button>
            </Tooltip>
            <Tooltip label={`Switch to ${colorMode === 'dark' ? 'light' : 'dark'} mode`}>
              <Button
                size="xs"
                variant="ghost"
                onClick={toggleColorMode}
                color="text.secondary"
                _hover={{ color: 'text.primary' }}
                aria-label="Toggle color mode"
              >
                <Icon as={colorMode === 'dark' ? Sun : Moon} boxSize={3.5} />
              </Button>
            </Tooltip>
          </HStack>
        </Flex>

        <Box maxW="1400px" mx="auto" px={{ base: 3, md: 6, lg: 8 }} py={{ base: 4, md: 8 }}>
          <Outlet />
        </Box>
      </Box>
    </Flex>
  )
}

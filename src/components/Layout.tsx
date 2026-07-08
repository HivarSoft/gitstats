import { Box, Flex, Button, HStack, Icon, Text, useColorMode, Tooltip } from '@chakra-ui/react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Sun, Moon, RefreshCw } from 'lucide-react'
import Sidebar from './Sidebar'
import { useReport } from '@/store/reportStore'

export default function Layout() {
  const { state, dispatch } = useReport()
  const { colorMode, toggleColorMode } = useColorMode()
  const navigate = useNavigate()

  const handleReset = () => {
    dispatch({ type: 'RESET' })
    navigate('/import')
  }

  return (
    <Flex minH="100vh" bg="bg.canvas">
      <Sidebar projectName={state.report?.projectName ?? state.projectName ?? 'GitStats'} />
      <Box flex={1} overflow="auto" minW={0}>
        {/* Top bar */}
        <Flex
          h="52px"
          px={8}
          align="center"
          justify="space-between"
          borderBottomWidth="1px"
          borderColor="border.default"
          bg="bg.surface"
          pos="sticky"
          top={0}
          zIndex={9}
        >
          <HStack spacing={2}>
            {state.report && (
              <>
                <Text fontSize="xs" color="text.muted">
                  {state.report.reportPeriod.from.slice(0, 10)}
                </Text>
                <Text fontSize="xs" color="text.muted">→</Text>
                <Text fontSize="xs" color="text.muted">
                  {state.report.reportPeriod.to.slice(0, 10)}
                </Text>
                {state.elapsed > 0 && (
                  <Text fontSize="xs" color="text.muted" ml={2}>
                    · analyzed in {state.elapsed}s
                  </Text>
                )}
              </>
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
                Change repo
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

        <Box maxW="1400px" mx="auto" px={{ base: 4, md: 6, lg: 8 }} py={8}>
          <Outlet />
        </Box>
      </Box>
    </Flex>
  )
}

import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, Button, Box, Flex, Text, Icon, Spinner, Input,
  HStack, Badge, VStack, useColorModeValue, Divider, IconButton,
  Tooltip, Alert, AlertIcon, AlertDescription,
} from '@chakra-ui/react'
import {
  Folder, FolderOpen, GitBranch, ChevronRight, ArrowLeft,
  Home, Search, CheckCircle,
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { api, type BrowseEntry, type BrowseResponse } from '@/api/client'

interface FolderBrowserProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (path: string) => void
}

export default function FolderBrowser({ isOpen, onClose, onSelect }: FolderBrowserProps) {
  const [browse, setBrowse] = useState<BrowseResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [manualPath, setManualPath] = useState('')

  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const selectedBg = useColorModeValue('brand.50', 'rgba(99,102,241,0.15)')
  const selectedBorder = useColorModeValue('brand.400', 'brand.500')
  const gitRepoBg = useColorModeValue('green.50', 'rgba(16,185,129,0.08)')

  const navigate = useCallback(async (dirPath?: string) => {
    setLoading(true)
    setError(null)
    setSelected(null)
    try {
      const data = await api.browse(dirPath)
      setBrowse(data)
      setManualPath(data.current)
      // Auto-select if this folder IS a git repo
      if (data.isGitRepo) setSelected(data.current)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load home dir when opened
  useEffect(() => {
    if (isOpen) navigate()
  }, [isOpen, navigate])

  const handleDirClick = (entry: BrowseEntry) => {
    if (entry.isGitDir || entry.isGitRepo) {
      // Select it directly
      setSelected(entry.path)
    } else {
      navigate(entry.path)
    }
  }

  const handleDirDoubleClick = (entry: BrowseEntry) => {
    if (!entry.isGitDir && !entry.isGitRepo) {
      navigate(entry.path)
    }
  }

  const handleNavigateInto = (entry: BrowseEntry) => {
    navigate(entry.path)
  }

  const handleSelectAndClose = () => {
    const path = selected ?? (browse?.isGitRepo ? browse.current : null)
    if (path) {
      onSelect(path)
      onClose()
    }
  }

  const handleManualNavigate = () => {
    if (manualPath.trim()) navigate(manualPath.trim())
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(4px)" />
      <ModalContent bg="bg.surface" borderColor="border.default" borderWidth="1px" mx={4}>
        <ModalHeader pb={2}>
          <Flex align="center" gap={2}>
            <Icon as={FolderOpen} color="brand.400" boxSize={5} />
            <Text>Browse for Repository</Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={0}>
          {/* Path bar */}
          <HStack mb={3} spacing={2}>
            <Tooltip label="Go to home">
              <IconButton
                aria-label="Home"
                icon={<Icon as={Home} boxSize={4} />}
                size="sm"
                variant="ghost"
                onClick={() => navigate()}
              />
            </Tooltip>
            <Tooltip label="Go up">
              <IconButton
                aria-label="Go up"
                icon={<Icon as={ArrowLeft} boxSize={4} />}
                size="sm"
                variant="ghost"
                isDisabled={!browse?.parent}
                onClick={() => browse?.parent && navigate(browse.parent)}
              />
            </Tooltip>
            <Input
              value={manualPath}
              onChange={e => setManualPath(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManualNavigate()}
              size="sm"
              fontFamily="mono"
              fontSize="xs"
              flex={1}
              bg="bg.subtle"
              borderColor="border.default"
              _focus={{ borderColor: 'brand.500' }}
              placeholder="Type a path and press Enter…"
            />
            <IconButton
              aria-label="Navigate"
              icon={<Icon as={ChevronRight} boxSize={4} />}
              size="sm"
              colorScheme="brand"
              variant="ghost"
              onClick={handleManualNavigate}
            />
          </HStack>

          {/* Current folder git status */}
          {browse?.isGitRepo && (
            <Alert status="success" borderRadius="lg" variant="subtle" mb={3} py={2}>
              <AlertIcon as={CheckCircle} boxSize={4} />
              <AlertDescription fontSize="xs">
                <strong>This folder is a git repository</strong> — click Select to analyze it
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert status="error" borderRadius="lg" variant="subtle" mb={3} py={2}>
              <AlertIcon boxSize={4} />
              <AlertDescription fontSize="xs">{error}</AlertDescription>
            </Alert>
          )}

          {/* Directory listing */}
          <Box
            borderWidth="1px"
            borderColor="border.default"
            borderRadius="lg"
            overflow="hidden"
            minH="320px"
            maxH="400px"
            overflowY="auto"
          >
            {loading ? (
              <Flex h="320px" align="center" justify="center" gap={3}>
                <Spinner size="sm" color="brand.400" />
                <Text fontSize="sm" color="text.muted">Loading…</Text>
              </Flex>
            ) : browse?.dirs.length === 0 ? (
              <Flex h="200px" align="center" justify="center">
                <Text fontSize="sm" color="text.muted">No subdirectories found</Text>
              </Flex>
            ) : (
              <VStack spacing={0} align="stretch">
                {browse?.dirs.map((entry, i) => {
                  const isSelected = selected === entry.path
                  const isGit = entry.isGitRepo || entry.isGitDir

                  return (
                    <Flex
                      key={entry.path}
                      align="center"
                      px={3}
                      py={2.5}
                      gap={2.5}
                      cursor="pointer"
                      bg={isSelected ? selectedBg : isGit ? gitRepoBg : 'transparent'}
                      borderLeftWidth="3px"
                      borderLeftColor={isSelected ? selectedBorder : 'transparent'}
                      borderBottomWidth={i < (browse?.dirs.length ?? 0) - 1 ? '1px' : '0'}
                      borderBottomColor="border.default"
                      _hover={{ bg: isSelected ? selectedBg : hoverBg }}
                      transition="all 0.1s"
                      onClick={() => handleDirClick(entry)}
                      onDoubleClick={() => handleDirDoubleClick(entry)}
                      role="button"
                      aria-label={`Navigate to ${entry.name}`}
                    >
                      <Icon
                        as={isGit ? GitBranch : isSelected ? FolderOpen : Folder}
                        boxSize={4}
                        color={isGit ? 'green.400' : isSelected ? 'brand.400' : 'text.muted'}
                        flexShrink={0}
                      />
                      <Box flex={1} minW={0}>
                        <HStack spacing={2}>
                          <Text
                            fontSize="sm"
                            fontWeight={isSelected ? 'semibold' : 'normal'}
                            color={isSelected ? 'text.primary' : 'text.primary'}
                            noOfLines={1}
                          >
                            {entry.name}
                          </Text>
                          {entry.isGitRepo && !entry.isGitDir && (
                            <Badge colorScheme="green" variant="subtle" fontSize="9px" flexShrink={0}>
                              git repo
                            </Badge>
                          )}
                          {entry.isGitDir && (
                            <Badge colorScheme="purple" variant="subtle" fontSize="9px" flexShrink={0}>
                              .git
                            </Badge>
                          )}
                        </HStack>
                        <Text fontSize="10px" color="text.muted" noOfLines={1} fontFamily="mono">
                          {entry.path}
                        </Text>
                      </Box>

                      {/* Open-in button for non-git dirs */}
                      {!isGit && (
                        <Tooltip label="Open folder" placement="left">
                          <IconButton
                            aria-label="Open"
                            icon={<Icon as={ChevronRight} boxSize={3.5} />}
                            size="xs"
                            variant="ghost"
                            color="text.muted"
                            _hover={{ color: 'brand.400' }}
                            onClick={e => {
                              e.stopPropagation()
                              handleNavigateInto(entry)
                            }}
                          />
                        </Tooltip>
                      )}
                    </Flex>
                  )
                })}
              </VStack>
            )}
          </Box>

          {/* Selected path display */}
          {selected && (
            <Box mt={3} p={3} bg="bg.subtle" borderRadius="lg" borderWidth="1px" borderColor="brand.500">
              <HStack spacing={2}>
                <Icon as={CheckCircle} boxSize={4} color="green.400" flexShrink={0} />
                <Box minW={0}>
                  <Text fontSize="xs" color="text.muted">Selected repository</Text>
                  <Text fontSize="xs" fontFamily="mono" color="text.primary" noOfLines={1}>
                    {selected}
                  </Text>
                </Box>
              </HStack>
            </Box>
          )}
        </ModalBody>

        <ModalFooter pt={4} gap={3}>
          <Button variant="ghost" onClick={onClose} size="sm">Cancel</Button>
          <Button
            colorScheme="brand"
            onClick={handleSelectAndClose}
            isDisabled={!selected && !browse?.isGitRepo}
            size="sm"
            leftIcon={<Icon as={GitBranch} boxSize={4} />}
          >
            Select Repository
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

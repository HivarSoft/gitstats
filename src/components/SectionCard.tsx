import { Box, Flex, Heading, Text, type BoxProps } from '@chakra-ui/react'
import type { ReactNode } from 'react'

interface SectionCardProps extends BoxProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export default function SectionCard({ title, description, actions, children, ...rest }: SectionCardProps) {
  return (
    <Box
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="xl"
      overflow="hidden"
      {...rest}
    >
      <Flex
        px={{ base: 4, md: 6 }}
        py={{ base: 3, md: 4 }}
        borderBottomWidth="1px"
        borderColor="border.default"
        justify="space-between"
        align="center"
        bg="bg.subtle"
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Heading size="sm" fontWeight="semibold" color="text.primary">
            {title}
          </Heading>
          {description && (
            <Text fontSize="xs" color="text.muted" mt={0.5}>
              {description}
            </Text>
          )}
        </Box>
        {actions && <Box flexShrink={0}>{actions}</Box>}
      </Flex>
      <Box p={{ base: 4, md: 6 }}>{children}</Box>
    </Box>
  )
}

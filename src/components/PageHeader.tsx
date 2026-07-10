import { Box, Flex, Heading, Text, Icon, type BoxProps } from '@chakra-ui/react'
import type { LucideIcon } from 'lucide-react'

interface PageHeaderProps extends BoxProps {
  title: string
  description?: string
  icon: LucideIcon
  actions?: React.ReactNode
}

export default function PageHeader({ title, description, icon, actions, ...rest }: PageHeaderProps) {
  return (
    <Flex
      mb={{ base: 4, md: 8 }}
      align={{ base: 'flex-start', sm: 'center' }}
      justify="space-between"
      flexDir={{ base: 'column', sm: 'row' }}
      gap={{ base: 3, sm: 0 }}
      {...rest}
    >
      <Flex align="center" gap={{ base: 3, md: 4 }}>
        <Flex
          w={{ base: 10, md: 12 }}
          h={{ base: 10, md: 12 }}
          borderRadius="xl"
          bg="brand.500"
          align="center"
          justify="center"
          flexShrink={0}
          shadow="md"
        >
          <Icon as={icon} boxSize={{ base: 5, md: 6 }} color="white" />
        </Flex>
        <Box>
          <Heading size={{ base: 'md', md: 'lg' }} fontWeight="bold" color="text.primary" lineHeight="shorter">
            {title}
          </Heading>
          {description && (
            <Text fontSize={{ base: 'xs', md: 'sm' }} color="text.secondary" mt={0.5} noOfLines={2}>
              {description}
            </Text>
          )}
        </Box>
      </Flex>
      {actions && <Box flexShrink={0}>{actions}</Box>}
    </Flex>
  )
}

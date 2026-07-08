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
    <Flex mb={8} align="center" justify="space-between" {...rest}>
      <Flex align="center" gap={4}>
        <Flex
          w={12}
          h={12}
          borderRadius="xl"
          bg="brand.500"
          align="center"
          justify="center"
          flexShrink={0}
          shadow="md"
        >
          <Icon as={icon} boxSize={6} color="white" />
        </Flex>
        <Box>
          <Heading size="lg" fontWeight="bold" color="text.primary" lineHeight="shorter">
            {title}
          </Heading>
          {description && (
            <Text fontSize="sm" color="text.secondary" mt={0.5}>
              {description}
            </Text>
          )}
        </Box>
      </Flex>
      {actions && <Box>{actions}</Box>}
    </Flex>
  )
}

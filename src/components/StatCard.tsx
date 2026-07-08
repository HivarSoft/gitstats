import {
  Box,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  type BoxProps,
} from '@chakra-ui/react'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps extends BoxProps {
  label: string
  value: string | number
  helpText?: string
  icon: LucideIcon
  iconColor?: string
  trend?: 'up' | 'down' | 'neutral'
}

export default function StatCard({
  label,
  value,
  helpText,
  icon,
  iconColor = 'brand.400',
  ...rest
}: StatCardProps) {
  return (
    <Box
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="xl"
      p={5}
      transition="all 0.2s"
      _hover={{ borderColor: 'brand.500', shadow: 'md', transform: 'translateY(-1px)' }}
      {...rest}
    >
      <Flex justify="space-between" align="flex-start">
        <Stat>
          <StatLabel fontSize="xs" fontWeight="semibold" letterSpacing="wider" textTransform="uppercase" color="text.secondary">
            {label}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold" mt={1} color="text.primary">
            {value}
          </StatNumber>
          {helpText && (
            <StatHelpText fontSize="xs" color="text.muted" mt={1} mb={0}>
              {helpText}
            </StatHelpText>
          )}
        </Stat>
        <Flex
          w={10}
          h={10}
          borderRadius="lg"
          align="center"
          justify="center"
          flexShrink={0}
        >
          <Icon as={icon} boxSize={5} color={iconColor} />
        </Flex>
      </Flex>
    </Box>
  )
}

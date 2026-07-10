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
      p={{ base: 4, md: 5 }}
      transition="all 0.2s"
      _hover={{ borderColor: 'brand.500', shadow: 'md', transform: 'translateY(-1px)' }}
      {...rest}
    >
      <Flex justify="space-between" align="flex-start">
        <Stat>
          <StatLabel
            fontSize={{ base: '9px', md: 'xs' }}
            fontWeight="semibold"
            letterSpacing="wider"
            textTransform="uppercase"
            color="text.secondary"
            noOfLines={1}
          >
            {label}
          </StatLabel>
          <StatNumber
            fontSize={{ base: 'lg', md: '2xl' }}
            fontWeight="bold"
            mt={1}
            color="text.primary"
            noOfLines={1}
          >
            {value}
          </StatNumber>
          {helpText && (
            <StatHelpText fontSize={{ base: '10px', md: 'xs' }} color="text.muted" mt={1} mb={0} noOfLines={1}>
              {helpText}
            </StatHelpText>
          )}
        </Stat>
        <Flex
          w={{ base: 8, md: 10 }}
          h={{ base: 8, md: 10 }}
          borderRadius="lg"
          align="center"
          justify="center"
          flexShrink={0}
        >
          <Icon as={icon} boxSize={{ base: 4, md: 5 }} color={iconColor} />
        </Flex>
      </Flex>
    </Box>
  )
}

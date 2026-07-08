import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const colors = {
  brand: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  surface: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    700: '#1e293b',
    800: '#0f172a',
    850: '#0d1526',
    900: '#080e1a',
  },
}

const semanticTokens = {
  colors: {
    'bg.canvas': {
      default: 'surface.50',
      _dark: 'surface.900',
    },
    'bg.surface': {
      default: 'white',
      _dark: 'surface.800',
    },
    'bg.subtle': {
      default: 'surface.100',
      _dark: 'surface.700',
    },
    'border.default': {
      default: 'surface.200',
      _dark: 'whiteAlpha.100',
    },
    'text.primary': {
      default: 'gray.900',
      _dark: 'whiteAlpha.900',
    },
    'text.secondary': {
      default: 'gray.600',
      _dark: 'whiteAlpha.600',
    },
    'text.muted': {
      default: 'gray.400',
      _dark: 'whiteAlpha.400',
    },
  },
}

const styles = {
  global: {
    body: {
      bg: 'bg.canvas',
      color: 'text.primary',
      fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    },
    '*': {
      borderColor: 'border.default',
    },
    '::-webkit-scrollbar': { width: '6px', height: '6px' },
    '::-webkit-scrollbar-track': { bg: 'transparent' },
    '::-webkit-scrollbar-thumb': { bg: 'brand.600', borderRadius: 'full' },
  },
}

const components = {
  Card: {
    baseStyle: {
      container: {
        bg: 'bg.surface',
        borderWidth: '1px',
        borderColor: 'border.default',
        borderRadius: 'xl',
        boxShadow: 'sm',
        overflow: 'hidden',
      },
    },
  },
  Button: {
    defaultProps: { colorScheme: 'brand' },
  },
  Badge: {
    baseStyle: { borderRadius: 'md', px: 2, py: 0.5 },
  },
  Table: {
    variants: {
      stats: {
        th: {
          bg: 'bg.subtle',
          color: 'text.secondary',
          fontSize: 'xs',
          fontWeight: 'semibold',
          letterSpacing: 'wider',
          textTransform: 'uppercase',
          borderColor: 'border.default',
          px: 4,
          py: 3,
        },
        td: {
          borderColor: 'border.default',
          px: 4,
          py: 3,
          fontSize: 'sm',
        },
        tr: {
          _hover: { bg: 'bg.subtle' },
          transition: 'background 0.15s',
        },
      },
    },
  },
  Tabs: {
    variants: {
      'soft-rounded': {
        tab: {
          _selected: {
            bg: 'brand.500',
            color: 'white',
          },
        },
      },
    },
  },
}

const fonts = {
  heading: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
  body: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
}

const theme = extendTheme({
  config,
  colors,
  semanticTokens,
  styles,
  components,
  fonts,
  shadows: {
    outline: '0 0 0 3px rgba(99, 102, 241, 0.45)',
  },
  radii: {
    xl: '12px',
    '2xl': '16px',
    '3xl': '24px',
  },
})

export default theme

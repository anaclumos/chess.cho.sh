import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['chess.js'],
  experimental: {
    optimizePackageImports: [
      'nucleo-ui-outline-18',
      'radix-ui',
      'three',
      '@react-three/drei',
      '@react-three/fiber',
      'es-hangul',
    ],
  },
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)

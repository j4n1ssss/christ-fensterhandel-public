import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: {
    // Staging/Prod-Build soll nicht an ESLint-Errors scheitern.
    // Die Fehler sollten trotzdem langfristig gefixt werden (lint-job separat).
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Staging-Build soll nicht an TS-Type-Errors scheitern.
    // TS-Fehler sollten trotzdem systematisch im CI gefixt werden.
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['@react-pdf/renderer'],
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

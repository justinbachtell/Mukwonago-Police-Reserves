import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs'
import './src/libs/Env'

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true'
})

/** @type {import('next').NextConfig} */
export default withSentryConfig(
  bundleAnalyzer({
    eslint: {
      dirs: ['.']
    },
    poweredByHeader: false,
    reactStrictMode: true,
    serverExternalPackages: ['@electric-sql/pglite'],

    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          net: false,
          tls: false,
          fs: false,
          crypto: require.resolve('crypto-browserify'),
          stream: require.resolve('stream-browserify'),
          path: require.resolve('path-browserify'),
          perf_hooks: false,
          'node:crypto': require.resolve('crypto-browserify'),
          'node:fs': false,
          'node:path': require.resolve('path-browserify')
        }
      }

      // Handle PDF.js worker
      config.module.rules.push({
        test: /pdf\.worker\.(min\.)?js/,
        type: 'asset/resource'
      })

      // Suppress Prisma and OpenTelemetry warnings from Sentry
      config.ignoreWarnings = [
        { message: /Critical dependency/ },
        { message: /Can't resolve 'prisma'/ }
      ]

      return config
    }
  }),
  {
    automaticVercelMonitors: true,
    disableLogger: true,
    hideSourceMaps: true,
    org: 'justin-bachtell',
    project: 'mukwonago-police-reserves',
    reactComponentAnnotation: {
      enabled: true
    },
    silent: !process.env.CI,
    telemetry: false,
    tunnelRoute: '/monitoring',
    widenClientFileUpload: true
  }
)

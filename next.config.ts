import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';
import './src/libs/Env';

const withNextIntl = createNextIntlPlugin('./src/libs/i18n.ts');

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
export default withSentryConfig(
  bundleAnalyzer(
    withNextIntl({
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
            punycode: false,
            canvas: false
          }
        }

        // Handle PDF.js worker
        config.module.rules.push({
          test: /pdf\.worker\.(min\.)?js/,
          type: 'asset/resource'
        })

        return config
      }
    })
  ),
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

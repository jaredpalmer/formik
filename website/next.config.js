const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const visit = require('unist-util-visit');
const remarkPlugins = require('./src/lib/docs/remark-plugins');

module.exports = {
  typescript: {
    // TODO: Re-enable type checking once React 19 compatibility issues are resolved
    // Temporarily ignoring type errors due to React 19 stricter type checking
    // See: https://react.dev/blog/2024/12/05/react-19
    ignoreBuildErrors: true,
  },
  // Empty turbopack config to acknowledge Turbopack as default bundler (Next.js 16)
  turbopack: {},
  pageExtensions: ['jsx', 'js', 'ts', 'tsx', 'mdx', 'md'],
  env: {
    NEXT_PUBLIC_GA_TRACKING_ID: process.env.NEXT_PUBLIC_GA_TRACKING_ID || '',
  },
  rewrites() {
    return [
      {
        source: '/feed.xml',
        destination: '/_next/static/feed.xml',
      },
      {
        source: '/docs{/}?',
        destination: '/docs/overview',
      },
      {
        source: '/docs/tag/:tag{/}?',
        destination: '/docs/tag/:tag/overview',
      },
    ];
  },
  webpack: (config, { dev, isServer, ...options }) => {
    config.module.rules.push({
      test: /.mdx?$/, // load both .md and .mdx files
      use: [
        options.defaultLoaders.babel,
        {
          loader: '@mdx-js/loader',
          options: {
            remarkPlugins,
          },
        },
        path.join(__dirname, './src/lib/docs/md-loader'),
      ],
    });

    if (!dev && isServer) {
      // we're in build mode so enable shared caching for the GitHub API
      process.env.USE_CACHE = 'true';
      const originalEntry = config.entry;

      config.entry = async () => {
        const entries = { ...(await originalEntry()) };
        return entries;
      };
    }

    return config;
  },
};

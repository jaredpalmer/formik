const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const dotenvLoad = require('dotenv-load');
const visit = require('unist-util-visit');
dotenvLoad();

const remarkPlugins = [
  require('remark-slug'),
  require('./src/lib/docs/remark-paragraph-alerts'),
  [
    require('remark-autolink-headings'),
    {
      behavior: 'append',
      linkProperties: {
        class: ['anchor'],
        title: 'Direct link to heading',
      },
    },
  ],

  require('remark-emoji'),
  require('remark-footnotes'),
  require('remark-images'),
  [
    require('remark-github'),
    { repository: 'https://github.com/jaredpalmer/formik' },
  ],
  require('remark-unwrap-images'),
  [
    require('remark-toc'),
    {
      skip: 'Reference',
      maxDepth: 6,
    },
  ],
];

module.exports = (phase, { defaultConfig }) => {
  return {
    pageExtensions: ['jsx', 'js', 'ts', 'tsx', 'mdx', 'md'],
    target: 'experimental-serverless-trace',
    env: {},
    experimental: {
      modern: true,
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

      // only compile build-rss in production server build
      if (dev || !isServer) {
        return config;
      }

      // we're in build mode so enable shared caching for Notion data
      process.env.USE_CACHE = 'true';

      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = {
          ...(await originalEntry()),
        };
        entries['./scripts/build-rss.js'] = './src/lib/build-rss.ts';
        return entries;
      };

      return config;
    },
  };
};

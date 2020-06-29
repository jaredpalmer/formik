const webpack = require('webpack');
const fs = require('fs');
const path = require('path');
const dotenvLoad = require('dotenv-load');
const visit = require('unist-util-visit');
dotenvLoad();

const remarkPlugins = [
  require('remark-slug'),
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
      if (!dev && isServer) {
        const originalEntry = config.entry;

        config.entry = async () => {
          const entries = { ...(await originalEntry()) };

          // These scripts can import components from the app and use ES modules
          // entries['./scripts/build-rss.js'] = './scripts/build-rss.js';
          // entries['./scripts/index-docs.js'] = './scripts/index-docs.js';

          return entries;
        };
      }
      config.plugins.push(
        new webpack.ContextReplacementPlugin(
          /highlight\.js[/\/]lib[/\/]languages$/,
          /javascript|json|jsx|bash|ts|js|typescript|tsx/
        )
      );

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
      return config;
    },
  };
};

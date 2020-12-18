const sitemap = require('nextjs-sitemap-generator');
const fs = require('fs');

// This is needed for the plugin to work
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BUILD_ID = fs.readFileSync('.next/BUILD_ID').toString();

sitemap({
  baseUrl: 'https://formik.org',
  pagesDirectory: process.cwd() + '/.next/server/pages',
  targetDirectory: 'public/',
  ignoredExtensions: ['js', 'map'],
  ignoredPaths: ['/404', '/blog/[...slug]'],
});

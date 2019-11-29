/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config for all the possible
// site configuration options.

// List of projects/orgs using your project for the users page.
const users = [
  {
    caption: 'The Palmer Group',
    image: '/formik/img/logos/palmer.svg',
    infoLink: 'https://palmer.net',
    pinned: true,
    style: {
      maxWidth: 50,
    },
  },
  {
    caption: 'Airbnb',
    image: '/formik/img/logos/airbnb.svg',
    infoLink: 'https://airbnb.com',
    pinned: true,
  },
  {
    caption: 'Walmart',
    image: '/formik/img/logos/walmart.svg',
    infoLink: 'https://walmart.com',
    pinned: true,
  },
  {
    caption: 'Lyft',
    image: '/formik/img/logos/lyft.svg',
    infoLink: 'https://lyft.com',
    pinned: true,
  },
  {
    caption: 'Nasa',
    image: '/formik/img/logos/nasa.svg',
    infoLink: 'https://www.nasa.gov',
    pinned: true,
  },
  {
    caption: 'OpenTable',
    image: '/formik/img/logos/opentable.svg',
    infoLink: 'https://opentable.com',
    pinned: true,
  },
  {
    caption: 'Priceline.com',
    image: '/formik/img/logos/priceline.png',
    infoLink: 'https://priceline.com',
    pinned: true,
  },
  {
    caption: 'Booking.com',
    image: '/formik/img/logos/booking.svg',
    infoLink: 'https://booking.com',
    pinned: true,
  },
  {
    caption: 'NASDAQ',
    image: '/formik/img/logos/nasdaq.svg',
    infoLink: 'https://www.nasdaq.com',
    pinned: true,
  },
  {
    caption: 'PWC',
    image: '/formik/img/logos/pwc.svg',
    infoLink: 'https://www.pwc.com',
    pinned: true,
  },
  {
    caption: 'NOAA',
    image: '/formik/img/logos/noaa.svg',
    infoLink: 'https://www.noaa.gov',
    pinned: true,
  },
  {
    caption: 'Docker',
    image: '/formik/img/logos/docker.svg',
    infoLink: 'https://docker.com',
    pinned: true,
  },
  {
    caption: 'Viacom',
    image: '/formik/img/logos/viacom.svg',
    infoLink: 'https://viacom.com',
    pinned: true,
  },
  {
    caption: 'Nokia',
    image: '/formik/img/logos/nokia.svg',
    infoLink: 'https://nokia.com',
    pinned: true,
  },
  {
    caption: 'Sony',
    image: '/formik/img/logos/sony.svg',
    infoLink: 'https://sony.com',
    pinned: true,
  },
  {
    caption: 'State Street',
    image: '/formik/img/logos/state-street.png',
    infoLink: 'https://statestreet.com',
  },
  {
    caption: 'Wayfair',
    image: '/formik/img/logos/wayfair.svg',
    infoLink: 'https://wayfair.com',
    pinned: true,
  },
  {
    caption: 'Artsy',
    image: '/formik/img/logos/artsy.png',
    infoLink: 'https://artsy.com',
    pinned: true,
  },
  {
    caption: 'Postmates',
    image: '/formik/img/logos/postmates.svg',
    infoLink: 'https://postmates.com',
    pinned: true,
  },
  {
    caption: 'Capsule Health',
    image: '/formik/img/logos/capsule.svg',
    infoLink: 'https://capsulecares.com',
    pinned: true,
  },
  {
    caption: 'Egghead',
    image: '/formik/img/logos/egghead.svg',
    infoLink: 'https://egghead.io',
    pinned: true,
  },
  {
    caption: 'Frame.io',
    image: '/formik/img/logos/frameio.png',
    infoLink: 'https://frame.io',
  },
  {
    caption: 'RVshare',
    image: '/formik/img/logos/rvshare.svg',
    infoLink: 'https://rvshare.com',
  },
  {
    caption: 'Extendi',
    image: '/formik/img/logos/extendi.svg',
    infoLink: 'https://www.extendi.it',
  },
  {
    caption: 'Gusto',
    image: '/formik/img/logos/gusto.svg',
    infoLink: 'https://gusto.com',
  },
  {
    caption: 'Campusjäger',
    image: '/formik/img/logos/campusjaeger.png',
    infoLink: 'https://www.campusjaeger.de/',
  },
  {
    caption: 'Letgo',
    image: '/formik/img/logos/letgo-logo.png',
    infoLink: 'https://we.letgo.com/',
  },
  {
    caption: 'gitconnected',
    image: '/formik/img/logos/gitconnected-logo.png',
    infoLink: 'https://gitconnected.com',
  },
  {
    caption: 'zauberware',
    image: '/formik/img/logos/zauberware-logo.svg',
    infoLink: 'https://www.zauberware.com',
  },
  {
    caption: 'brightwheel',
    image: '/formik/img/logos/brightwheel.svg',
    infoLink: 'https://mybrightwheel.com',
  },
  {
    caption: 'restaurant365',
    image: '/formik/img/logos/restaurant365.svg',
    infoLink: 'https://restaurant365.com',
  },
];

const siteConfig = {
  title: 'Formik', // Title for your website.
  tagline: `Build forms in React, without the tears.`,
  url: 'https://jaredpalmer.com', // Your website URL
  baseUrl: '/formik/', // Base URL for your project */
  // For github.io type URLs, you would set the url and baseUrl like:
  //   url: 'https://facebook.github.io',
  //   baseUrl: '/test-site/',

  // Used for publishing and more
  projectName: 'formik',
  organizationName: 'jaredpalmer',
  // For top-level user or org sites, the organization is still the same.
  // e.g., for the https://JoelMarcey.github.io site, it would be set like...
  //   organizationName: 'JoelMarcey'
  editUrl: 'https://github.com/jaredpalmer/formik/edit/master/docs/',
  // For no header links in the top nav bar -> headerLinks: [],
  headerLinks: [
    { doc: 'overview', label: 'Docs' },
    { page: 'users', label: 'Users' },
    { page: 'help', label: 'Help' },
    {
      href: 'https://github.com/jaredpalmer/formik',
      label: 'GitHub',
    },
    // { blog: true, label: 'Blog' },
  ],
  noIndex: false,
  search: true,
  // If you have users set above, you add it here:
  users,

  /* path to images for header/footer */
  headerIcon: 'img/formik.svg',
  footerIcon: 'img/formik-mark.svg',
  favicon: 'img/favicon.png',

  /* Colors for website */
  colors: {
    primaryColor: '#1B2638',
    secondaryColor: '#0E1624',
    grayDarker: '#344563',
    gray: '#505F79',
    grayLighter: '#7A869A',
    accentColor: '#785BA3',
    actionColor: '#008cf2',
  },

  /* Custom fonts for website */
  fonts: {
    sans: [
      `FormikSans`,
      `-apple-system`,
      `BlinkMacSystemFont`,
      `Segoe UI`,
      `Roboto`,
      `Oxygen`,
      `Ubuntu`,
      `Cantarell`,
      'Open Sans',
      'Helvetica Neue',
      `sans-serif`,
    ],
  },

  // This copyright info is used in /core/Footer.js and blog RSS/Atom feeds.
  copyright: `Copyright © ${new Date().getFullYear()} Jared Palmer. All Rights Reserved.`,

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks.
    theme: 'default',
  },
  usePrism: ['jsx', 'typescript'],
  // Add custom scripts here that would be placed in <script> tags.
  scripts: [
    'https://buttons.github.io/buttons.js',
    'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.0/clipboard.min.js',
    '/formik/js/code-blocks-buttons.js',
  ],

  // On page navigation for the current documentation page.
  onPageNav: 'separate',
  // No .html extensions for paths.
  cleanUrl: true,
  // Open Graph and Twitter card images.
  ogImage: 'img/formik-og.png',
  twitterImage: 'img/formik-twitter.png',
  algolia: {
    apiKey: '32fabc38a054677ee9b24e69d699fbd0',
    indexName: 'formik',
    algoliaOptions: {
      facetFilters: ['version:VERSION'],
    },
  },
  // You may provide arbitrary config keys to be used as needed by your
  // template. For example, if you need your repo's URL...
  repoUrl: 'https://github.com/jaredpalmer/formik',
  scrollToTop: true,
  scrollToTopOptions: {
    zIndex: 100,
  },
  disableHeaderTitle: true,
  enableUpdateTime: true,
  enableUpdateBy: true,
  gaTrackingId: 'UA-55176740-4',
  twitter: true,
  twitterUsername: 'jaredpalmer',
};

module.exports = siteConfig;

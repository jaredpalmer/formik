// List of projects/orgs using your project for the users page.
const users = [
  {
    caption: 'Airbnb',
    image: '/img/logos/airbnb.svg',
    infoLink: 'https://airbnb.com',
    pinned: true,
  },
  {
    caption: 'Walmart',
    image: '/img/logos/walmart.svg',
    infoLink: 'https://walmart.com',
    pinned: true,
  },
  {
    caption: 'Lyft',
    image: '/img/logos/lyft.svg',
    infoLink: 'https://lyft.com',
    pinned: true,
  },
  {
    caption: 'Nasa',
    image: '/img/logos/nasa.svg',
    infoLink: 'https://www.nasa.gov',
    pinned: true,
  },
  {
    caption: 'OpenTable',
    image: '/img/logos/opentable.svg',
    infoLink: 'https://opentable.com',
    pinned: true,
  },
  {
    caption: 'Priceline.com',
    image: '/img/logos/priceline.png',
    infoLink: 'https://priceline.com',
    pinned: true,
  },
  {
    caption: 'Booking.com',
    image: '/img/logos/booking.svg',
    infoLink: 'https://booking.com',
    pinned: true,
  },
  {
    caption: 'NASDAQ',
    image: '/img/logos/nasdaq.svg',
    infoLink: 'https://www.nasdaq.com',
    pinned: true,
  },
  {
    caption: 'PWC',
    image: '/img/logos/pwc.svg',
    infoLink: 'https://www.pwc.com',
    pinned: true,
    style: {
      maxWidth: 100,
    },
  },
  {
    caption: 'NOAA',
    image: '/img/logos/noaa.svg',
    infoLink: 'https://www.noaa.gov',
    pinned: true,
    style: {
      maxWidth: 100,
    },
  },
  {
    caption: 'Docker',
    image: '/img/logos/docker.svg',
    infoLink: 'https://docker.com',
    pinned: true,
  },
  {
    caption: 'Viacom',
    image: '/img/logos/viacom.svg',
    infoLink: 'https://viacom.com',
    pinned: true,
  },
  {
    caption: 'Nokia',
    image: '/img/logos/nokia.svg',
    infoLink: 'https://nokia.com',
    pinned: true,
  },
  {
    caption: 'Sony',
    image: '/img/logos/sony.svg',
    infoLink: 'https://sony.com',
    pinned: true,
  },
  {
    caption: 'State Street',
    image: '/img/logos/state-street.png',
    infoLink: 'https://statestreet.com',
  },
  {
    caption: 'Wayfair',
    image: '/img/logos/wayfair.svg',
    infoLink: 'https://wayfair.com',
    pinned: true,
  },
  {
    caption: 'Artsy',
    image: '/img/logos/artsy.png',
    infoLink: 'https://artsy.com',
    pinned: true,
  },
  {
    caption: 'Postmates',
    image: '/img/logos/postmates.svg',
    infoLink: 'https://postmates.com',
    pinned: true,
  },
  {
    caption: 'Capsule Health',
    image: '/img/logos/capsule.svg',
    infoLink: 'https://capsulecares.com',
    pinned: true,
  },
  {
    caption: 'Egghead',
    image: '/img/logos/egghead.svg',
    infoLink: 'https://egghead.io',
    pinned: true,
  },
  {
    caption: 'Frame.io',
    image: '/img/logos/frameio.png',
    infoLink: 'https://frame.io',
  },
  {
    caption: 'RVshare',
    image: '/img/logos/rvshare.svg',
    infoLink: 'https://rvshare.com',
  },
  {
    caption: 'Extendi',
    image: '/img/logos/extendi.svg',
    infoLink: 'https://www.extendi.it',
  },
  {
    caption: 'Gusto',
    image: '/img/logos/gusto.svg',
    infoLink: 'https://gusto.com',
  },
  {
    caption: 'Campusjäger',
    image: '/img/logos/campusjaeger.png',
    infoLink: 'https://www.campusjaeger.de/',
  },
  {
    caption: 'Letgo',
    image: '/img/logos/letgo-logo.png',
    infoLink: 'https://we.letgo.com/',
    style: {
      maxWidth: 100,
    },
  },
  {
    caption: 'gitconnected',
    image: '/img/logos/gitconnected-logo.png',
    infoLink: 'https://gitconnected.com',
  },
  {
    caption: 'zauberware',
    image: '/img/logos/zauberware-logo.svg',
    infoLink: 'https://www.zauberware.com',
  },
  {
    caption: 'brightwheel',
    image: '/img/logos/brightwheel.svg',
    infoLink: 'https://mybrightwheel.com',
  },
  {
    caption: 'restaurant365',
    image: '/img/logos/restaurant365.svg',
    infoLink: 'https://restaurant365.com',
  },
  {
    caption: 'CarGurus',
    image: '/img/logos/cargurus.svg',
    infoLink: 'https://www.cargurus.com',
  },
  {
    caption: 'Gremlin',
    image: '/img/logos/gremlin.svg',
    infoLink: 'https://www.gremlin.com',
  },
  {
    caption: 'Ubidots',
    image: '/img/logos/ubidots.svg',
    infoLink: 'https://www.ubidots.com',
  },
  {
    caption: 'SwissDev DevOps Jobs',
    image: '/img/logos/swissdev-devops-jobs.svg',
    infoLink: 'https://swissdevjobs.ch/jobs/Dev-Ops/All',
    style: {
      maxWidth: 100,
    },
  },
];

export const siteConfig = {
  users,
  editUrl: 'https://github.com/formik/formik/edit/master',
  copyright: `Copyright © ${new Date().getFullYear()} Jared Palmer. All Rights Reserved.`,
  repoUrl: 'https://github.com/formik/formik',
  algolia: {
    appId: 'BH4D9OD16A',
    apiKey: '32fabc38a054677ee9b24e69d699fbd0',
    indexName: 'formik',
    algoliaOptions: {
      facetFilters: ['version:VERSION'],
    },
  },
};

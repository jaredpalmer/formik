import * as React from 'react';

export enum Threshold {
  HIGH = 'high-threshold',
  MEDIUM = 'medium-threshold',
  LOW = 'low-threshold',
}

export interface Logo {
  name: string;
  image: string;
  threshold: Threshold;
  url?: string;
  style?: React.CSSProperties;
  pinned?: boolean;
}

export const logos: Logo[] = [
  {
    threshold: Threshold.MEDIUM,
    name: 'Airbnb',
    image: '/img/logos/airbnb.svg',
    url: 'https://airbnb.com',
    pinned: true,
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'Walmart',
    image: '/img/logos/walmart.svg',
    url: 'https://walmart.com',
    pinned: true,
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'Lyft',
    image: '/img/logos/lyft.svg',
    url: 'https://lyft.com',
    pinned: true,
    style: {
      maxWidth: 75,
    },
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'Nasa',
    image: '/img/logos/nasa.svg',
    url: 'https://www.nasa.gov',
    pinned: true,
    style: {
      maxWidth: 80,
    },
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'OpenTable',
    image: '/img/logos/opentable.svg',
    url: 'https://opentable.com',
    pinned: true,
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'Priceline.com',
    image: '/img/logos/priceline.png',
    url: 'https://priceline.com',
    pinned: true,
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'Booking.com',
    image: '/img/logos/booking.svg',
    url: 'https://booking.com',
    pinned: true,
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'NASDAQ',
    image: '/img/logos/nasdaq.svg',
    url: 'https://www.nasdaq.com',
    pinned: true,
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'PWC',
    image: '/img/logos/pwc.svg',
    url: 'https://www.pwc.com',
    pinned: true,
    style: {
      maxWidth: 80,
    },
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'NOAA',
    image: '/img/logos/noaa.svg',
    url: 'https://www.noaa.gov',
    pinned: true,
    style: {
      maxWidth: 80,
    },
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'Docker',
    image: '/img/logos/docker.svg',
    url: 'https://docker.com',
    pinned: true,
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'Viacom',
    image: '/img/logos/viacom.svg',
    url: 'https://viacom.com',
    pinned: true,
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'Nokia',
    image: '/img/logos/nokia.svg',
    url: 'https://nokia.com',
    pinned: true,
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'Sony',
    image: '/img/logos/sony.svg',
    url: 'https://sony.com',
    pinned: true,
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'State Street',
    image: '/img/logos/state-street.png',
    url: 'https://statestreet.com',
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'Wayfair',
    image: '/img/logos/wayfair.svg',
    url: 'https://wayfair.com',
    pinned: true,
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'Artsy',
    image: '/img/logos/artsy.png',
    url: 'https://artsy.com',
    pinned: true,
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'Postmates',
    image: '/img/logos/postmates.svg',
    url: 'https://postmates.com',
    pinned: true,
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'Capsule Health',
    image: '/img/logos/capsule.svg',
    url: 'https://capsulecares.com',
    pinned: true,
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'Egghead',
    image: '/img/logos/egghead.svg',
    url: 'https://egghead.io',
    pinned: true,
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'Frame.io',
    image: '/img/logos/frameio.png',
    url: 'https://frame.io',
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'RVshare',
    image: '/img/logos/rvshare.svg',
    url: 'https://rvshare.com',
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'Extendi',
    image: '/img/logos/extendi.svg',
    url: 'https://www.extendi.it',
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'Gusto',
    image: '/img/logos/gusto.svg',
    url: 'https://gusto.com',
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'Campusjäger',
    image: '/img/logos/campusjaeger.png',
    url: 'https://www.campusjaeger.de/',
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'Letgo',
    image: '/img/logos/letgo-logo.png',
    url: 'https://we.letgo.com/',
    style: {
      maxWidth: 100,
    },
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'gitconnected',
    image: '/img/logos/gitconnected-logo.png',
    url: 'https://gitconnected.com',
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'zauberware',
    image: '/img/logos/zauberware-logo.svg',
    url: 'https://www.zauberware.com',
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'brightwheel',
    image: '/img/logos/brightwheel.svg',
    url: 'https://mybrightwheel.com',
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'restaurant365',
    image: '/img/logos/restaurant365.svg',
    url: 'https://restaurant365.com',
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'CarGurus',
    image: '/img/logos/cargurus.svg',
    url: 'https://www.cargurus.com',
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'Gremlin',
    image: '/img/logos/gremlin.svg',
    url: 'https://www.gremlin.com',
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'Ubidots',
    image: '/img/logos/ubidots.svg',
    url: 'https://www.ubidots.com',
  },
  {
    threshold: Threshold.MEDIUM,
    name: 'SwissDev DevOps Jobs',
    image: '/img/logos/swissdev-devops-jobs.svg',
    url: 'https://swissdevjobs.ch/jobs/Dev-Ops/All',
    style: {
      maxWidth: 100,
    },
  },
];

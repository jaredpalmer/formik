import * as React from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';

// Wrapper to handle React 19 type compatibility
const NextLink = Link as any;

const Img = (props: any) => (
  <Image
    {...props}
    loading="lazy"
    sizes="100vw"
    style={{
      width: '100%',
      height: 'auto',
    }}
  />
);

export default {
  // default tags
  pre: (p: any) => <div {...p} />,
  img: Img,
  code: dynamic(() => import('./Highlight2')),
  a: NextLink,
  Head,
};

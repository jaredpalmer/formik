import * as React from 'react';
import dynamic from 'next/dynamic';
import Highlight from './Highlight';
export default {
  // default tags
  pre: (p: any) => <pre {...p} />,
  code: Highlight,
  // Counter: dynamic(() => import('./counter')),
};

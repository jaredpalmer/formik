import * as React from 'react';
import dynamic from 'next/dynamic';

export default {
  // default tags
  pre: (p: any) => <div {...p} />,
  code: dynamic(() => import('./Highlight2')),
  // Counter: dynamic(() => import('./counter')),
};

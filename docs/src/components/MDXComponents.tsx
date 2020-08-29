import * as React from 'react';
import dynamic from 'next/dynamic';

export default {
  // default tags
  pre: (p: any) => <pre {...p} />,
  code: dynamic(() => import('./Highlight2')),
  // Counter: dynamic(() => import('./counter')),
};

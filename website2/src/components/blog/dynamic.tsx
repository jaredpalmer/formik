import * as React from 'react';
import dynamic from 'next/dynamic';
import ExtLink from './ExternalLink';

export default {
  // default tags
  ol: 'ol',
  ul: 'ul',
  li: 'li',
  p: 'p',
  blockquote: 'blockquote',
  a: ExtLink,

  Image: dynamic(() => import('./Image')),
  Code: dynamic(() => import('./Code')),
  // Counter: dynamic(() => import('./counter')),
};

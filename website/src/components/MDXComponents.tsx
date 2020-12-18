import * as React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ExternalLink } from './ExternalLink';
const code = dynamic(() => import('./Highlight2'));
const Pre = (p: any) => <pre {...p} />;

const Anchor = ({ href, ...props }: JSX.IntrinsicElements['a']) => {
  if (!href) {
    // eslint-disable-next-line jsx-a11y/anchor-has-content
    return <a href={href} {...props} />;
  }
  return (
    <>
      {href.startsWith('https://') ? (
        <ExternalLink href={href} {...props} />
      ) : href.startsWith('#') ? (
        // eslint-disable-next-line jsx-a11y/anchor-has-content
        <a href={href} {...props} />
      ) : typeof window !== 'undefined' ? (
        <Link href={href.replace('.html', '').replace('.md', '')}>
          {/* eslint-disable-next-line jsx-a11y/anchor-has-content */}
          <a {...props} />
        </Link>
      ) : (
        <a href={href} {...props} />
      )}
    </>
  );
};
const MDXComponents = {
  // default tags
  pre: Pre,
  code,
  a: Anchor,
  // Counter: dynamic(() => import('./counter')),
};

export default MDXComponents;

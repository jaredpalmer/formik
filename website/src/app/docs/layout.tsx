import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  const tree = source.pageTree;
  
  return (
    <DocsLayout 
      tree={tree} 
      nav={{ 
        title: 'Formik',
        url: '/',
      }}
      links={[
        {
          text: 'Blog',
          url: '/blog',
        },
        {
          text: 'GitHub',
          url: 'https://github.com/jaredpalmer/formik',
          external: true,
        },
      ]}
    >
      {children}
    </DocsLayout>
  );
}

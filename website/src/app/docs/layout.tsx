import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  const tree = source.pageTree;
  
  return (
    <DocsLayout 
      tree={tree} 
      nav={{ title: 'Formik' }}
    >
      {children}
    </DocsLayout>
  );
}

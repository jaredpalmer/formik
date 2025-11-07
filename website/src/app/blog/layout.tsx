import type { ReactNode } from 'react';
import Link from 'next/link';

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 bg-white z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            Formik
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/docs" className="text-gray-700 hover:text-gray-900">
              Docs
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-gray-900 font-semibold">
              Blog
            </Link>
            <a 
              href="https://github.com/jaredpalmer/formik" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-gray-900"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

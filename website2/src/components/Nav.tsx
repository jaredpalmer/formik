import * as React from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { AnimatePresence, motion } from 'framer-motion';
import cn from 'classnames';
import { siteConfig } from 'siteConfig';
import ExternalLink from './blog/ExternalLink';

export const Nav: React.FC = () => (
  <div className="bg-white border-b border-gray-200">
    <div className="container mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 md:gap-6">
        <div className="md:col-span-3 flex items-center h-16">
          <Link href="/" as="/">
            <a>
              <Logo />
            </a>
          </Link>
        </div>
        <div className="md:col-span-9 items-center flex justify-between md:justify-end  space-x-8 h-16">
          <div className="flex items-center  space-x-8">
            <div>
              <Link href="/docs/overview">
                <a className="leading-6 font-medium">Docs</a>
              </Link>
            </div>
            <div>
              <Link href="/blog">
                <a className="leading-6 font-medium">Blog</a>
              </Link>
            </div>
            <div>
              <Link href="/users">
                <a className="leading-6 font-medium">Users</a>
              </Link>
            </div>
          </div>
          <div className="-mb-2">
            <a
              className="github-button"
              href="https://github.com/formik/formik"
              data-color-scheme="no-preference: light; light: light; dark: dark;"
              data-size="large"
              data-show-count="true"
              aria-label="Star formik/formik on GitHub"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

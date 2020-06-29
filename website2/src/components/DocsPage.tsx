import * as React from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { getSlug, removeFromLast, addTagToSlug } from '../lib/docs/utils';
import { GITHUB_URL, REPO_NAME } from '../lib/github/constants';
import { Page, RouteItem } from '../lib/types';
import { FiThumbsDown, FiThumbsUp } from 'react-icons/fi';
import { Markdown } from './Markdown';
import { addLinkListener } from 'lib/docs/addLinkListener';

export interface DocsPageProps {
  route: RouteItem;
  page: Page;
  href: string;

  prevRoute?: RouteItem;
  nextRoute?: RouteItem;
  content?: React.ReactNode;
}

function areEqual(prevProps: DocsPageProps, props: DocsPageProps) {
  return prevProps.route.path === props.route.path;
}

export const DocsPage = React.memo<DocsPageProps>(
  ({ route, page, prevRoute, nextRoute, href, content }) => {
    const { query } = useRouter();
    const { slug, tag } = getSlug(query as { slug: string[] });
    const editUrl = `${GITHUB_URL}/${REPO_NAME}/edit/master${route?.path}`;
    React.useEffect(() => {
      const listeners: any = [];

      document
        .querySelectorAll('.docs-content a.relative-link')
        .forEach((node) => {
          const nodeHref = node.getAttribute('href');
          // Exclude paths like #setup and hashes that have the same current path
          if (nodeHref && nodeHref[0] !== '#' && !nodeHref.startsWith(slug)) {
            if (nodeHref.startsWith('/docs')) {
              // Handle relative documentation paths
              const as = addTagToSlug(nodeHref, tag!);
              listeners.push(
                addLinkListener(node, { href: '/docs/[...slug]', as })
              );
            } else if (nodeHref.startsWith('/blog')) {
              listeners.push(
                addLinkListener(node, { href: '/blug/[...slug]', as: nodeHref })
              );
            } else if (!nodeHref.startsWith('mailto')) {
              // Handle any other relative path
              listeners.push(addLinkListener(node, { href: nodeHref }));
            }
          }
        });

      return () => {
        listeners.forEach((cleanUpListener: any) => cleanUpListener());
      };
    }, [slug]);
    return (
      <div className="docs">
        <h1 className="mb-6 text-4xl font-bold leading-snug tracking-tight text-gray-900">
          {page.title}
        </h1>
        <Markdown html={page.html} />
        <footer className="my-8">
          {tag ? (
            <NextLink href={href} as={slug}>
              <a className="text-gray-600 underline">
                Go to the live version of this page
              </a>
            </NextLink>
          ) : (
            <a
              href={editUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 underline"
            >
              Edit this page on GitHub
            </a>
          )}
        </footer>
        <hr className="mt-8" />
        <div className="py-8 md:flex md:items-center md:py-8">
          <div className="font-semibold text-xl mr-4 text-center mb-4 md:mb-0  md:text-left">
            Was this page helpful?
          </div>
          <div className="grid grid-cols-2 gap-3 w-auto max-w-xs mx-auto md:mx-2">
            <button className="button-secondary">
              <FiThumbsUp className="-ml-1 mr-2" />
              Yes
            </button>
            <button className="button-secondary">
              <FiThumbsDown className="-ml-1 mr-2" />
              No
            </button>
          </div>
        </div>
        <hr />
        <div className="py-12">
          <div className="flex space-between items-center">
            {prevRoute && prevRoute.path ? (
              <NextLink
                href={href}
                as={addTagToSlug(
                  removeFromLast(prevRoute.path, '.'),
                  tag as string
                )}
              >
                <a className="flex-grow  block">
                  <span className="text-sm block text-gray-500 mb-1 font-semibold">
                    Prev
                  </span>
                  <span className="text-xl block text-blue-600 font-semibold">
                    {prevRoute.title}
                  </span>
                </a>
              </NextLink>
            ) : (
              <div />
            )}
            {nextRoute && nextRoute.path && (
              <NextLink
                href={href}
                as={addTagToSlug(
                  removeFromLast(nextRoute.path, '.'),
                  tag as string
                )}
              >
                <a className="flex-grow text-right block">
                  <span className="text-sm block text-gray-500 mb-1 font-semibold">
                    Next
                  </span>
                  <span className="text-xl block text-blue-600 font-semibold">
                    {nextRoute.title}
                  </span>
                </a>
              </NextLink>
            )}
          </div>
        </div>
        <style jsx>{`
          .docs {
            // flex: 1;
            // width: auto;
            min-width: calc(100% - 300px - 1rem - 200px);
          }
        `}</style>
      </div>
    );
  },
  areEqual
);

DocsPage.displayName = 'DocsPage';

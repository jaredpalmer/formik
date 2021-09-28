import * as React from 'react';
import { createPortal } from 'react-dom';
import Router from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { useDocSearchKeyboardEvents } from '@docsearch/react';
import { siteConfig } from 'siteConfig';

export interface SearchProps {
  appId?: string;
  apiKey?: string;
  indexName?: string;
  searchParameters?: any;
  renderModal?: boolean;
}

function Hit({ hit, children }: any) {
  return (
    <Link href={hit.url.replace()}>
      <a>{children}</a>
    </Link>
  );
}

const options = {
  appId: siteConfig.algolia.appId,
  apiKey: siteConfig.algolia.apiKey,
  indexName: siteConfig.algolia.indexName,
};

let DocSearchModal: any = null;

export const Search: React.FC<SearchProps> = ({ appId }) => {
  const searchButtonRef = React.useRef<HTMLButtonElement | null>(null);
  const [isShowing, setIsShowing] = React.useState(false);
  const [initialQuery, setInitialQuery] = React.useState<string | null>(null);

  const importDocSearchModalIfNeeded = React.useCallback(
    function importDocSearchModalIfNeeded() {
      if (DocSearchModal) {
        return Promise.resolve();
      }

      return Promise.resolve(import('@docsearch/react/modal')).then(
        ({ DocSearchModal: Modal }) => {
          DocSearchModal = Modal;
        }
      );
    },
    []
  );

  const onOpen = React.useCallback(
    function onOpen() {
      importDocSearchModalIfNeeded().then(() => {
        // We check that no other DocSearch modal is showing before opening this
        // one (we use one instance for desktop and one instance for mobile).
        if (document.body.classList.contains('DocSearch--active')) {
          return;
        }

        setIsShowing(true);
      });
    },
    [importDocSearchModalIfNeeded, setIsShowing]
  );

  const onClose = React.useCallback(
    function onClose() {
      setIsShowing(false);
    },
    [setIsShowing]
  );

  const onInput = React.useCallback(
    (event: KeyboardEvent) => {
      importDocSearchModalIfNeeded().then(() => {
        setIsShowing(true);
        setInitialQuery(event.key);
      });
    },
    [importDocSearchModalIfNeeded, setIsShowing, setInitialQuery]
  );

  useDocSearchKeyboardEvents({
    isOpen: isShowing,
    onOpen,
    onClose,
    onInput,
    searchButtonRef,
  });

  return (
    <>
      <Head>
        <link
          rel="preconnect"
          href={`https://${appId}-dsn.algolia.net`}
          crossOrigin="true"
        />
      </Head>

      <div>
        <button
          ref={searchButtonRef}
          type="button"
          className="flex items-center w-full px-2 py-2 text-sm leading-6 text-left text-gray-500 align-middle transition duration-150 ease-in-out border rounded-lg group hover:text-gray-600 hover:border-gray-300 pointer bg-gray-50 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          onClick={onOpen}
        >
          <svg
            width="1em"
            height="1em"
            className="flex-shrink-0 mr-3 text-gray-600 align-middle group-hover:text-gray-700"
            style={{ marginBottom: 2 }}
            viewBox="0 0 20 20"
          >
            <path
              d="M14.386 14.386l4.0877 4.0877-4.0877-4.0877c-2.9418 2.9419-7.7115 2.9419-10.6533 0-2.9419-2.9418-2.9419-7.7115 0-10.6533 2.9418-2.9419 7.7115-2.9419 10.6533 0 2.9419 2.9418 2.9419 7.7115 0 10.6533z"
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              fillRule="evenodd"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
          Search docs
          <span className="ml-auto">
            <kbd
              className="inline-flex items-center justify-center p-0 mr-0 mr-1 text-xs text-center align-middle transition duration-150 ease-in-out bg-gray-100 border border-gray-300 rounded group-hover:border-gray-300 "
              style={{ minWidth: '1.8em' }}
            >
              ⌘
            </kbd>
            <kbd
              className="inline-flex items-center justify-center p-0 ml-auto mr-0 text-xs text-center align-middle transition duration-150 ease-in-out bg-gray-100 border border-gray-300 rounded group-hover:border-gray-300 "
              style={{ minWidth: '1.8em' }}
            >
              K
            </kbd>
          </span>
        </button>
      </div>
      {isShowing &&
        createPortal(
          <DocSearchModal
            {...options}
            initialQuery={initialQuery}
            onClose={onClose}
            navigator={{
              navigate({ suggestionUrl }: any) {
                Router.push(suggestionUrl);
              },
            }}
            transformItems={(items: any[]) => {
              return items.map(item => {
                const url = new URL(item.url);
                return {
                  ...item,
                  url: item.url
                    .replace(url.origin, '')
                    .replace('/docs/#', '/docs/overview#'),
                };
              });
            }}
            hitComponent={Hit}
          />,
          document.body
        )}
    </>
  );
};

Search.displayName = 'Search';

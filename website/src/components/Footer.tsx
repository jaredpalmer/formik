import Link from 'next/link';
import * as React from 'react';
import { siteConfig } from 'siteConfig';
import { ExternalLink } from './ExternalLink';
import { FormiumLogo } from './FormiumLogo';
export interface FooterProps {}

export const Footer: React.FC<FooterProps> = props => {
  return (
    <div className="border-t border-gray-200 bg-gray-50 lg:mx-4">
      <div className="container px-4 py-12 mx-auto lg:py-16 lg:px-0 ">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="gap-8 lg:grid lg:grid-cols-3 lg:col-span-2">
            <div className="mt-12 lg:mt-0">
              <h4 className="text-sm font-semibold leading-5 tracking-wider text-gray-400 uppercase">
                Resources
              </h4>
              <ul className="mt-4">
                <li>
                  <Link
                    href="/docs/overview"
                    className="text-base leading-6 text-gray-500 hover:text-gray-900"
                  >
                    Docs
                  </Link>
                </li>
                <li className="mt-4">
                  <Link
                    href="/docs/tutorial"
                    className="text-base leading-6 text-gray-500 hover:text-gray-900"
                  >
                    Learn
                  </Link>
                </li>
                <li className="mt-4">
                  <Link
                    href="/docs/guides/validation"
                    className="text-base leading-6 text-gray-500 hover:text-gray-900"
                  >
                    Guides
                  </Link>
                </li>
                <li className="mt-4">
                  <Link
                    href="/docs/api/formik"
                    className="text-base leading-6 text-gray-500 hover:text-gray-900"
                  >
                    API Reference
                  </Link>
                </li>

                <li className="mt-4">
                  <Link
                    href="/blog"
                    className="text-base leading-6 text-gray-500 hover:text-gray-900"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div className="mt-12 lg:mt-0">
              <h4 className="text-sm font-semibold leading-5 tracking-wider text-gray-400 uppercase">
                Community
              </h4>
              <ul className="mt-4">
                <li>
                  <Link
                    href="/users"
                    className="text-base leading-6 text-gray-500 hover:text-gray-900"
                  >
                    User Showcase
                  </Link>
                </li>
                <li className="mt-4">
                  <ExternalLink
                    href="https://opencollective.com/formik"
                    className="text-base leading-6 text-gray-500 hover:text-gray-900"
                  >
                    Funding
                  </ExternalLink>
                </li>
                <li className="mt-4">
                  <ExternalLink
                    href={siteConfig.discordUrl}
                    className="text-base leading-6 text-gray-500 hover:text-gray-900"
                  >
                    Community Chat
                  </ExternalLink>
                </li>
                <li className="mt-4">
                  <ExternalLink
                    href={`${siteConfig.repoUrl}/discussions`}
                    className="text-base leading-6 text-gray-500 hover:text-gray-900"
                  >
                    Project Forum
                  </ExternalLink>
                </li>
                <li className="mt-4">
                  <ExternalLink
                    href={`${siteConfig.repoUrl}/releases`}
                    className="text-base leading-6 text-gray-500 hover:text-gray-900"
                  >
                    Releases
                  </ExternalLink>
                </li>
                <li className="mt-4">
                  <ExternalLink
                    className="github-button"
                    href="https://github.com/formium/formik"
                    data-color-scheme="no-preference: light; light: light; dark: dark;"
                    data-icon="octicon-star"
                    data-size="large"
                    data-show-count="true"
                    aria-label="Star formik/formik on GitHub"
                  >
                    Star
                  </ExternalLink>
                </li>
              </ul>
            </div>
            <div className="mt-12 lg:mt-0">
              <h4 className="text-sm font-semibold leading-5 tracking-wider text-gray-400 uppercase">
                About Formium
              </h4>
              <ul className="mt-4">
                <li className="mt-4">
                  <ExternalLink
                    href="https://formium.io?utm_source=formik-site&utm_medium=footer-link&utm_campaign=formik-website"
                    className="text-base leading-6 text-gray-500 hover:text-gray-900"
                  >
                    Home
                  </ExternalLink>
                </li>
                <li className="mt-4">
                  <ExternalLink
                    href="https://github.com/formium"
                    className="text-base leading-6 text-gray-500 hover:text-gray-900"
                  >
                    GitHub
                  </ExternalLink>
                </li>
                <li className="mt-4">
                  <ExternalLink
                    href="https://twitter.com/formiumhq"
                    className="text-base leading-6 text-gray-500 hover:text-gray-900"
                  >
                    Twitter
                  </ExternalLink>
                </li>
                <li className="mt-4">
                  <ExternalLink
                    href="https://formium.io/contact/sales?utm_source=formik-site&utm_medium=footer-link&utm_campaign=formik-website"
                    className="text-base leading-6 text-gray-500 hover:text-gray-900"
                  >
                    Contact Sales
                  </ExternalLink>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 lg:mt-0">
            <h4 className="text-sm font-semibold leading-5 tracking-wider text-gray-400 uppercase">
              Subscribe to our newsletter
            </h4>
            <p className="mt-4 text-base leading-6 text-gray-500">
              The latest Formik news, articles, and resources, sent to your
              inbox.
            </p>
            <form
              action="https://api.formik.com/submit/palmerhq/formik-newsletter"
              method="post"
              className="mt-4 lg:flex lg:max-w-md"
            >
              <input type="hidden" name="_honeypot" value="" />
              <input
                aria-label="Email address"
                type="email"
                name="email"
                required={true}
                className="w-full px-4 py-2 text-base leading-6 text-gray-900 placeholder-gray-500 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md outline-none appearance-none focus:outline-none focus:ring focus:ring-blue focus:border-blue-300 lg:max-w-xs"
                placeholder="Enter your email"
              />
              <span className="inline-flex flex-shrink-0 mt-2 rounded-md shadow-sm lg:mt-0 lg:ml-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 text-base font-medium leading-6 text-white transition duration-150 ease-in-out bg-blue-600 border border-transparent rounded-md hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:ring focus:ring-blue active:bg-blue-700"
                >
                  Notify me
                </button>
              </span>
            </form>
          </div>
        </div>
        <div className="pt-8 mt-8 border-t border-gray-200 lg:flex lg:items-center lg:justify-between">
          <div className="mt-8 text-base leading-6 lg:mt-0 lg:order-1">
            <ExternalLink href="https://formium.io?utm_source=formik-site&utm_medium=footer-logo&utm_campaign=formik-website">
              <FormiumLogo />
            </ExternalLink>
            <div className="pt-1 text-xs text-gray-400">
              Copyright &copy; 2020 Formium, Inc. All rights reserved.{' '}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Footer.displayName = 'Footer';

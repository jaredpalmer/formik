import Link from 'next/link';
import * as React from 'react';
import { siteConfig } from 'siteConfig';
import { ExternalLink } from './ExternalLink';
import { FormiumLogo } from './FormiumLogo';
export interface FooterProps {}

export const Footer: React.FC<FooterProps> = props => {
  return (
    <div className="bg-gray-50 border-t border-gray-200 lg:mx-4">
      <div className="container mx-auto py-12 lg:py-16 px-4 lg:px-0 ">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:grid lg:grid-cols-3 gap-8 lg:col-span-2">
            <div className="mt-12 lg:mt-0">
              <h4 className="text-sm leading-5 font-semibold tracking-wider text-gray-400 uppercase">
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
              <h4 className="text-sm leading-5 font-semibold tracking-wider text-gray-400 uppercase">
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
              <h4 className="text-sm leading-5 font-semibold tracking-wider text-gray-400 uppercase">
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
            <h4 className="text-sm leading-5 font-semibold tracking-wider text-gray-400 uppercase">
              Subscribe to our newsletter
            </h4>
            <p className="mt-4 text-gray-500 text-base leading-6">
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
                className="appearance-none w-full px-4 py-2 outline-none border border-gray-300 text-base leading-6 rounded-md text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring focus:ring-blue focus:border-blue-300 transition duration-150 ease-in-out lg:max-w-xs"
                placeholder="Enter your email"
              />
              <span className="mt-2 lg:mt-0 lg:ml-3 flex-shrink-0 inline-flex rounded-md shadow-sm">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base leading-6 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:border-blue-700 focus:ring focus:ring-blue active:bg-blue-700 transition ease-in-out duration-150"
                >
                  Notify me
                </button>
              </span>
            </form>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 lg:flex lg:items-center lg:justify-between">
          <div className="mt-8 text-base leading-6  lg:mt-0 lg:order-1">
            <ExternalLink href="https://formium.io?utm_source=formik-site&utm_medium=footer-logo&utm_campaign=formik-website">
              <FormiumLogo />
            </ExternalLink>
            <div className="text-gray-400 text-xs pt-1">
              Copyright &copy; 2020 Formium, Inc. All rights reserved.{' '}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Footer.displayName = 'Footer';

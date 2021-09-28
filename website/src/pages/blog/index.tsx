import cn from 'classnames';
import { Banner } from 'components/Banner';
import { Footer } from 'components/Footer';
import markdownStyles from 'components/markdown.module.css';
import { Nav } from 'components/Nav';
import { Seo } from 'components/Seo';
import { Sticky } from 'components/Sticky';
import fs from 'fs';
import matter from 'gray-matter';
import { postFilePaths, POSTS_PATH } from 'lib/blog/mdxUtils';
import Link from 'next/link';
import path from 'path';

export default function Index({ posts }: any) {
  return (
    <>
      <div className="h-full min-h-full">
        <Banner />
        <Sticky>
          <Nav />
        </Sticky>
        <Seo
          title="Blog"
          description="The latest Formik news, announcements, articles, and resources."
        />
        <div className="container px-4 pt-16 pb-20 mx-auto bg-white lg:pt-24 lg:pb-28">
          <div className="relative ">
            <div>
              <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 lg:text-5xl sm:text-4xl sm:leading-10 ">
                Blog
              </h1>
              <div className="mt-3 sm:mt-4 lg:grid lg:grid-cols-2 lg:gap-5 lg:items-center">
                <p className="text-xl leading-7 text-gray-500">
                  Stories, tips, and tools to inspire you to build better
                  software. Subscribe for updates.
                </p>
                <form
                  action="https://api.formik.com/submit/palmerhq/formik-newsletter"
                  method="post"
                  className="flex mt-6 lg:mt-0 lg:justify-end"
                >
                  <input type="hidden" name="_honeypot" value="" />
                  <input
                    aria-label="Email address"
                    type="email"
                    name="email"
                    required={true}
                    className="w-full px-4 py-2 text-base leading-6 text-gray-900 placeholder-gray-500 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring focus:ring-blue focus:border-blue-300 lg:max-w-xs"
                    placeholder="Enter your email"
                  />
                  <span className="inline-flex flex-shrink-0 ml-3 rounded-md shadow-sm">
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
            <div className={markdownStyles['markdown']}>
              {posts.length === 0 && <p>There are no posts yet</p>}
              <div className="grid gap-16 pt-10 mt-6 border-t border-gray-100 lg:grid-cols-2 lg:gap-x-5 lg:gap-y-12">
                {posts.map((post: any) => {
                  return (
                    <div key={post.filePath} className="pb-6 space-y-2">
                      {post.data.date && (
                        <div className="text-sm leading-5 text-gray-500 posted">
                          <time dateTime={post.data.date}>
                            {post.data.date}
                          </time>
                        </div>
                      )}
                      <h3 className="mt-2 text-2xl font-semibold leading-7 text-gray-900">
                        <Link
                          as={`/blog/${post.filePath.replace(/\.mdx?$/, '')}`}
                          href={`/blog/[slug]`}
                        >
                          <a className="block">
                            <span className="cursor-pointer hover:underline">
                              {!post.data.published && (
                                <span className="text-white bg-black rounded-xl">
                                  Draft
                                </span>
                              )}
                              {post.data.title}
                            </span>{' '}
                          </a>
                        </Link>
                      </h3>
                      <div className="mt-3 leading-6 text-gray-500 ">
                        <div
                          className={cn(
                            markdownStyles.markdown,
                            'text-gray-500'
                          )}
                        >
                          {!post.data.preview || post.data.preview.length === 0
                            ? 'No preview available'
                            : post.data.preview}
                        </div>
                      </div>

                      <div className="mt-3">
                        <Link
                          as={`/blog/${post.filePath.replace(/\.mdx?$/, '')}`}
                          href={`/blog/[slug]`}
                        >
                          <a className="text-base font-semibold leading-6 text-blue-600 transition duration-150 ease-in-out hover:text-blue-500">
                            Read More <span aria-hidden="true">→</span>
                          </a>
                        </Link>
                      </div>
                      {/* {post.Authors.length > 0 && (
                  <div className="authors">By: {post.Authors.join(' ')}</div>
                )} */}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

export function getStaticProps() {
  const posts = postFilePaths.map(filePath => {
    const source = fs.readFileSync(path.join(POSTS_PATH, filePath));
    const { content, data } = matter(source);

    return {
      content,
      data,
      filePath,
    };
  });

  return { props: { posts } };
}

import fs from 'fs';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import imageSize from 'rehype-img-size';
import styles from 'components/markdown.module.css';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import path from 'path';
import { postFilePaths, POSTS_PATH } from 'lib/blog/mdxUtils';
import { Footer } from 'components/Footer';
import Image from 'next/image';
import { Banner } from 'components/Banner';
import { Sticky } from 'components/Sticky';
import { Nav } from 'components/Nav';
import { Seo } from 'components/Seo';
import { CustomLink } from 'components/CustomLink';

// Custom components/renderers to pass to MDX.
// Since the MDX files aren't loaded by webpack, they have no knowledge of how
// to handle import statements. Instead, you must include components in scope
// here.
const components = {
  pre: (p: any) => <div {...p} />,
  img: (props: any) => (
    // height and width are part of the props, so they get automatically passed here with {...props}
    <Image {...props} layout="responsive" loading="lazy" />
  ),
  code: dynamic(() => import('../../components/Highlight2')),
  a: CustomLink,
  Head,
};

export default function PostPage({ source, frontMatter }: any) {
  return (
    <>
      <div className="h-full min-h-full">
        <Banner />
        <Sticky className="z-20">
          <Nav />
        </Sticky>
        <Seo title={frontMatter.title + ' | Blog'} />
        <div className="container max-w-3xl px-4 pt-6 pb-12 mx-auto sm:px-6 lg:px-8 max-w-screen">
          <div className="my-10 space-y-4">
            <div className="flex items-center ">
              {frontMatter.authors && frontMatter.authors.length > 0 && (
                <div className="mr-1 text-gray-700 authors">
                  By {frontMatter.authors.join(' ')}{' '}
                </div>
              )}
              {frontMatter.date && (
                <div className="text-gray-700 posted">
                  {' '}
                  • {frontMatter.date}
                </div>
              )}
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-snug tracking-tighter text-gray-900">
              {frontMatter.title || ''}
            </h1>
          </div>
          <div className="relative">
            <div className="mx-auto">
              <div className={styles['markdown']}>
                <MDXRemote {...source} components={components} />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

export const getStaticProps = async ({ params }: any) => {
  const postFilePath = path.join(POSTS_PATH, `${params.slug}.md`);
  const source = fs.readFileSync(postFilePath);

  const { content, data } = matter(source);

  const mdxSource = await serialize(content, {
    // Optionally pass remark/rehype plugins
    mdxOptions: {
      remarkPlugins: [],
      rehypePlugins: [[imageSize, { dir: 'public' }]],
    },
    scope: data,
  });

  return {
    props: {
      source: mdxSource,
      frontMatter: data,
    },
  };
};

export const getStaticPaths = async () => {
  const paths = postFilePaths
    // Remove file extensions for page paths
    .map(path => path.replace(/\.mdx?$/, ''))
    // Map the path into the static paths object required by Next.js
    .map(slug => ({ params: { slug } }));

  return {
    paths,
    fallback: false,
  };
};

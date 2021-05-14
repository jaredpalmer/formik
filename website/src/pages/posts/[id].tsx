import { getBlocks, getDatabase, getPage } from 'lib/notionAPI';
import { renderBlock } from 'lib/renderBlock';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { Fragment } from 'react';

export default function Post({ page, blocks }) {
  if (!page || !blocks) {
    return <div />;
  }
  const name = page?.properties.Name.title[0]?.plain_text;
  return (
    <div>
      <Head>
        <title>{name}</title>
      </Head>

      <article>
        <h1>{name}</h1>
        <section>
          {blocks.map((block: any) => (
            <Fragment key={block.id}>{renderBlock(block)}</Fragment>
          ))}
          <Link href="/">
            <a>← Go home</a>
          </Link>
        </section>
      </article>
    </div>
  );
}

export const getStaticPaths = async () => {
  const database = await getDatabase('80bfda2db1664629acdedf240cb1d101');
  return {
    paths: database.map(page => ({ params: { id: page.id } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps<any, any> = async context => {
  const { id } = context.params;
  const page = await getPage(id);
  const blocks = await getBlocks(id);

  return {
    props: {
      page,
      blocks,
    },
    revalidate: 1,
  };
};

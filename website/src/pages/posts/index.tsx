import { getDatabase } from 'lib/notionAPI';
import Link from 'next/link';
import * as React from 'react';

export interface IndexProps {
  posts: any[];
}

export default function Index({ posts }: IndexProps) {
  return (
    <ol>
      {posts.map(post => {
        const date = new Date(post.last_edited_time).toLocaleString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        });
        return (
          <li key={post.id}>
            <h3>
              <Link href={`/${post.id}`}>
                <a>{post.properties.Name.title[0]?.plain_text}</a>
              </Link>
            </h3>

            <p>{date}</p>
            <Link href={`/${post.id}`}>
              <a> Read post →</a>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export const getStaticProps = async () => {
  const database = await getDatabase('80bfda2db1664629acdedf240cb1d101');
  return {
    props: {
      posts: database,
    },
    revalidate: 1,
  };
};
Index.displayName = 'Index';

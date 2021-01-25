import { NextRouter } from 'next/router';

export function getSlug({ slug }: { slug: string[] }) {
  if (!slug) {
    return { slug: '/docs/overview.md' };
  }
  if (slug[0] === 'tag') {
    return {
      tag: slug[1],
      slug: `/docs/${slug.slice(2).join('/')}`,
    };
  }
  return { slug: `/docs/${slug && slug.join('/')}` };
}

export function removeFromLast(path: string, key: string) {
  const i = path.lastIndexOf(key);
  return i === -1 ? path : path.substring(0, i);
}

export function addTagToSlug(slug: string, tag?: string) {
  return tag ? slug.replace('/docs', `/docs/tag/${tag}`) : slug;
}

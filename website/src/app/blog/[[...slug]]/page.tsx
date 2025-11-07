import { blogSource } from '@/lib/source';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import Link from 'next/link';

export default async function BlogPost(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  
  // If no slug, show blog index
  if (!params.slug || params.slug.length === 0) {
    const posts = blogSource.getPages().sort((a, b) => {
      const dateA = a.data.date instanceof Date ? a.data.date : new Date(a.data.date);
      const dateB = b.data.date instanceof Date ? b.data.date : new Date(b.data.date);
      return dateB.getTime() - dateA.getTime();
    });

    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Blog</h1>
        <div className="space-y-8">
          {posts.map((post) => (
            <article key={post.url} className="border-b pb-6">
              <Link href={post.url} className="group">
                <h2 className="text-2xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                  {post.data.title}
                </h2>
              </Link>
              <p className="text-sm text-gray-600 mb-3">
                {post.data.date instanceof Date 
                  ? post.data.date.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                  : new Date(post.data.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                {post.data.authors && post.data.authors.length > 0 && (
                  <span> • By {post.data.authors.join(', ')}</span>
                )}
              </p>
              {post.data.preview && (
                <p className="text-gray-700 mb-3">{post.data.preview}</p>
              )}
              <Link 
                href={post.url} 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Read more →
              </Link>
            </article>
          ))}
        </div>
      </div>
    );
  }
  
  // Show individual blog post
  const page = blogSource.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <article className="container mx-auto px-4 py-8 max-w-4xl">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{page.data.title}</h1>
        <div className="text-gray-600 text-sm">
          {page.data.date instanceof Date 
            ? page.data.date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })
            : new Date(page.data.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
          {page.data.authors && page.data.authors.length > 0 && (
            <span> • By {page.data.authors.join(', ')}</span>
          )}
        </div>
      </header>
      <div className="prose prose-lg max-w-none">
        <MDX components={{ ...defaultMdxComponents }} />
      </div>
    </article>
  );
}

export async function generateStaticParams() {
  return [
    { slug: undefined }, // for /blog
    ...blogSource.generateParams(),
  ];
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  
  if (!params.slug || params.slug.length === 0) {
    return {
      title: 'Blog',
      description: 'Latest updates and articles from the Formik team',
    };
  }
  
  const page = blogSource.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.preview,
  };
}

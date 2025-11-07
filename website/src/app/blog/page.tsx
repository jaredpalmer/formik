import { blogSource } from '@/lib/source';
import Link from 'next/link';

export default function BlogIndex() {
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

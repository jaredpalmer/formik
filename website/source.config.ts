import { defineDocs, defineConfig } from 'fumadocs-mdx/config';
import { z } from 'zod';

export const docs = defineDocs({
  dir: 'content/docs',
});

export const blog = defineDocs({
  dir: 'content/blog',
  schema: {
    frontmatter: z.object({
      title: z.string(),
      date: z.coerce.date(),
      published: z.boolean().optional().default(true),
      slug: z.string(),
      authors: z.array(z.string()).optional(),
      preview: z.string().optional(),
    }),
  },
});

export default defineConfig();

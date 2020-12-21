import unified from 'unified';
import github from 'remark-github';
import footnotes from 'remark-footnotes';
import toc from 'remark-toc';
import headings from 'remark-autolink-headings';
import slug from 'remark-slug';
import images from 'remark-images';
import markdown from 'remark-parse';
import shiki from 'rehype-shiki';
import r2r from 'remark-rehype';
import format from 'rehype-format';
import raw from 'rehype-raw';
import sanitize from 'rehype-sanitize';
import stringify from 'rehype-stringify';
// https://github.com/syntax-tree/hast-util-sanitize/blob/master/lib/github.json
import githubSchema from 'hast-util-sanitize/lib/github.json';
import docs from './rehype-docs';
import alerts from './remark-alerts';
// Allow className for all elements
githubSchema.attributes['*'].push('className');

const handlers = {
  // Add a className to inlineCode so we can differentiate between it and code fragments
  inlineCode(h: any, node: any) {
    return {
      ...node,
      type: 'element',
      tagName: 'code',
      properties: { className: 'inline' },
      children: [
        {
          type: 'text',
          value: node.value,
        },
      ],
    };
  },
};
const getProcessor = unified()
  .use(markdown)

  .use(slug)
  .use(headings, {
    behavior: 'append',
    linkProperties: {
      class: ['anchor'],
      title: 'Direct link to heading',
    },
  })
  .use(alerts)
  .use(toc)
  .use(footnotes)
  .use(images)
  // .use(github, { repository: 'https://github.com/jaredpalmer/formik' }) // Add custom HTML found in the markdown file to the AST
  .use(r2r, { handlers })
  // .use(raw)
  // // Sanitize the HTML
  // .use(sanitize, githubSchema)
  // // Add custom HTML found in the markdown file to the AST
  // .use(raw)
  // // Sanitize the HTML
  // .use(sanitize, githubSchema)
  .use(format)
  .use(shiki, {
    theme: 'Material-Theme-Palenight',
    useBackground: true,
  })
  .use(stringify)
  .freeze();

export async function markdownToHtml(
  md: string,
  filePath: string,
  tag?: string
) {
  try {
    // Init the processor with our custom plugin
    const processor = getProcessor().use(docs, { filePath, tag });
    const file = await processor.process(md);

    // Replace non-breaking spaces (char code 160) with normal spaces to avoid style issues
    return (file.contents as string).replace(/\xA0/g, ' ');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Markdown to HTML error: ${error}`);
    throw error;
  }
}

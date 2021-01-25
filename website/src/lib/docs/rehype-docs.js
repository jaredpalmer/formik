import { resolve } from 'url';
import visit from 'unist-util-visit';
import toString from 'mdast-util-to-string';
import GithubSlugger from 'github-slugger';
import { GITHUB_URL, REPO_NAME } from '../github/constants';

const ABSOLUTE_URL = /^https?:\/\/|^\/\//i;
const SITE_URL = /^(https?:\/\/|^\/\/)formik\.org/i;
// The headers will be updated to include a link to their hash
const HEADINGS = ['h2', 'h3', 'h4', 'h5', 'h6'];

function removeExt(path) {
  const basePath = path.split(/#|\?/)[0];
  const i = basePath.lastIndexOf('.');

  if (i === -1) return path;
  return basePath.substring(0, i) + path.substring(basePath.length);
}

function visitCard(node) {
  if (
    !node.children ||
    !node.properties ||
    !node.properties.className ||
    !node.properties.className.includes('card')
  )
    return;

  const anchor = node.children.find(n => n.tagName === 'a');

  if (!anchor || !anchor.children) return;

  const title = anchor.children.find(n => n.tagName === 'b');
  const text = anchor.children.find(n => n.tagName === 'small');

  if (!title || !text) return;

  const titleText = title.children.pop();

  // Remove `:` from the title if it ends with it
  if (titleText && titleText.value && titleText.value.endsWith(':')) {
    titleText.value = titleText.value.slice(0, -1);
  }

  title.children.push(titleText);
  anchor.children = [{ ...title, tagName: 'h4' }, text];
}

export default function rehypeDocs({ filePath, tag }) {
  const slugger = new GithubSlugger();
  const anchorSlugger = new GithubSlugger();
  // Don't use the custom tag here, relative URLs to repo files should always go to canary
  const blobUrl = `${GITHUB_URL}/${REPO_NAME}/blob/master`;

  function visitAnchor(node) {
    const props = node.properties;
    const href = props?.href;

    if (!href) return;

    props.href = href.replace(SITE_URL, '');

    const isDocs = href.startsWith('/docs') || href.startsWith('./');

    if (props.href === href) {
      const isAbsoluteUrl = ABSOLUTE_URL.test(href);
      const isHash = href[0] === '#';
      const isRepoUrl = !isHash && !isDocs;
      if (
        props.className &&
        props.className.includes &&
        props.className.includes('anchor')
      ) {
        return;
      }
      if (isAbsoluteUrl || isRepoUrl) {
        props.className = 'absolute-link';
        props.target = '_blank';
        props.rel = 'noopener noreferrer';

        if (!isAbsoluteUrl) {
          // Turn any relative URL that's not handled by the Next.js site into an absolute URL
          props.href = blobUrl + resolve(filePath, href);
        }
        return;
      }
    }

    const [relativePath, hash] = props.href.split('#');

    // Reset the slugger because single pages can have multiple urls to the same hash
    anchorSlugger.reset();
    // The URL is relative at this point
    props.className = 'relative-link';
    // Update the hash used by anchors to match the one set for headers
    props.href = hash
      ? `${relativePath}#${anchorSlugger.slug(hash)}`
      : relativePath;
    // Relative URL for another documentation route
    if (isDocs) {
      props.href = removeExt(
        tag ? props.href.replace('/docs', `/docs/tag/${tag}`) : props.href
      );
    }
  }

  function visitHeading(node) {
    const text = toString(node);

    if (!text) return;

    const id = slugger.slug(text);

    node.properties.className = 'heading';
    node.children = [
      {
        type: 'element',
        tagName: 'span',
        properties: { id },
      },
      {
        type: 'element',
        tagName: 'a',
        properties: {
          href: `#${id}`,
        },
        children: node.children,
      },
      {
        type: 'element',
        tagName: 'span',
        properties: { className: 'permalink' },
        children: [permalinkIcon],
      },
    ];
  }

  return function transformer(tree) {
    visit(tree, node => node.tagName === 'a', visitAnchor);
    // visit(tree, (node) => HEADINGS.includes(node.tagName), visitHeading);
    visit(tree, node => node.tagName === 'div', visitCard);
  };
}

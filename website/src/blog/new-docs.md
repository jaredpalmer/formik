---
title: New Docs
date: June 30, 2020
published: true
slug: new-docs
preview: |
  After a few weeks of work, I'm excited to finally release Formik's new documentation website. Formik was one of the earliest users of Facebook's [Docusaurus](https://docusaurus.io/) documentation framework. It worked great and, due to limited styling options, it helped ensure we stayed focused on the content and not on the looks. That being said, Docusaurus v1 has its shortcomings.
authors:
  - Jared Palmer
---

After a few weeks of work, I'm excited to finally release Formik's new documentation website as well as its new domain at [https://formik.org](https://formik.org).

---

![/images/blog/formik-landing-page-screenshot.png](/images/blog/formik-landing-page-screenshot.png)

Formik was one of the earliest users of Facebook's [Docusaurus](https://docusaurus.io/) documentation framework. It worked great and, due to limited styling options, it helped ensure we stayed focused on the content and not on the looks.

That being said, Docusaurus v1 has its shortcomings. First, it is truly a static site generator. It spits out pure HTML. This is great for a lot of libraries and tools, but for something like Formik, which is a React package, the inability to run modern client-side JS became frustrating. Things like in-page playgrounds or editable code-blocks were not feasible.

When it came time to give the docs a much-needed refresh, I evaluated Gatsby and Docusaurus v2, but ultimately **decided to go with [Next.js](https://nextjs.org)**. Thanks to new features like `getStaticProps`, catch-all routes, and incremental static-site generation, the Formik docs now have solid foundation upon which we can innovate going forward.

## **tl;dr**

The Formik docs are built with:

- [Next.js](https://nextjs.org/) 9.4.x + MDX
- [Notion](https://notion.so) (for powering this blog post you're reading right now)
- [Tailwind CSS](https://tailwindcss.com)
- [Algolia DocSearch](https://docsearch.algolia.com/) v3 Alpha for search

_What follows in the rest of this post is a more detailed overview of Formik's documentation stack, some of the rationale behind it, and a few cool tidbits you might find interesting._

## [Next.js](https://nextjs.org/) 9.4

I chose Next.js over alternatives such as Gatsby and Docusaurus v2 for several reasons. The biggest factor in the decision is that I believe that **documentation is part of the product**. Since some of my forthcoming SaaS dashboard and marketing sites already use Next.js, staying within the Next.js universe meant all of the codebases would work the same way, even the open source ones. This reduces cognitive overhead and makes it easier to work across applications and share components.

### **Why not Gatsby?**

[Gatsby](https://gatsbyjs.org) is a React-based static site generator with a rich plugin and theme ecosystem. Its key value proposition is a single data graph powered by [GraphQL](https://graphql.org). With respect to documentation sites, Gatsby themes—groups of plugins, layouts, and components that child themes can then inherit— are extremely useful. Given the growing number of OSS projects [we are working on](https://github.com/formik), this was seriously compelling. However, I am fairly [convinced that GraphQL is still wildly overkill for documentation and most static document-driven websites](https://jaredpalmer.com/gatsby-vs-nextjs). And yes, I am fully aware that you don't technically _need_ to use GraphQL with Gatsby, but it is definitely its happy path.

### **Why not Docusaurus v2?**

As of writing, Docusaurus v2.0 is still in alpha. The new version fixes a lot of issues with v1.0 by allowing for client-side React, plugins, and even custom themes.

The biggest issue for me with Docusaurus 2 was/is its base theme.

For many projects, Facebook's new static CSS framework for docs called [Infima](https://facebookincubator.github.io/infima/) (which Docusaurus uses and is co-developed by the same team) is fine. However, there are few things about it that really bother me.

**Mobile Navigation feels awkward**

I consistently struggle to navigate every Docusaurus v2 website on mobile. I find the floating sub-navigation to be unintuitive compared to Docusaurus v1's sub-navbar. Here's a comparison video. v1 is on the left and v2 is on the right.

<video controls="true" loop="true"><source  src="/images/blog/docusaurus-v1-vs-v2-nav.mp4" type="video/mp4" /></video>

**Infima CSS isn't easy to theme**

While Infima CSS is a complete CSS framework, it has somewhat limited theming options. Keeping the new Formik docs looking visually congruent with our enterprise SaaS app's design system also seemed like it would be challenging since we would need to bend/extend Infima CSS significantly.

**Lack of Community Themes**

Another great addition to Docusaurus in v2 is custom theming and [first-class theme component overriding (a.k.a "Swizzling")](https://v2.docusaurus.io/docs/using-themes/#swizzling-theme-components). If you've never heard of it before, component swizzling works similarly to Wordpress's template hierarchy for themes and plugins, but for React components. When you run `docusaurus swizzle <theme name> [component name]` , Docusaurus copies that component from the specified theme out of `node_modules` and into a local file in `src/theme/[component name]` . You can then make all the changes you want to that file and Docusaurus will use the "Swizzled" version instead of the base one when it builds your site.

The big downside to Swizzling is the same one that forever afflicts Wordpress child themes—it can make upgrading _much_ more complicated (especially when new features are added to the base theme). This problem is so prominent in fact, that the Docusaurus docs [currently warn **_against_** Swizzling until v2 reaches the beta stage](https://v2.docusaurus.io/docs/using-themes/#swizzling-theme-components):

> We would like to discourage swizzling of components until we've minimally reached a Beta stage. The components APIs have been changing rapidly and are likely to keep changing until we reach Beta. Stick with the default appearance for now if possible to save yourself some potential pain in future.

At this point, I spent a bit of time evaluating what it would take to write our own custom Docusaurus v2 theme for Formik, but ultimately decided against it because of the above warning. My rationale was that if I was going to go down that rabbit hole, I might as well just retain full control of the entire markdown processing pipeline with Next.js–and that's exactly what I did...

### MDX FTW

With a little bit of effort, Next.js can be great for documentation—with MDX being the secret sauce. However, getting it to feature-parity with Docusaurus will take considerable effort and is not for the faint of heart. That being said, I'm super happy with how the new docs work, how easy it is contribute to them, and the way the site looks.

![/images/blog/formik-mdx-docs-screenshot.png](/images/blog/formik-mdx-docs-screenshot.png)

Worth pointing out that Formik's new docs handle MDX slightly differently than most Next.js sites likely do. Instead of using the official `@next/mdx` plugin, I shamelessly stole Brent Vatne's [custom webpack loader](https://github.com/formik/formik/blob/master/website2/src/lib/docs/md-loader.js) from the [Expo.io](http://expo.io) docs which automagically extracts front-matter and injects a wrapper Layout component export in every .mdx file.

```tsx
const fm = require('gray-matter');

// Makes mdx in next.js much better by injecting necessary exports so that
// the docs are still readable on github
// (Shamelessly stolen from Expo.io docs)
// @see https://github.com/expo/expo/blob/master/docs/common/md-loader.js
module.exports = async function (src) {
  const callback = this.async();
  const { content, data } = fm(src);
  const layout = data.layout || 'Docs';
  const code =
    `import { Layout${layout} } from 'components/Layout${layout}';
export const meta = ${JSON.stringify(data)};
export default ({ children, ...props }) => (
  <Layout${layout} meta={meta} {...props}>{children}</Layout${layout}>
);
` + content;

  return callback(null, code);
};
```

By default, this loader injects the `LayoutDocs.tsx` layout component as a wrapper, but additional layouts can be added whenever we need them. They can be specified on a per-page basis via `layout` frontmatter key.

### Notion-powered Blog with [Static Site Generation](https://github.com/vercel/next.js/issues/9524)

Instead of using a traditional CMS or MDX, this blog you're reading right now is actually powered by [Notion](https://notion.so) and Next.js's Static Site Generation feature. We keep posts in a table in a Notion API with relevant metadata and then map Notion's undocumented API to custom React components in [./src/pages/blog/[...slug].tsx](https://github.com/formik/formik/blob/master/website2/src/pages/blog/%5B...slug%5D.tsx) . The result is amazing and a fantastic writing experience. For a more detailed example of this setup and one that you can deploy immediately, go here: [https://notion-blog.now.sh/](https://notion-blog.now.sh/)

![/images/blog/notion-cms-screenshot.png](/images/blog/notion-cms-screenshot.png)

## [**Tailwind**](https://tailwindcss.com)

I've been a fan of Atomic CSS for many many years. Tailwind is the latest and perhaps greatest of all Atomic CSS frameworks. It's flexible, it's intuitive, it looks great, and nothing beats it perf-wise (cuz it's just CSS!). Thanks to Tailwind 1.4.x, we're able to purge all extraneous class with its new `purge` feature too.

## **[Algolia DocSearch](https://docsearch.algolia.com/) v3 Alpha**

I accidentally discovered the new version of docsearch.js while working on the docs and it's even better than I could have ever imagined. It has a cool omnibar and even keeps track of recent searches and favorites.

![/images/blog/algolia-docsearch-screenshot.png](/images/blog/algolia-docsearch-screenshot.png)

Overall, I'm pretty happy with the new docs site. For the first time in a while, I'm excited to write docs again. There's still a decent amount of features still missing, but I'm very happy with the end-user experience and the developer experience that this stack provides. Next.js gives us a great foundation for building more app-like features into the docs site. The first of these will be a brand new interactive tutorial as well as a new searchable example and boilerplate directory. As always, if you're interested helping out or diving deeper, the [full source code of the new docs is available on GitHub](https://github.com/formik/formik).

So with that, go poke around, but be gentle. If you find any bugs, [file an issue.](https://github.com/formik/formik/issues/new?template=Bug_report.md) With this new Notion-powered blog, I'll be posting a lot more often, so enter your email and slap that subscribe button in the footer to join the Formik mailing list.

-J

## September 2021 Update

Since writing this post, Notion now has a public API. However, we ultimately ended up switching to MDX for blog content as well.

The problem we ran into with Notion is that docs builds would fail on PRs made by external contributors without approval. This is because using Notion as a CMS requires a secret API token which Vercel rightfully does not allow access to for PR deployments made by developers from outside of an organization. This really isn't specific to Notion, but would be the same for any headless CMS used to power a blog on an OSS project. It made browsing Formik's issues difficult on GitHub, since every PR would fail out of the box. Furthermore, it's not an awesome experience for new contributors to see a red X even though they didn't do anything wrong.

At this point, we could have either moved the blog to its own repo or site, but we decided it was just easier to drop Notion for good ol' MDX and keep everything inside the codebase.

In addition to Notion's public API, Docusaurus v2 has updated and improved its mobile navigation. It's worth checking it out along with another project called [Nextra](https://nextra.vercel.app) which is like Docusaurus, but powered by Next.js. If I were to rewrite the Formik docs again today, I would likely fork `nextra-theme-docs`.

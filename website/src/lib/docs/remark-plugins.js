module.exports = [
  require('remark-slug'),
  require('./remark-paragraph-alerts'),
  [
    require('remark-autolink-headings'),
    {
      behavior: 'append',
      linkProperties: {
        class: ['anchor'],
        title: 'Direct link to heading',
      },
    },
  ],
  require('./remark-alerts'),
  [
    require('remark-toc'),
    {
      skip: 'Reference',
      maxDepth: 6,
    },
  ],
  require('remark-emoji'),
  require('remark-footnotes'),
  require('remark-images'),
];

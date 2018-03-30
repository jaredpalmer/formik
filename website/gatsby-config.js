module.exports = {
  pathPrefix: '/formik',
  siteMetadata: {
    siteName: `Formik`,
  },
  plugins: [
    `gatsby-plugin-glamor`,
    `gatsby-plugin-react-next`,
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        path: `${__dirname}/src/pages`,
        name: 'pages',
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/../docs/`,
        name: `pages`,
      },
    },

    // `gatsby-plugin-offline`,
    `gatsby-plugin-typescript`,
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          'gatsby-remark-autolink-headers',
          'gatsby-remark-prismjs',
          'gatsby-remark-copy-linked-files',
          'gatsby-remark-smartypants',
        ],
      },
    },
  ],
};

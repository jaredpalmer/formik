const path = require('path');
const webpack = require('webpack');
// @todo when online
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

exports.modifyWebpackConfig = ({ config, stage }) => {
  // See https://github.com/FormidableLabs/react-live/issues/5
  // See https://github.com/facebook/react/blob/master/www/gatsby-node.js
  config.plugin('ignore', () => new webpack.IgnorePlugin(/^(xor|props)$/));

  config.merge({
    resolve: {
      root: path.resolve(__dirname, './src'),
      extensions: ['', '.js', '.jsx', '.tsx', '.ts', '.json'],
    },
    plugins: [
      // new ForkTsCheckerWebpackPlugin({
      //   checkSyntacticErrors: true,
      //   formatter: 'codeframe',
      //   tslint: './tslint.json',
      //   watch: './src',
      //   workers: 2,
      // }),
    ],
  });
  return config;
};

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators;

  return new Promise((resolve, reject) => {
    const blogPost = path.resolve('./src/templates/md.tsx');
    const blogPostQuery = `
        {
          allMarkdownRemark(limit: 1000) {
            edges {
              node {
                frontmatter {
                  path,
                  title
                }
              }
            }
          }
        }
      `;

    resolve(
      graphql(blogPostQuery).then(result => {
        if (result.errors) {
          reject(result.errors);
        }

        result.data.allMarkdownRemark.edges.forEach(edge => {
          createPage({
            path: edge.node.frontmatter.path,
            component: blogPost,
            context: {
              pathname: edge.node.frontmatter.path,
            },
          });
        });
      })
    );
  });
};

// exports.onCreatePage = ({ page, boundActionCreators }) => {
//   const { createPage, deletePage } = boundActionCreators;

//   return new Promise((resolve, reject) => {
//     // Remove trailing slash
//     const oldPath = page.path;
//     page.path = page.path === `/` ? page.path : page.path.replace(/\/$/, ``);
//     if (page.path !== oldPath) {
//       // Remove the old page
//       deletePage({ path: oldPath });

//       // Add the new page
//       createPage(page);
//     }

//     resolve();
//   });
// };

/**
 * Copyright 2017-present Jared Palmer.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @format
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(`${process.cwd()}/siteConfig.js`);

function docUrl(doc, language) {
  return `${siteConfig.baseUrl}docs/${
    language && language !== 'en' ? `${language}/` : ''
  }${doc}`;
}

class Help extends React.Component {
  render() {
    const language = this.props.language || '';
    const supportLinks = [
      {
        content: `Learn more using the [documentation on this site.](${docUrl(
          'overview.html',
          language
        )})`,
        title: 'Browse Docs',
      },
      {
        content:
          'Ask questions about the documentation and project on [Spectrum.chat](https://spectrum.chat/palmer) or [Reactiflux Discord](https://discord.gg/cU6MCve)',
        title: 'Join the community',
      },
      {
        content:
          "Find out what's new with this project. Follow [@jaredpalmer](https://twitter.com/jaredpalmer) and [@eonwhite](https://twitter.com/eonwhite) on Twitter",
        title: 'Stay up to date',
      },
    ];

    return (
      <div className="docMainWrapper wrapper">
        <Container className="mainContainer documentContainer postContainer">
          <div className="post">
            <header className="postHeader">
              <h1>Need help?</h1>
            </header>
            <p>This project is maintained by a dedicated group of people.</p>
            <GridBlock contents={supportLinks} layout="threeColumn" />
          </div>
        </Container>
      </div>
    );
  }
}
Help.title = 'Help';
Help.description = 'Get Help with Formik.';
module.exports = Help;

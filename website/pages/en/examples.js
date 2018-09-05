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
const SideNav = CompLibrary.SideNav;

const siteConfig = require(`${process.cwd()}/siteConfig.js`);

function docUrl(doc, language) {
  return `${siteConfig.baseUrl}docs/${language ? `${language}/` : ''}${doc}`;
}
class BlogSidebar extends React.Component {
  render() {
    const contents = [
      {
        name: 'Examples',
        links: [
          {
            title: 'Basic',
            id: 'Basic',
            permalink: '/examples/basic.html',
          },
          {
            title: 'Basic',
            id: 'Basic',
            permalink: '/examples/basic.html',
          },
        ],
      },
    ];
    const title = this.props.current && this.props.current.title;

    const current = {
      id: title || 'basic',
      category: 'blogSidebarTitle',
    };
    return (
      <div>
        <iframe
          src="https://codesandbox.io/embed/zkrk5yldz?fontsize=13"
          style={{
            display: 'block',
            width: '100%',
            border: 0,
            height: '100vh',
          }}
          sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"
        />
        <div className="docMainWrapper wrapper">
          <Container className="mainContainer" id="docsNav" wrapper={false} />
        </div>
      </div>
    );
  }
}

module.exports = BlogSidebar;

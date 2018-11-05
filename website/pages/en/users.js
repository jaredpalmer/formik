/**
 * Copyright 2017-present Jared Palmer.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @format
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const Container = CompLibrary.Container;

const siteConfig = require(`${process.cwd()}/siteConfig.js`);

class Users extends React.Component {
  render() {
    if ((siteConfig.users || []).length === 0) {
      return null;
    }

    const editUrl = `${siteConfig.repoUrl}/edit/master/website/siteConfig.js`;
    const showcase = siteConfig.users.map(user => (
      <a href={user.infoLink} key={user.infoLink}>
        <img
          src={user.image}
          alt={user.caption}
          title={user.caption}
          style={user.style}
        />
      </a>
    ));

    return (
      <div className="mainContainer">
        <Container padding={['bottom']}>
          <div className="showcaseSection">
            <div className="prose">
              <h1>Who's using Formik?</h1>
              <p>
                Formik has been powering forms at{' '}
                <a href="http://www.palmer.net">The Palmer Group</a> since 2016.
                Formik was open sourced in 2017 and is used by teams of all
                sizes.
              </p>
            </div>
            <div className="logos">{showcase}</div>
            <p>Are you using this Formik?</p>
            <a href={editUrl} className="button">
              Add your company
            </a>
          </div>
        </Container>
      </div>
    );
  }
}

Users.title = 'Users';
Users.description = 'Companies and Projects Using Formik in Production.';
module.exports = Users;

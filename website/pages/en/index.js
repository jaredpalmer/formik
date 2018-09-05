/**
 * Copyright 2018-present Facebook.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * @format
 */

const React = require('react');
const CompLibrary = require('../../core/CompLibrary');

const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(`${process.cwd()}/siteConfig.js`);

class Index extends React.Component {
  render() {
    if ((siteConfig.users || []).length === 0) {
      return null;
    }

    const editUrl = `${siteConfig.repoUrl}/edit/master/website/siteConfig.js`;
    const showcase = siteConfig.users.filter(u => !!u.pinned).map(user => (
      <a href={user.infoLink} key={user.infoLink}>
        <img src={user.image} alt={user.caption} title={user.caption} />
      </a>
    ));
    return (
      <div>
        <div className="splash">
          <div className="content">
            <h1>Formik</h1>
            <h2>Build forms in React, without tears.</h2>
            <div className="row">
              <a className="btn primary" href="/formik/docs/overview">
                Get Started
              </a>
              <a className="btn" href="https://github.com/jaredpalmer/formik">
                GitHub
              </a>
            </div>
            {/* <img
              src="/img/splash.png"
              srcSet="/img/splash.png 1x, /img/splash@2x.png 2x"
              className="splashScreen"
            /> */}
            <div className="shadow" />
          </div>
        </div>
        {/* <div className="content row">
          <div className="col">
            <img
              src="/img/inspector.png"
              srcSet="/img/inspector.png 1x, /img/inspector@2x.png 2x"
            />
          </div>
          <div className="col">
            <h3>Declarative</h3>
            <p>
              Formik is a small collection declarative React components that
              make it painless to create rich, complex forms. Formik takes care
              of the repetitive and annoying stuff--keeping track of
              values/errors/visited fields, orchestrating validation, and
              handling submission--so you don't have to. This means you spend
              less time wiring up state and change handlers and more time
              focusing on your business logic.
            </p>
            <a className="learnmore" href="/docs/getting-started.html">
              Learn more
            </a>
          </div>
        </div>
        <div className="content row">
          <div className="col">
            <h3>Intuitive</h3>
            <p>
              Formik doesn't use fancy subscriptions or observables under the
              hood, just plain React state and props. By staying within the core
              React framework and away from magic, Formik makes debugging,
              testing, and reasoning about your forms a breeze. If you know
              React, and you know a bit about forms, you know Formik!
            </p>
            <a className="learnmore" href="/docs/understand.html">
              Learn more
            </a>
          </div>
          <div className="col center">
            <img
              src="/img/FlipperKit.png"
              srcSet="/img/FlipperKit.png 1x, /img/FlipperKit@2x.png 2x"
            />
          </div>
        </div>
        <div className="content row">
          <div className="col">
            <img
              src="/img/plugins.png"
              srcSet="/img/plugins.png 1x, /img/plugins@2x.png 2x"
            />
          </div>
          <div className="col">
            <h3>Adoptable</h3>
            <p>
              Form state is inherently local and ephemeral. Unlike other form
              helpers, Formik does not use external state mangement librares
              like Redux or MobX to store form state. This makes Formik is easy
              to adopt incrementally and keeps its bundle size to just 7.5 KB
              minified gzipped.
            </p>
            <a className="learnmore" href="/docs/js-setup.html">
              Learn more
            </a>
          </div>
        </div>
        <div className="content row">
          <div className="col">
            <h3>Cross Platform</h3>
            <p>
              Formik doesn’t make assumptions about how or where you render or
              style your inputs, so it works anywhere and everywhere React does
              and with any 3rd party input component you can throw at it.
            </p>
            <a className="learnmore" href="/docs/js-setup.html">
              Learn more
            </a>
          </div>
          <div className="col">
            <img
              src="/img/plugins.png"
              srcSet="/img/plugins.png 1x, /img/plugins@2x.png 2x"
            />
          </div>
        </div> */}

        <div style={{ background: '#eee' }}>
          <Container padding={['bottom', 'top']}>
            <GridBlock
              align="center"
              contents={[
                {
                  content: 'James Long, Creator of Prettier',
                  // image: `${siteConfig.baseUrl}img/hector-ramos.png`,
                  // imageAlign: 'bottom',
                  // imageAlt: 'James Long',
                  title:
                    "*I can't believe people ever put forms in Redux, or did anything else other than this.*",
                },
                {
                  content: `Kye Hohenberger, Creator of Emotion`,
                  // image: `${siteConfig.baseUrl}img/ricky-vetter.jpg`,
                  // imageAlign: 'bottom',
                  // imageAlt: 'Kye Hohenberger',
                  title: `*Formik removes most of the moving parts involved in forms
                    allowing me to move faster with more confidence.*`,
                },
                {
                  content:
                    'Ken Wheeler, Director of Open Source at Formidable Labs',
                  // image: `${siteConfig.baseUrl}img/christopher-chedeau.jpg`,
                  // imageAlign: 'bottom',
                  // imageAlt: 'Ken Wheeler',
                  title: `*Formik. All day. All long.*`,
                },
              ]}
              layout="threeColumn"
            />
          </Container>
        </div>

        <div
          className="showcaseSection"
          style={{ marginBottom: 80, marginTop: 80 }}
        >
          <div className="prose">
            <h2>Who's using Formik?</h2>
            <p>
              Formik has been powering forms at{' '}
              <a href="https://www.palmer.net">The Palmer Group</a> since 2016.
              Formik was open sourced in 2017 and is used by teams of all sizes.
            </p>
          </div>
          <div className="logos">{showcase}</div>
          <a className="btn" href="/formik/users.html">
            More Formik Users
          </a>
        </div>
      </div>
    );
  }
}

module.exports = Index;

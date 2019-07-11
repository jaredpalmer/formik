/**
 * Copyright 2018-present Jared Palmer.
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
    const showcase = siteConfig.users
      .filter(u => !!u.pinned)
      .map(user => (
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
      <div>
        <div className="splash">
          <div className="content">
            <svg width={326} height={105} viewBox="0 0 261 84" fill="none">
              <path
                d="M83.37 59c-.313 0-.595-.11-.846-.329a1.252 1.252 0 0 1-.329-.846V27.322c0-.345.11-.627.329-.846.22-.25.501-.376.846-.376h21.855c.345 0 .627.125.846.376.251.22.376.501.376.846v4.982c0 .345-.125.627-.376.846-.219.22-.501.329-.846.329H90.843v6.533h13.442c.345 0 .627.125.846.376.251.22.376.501.376.846v4.982c0 .345-.125.627-.376.846-.219.22-.501.329-.846.329H90.843v10.434c0 .313-.11.595-.329.846-.22.22-.501.329-.846.329H83.37zm41.417.47c-4.449 0-7.959-1.081-10.528-3.243-2.569-2.162-3.932-5.342-4.089-9.541-.031-.877-.047-2.225-.047-4.042 0-1.817.016-3.18.047-4.089.125-4.136 1.488-7.316 4.089-9.541 2.632-2.256 6.141-3.384 10.528-3.384 4.355 0 7.833 1.128 10.434 3.384 2.632 2.225 4.011 5.405 4.136 9.541.063 1.817.094 3.18.094 4.089 0 .94-.031 2.287-.094 4.042-.157 4.199-1.52 7.379-4.089 9.541-2.538 2.162-6.032 3.243-10.481 3.243zm0-7.05c1.629 0 2.93-.486 3.901-1.457.971-1.003 1.488-2.522 1.551-4.559.063-1.817.094-3.118.094-3.901 0-.783-.031-2.052-.094-3.807-.063-2.037-.58-3.54-1.551-4.512-.971-1.003-2.272-1.504-3.901-1.504-1.661 0-2.977.501-3.948 1.504-.971.971-1.488 2.475-1.551 4.512-.031.877-.047 2.146-.047 3.807 0 1.692.016 2.992.047 3.901.063 2.037.58 3.556 1.551 4.559.971.971 2.287 1.457 3.948 1.457zM145.93 59a1.25 1.25 0 0 1-.846-.329 1.248 1.248 0 0 1-.329-.846V27.322c0-.345.109-.627.329-.846.219-.25.501-.376.846-.376h12.925c4.136 0 7.363.94 9.682 2.82 2.35 1.88 3.525 4.528 3.525 7.943 0 2.193-.517 4.058-1.551 5.593-1.003 1.535-2.397 2.726-4.183 3.572l6.345 11.468c.094.188.141.36.141.517 0 .25-.094.486-.282.705a.957.957 0 0 1-.705.282H165.2c-.909 0-1.551-.423-1.927-1.269l-5.17-10.199h-4.512v10.293c0 .345-.126.627-.376.846-.22.22-.502.329-.846.329h-6.439zm12.878-18.377c1.347 0 2.365-.329 3.055-.987.72-.69 1.081-1.63 1.081-2.82s-.361-2.146-1.081-2.867c-.69-.72-1.708-1.081-3.055-1.081h-5.217v7.755h5.217zM178.656 59c-.344 0-.642-.11-.893-.329-.219-.22-.329-.501-.329-.846V27.322c0-.345.11-.627.329-.846.251-.25.549-.376.893-.376h5.311c.784 0 1.348.345 1.692 1.034l8.084 14.476 8.131-14.476c.345-.69.909-1.034 1.692-1.034h5.311c.345 0 .627.125.846.376.251.22.376.501.376.846v30.503c0 .345-.125.627-.376.846-.219.22-.501.329-.846.329h-5.969c-.313 0-.595-.11-.846-.329a1.253 1.253 0 0 1-.329-.846V40.717l-5.076 9.306c-.407.72-.955 1.081-1.645 1.081h-2.538c-.626 0-1.175-.36-1.645-1.081l-5.029-9.306v17.108c0 .345-.125.627-.376.846-.219.22-.501.329-.846.329h-5.922zm39.013 0c-.313 0-.595-.11-.846-.329a1.253 1.253 0 0 1-.329-.846v-30.55c0-.345.11-.627.329-.846.251-.22.533-.329.846-.329h6.721c.345 0 .627.11.846.329.219.22.329.501.329.846v30.55c0 .313-.11.595-.329.846-.219.22-.501.329-.846.329h-6.721zm15.468 0a1.25 1.25 0 0 1-.846-.329 1.248 1.248 0 0 1-.329-.846V27.322c0-.345.109-.627.329-.846.219-.25.501-.376.846-.376h6.298c.344 0 .626.125.846.376.219.22.329.501.329.846v10.246l8.319-10.528c.344-.627.955-.94 1.833-.94h7.191c.25 0 .47.11.658.329.219.188.329.407.329.658 0 .25-.063.439-.188.564l-10.951 14.194 11.844 15.604c.125.125.188.313.188.564 0 .25-.11.486-.329.705a.957.957 0 0 1-.705.282h-7.379c-.502 0-.909-.094-1.222-.282-.314-.22-.533-.439-.658-.658l-8.93-11.468v11.233c0 .313-.11.595-.329.846-.22.22-.502.329-.846.329h-6.298zM38.869 0l9.694 5.575-38.176 21.953-9.694-5.574L38.869 0zM48.954 6.745L11.018 28.551l-.001 11.032 37.936-21.805V6.745zM33.699 28.276l-22.601 12.99-.002 11.034 22.601-12.992.002-11.032zM25.035 45.717l-13.99 8.042-.002 11.033 13.99-8.042.002-11.033zM.004 23.017l9.75 5.605-.003 11.035L0 34.053l.004-11.036zM.097 35.657l9.632 5.537-.004 11.035-9.632-5.536.004-11.036zM.092 48.221l9.636 5.539-.004 11.763-9.636-5.539.004-11.763zM21.564 84l-9.694-5.575 37.743-21.704 9.694 5.575L21.564 84zM11.102 77.471l37.879-21.773.001-11.032-37.879 21.773-.001 11.032zM26.3 55.974l22.601-12.992.001-11.032-22.6 12.99-.002 11.034zM34.964 38.532l13.99-8.042.002-11.033-13.99 8.042-.002 11.033zM59.996 61.306l-9.75-5.605.003-11.035L60 50.271l-.004 11.035zM59.904 48.595l-9.633-5.537.004-11.035 9.633 5.536-.004 11.036zM59.908 36.03l-9.636-5.538.004-11.552 9.636 5.539-.004 11.552z"
                fill="#fff"
              />
            </svg>

            <div className="relative">
              <h1>Formik</h1>
              <h2>Build forms in React, without the tears.</h2>
              <div className="row">
                <a className="btn primary" href="/formik/docs/overview">
                  Get Started
                </a>
                <a
                  className="btn ghost"
                  href="https://github.com/jaredpalmer/formik"
                >
                  GitHub
                </a>
              </div>
            </div>

            <div className="shadow" />
          </div>
        </div>
        <div>
          <Container padding={['bottom', 'top']}>
            <GridBlock
              align="left"
              contents={[
                {
                  title: 'Declarative',
                  content: `Formik takes care
                  of the repetitive and annoying stuff--keeping track of
                  values/errors/visited fields, orchestrating validation, and
                  handling submission--so you don't have to. This means you spend
                  less time wiring up state and change handlers and more time
                  focusing on your business logic.`,
                },
                {
                  title: 'Intuitive',
                  content: `No fancy subscriptions or observables under the
                  hood, just plain React state and props. By staying within the core
                  React framework and away from magic, Formik makes debugging,
                  testing, and reasoning about your forms a breeze. If you know
                  React, and you know a bit about forms, you know Formik!`,
                },
                {
                  title: 'Adoptable',
                  content: `Since form state is inherently local and ephemeral, Formik 
                  does not use external state management libraries like Redux or MobX.
                  This also makes Formik easy to adopt incrementally and keeps bundle
                  size to a minimum.`,
                },
              ]}
              layout="threeColumn"
            />
          </Container>
        </div>
        <div className="quotes">
          <Container padding={['bottom', 'top']}>
            <GridBlock
              align="left"
              contents={[
                {
                  content:
                    'Ken Wheeler, Director of Open Source at Formidable Labs',
                  // image: `${siteConfig.baseUrl}img/christopher-chedeau.jpg`,
                  // imageAlign: 'bottom',
                  // imageAlt: 'Ken Wheeler',
                  title: `*"Formik. All day. All long."*`,
                },
                {
                  content: 'James Long, Creator of Prettier',
                  // image: `${siteConfig.baseUrl}img/hector-ramos.png`,
                  // imageAlign: 'bottom',
                  // imageAlt: 'James Long',
                  title:
                    '*"I can\'t believe people ever put forms in Redux, or did anything else other than this."*',
                },
              ]}
              layout="twoColumn"
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
              <a href="http://www.palmer.net">The Palmer Group</a> since 2016.
              Formik was open sourced in 2017 and is used by teams of all sizes.
            </p>
          </div>
          <div className="logos" style={{ marginBottom: 40 }}>
            {showcase}
          </div>
          <a className="btn" href="/formik/users.html">
            More Formik Users
          </a>
        </div>
        <div style={{ background: '#283447' }}>
          <div className="center" style={{ paddingBottom: 40, paddingTop: 40 }}>
            <div className="row">
              <a className="btn primary" href="/formik/docs/overview">
                Get Started
              </a>
              <a
                className="btn ghost"
                href="https://github.com/jaredpalmer/formik"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Index.description = 'Build forms in React, without the tears.';
module.exports = Index;

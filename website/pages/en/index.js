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
    const showcase = siteConfig.users.filter(u => !!u.pinned).map(user => (
      <a href={user.infoLink} key={user.infoLink}>
        <img src={user.image} alt={user.caption} title={user.caption} />
      </a>
    ));
    return (
      <div>
        <div className="splash">
          <div className="content">
            <svg
              viewBox="0 0 145 127"
              aria-hidden="true"
              style={{
                height: 145 * 3,
                height: 127 * 3,
                position: 'absolute',
                right: '36%',
                bottom: 30,
                opacity: 0.03,
              }}
            >
              <g id="Stickers" fill="none" fillRule="evenodd">
                <g
                  id="Artboard-2-Copy-2"
                  transform="translate(-9 -14)"
                  fillRule="nonzero"
                  stroke="#FFF"
                  strokeWidth="2.143"
                >
                  <path
                    d="M150.823574,31.375 C150.798156,31.3541707 120.541046,16.0476098 120.541046,16.0476098 C120.401999,16.0297561 12.4485414,16 12.4485414,16 C12.0882131,16.215732 12.0613007,16.2201955 12.0478444,16.2425126 C12.0313979,16.3838543 12,31.7097566 12,31.7097566 C12.1226013,31.9790497 12.1495138,32.0192205 12.1973582,32.0534401 C12.2182902,32.069806 40.7858941,46.5268289 40.7858941,46.5268289 L12.4485414,46.5268289 C12.0897083,46.7440488 12.0627958,46.7485122 12.0493396,46.7708293 C12.032893,46.9106832 12.0014951,62.2365855 12.0014951,62.2365855 C12.1240965,62.5058787 12.1510089,62.5460494 12.1988534,62.580269 C12.2197853,62.5966349 40.7873892,77.0536578 40.7873892,77.0536578 L12.4485414,77.0536578 C12.0897083,77.2708777 12.0627958,77.2753411 12.0493396,77.2976582 C12.032893,77.4375121 12.0014951,92.7634145 12.0014951,92.7634145 C12.1240965,93.0327076 12.1510089,93.0728784 12.1988534,93.1070979 C12.2197853,93.1234638 40.7873892,107.580487 40.7873892,107.580487 L12.4485414,107.580487 C12.0882131,107.797707 12.0613007,107.80217 12.0478444,107.824487 C12.0313979,107.964341 12,123.290243 12,123.290243 C12.1226013,123.559536 12.1495138,123.599707 12.1973582,123.633927 C12.2182902,123.650293 42.4574585,138.95239 42.4574585,138.95239 C42.5217494,138.985122 93.0912488,139 93.0912488,139 C93.3379466,139 93.5397902,138.800634 93.5397902,138.553658 L93.5397902,123.293219 C93.4171889,123.022438 93.3902764,122.983755 93.3409368,122.949536 C93.3200049,122.93317 63.0823317,107.629584 63.0823317,107.629584 C62.9417887,107.611731 43.1093387,107.581975 43.1093387,107.581975 L43.1093387,93.2112444 L121.821354,93.2112444 C122.068051,93.2112444 122.269895,93.0118783 122.269895,92.7649023 L122.269895,77.5 C122.147294,77.2307069 122.120381,77.1905361 122.071042,77.1563165 C122.05011,77.1399506 91.8109415,61.839341 91.8109415,61.839341 C91.6718936,61.8214873 42.7684472,61.7917312 42.7684472,61.7917312 L14.3219495,47.4195133 L42.6607973,47.4195133 L120.340698,47.4195133 L150.551459,47.4195133 C150.798156,47.4195133 151,47.2201471 151,46.9731711 L151,31.7097566 C150.863942,31.406244 150.847496,31.3943415 150.823574,31.375 Z M12.8970829,17.1709043 L42.2122558,31.9835132 L42.2122558,46.2456333 L12.8970829,31.4345123 L12.8970829,17.1709043 Z M42.7684472,31.2634145 L14.3219495,16.8911965 L120.231553,16.8911965 L148.67506,31.2634145 L42.7684472,31.2634145 Z M91.5014479,62.6829277 L119.94645,77.0536578 L43.1093387,77.0536578 L43.1093387,62.6829277 L91.5014479,62.6829277 Z M62.771343,108.474659 L91.2163456,122.846877 L42.7684472,122.846877 L14.3219495,108.474659 L42.6607973,108.474659 L62.771343,108.474659 Z M12.8970829,108.754367 L42.2122558,123.566976 L42.2122558,137.829096 L12.8970829,123.017975 L12.8970829,108.754367 Z M43.1093387,123.738073 L92.6427073,123.738073 L92.6427073,138.108803 L43.1093387,138.108803 L43.1093387,123.738073 Z M12.8970829,78.2260499 L42.2122558,93.0386588 L42.2122558,107.300779 L12.8970829,92.4896579 L12.8970829,78.2260499 Z M14.3219495,77.9463422 L121.371317,77.9463422 L121.371317,92.3185601 L42.7684472,92.3185601 L14.3219495,77.9463422 Z M42.2122558,76.7739501 L12.8970829,61.962829 L12.8970829,47.699221 L42.2122558,62.5118299 L42.2122558,76.7739501 Z M43.1093387,46.5268289 L43.1093387,32.1560988 L150.102917,32.1560988 L150.102917,46.5268289 L120.339203,46.5268289 L43.1093387,46.5268289 Z"
                    id="Shape"
                  />
                </g>
              </g>
            </svg>
            <div className="relative">
              <h1 style={{ fontWeight: 800 }}>Formik</h1>
              <h2>Build forms in React, without tears.</h2>
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
                  content: `Since form state is inherently local and ephemeral, Formik does not use external state mangement librares
                  like Redux or MobX. This also makes Formik is easy
                  to adopt incrementally and keeps bundle size to a minimum.`,
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
          <div className="logos">{showcase}</div>
          <a className="btn" href="/formik/users.html">
            More Formik Users
          </a>
        </div>
        <div style={{ background: '#222' }}>
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

module.exports = Index;

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

class Footer extends React.Component {
  docUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    return `${baseUrl}docs/${doc}`;
  }

  pageUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    return baseUrl + doc;
  }

  render() {
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            {this.props.config.footerIcon && (
              <img
                src={this.props.config.baseUrl + this.props.config.footerIcon}
                alt={this.props.config.title}
                width="66"
                height="58"
              />
            )}
          </a>
          <div>
            <h5>Docs</h5>
            <a href={this.docUrl('overview', this.props.language)}>
              Getting Started
            </a>
            <a href={this.docUrl('guides/validation', this.props.language)}>
              Guides
            </a>
            <a href={this.docUrl('api/formik', this.props.language)}>
              API Reference
            </a>
          </div>
          <div>
            <h5>Community</h5>
            <a href={this.pageUrl('users', this.props.language)}>
              User Showcase
            </a>
            <a
              href="http://stackoverflow.com/questions/tagged/formik"
              target="_blank"
              rel="noreferrer noopener"
            >
              Stack Overflow
            </a>
            <a
              href="https://discord.gg/cU6MCve"
              target="_blank"
              rel="noreferrer noopener"
            >
              Project Chat
            </a>
            <a
              href="https://twitter.com/jaredpalmer"
              target="_blank"
              rel="noreferrer noopener"
            >
              Twitter
            </a>
          </div>
          <div>
            <h5>More</h5>
            <a href={`${this.props.config.baseUrl}blog`}>Blog</a>
            <a href="https://github.com/jaredpalmer/formik">GitHub</a>
            <a
              className="github-button"
              href={this.props.config.repoUrl}
              data-icon="octicon-star"
              data-count-href="/jaredpalmer/formik/stargazers"
              data-show-count="true"
              data-count-aria-label="# stargazers on GitHub"
              aria-label="Star this project on GitHub"
            >
              Star
            </a>
          </div>
        </section>

        <a
          href="https://palmer.net/open-source"
          target="_blank"
          rel="noreferrer noopener"
          className="fbOpenSource"
        >
          {/* <img
            src={`${this.props.config.baseUrl}img/oss_logo.png`}
            alt="The Palmer Group Open Source"
            width="170"
            height="45"
          /> */}
          <IconPalmer size={1} viewBox="0 0 582 708" />
        </a>
        <section className="copyright">{this.props.config.copyright}</section>
      </footer>
    );
  }
}

function IconPalmer({ size = 1, ...props }) {
  return (
    <svg width={size * 58} height={size * 71} {...props}>
      <title>{'Group'}</title>
      <defs>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="prefix__a">
          <stop stopColor="#D8D8D8" offset="0%" />
          <stop stopColor="#FFF" offset="100%" />
        </linearGradient>
        <linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="prefix__b">
          <stop stopColor="#FFF" offset="0%" />
          <stop stopColor="#FFF" offset="100%" />
        </linearGradient>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="prefix__c">
          <stop stopColor="#D8D8D8" offset="0%" />
          <stop stopColor="#FFF" offset="100%" />
        </linearGradient>
      </defs>
      <g fill="none" fillRule="evenodd">
        <path
          d="M0 707.023v-80.754h32.918c4.83 0 9.147.676 12.948 2.027 3.8 1.352 7.021 3.257 9.662 5.716 2.64 2.46 4.671 5.397 6.094 8.813 1.423 3.417 2.135 7.208 2.135 11.376v.225c0 4.693-.843 8.804-2.528 12.333s-4.007 6.485-6.965 8.869c-2.959 2.384-6.413 4.177-10.364 5.378-3.951 1.201-8.192 1.802-12.724 1.802H17.695v24.215H0zm17.695-40.04h14.043c4.457 0 7.911-1.172 10.364-3.519 2.453-2.346 3.68-5.246 3.68-8.7v-.226c0-3.98-1.283-7.01-3.848-9.094-2.566-2.084-6.077-3.126-10.533-3.126H17.695v24.666zm71.415 40.04l34.547-81.317h16.29l34.547 81.317h-18.537l-7.36-18.133h-34.04l-7.36 18.133H89.11zm31.738-33.788h21.402l-10.673-26.186-10.729 26.186zm85.178 33.788v-80.754h17.695v64.592h40.164v16.162h-57.86zm90.346 0v-80.754h19.099l21.177 34.182 21.178-34.182h19.099v80.754h-17.639v-52.71l-22.638 34.464h-.45l-22.469-34.126v52.372h-17.357zm118.994 0v-80.754h60.724v15.824h-43.142v16.387h37.974v15.768h-37.974v16.95h43.76v15.825h-61.342zm96.244 0v-80.754h36.794c10.186 0 18.013 2.74 23.48 8.222 4.607 4.618 6.91 10.756 6.91 18.414v.282c0 6.532-1.592 11.854-4.775 15.965-3.183 4.11-7.34 7.124-12.47 9.038l19.66 28.833h-20.728l-17.245-25.848h-13.931v25.848H511.61zm17.695-41.503h17.975c4.382 0 7.743-1.042 10.084-3.126 2.34-2.083 3.51-4.852 3.51-8.306v-.225c0-3.83-1.226-6.711-3.679-8.644-2.453-1.934-5.87-2.9-10.252-2.9h-17.638v23.2z"
          fill="#FFF"
        />
        <path
          d="M286.396 223.784s33.239-.03 55.627-18.518c11.369-9.388 19.94-23.536 19.94-44.855 0-16.389-5.065-28.535-12.572-37.536-21.49-25.77-50.437-25.164-62.995-25.77-12.558-.605-69.353 0-69.353 0v126.759l-91.027-.08V14.71h169.338c24.852 0 47.054 3.47 66.608 10.41 19.554 6.94 36.122 16.724 49.704 29.352 13.581 12.627 24.032 27.712 31.353 45.256C450.34 117.27 454 136.742 454 158.141c0 25.255-4.335 46.365-13.004 64.486-8.669 18.122-20.613 33.304-35.832 45.546-15.22 12.242-32.991 21.447-53.316 27.616-20.324 6.17-42.141 9.254-65.452 9.254h-69.353l-.293 173.341-90.734-61.232V305.043h90.734v-81.179l69.646-.08z"
          stroke="#FFF"
          strokeWidth={27.216}
        />
        <path
          fill="url(#prefix__a)"
          d="M112.323 291.373l27.71 26.881v101.359l-27.71 4.229z"
        />
        <path
          fill="url(#prefix__b)"
          d="M112.701 209.424h181.512v27.316H112.701z"
        />
        <path
          fill="url(#prefix__c)"
          d="M203.107 84.058l27.71 25.33V504.83l-27.71-51.472z"
        />
        <path fill="#FFF" d="M112.219 291.373H286.14v27.316H140.033z" />
        <path
          fill="url(#prefix__a)"
          d="M112.7.367l27.71 27.748v180.647L112.7 237.07z"
        />
        <path
          fill="#6B6B76"
          d="M203.107 318.69h28.032l-28.032 14.008zM244.8 209.42h-14.01v28.03z"
        />
      </g>
    </svg>
  );
}

module.exports = Footer;

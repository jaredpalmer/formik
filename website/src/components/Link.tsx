import * as React from 'react';

const LinkSrc = require('gatsby-link').default;

export interface LinkProps {
  href?: string;
  to?: string;
  className?: string;
  type?: string;
  role?: string;
  children?: any;
  activeClassName?: string;
  activeStyle?: object;
  style?: object;
  exact?: boolean;
}

export const Link: React.SFC<LinkProps> = props => {
  if (props.href) {
    return (
      <a
        href={props.href}
        className={props.className}
        target="_blank"
        rel="noopener"
        role={props.role}
      >
        {props.children}
      </a>
    );
  } else if (props.activeClassName || props.activeStyle) {
    return (
      <LinkSrc
        className={props.className}
        to={props.to}
        role={props.role}
        activeClassName={props.activeClassName}
        activeStyle={props.activeStyle}
        exact={props.exact}
        style={props.style}
      >
        {props.children}
      </LinkSrc>
    );
  } else {
    return (
      <LinkSrc className={props.className} to={props.to} role={props.role}>
        {props.children}
      </LinkSrc>
    );
  }
};

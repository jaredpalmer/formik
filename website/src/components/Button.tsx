import * as React from 'react';
import * as cx from 'classnames';
import { css } from 'glamor';
import { INTENT, COLORS, ColorWay } from 'theme';
import { Link } from 'components/Link';
import { Block } from 'components/Primitives';

export interface ButtonProps {
  intent?: INTENT;
  href?: string;
  to?: string;
  onClick?: () => void;
  className?: string;
  type?: string;
  role?: string;
  outline?: boolean;
  minimal?: boolean;
  white?: boolean;
  children?: any;
  color?: keyof ColorWay;
}

// @todo multiple intents

const base = {
  background: '#666ee8',
  fontSize: '1rem',
  color: '#fff',
  boxShadow: '0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)',
  borderRadius: '4px',
  border: '0',
  fontWeight: '700',
  width: '100%',
  height: '40px',
  outline: 'none',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  ':focus': {
    background: '#555abf',
  },
  ':hover': {
    transform: 'translateY(-1px)',
    boxShadow:
      '0 7px 14px 0 rgba(50, 50, 93, 0.1),0 3px 6px 0 rgba(0, 0, 0, 0.08)',
  },
  ':active': {
    background: '#43458b',
  },
};

const makeButtonStyles = (color: string | string[]) => ({
  background: color[5],
  ':focus': {
    background: color[6],
  },
  ':hover': {
    transform: 'translateY(-1px)',
    boxShadow:
      '0 7px 14px 0 rgba(50, 50, 93, 0.1),0 3px 6px 0 rgba(0, 0, 0, 0.08)',
  },
  ':active': {
    background: color[7],
  },
});

export const Button: React.SFC<ButtonProps> = props => {
  const style = {
    ...base,
    ...makeButtonStyles(props.color ? COLORS[props.color] : COLORS.indigo),
  };
  if (props.href || props.to) {
    return (
      <Link href={props.href} to={props.to} role={props.role} {...css(style)}>
        {props.children}
      </Link>
    );
  } else {
    return (
      <Block
        component="button"
        css={style}
        props={{
          onClick: props.onClick,
          type: props.type,
        }}
      >
        {props.children}
      </Block>
    );
  }
};

Button.displayName = 'Button';

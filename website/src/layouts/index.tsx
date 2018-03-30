import 'css/global.css';

import 'prismjs/themes/prism-tomorrow.css';
import 'css/text-content.css';
// import 'css/prism-co.css';

import * as React from 'react';
import { Block } from 'components/Primitives';

import { css } from 'glamor';
import { COLORS } from 'theme';

const { base, black, ...cols } = COLORS;

Object.keys(cols).forEach((color: string) => {
  css.global(
    `.formik-example.formik-example--${color} button[type='submit'],
  .formik-example.formik-example--${color} button.primary`,
    {
      background: COLORS[color][5],
    }
  );
  css.global(
    `.formik-example.formik-example--${color} button[type='submit']:focus,
    .formik-example.formik-example--${color} button.primary:focus`,
    {
      background: COLORS[color][6],
    }
  );
  css.global(
    `.formik-example.formik-example--${color} button[type='submit']:active,
    .formik-example.formik-example--${color} button.primary:active`,
    {
      background: COLORS[color][7],
    }
  );

  css.global(
    `.formik-example.formik-example--${color} input:focus, .formik-example.formik-example--${color} select:focus`,
    {
      borderColor: COLORS[color][4],
      boxShadow: `inset 0 1px 1px rgba(0, 0, 0, 0.075),0 0 0 3px ${
        COLORS[color][1]
      }`,
      outline: 'none',
    }
  );
});
interface TemplateProps {
  children?: any;
}

export default class Template extends React.Component<
  TemplateProps,
  { isOpen: boolean }
> {
  constructor(props: TemplateProps, context: any) {
    super(props, context);
  }
  render() {
    return <Block height="100%">{this.props.children()}</Block>;
  }
}

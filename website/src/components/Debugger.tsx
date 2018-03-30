import * as React from 'react';

import * as PropTypes from 'prop-types';
import * as ReactDOM from 'react-dom';
import './Debugger.css';
import { Block } from 'glamor/jsxstyle';
const JSONTree = require('react-json-tree').default;

export interface DebuggerProps {}

export interface DebuggerState {}

const root = document.getElementById('debugger');

export class Modal extends React.Component<any> {
  el: any;
  constructor(props: any) {
    super(props);
    this.el = document.createElement('div');
  }

  componentDidMount() {
    // The portal element is inserted in the DOM tree after
    // the Modal's children are mounted, meaning that children
    // will be mounted on a detached DOM node. If a child
    // component requires to be attached to the DOM tree
    // immediately when mounted, for example to measure a
    // DOM node, or uses 'autoFocus' in a descendant, add
    // state to Modal and only render the children when Modal
    // is inserted in the DOM tree.

    (root as any).appendChild(this.el);
  }

  componentWillUnmount() {
    (root as any).removeChild(this.el);
  }

  render() {
    return (ReactDOM as any).createPortal(this.props.children, this.el);
  }
}

export class Debugger extends React.Component<DebuggerProps, DebuggerState> {
  static contextTypes = {
    formik: PropTypes.object,
  };
  el: any;

  render() {
    const {
      values,
      errors,
      touched,
      dirty,
      isValid,
      isSubmitting,
    } = this.context.formik;
    return (
      <Modal>
        <Block
          color="#eee"
          padding=".5rem"
          fontWeight="bold"
          boxShadow="-2px 0 2px rgba(0,0,0,.8)"
        >
          Formik Debugger
        </Block>
        <Block component="pre" color="#fff">
          <JSONTree
            hideRoot={true}
            shouldExpandNode={() => true}
            theme={{
              scheme: 'tomorrow',
              author: 'chris kempson (http://chriskempson.com)',
              base00: '#222',
              base01: '#222',
              base02: '#373b41',
              base03: '#969896',
              base04: '#b4b7b4',
              base05: '#c5c8c6',
              base06: '#e0e0e0',
              base07: '#ffffff',
              base08: '#cc6666',
              base09: '#de935f',
              base0A: '#f0c674',
              base0B: '#b5bd68',
              base0C: '#8abeb7',
              base0D: '#81a2be',
              base0E: '#b294bb',
              base0F: '#a3685a',
            }}
            invertTheme={false}
            data={{ values, errors, touched, dirty, isValid, isSubmitting }}
          />
        </Block>
      </Modal>
    );
  }
}

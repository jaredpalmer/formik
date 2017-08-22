import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Formik, InjectedFormikProps, withFormik } from '../src/next';
import { mount, render, shallow } from 'enzyme';

const Yup = require('yup');

// tslint:disable-next-line:no-empty
const noop = () => {};

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('withFormik', () => {
  const node = document.createElement('div');

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(node);
  });

  it('provides correct props', () => {
    const Basic = withFormik<{ passThru: string }, {}>({
      handleSubmit: noop,
      isInitialValid: true,
    })(props => {
      expect(props.dirty).toBe(false);
      expect(props.isValid).toBe(true);
      expect(props.values).toEqual({
        passThru: 'pass',
      });
      expect(props.errors).toEqual({});
      expect(props.touched).toEqual({});
      expect(props.isSubmitting).toEqual(false);
      return null;
    });
    ReactDOM.render(<Basic passThru="pass" />, node);
  });
});

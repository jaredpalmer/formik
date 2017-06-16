import * as React from 'react';
import * as renderer from 'react-test-renderer';

import { Simple, SimpleProps } from '../__fixtures__/Simple';

import Formik from '../.';
import Yup from 'yup';

describe('Formik', () => {
  it('renders Formik correctly', () => {
    const Form = Formik<SimpleProps, SimpleProps, SimpleProps>({
      displayName: 'Simple',
      validationSchema: Yup.object().shape({
        thing: Yup.string(),
      }),
      handleSubmit: payload => {
        console.log(payload);
      },
    })(Simple as any);

    const tree = renderer.create(
      <Form thing="hello" />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('mapsPropsToValues', () => {
    const Form = Formik<{hello: string}, SimpleProps, SimpleProps>({
      displayName: 'Simple',
      mapPropsToValues: ({ hello }) => ({thing: hello})
      validationSchema: Yup.object().shape({
        thing: Yup.string(),
      }),
      handleSubmit: payload => {
        console.log(payload);
      },
    })(Simple as any);

    const tree = renderer.create(<Form hello="hello" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
